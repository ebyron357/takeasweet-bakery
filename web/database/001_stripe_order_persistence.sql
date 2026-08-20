-- Apply this migration to the production MySQL database before enabling
-- PAYMENTS_ENABLED. The new columns are nullable so the legacy application can
-- continue writing order_items during the incremental Next.js migration.

ALTER TABLE order_items
  ADD COLUMN productSlug VARCHAR(220) NULL AFTER productId,
  ADD COLUMN selectedFlavors JSON NULL AFTER quantity;

CREATE TABLE stripe_webhook_events (
  eventId VARCHAR(255) PRIMARY KEY,
  eventType VARCHAR(120) NOT NULL,
  processedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
