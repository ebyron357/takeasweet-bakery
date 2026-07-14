import { TRPCError } from "@trpc/server";
import { nanoid } from "nanoid";
import Stripe from "stripe";
import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { containsWeddingKeyword, PICKUP_INSTRUCTIONS } from "@shared/bakery";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import * as dbf from "./db-features";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "");

const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
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
  description: z.string().max(2000).optional(),
  priceCents: z.number().int().min(50),
  category: z.enum(["cookies", "treats", "seasonal"]),
  imageUrl: z.string().max(500).optional(),
  inStock: z.boolean().optional(),
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
        return product;
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
            throw new TRPCError({ code: "BAD_REQUEST", message: "Product not found" });
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

        const session = await stripe.checkout.sessions.create({
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
          cancel_url: `${origin}/cart?cancelled=1`,
        });

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
          throw new TRPCError({ code: "NOT_FOUND", message: "Order not found" });
        }

        // Verify payment status with Stripe directly (webhook may lag).
        if (order.status === "pending") {
          const session = await stripe.checkout.sessions.retrieve(input.sessionId);
          if (session.payment_status === "paid") {
            await dbf.markOrderPaid(
              input.sessionId,
              typeof session.payment_intent === "string" ? session.payment_intent : undefined,
            );
            order.status = "paid";
          }
        }

        if (order.status !== "paid" && order.status !== "fulfilled") {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Payment has not been completed for this order",
          });
        }

        const items = await dbf.getOrderItems(order.id);
        return {
          orderRef: order.orderRef,
          totalCents: order.totalCents,
          items: items.map(item => ({
            name: item.productName,
            quantity: item.quantity,
            unitPriceCents: item.unitPriceCents,
          })),
          pickupInstructions: PICKUP_INSTRUCTIONS,
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
          eventDate: z.string().min(1).max(20),
          quantity: z.number().int().min(1).max(10000),
          details: z.string().max(3000).optional(),
        }),
      )
      .mutation(async ({ input }) => {
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
        await dbf.createContactMessage(input.name, input.email, input.message);
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
  }),
});

export type AppRouter = typeof appRouter;
