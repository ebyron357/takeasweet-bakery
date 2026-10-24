# TakeASweet Bakery

## Vision

A premium custom bakery platform with online ordering, deposits/full payments via
Stripe, AI Bakery Concierge, gallery, cake builder, admin dashboard, and customer
portal. This repository is the production source of truth.

## Current status

The site is **feature-complete for client review** and runs in a deliberately
locked-down mode until the client approves launch:

| Area | State |
| --- | --- |
| Public pages (home, shop, product, cart, custom orders, our story, FAQ, gallery, order info, privacy, contact, 404) | Built and verified desktop + mobile |
| Customer data collection (custom order, contact, newsletter forms) | **Disabled** — `CLIENT_REVIEW_MODE = true` |
| Online checkout | **Disabled** — `PAYMENTS_ENABLED = false`; Stripe wiring is test-mode only |
| Stripe checkout session + webhook (`paid` / `cancelled`) | Implemented and covered by tests |
| Admin dashboard (`/admin`) | Role-protected (`role = admin`), not linked from public nav |
| Analytics (Umami) | Injected only when both analytics env vars are set |

Completed work is tracked in [`todo.md`](todo.md). The Scroll Craft accent
integration is documented in [`docs/SCROLL_CRAFT_IMPLEMENTATION.md`](docs/SCROLL_CRAFT_IMPLEMENTATION.md).

## Stack

- **Client:** React 19 + Vite, Tailwind CSS 4, Radix UI, wouter routing (`client/`)
- **Server:** Express + tRPC (`server/`), entry `server/_core/index.ts`
- **Database:** MySQL via Drizzle ORM (`drizzle/schema.ts`, migrations in `drizzle/`)
- **Payments:** Stripe Checkout, webhook at `POST /api/stripe/webhook`
- **Shared config:** `shared/` (review/payment mode flags live in `shared/review-mode.ts`)

## Getting started

Requires Node 22 and pnpm.

```bash
pnpm install --frozen-lockfile
pnpm dev          # development server (default port 3000)
```

## Scripts

| Command | Purpose |
| --- | --- |
| `pnpm dev` | Run the dev server with hot reload |
| `pnpm check` | TypeScript type-check |
| `pnpm test` | Vitest unit tests |
| `pnpm build` | Build client (`dist/public`) and server bundle (`dist/index.js`) |
| `pnpm start` | Run the production build |
| `pnpm db:push` | Generate and apply Drizzle migrations (requires `DATABASE_URL`) |
| `pnpm format` | Prettier |

CI (`.github/workflows/client-review-ci.yml`) runs type-check, tests, the
production build and the Scroll Craft browser check on every pull request.

## Environment variables

### Server

| Variable | Required | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | Yes | MySQL connection string |
| `JWT_SECRET` | Yes | Session cookie signing secret |
| `VITE_APP_ID` | Yes | OAuth application ID |
| `OAUTH_SERVER_URL` | Yes | OAuth server base URL |
| `OWNER_OPEN_ID` | Yes | OpenID of the owner account (granted admin) |
| `STRIPE_SECRET_KEY` | For checkout | Stripe secret key (`sk_test_…` during review) |
| `STRIPE_WEBHOOK_SECRET` | For checkout | Signing secret for `/api/stripe/webhook` |
| `BUILT_IN_FORGE_API_URL` / `BUILT_IN_FORGE_API_KEY` | Optional | Platform AI/storage services |
| `PORT` | Optional | HTTP port (default `3000`) |

### Client (build-time, `VITE_` prefix)

| Variable | Required | Purpose |
| --- | --- | --- |
| `VITE_APP_ID` | Yes | OAuth application ID |
| `VITE_OAUTH_PORTAL_URL` | Yes | OAuth login portal URL |
| `VITE_FRONTEND_FORGE_API_URL` / `VITE_FRONTEND_FORGE_API_KEY` | Optional | Map component |
| `VITE_ANALYTICS_ENDPOINT` / `VITE_ANALYTICS_WEBSITE_ID` | Optional | Umami analytics; the script is only added when **both** are set |

## Launch runbook (client approval required)

These steps change real-world behaviour and must only be taken once the client
has approved launch. None of them can be completed from the codebase alone.

1. **Database** — set `DATABASE_URL` for production and run `pnpm db:push`.
2. **Stripe ownership** — the client creates and verifies their own Stripe
   account. Install their keys (`STRIPE_SECRET_KEY`) in project settings.
3. **Webhook** — in the Stripe dashboard, add an endpoint for
   `https://<production-domain>/api/stripe/webhook` listening to
   `checkout.session.completed`, `checkout.session.expired` and
   `checkout.session.async_payment_failed`; set `STRIPE_WEBHOOK_SECRET`.
4. **Enable forms** — set `CLIENT_REVIEW_MODE = false` in `shared/review-mode.ts`.
   Confirm the privacy policy reflects the data now being collected.
5. **Enable checkout** — set `PAYMENTS_ENABLED = true`. Run one test purchase
   with card `4242 4242 4242 4242` and confirm the order shows `paid` in `/admin`.
6. **Go live** — with live keys installed, set `PAYMENTS_TEST_MODE = false`, then
   run one small real purchase and refund it from the Stripe dashboard.
7. **Analytics (optional)** — set both `VITE_ANALYTICS_*` variables and rebuild.

Rollback for steps 4–6 is reverting the flag in `shared/review-mode.ts` and
redeploying.
