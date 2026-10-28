import { TRPCError } from "@trpc/server";
import { nanoid } from "nanoid";
import Stripe from "stripe";
import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { containsWeddingKeyword, isEventDateTodayOrLater } from "@shared/bakery";
import {
  REVIEW_CHECKOUT_NOTICE,
  REVIEW_FORM_NOTICE,
  siteSettingsSchema,
  type PublicSiteSettings,
} from "@shared/site-settings";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import * as dbf from "./db-features";
import {
  customerFromSession,
  notifyOrderPaid,
  notifyOwnerSafely,
} from "./order-notifications";
import { getSiteSettings, isStripeTestMode, saveSiteSettings } from "./site-settings";

let stripe: Stripe | undefined;

function getStripe() {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new TRPCError({
      code: "PRECONDITION_FAILED",
      message: "Online payment is not configured.",
    });
  }
  stripe ??= new Stripe(secretKey);
  return stripe;
}

async function blockDuringClientReview(message: string) {
  const settings = await getSiteSettings();
  if (settings.reviewMode) {
    throw new TRPCError({ code: "FORBIDDEN", message });
  }
}

async function blockUnlessCheckoutOpen() {
  const settings = await getSiteSettings();
  if (settings.reviewMode || !settings.paymentsEnabled) {
    throw new TRPCError({ code: "FORBIDDEN", message: REVIEW_CHECKOUT_NOTICE });
  }
}

const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Admin access required",
    });
  }
  return next({ ctx });
});

const productInputSchema = z.object({
  name: z.string().min(1).max(200),
  slug: z
    .string()
    .min(1)
    .max(220)
    .regex(/^[a-z0-9-]+$/),
  description: z.string().max(2000).nullable().optional(),
  priceCents: z.number().int().min(50),
  category: z.enum(["limber", "treat-cups", "cookies", "cheesecake", "seasonal"]),
  imageUrl: z.string().max(500).nullable().optional(),
  size: z.string().max(60).nullable().optional(),
  flavorOptions: z.array(z.string().max(100)).optional(),
  maxFlavorSelections: z.number().int().min(1).max(20).nullable().optional(),
  quantityOptions: z.array(z.number().int().min(1)).optional(),
  leadTime: z.string().max(200).nullable().optional(),
  pickupEligible: z.boolean().optional(),
  deliveryEligible: z.boolean().optional(),
  ingredients: z.string().max(3000).nullable().optional(),
  allergens: z.string().max(3000).nullable().optional(),
  storageInstructions: z.string().max(3000).nullable().optional(),
  relatedSlugs: z.array(z.string().max(220)).optional(),
  inStock: z.boolean().optional(),
  isSeasonal: z.boolean().optional(),
  isSeasonalActive: z.boolean().optional(),
  featured: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
});

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  site: router({
    /** Everything the storefront needs except private fields like pickup instructions. */
    settings: publicProcedure.query(async (): Promise<PublicSiteSettings> => {
      const { pickupInstructions: _private, ...settings } = await getSiteSettings();
      return { ...settings, paymentsTestMode: isStripeTestMode() };
    }),
  }),

  products: router({
    /** Public storefront list — only seasonal-active products. */
    list: publicProcedure.query(() => dbf.listActiveProducts()),
    bySlug: publicProcedure
      .input(z.object({ slug: z.string() }))
      .query(async ({ input }) => {
        const product = await dbf.getProductBySlug(input.slug);
        if (!product || !product.isSeasonalActive) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Product not found" });
        }
        const related =
          product.relatedSlugs && product.relatedSlugs.length > 0
            ? (await dbf.getProductsBySlugs(product.relatedSlugs)).filter(
                p => p.isSeasonalActive,
              )
            : [];
        return { ...product, related };
      }),
  }),

  checkout: router({
    createSession: publicProcedure
      .input(
        z.object({
          items: z
            .array(
              z.object({
                productId: z.number().int(),
                quantity: z.number().int().min(1).max(50),
              }),
            )
            .min(1),
        }),
      )
      .mutation(async ({ ctx, input }) => {
        await blockUnlessCheckoutOpen();
        const ids = input.items.map(item => item.productId);
        const productRows = await dbf.getProductsByIds(ids);
        const productMap = new Map(productRows.map(p => [p.id, p]));

        const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];
        const orderItemsData: {
          productId: number;
          productName: string;
          unitPriceCents: number;
          quantity: number;
        }[] = [];
        let totalCents = 0;

        for (const item of input.items) {
          const product = productMap.get(item.productId);
          if (!product) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "Product not found",
            });
          }
          if (!product.inStock || !product.isSeasonalActive) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: `${product.name} is currently unavailable`,
            });
          }
          totalCents += product.priceCents * item.quantity;
          lineItems.push({
            quantity: item.quantity,
            price_data: {
              currency: "usd",
              unit_amount: product.priceCents,
              product_data: {
                name: product.name,
                ...(product.description ? { description: product.description.slice(0, 300) } : {}),
              },
            },
          });
          orderItemsData.push({
            productId: product.id,
            productName: product.name,
            unitPriceCents: product.priceCents,
            quantity: item.quantity,
          });
        }

        const origin = ctx.req.headers.origin ?? `${ctx.req.protocol}://${ctx.req.headers.host}`;
        const orderRef = `TAS-${nanoid(6).toUpperCase()}`;

        const session = await getStripe().checkout.sessions.create({
          mode: "payment",
          line_items: lineItems,
          allow_promotion_codes: true,
          ...(ctx.user?.email ? { customer_email: ctx.user.email } : {}),
          client_reference_id: ctx.user ? ctx.user.id.toString() : orderRef,
          metadata: {
            order_ref: orderRef,
            user_id: ctx.user ? ctx.user.id.toString() : "guest",
            customer_email: ctx.user?.email ?? "",
            customer_name: ctx.user?.name ?? "",
          },
          success_url: `${origin}/order/confirmation?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${origin}/order/canceled`,
        });

        try {
          await dbf.createOrder(
            {
              orderRef,
              userId: ctx.user?.id ?? null,
              customerName: ctx.user?.name ?? null,
              customerEmail: ctx.user?.email ?? null,
              stripeSessionId: session.id,
              totalCents,
              status: "pending",
            },
            orderItemsData,
          );
        } catch (error) {
          // Without a saved order a payment could not be matched, so close the
          // session before the customer can pay.
          console.error("[Checkout] Failed to save order; expiring session:", error);
          await getStripe()
            .checkout.sessions.expire(session.id)
            .catch(expireError =>
              console.error("[Checkout] Failed to expire session:", expireError),
            );
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "We couldn't start checkout. Please try again.",
          });
        }

        return { url: session.url };
      }),

    /**
     * Post-purchase confirmation. Pickup details are revealed ONLY here,
     * after verifying the Stripe session is actually paid.
     */
    confirmation: publicProcedure
      .input(z.object({ sessionId: z.string().min(1) }))
      .query(async ({ input }) => {
        const order = await dbf.getOrderBySessionId(input.sessionId);
        if (!order) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Order not found",
          });
        }

        // Verify payment status with Stripe directly (webhook may lag).
        if (order.status === "pending") {
          const session = await getStripe().checkout.sessions.retrieve(input.sessionId);
          if (session.payment_status === "paid") {
            const changed = await dbf.markOrderPaid(
              input.sessionId,
              typeof session.payment_intent === "string" ? session.payment_intent : undefined,
              customerFromSession(session),
            );
            if (changed) await notifyOrderPaid(input.sessionId);
            // Re-read: markOrderPaid only moves pending orders, so the order
            // may have been cancelled meanwhile.
            const refreshed = await dbf.getOrderBySessionId(input.sessionId);
            if (refreshed) order.status = refreshed.status;
          }
        }

        if (order.status !== "paid" && order.status !== "fulfilled") {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Payment has not been completed for this order",
          });
        }

        const items = await dbf.getOrderItems(order.id);
        const settings = await getSiteSettings();
        return {
          orderRef: order.orderRef,
          totalCents: order.totalCents,
          items: items.map(item => ({
            name: item.productName,
            quantity: item.quantity,
            unitPriceCents: item.unitPriceCents,
          })),
          pickupInstructions: settings.pickupInstructions,
        };
      }),
  }),

  customOrders: router({
    submit: publicProcedure
      .input(
        z.object({
          name: z.string().min(1).max(200),
          email: z.string().email().max(320),
          phone: z.string().max(40).optional(),
          eventType: z.string().min(1).max(100),
          eventDate: z
            .string()
            .refine(value => isEventDateTodayOrLater(value), {
              message: "Please choose an event date of today or later.",
            }),
          quantity: z.number().int().min(1).max(10000),
          details: z.string().max(3000).optional(),
        }),
      )
      .mutation(async ({ input }) => {
        await blockDuringClientReview(REVIEW_FORM_NOTICE);
        // Wedding orders are not accepted — enforce server-side.
        const combined = `${input.eventType} ${input.details ?? ""}`;
        if (containsWeddingKeyword(combined)) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message:
              "We're flattered, but we aren't able to take wedding orders right now. We'd love to help with birthdays, showers, and other celebrations!",
          });
        }
        await dbf.createCustomOrderRequest({
          name: input.name,
          email: input.email,
          phone: input.phone ?? null,
          eventType: input.eventType,
          eventDate: input.eventDate,
          quantity: input.quantity,
          details: input.details ?? null,
        });
        await notifyOwnerSafely({
          title: `New custom order request from ${input.name}`,
          content: [
            `Event: ${input.eventType} on ${input.eventDate}`,
            `Quantity: ${input.quantity}`,
            `Name: ${input.name}`,
            `Email: ${input.email}`,
            `Phone: ${input.phone || "(not given)"}`,
            "",
            input.details || "(no details given)",
            "",
            "Review it in the admin panel and reply with a quote.",
          ].join("\n"),
        });
        return { success: true } as const;
      }),
  }),

  newsletter: router({
    subscribe: publicProcedure
      .input(
        z.object({
          email: z.string().email().max(320),
          firstName: z.string().max(100).optional(),
        }),
      )
      .mutation(async ({ input }) => {
        await blockDuringClientReview(REVIEW_FORM_NOTICE);
        await dbf.subscribeNewsletter(input.email, input.firstName);
        return { success: true } as const;
      }),
  }),

  contact: router({
    submit: publicProcedure
      .input(
        z.object({
          name: z.string().min(1).max(200),
          email: z.string().email().max(320),
          message: z.string().min(1).max(3000),
        }),
      )
      .mutation(async ({ input }) => {
        await blockDuringClientReview(REVIEW_FORM_NOTICE);
        await dbf.createContactMessage(input.name, input.email, input.message);
        await notifyOwnerSafely({
          title: `New contact message from ${input.name}`,
          content: `From: ${input.name} <${input.email}>\n\n${input.message}`,
        });
        return { success: true } as const;
      }),
  }),

  admin: router({
    listProducts: adminProcedure.query(() => dbf.listAllProducts()),
    createProduct: adminProcedure.input(productInputSchema).mutation(async ({ input }) => {
      await dbf.createProduct(input);
      return { success: true } as const;
    }),
    updateProduct: adminProcedure
      .input(productInputSchema.partial().extend({ id: z.number().int() }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await dbf.updateProduct(id, data);
        return { success: true } as const;
      }),
    deleteProduct: adminProcedure
      .input(z.object({ id: z.number().int() }))
      .mutation(async ({ input }) => {
        await dbf.deleteProduct(input.id);
        return { success: true } as const;
      }),
    listOrders: adminProcedure.query(() => dbf.listOrders()),
    updateOrderStatus: adminProcedure
      .input(
        z.object({
          id: z.number().int(),
          status: z.enum(["pending", "paid", "fulfilled", "cancelled"]),
        }),
      )
      .mutation(async ({ input }) => {
        await dbf.updateOrderStatus(input.id, input.status);
        return { success: true } as const;
      }),
    listCustomRequests: adminProcedure.query(() => dbf.listCustomOrderRequests()),
    updateCustomRequest: adminProcedure
      .input(
        z.object({
          id: z.number().int(),
          status: z.enum(["new", "approved", "deposit_requested", "confirmed", "declined"]),
          adminNotes: z.string().max(2000).optional(),
        }),
      )
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await dbf.updateCustomOrderRequest(id, data);
        return { success: true } as const;
      }),
    listContactMessages: adminProcedure.query(() => dbf.listContactMessages()),
    getSettings: adminProcedure.query(async () => ({
      settings: await getSiteSettings(),
      stripeConfigured: Boolean(process.env.STRIPE_SECRET_KEY),
      stripeTestMode: isStripeTestMode(),
    })),
    updateSettings: adminProcedure.input(siteSettingsSchema).mutation(async ({ input }) => {
      await saveSiteSettings(input);
      return { success: true } as const;
    }),
  }),
});

export type AppRouter = typeof appRouter;
