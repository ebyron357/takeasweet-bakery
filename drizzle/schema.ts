import {
  boolean,
  int,
  json,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/** Product catalog: cookies, treats, and seasonal items. */
export const products = mysqlTable("products", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 200 }).notNull(),
  slug: varchar("slug", { length: 220 }).notNull().unique(),
  description: text("description"),
  /** Price in cents (USD) to avoid floating point issues. */
  priceCents: int("priceCents").notNull(),
  category: mysqlEnum("category", [
    "limber",
    "treat-cups",
    "cookies",
    "cheesecake",
    "seasonal",
  ]).notNull(),
  imageUrl: varchar("imageUrl", { length: 500 }),
  /** Serving size, e.g. "5 oz". Null when not applicable / not confirmed. */
  size: varchar("size", { length: 60 }),
  /** Selectable flavor options (JSON array of strings). */
  flavorOptions: json("flavorOptions").$type<string[]>(),
  /** Max flavors a customer may select (e.g. 4 for Four Corners). Null = single/no selection. */
  maxFlavorSelections: int("maxFlavorSelections"),
  /** Quantity options offered (JSON array of numbers), e.g. [1,6,12]. */
  quantityOptions: json("quantityOptions").$type<number[]>(),
  /** Lead time text, e.g. "48 hours notice". Internal placeholder until confirmed. */
  leadTime: varchar("leadTime", { length: 200 }),
  pickupEligible: boolean("pickupEligible").default(true).notNull(),
  deliveryEligible: boolean("deliveryEligible").default(true).notNull(),
  /** Internal-only fields — may contain "CLIENT APPROVAL REQUIRED"; never render publicly. */
  ingredients: text("ingredients"),
  allergens: text("allergens"),
  storageInstructions: text("storageInstructions"),
  /** Related product slugs (JSON array of strings). */
  relatedSlugs: json("relatedSlugs").$type<string[]>(),
  inStock: boolean("inStock").default(true).notNull(),
  /** Seasonal item flag (shows the Seasonal badge). */
  isSeasonal: boolean("isSeasonal").default(false).notNull(),
  /** Seasonal availability flag — seasonal items can be toggled off-season. */
  isSeasonalActive: boolean("isSeasonalActive").default(true).notNull(),
  featured: boolean("featured").default(false).notNull(),
  sortOrder: int("sortOrder").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Product = typeof products.$inferSelect;
export type InsertProduct = typeof products.$inferInsert;

/** Standard orders paid through Stripe checkout. */
export const orders = mysqlTable("orders", {
  id: int("id").autoincrement().primaryKey(),
  /** Public-facing order reference, e.g. TAS-8F3K2 */
  orderRef: varchar("orderRef", { length: 24 }).notNull().unique(),
  userId: int("userId"),
  customerName: varchar("customerName", { length: 200 }),
  customerEmail: varchar("customerEmail", { length: 320 }),
  stripeSessionId: varchar("stripeSessionId", { length: 255 }).unique(),
  stripePaymentIntentId: varchar("stripePaymentIntentId", { length: 255 }),
  totalCents: int("totalCents").notNull(),
  status: mysqlEnum("status", ["pending", "paid", "fulfilled", "cancelled"])
    .default("pending")
    .notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Order = typeof orders.$inferSelect;
export type InsertOrder = typeof orders.$inferInsert;

/** Line items within an order. */
export const orderItems = mysqlTable("order_items", {
  id: int("id").autoincrement().primaryKey(),
  orderId: int("orderId").notNull(),
  productId: int("productId").notNull(),
  productName: varchar("productName", { length: 200 }).notNull(),
  unitPriceCents: int("unitPriceCents").notNull(),
  quantity: int("quantity").notNull(),
});

export type OrderItem = typeof orderItems.$inferSelect;
export type InsertOrderItem = typeof orderItems.$inferInsert;

/** Custom dessert order requests (weddings are not accepted). */
export const customOrderRequests = mysqlTable("custom_order_requests", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 200 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  phone: varchar("phone", { length: 40 }),
  eventType: varchar("eventType", { length: 100 }).notNull(),
  eventDate: varchar("eventDate", { length: 20 }).notNull(),
  quantity: int("quantity").notNull(),
  details: text("details"),
  status: mysqlEnum("status", [
    "new",
    "approved",
    "deposit_requested",
    "confirmed",
    "declined",
  ])
    .default("new")
    .notNull(),
  adminNotes: text("adminNotes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CustomOrderRequest = typeof customOrderRequests.$inferSelect;
export type InsertCustomOrderRequest = typeof customOrderRequests.$inferInsert;

/** Newsletter signups from homepage and footer. */
export const newsletterSubscribers = mysqlTable("newsletter_subscribers", {
  id: int("id").autoincrement().primaryKey(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  firstName: varchar("firstName", { length: 100 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type NewsletterSubscriber = typeof newsletterSubscribers.$inferSelect;

/** Contact form inquiries. */
export const contactMessages = mysqlTable("contact_messages", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 200 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  message: text("message").notNull(),
  isRead: boolean("isRead").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ContactMessage = typeof contactMessages.$inferSelect;