# TakeASweet Cookies & Treats

Website for TakeASweet Cookies & Treats, a kid-owned bakery serving Charlotte,
North Carolina. Customers browse the menu, pay online through Stripe, and send
custom order requests and messages. The owner runs everything from the Admin
page — no code changes needed for day-to-day updates.

- **Owner guide and handoff checklist:** [`docs/CLIENT_HANDOFF.md`](docs/CLIENT_HANDOFF.md)
- **Quality bar for every change:** [`CLAUDE.md`](CLAUDE.md)
- **Product scope and long-term roadmap:** [`SKILL.md`](SKILL.md)
- **Change history:** [`todo.md`](todo.md)

## What the site does today

| Area | Included |
|---|---|
| Public pages | Home, Menu (`/shop`), product pages, Cart, Custom Orders, Our Story, FAQ, Gallery (shown once it has photos), Order Information, Privacy, Contact, 404 |
| Ordering | Cart with flavor selection, Stripe Checkout, order confirmation that reveals private pickup instructions only after payment, canceled-payment page |
| Custom orders | Request form (wedding orders blocked on client and server); owner reviews, then approves, requests a deposit, confirms, or declines |
| Admin (`/admin`) | Products, Orders, Custom Requests, Messages, Site Settings (launch switches, business details, images, gallery, FAQ, private pickup instructions) |
| Safety | Review mode and payments are off by default and stay off if settings can't load; no pickup address on public pages; security headers; Stripe webhook signature check |

**Not built** (planned in `SKILL.md`, not part of this release): guided cake
builder, customer accounts and order portal, AI bakery concierge, photo upload
from Admin (images are added by URL).

## Tech stack

React 19 + Vite + Tailwind CSS 4 (client) · Express + tRPC (server) · MySQL +
Drizzle ORM · Stripe Checkout · Manus hosting, login (OAuth), image storage, and
owner notifications · Vitest · Playwright + axe-core site QA · pnpm.

## Run locally

```bash
pnpm install
cp .env.example .env          # fill in at least DATABASE_URL and JWT_SECRET
pnpm db:push                  # create/upgrade database tables
pnpm dev                      # http://localhost:3000
```

Without the Manus values, admin sign-in and `/manus-storage/…` images do not
work locally; everything else does.

## Quality gates

```bash
pnpm check                    # type check
pnpm test                     # unit tests
pnpm build                    # production build (dist/)
PORT=3000 pnpm start          # then, in another terminal:
QA_BASE=http://127.0.0.1:3000 node scripts/site-qa.mjs   # page QA at 1440px + 390px
```

## Deploy

1. Build with `pnpm build`.
2. **Run `pnpm db:push` against the production database** whenever a release
   includes a migration (`drizzle/00xx_*.sql`).
3. Start with `pnpm start`.

Environment variables are documented in [`.env.example`](.env.example).
