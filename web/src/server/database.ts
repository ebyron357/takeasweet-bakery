import "server-only";

import mysql, {
  type Pool,
  type PoolConnection,
  type ResultSetHeader,
  type RowDataPacket,
} from "mysql2/promise";

import { isCustomOrderLaunchEnabled } from "@/config/launch";
import type { CustomOrderRequest } from "@/server/custom-orders";
import type { PaymentStateUpdate } from "@/server/payment-events";
import type { ValidatedCartItem } from "@/types/cart";

let pool: Pool | undefined;

function getPool() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) throw new Error("DATABASE_URL is not configured.");

  pool ??= mysql.createPool(databaseUrl);
  return pool;
}

export function isCustomOrderStorageEnabled() {
  return isCustomOrderLaunchEnabled();
}

export async function saveCustomOrderRequest(request: CustomOrderRequest) {
  await getPool().execute(
    `INSERT INTO custom_order_requests
      (name, email, phone, eventType, eventDate, quantity, details, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, 'new')`,
    [
      request.name,
      request.email,
      request.phone || null,
      request.eventType,
      request.eventDate,
      request.quantity,
      request.details,
    ]
  );
}

export class OrderPersistenceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "OrderPersistenceError";
  }
}

type AvailableProductRow = RowDataPacket & {
  id: number;
  slug: string;
};

type OrderRow = RowDataPacket & {
  id: number;
  stripeSessionId: string | null;
  totalCents: number;
  status: "pending" | "paid" | "fulfilled" | "cancelled";
};

export type PersistableOrderItem = ValidatedCartItem & {
  productId: number;
};

export async function resolvePersistableOrderItems(
  items: readonly ValidatedCartItem[]
): Promise<readonly PersistableOrderItem[]> {
  const slugs = [...new Set(items.map((item) => item.slug))];
  const placeholders = slugs.map(() => "?").join(", ");
  const [rows] = await getPool().execute<AvailableProductRow[]>(
    `SELECT id, slug
       FROM products
      WHERE slug IN (${placeholders})
        AND inStock = 1
        AND isSeasonalActive = 1`,
    slugs
  );
  const productIds = new Map(rows.map((row) => [row.slug, row.id]));

  if (productIds.size !== slugs.length) {
    throw new OrderPersistenceError(
      "One or more items are not currently available."
    );
  }

  return items.map((item) => ({
    ...item,
    productId: productIds.get(item.slug)!,
  }));
}

type PendingOrderInput = Readonly<{
  orderReference: string;
  stripeSessionId: string;
  totalCents: number;
  items: readonly PersistableOrderItem[];
}>;

export async function savePendingOrder(order: PendingOrderInput) {
  const connection = await getPool().getConnection();

  try {
    await connection.beginTransaction();
    const [existingRows] = await connection.execute<OrderRow[]>(
      `SELECT id, stripeSessionId, totalCents, status
         FROM orders
        WHERE orderRef = ?
        FOR UPDATE`,
      [order.orderReference]
    );
    const existing = existingRows[0];

    if (existing) {
      if (
        existing.stripeSessionId !== order.stripeSessionId ||
        existing.totalCents !== order.totalCents
      ) {
        throw new OrderPersistenceError(
          "The checkout retry did not match the pending order."
        );
      }
      await connection.commit();
      return;
    }

    const [result] = await connection.execute<ResultSetHeader>(
      `INSERT INTO orders
        (orderRef, stripeSessionId, totalCents, status)
       VALUES (?, ?, ?, 'pending')`,
      [order.orderReference, order.stripeSessionId, order.totalCents]
    );

    for (const item of order.items) {
      await connection.execute(
        `INSERT INTO order_items
          (orderId, productId, productSlug, productName, unitPriceCents,
           quantity, selectedFlavors)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          result.insertId,
          item.productId,
          item.slug,
          item.name,
          item.unitPriceCents,
          item.quantity,
          JSON.stringify(item.selectedFlavors),
        ]
      );
    }

    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

async function applyPaymentState(
  connection: PoolConnection,
  update: PaymentStateUpdate
) {
  const [rows] = await connection.execute<OrderRow[]>(
    `SELECT id, stripeSessionId, totalCents, status
       FROM orders
      WHERE stripeSessionId = ?
      FOR UPDATE`,
    [update.sessionId]
  );
  const order = rows[0];

  if (!order) {
    throw new OrderPersistenceError(
      "No pending order matches the Stripe Checkout Session."
    );
  }

  if (order.status !== "pending") return;

  if (update.status === "cancelled") {
    await connection.execute(
      `UPDATE orders SET status = 'cancelled' WHERE id = ?`,
      [order.id]
    );
    return;
  }

  await connection.execute(
    `UPDATE orders
        SET status = 'paid',
            stripePaymentIntentId = ?,
            customerName = ?,
            customerEmail = ?
      WHERE id = ?`,
    [
      update.paymentIntentId,
      update.customerName,
      update.customerEmail,
      order.id,
    ]
  );
}

export async function processStripeWebhook(
  eventId: string,
  eventType: string,
  update: PaymentStateUpdate | null
) {
  const connection = await getPool().getConnection();

  try {
    await connection.beginTransaction();
    const [result] = await connection.execute<ResultSetHeader>(
      `INSERT IGNORE INTO stripe_webhook_events (eventId, eventType)
       VALUES (?, ?)`,
      [eventId, eventType]
    );

    if (result.affectedRows === 0) {
      await connection.commit();
      return { duplicate: true } as const;
    }

    if (update) await applyPaymentState(connection, update);
    await connection.commit();
    return { duplicate: false } as const;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

export async function reconcilePaidOrder(update: PaymentStateUpdate) {
  if (update.status !== "paid") {
    throw new OrderPersistenceError("Only paid orders can be reconciled.");
  }

  const connection = await getPool().getConnection();
  try {
    await connection.beginTransaction();
    await applyPaymentState(connection, update);
    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}
