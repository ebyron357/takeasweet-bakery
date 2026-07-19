import "server-only";

import mysql, { type Pool } from "mysql2/promise";

import { isCustomOrderLaunchEnabled } from "@/config/launch";
import type { CustomOrderRequest } from "@/server/custom-orders";

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
