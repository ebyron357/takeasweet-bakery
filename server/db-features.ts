import { and, asc, desc, eq, inArray } from "drizzle-orm";
import {
  contactMessages,
  customOrderRequests,
  InsertCustomOrderRequest,
  InsertOrder,
  InsertOrderItem,
  InsertProduct,
  newsletterSubscribers,
  orderItems,
  orders,
  products,
} from "../drizzle/schema";
import { getDb } from "./db";

// ---------- Products ----------

export async function listActiveProducts() {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(products)
    .where(eq(products.isSeasonalActive, true))
    .orderBy(asc(products.sortOrder), asc(products.id));
}

export async function listAllProducts() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(products).orderBy(asc(products.sortOrder), asc(products.id));
}

export async function getProductBySlug(slug: string) {
  const db = await getDb();
  if (!db) return undefined;
  const rows = await db.select().from(products).where(eq(products.slug, slug)).limit(1);
  return rows[0];
}

export async function getProductsByIds(ids: number[]) {
  const db = await getDb();
  if (!db || ids.length === 0) return [];
  return db.select().from(products).where(inArray(products.id, ids));
}

export async function getProductsBySlugs(slugs: string[]) {
  const db = await getDb();
  if (!db || slugs.length === 0) return [];
  return db.select().from(products).where(inArray(products.slug, slugs));
}

export async function createProduct(data: InsertProduct) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(products).values(data);
  return result;
}

export async function updateProduct(id: number, data: Partial<InsertProduct>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(products).set(data).where(eq(products.id, id));
}

export async function deleteProduct(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(products).where(eq(products.id, id));
}

// ---------- Orders ----------

export async function createOrder(order: InsertOrder, items: Omit<InsertOrderItem, "orderId">[]) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [inserted] = await db.insert(orders).values(order).$returningId();
  const orderId = inserted.id;
  if (items.length > 0) {
    await db.insert(orderItems).values(items.map(item => ({ ...item, orderId })));
  }
  return orderId;
}

export async function getOrderBySessionId(sessionId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const rows = await db
    .select()
    .from(orders)
    .where(eq(orders.stripeSessionId, sessionId))
    .limit(1);
  return rows[0];
}

export async function getOrderItems(orderId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(orderItems).where(eq(orderItems.orderId, orderId));
}

export async function markOrderPaid(sessionId: string, paymentIntentId?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db
    .update(orders)
    .set({ status: "paid", stripePaymentIntentId: paymentIntentId })
    .where(eq(orders.stripeSessionId, sessionId));
}

export async function updateOrderStatus(
  id: number,
  status: "pending" | "paid" | "fulfilled" | "cancelled",
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(orders).set({ status }).where(eq(orders.id, id));
}

export async function listOrders() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(orders).orderBy(desc(orders.createdAt));
}

// ---------- Custom order requests ----------

export async function createCustomOrderRequest(data: InsertCustomOrderRequest) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(customOrderRequests).values(data);
}

export async function listCustomOrderRequests() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(customOrderRequests).orderBy(desc(customOrderRequests.createdAt));
}

export async function updateCustomOrderRequest(
  id: number,
  data: Partial<InsertCustomOrderRequest>,
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(customOrderRequests).set(data).where(eq(customOrderRequests.id, id));
}

// ---------- Newsletter ----------

export async function subscribeNewsletter(email: string, firstName?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db
    .insert(newsletterSubscribers)
    .values({ email, firstName: firstName ?? null })
    .onDuplicateKeyUpdate({ set: { firstName: firstName ?? null } });
}

// ---------- Contact ----------

export async function createContactMessage(name: string, email: string, message: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(contactMessages).values({ name, email, message });
}

export async function listContactMessages() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(contactMessages).orderBy(desc(contactMessages.createdAt));
}
