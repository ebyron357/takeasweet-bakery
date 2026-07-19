# TakeASweet Next.js application

This directory is the production Next.js 15 migration target. The existing Vite/Express application remains intact while routes and backend capabilities are moved in verified increments.

## Local verification

```bash
npm ci
npm run format:check
npm run lint
npm run typecheck
npm run test
npm run build
```

## Environment controls

- `PAYMENTS_ENABLED=true` requires `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `DATABASE_URL`, and `PRIVACY_CONTACT_EMAIL` before checkout is available.
- `CUSTOM_ORDER_REQUESTS_ENABLED=true` requires `DATABASE_URL` and `PRIVACY_CONTACT_EMAIL` before the request form is available.
- Both launch gates default to `false`; credentials and secrets belong in the deployment environment, never in source control.
- `NEXT_PUBLIC_SITE_URL` must be the final HTTPS origin before production metadata or checkout redirects are enabled.
- `SEARCH_INDEXING_ENABLED=true` is accepted only with a non-local HTTPS origin. Keep it disabled until the launch review in `docs/seo-launch.md` is complete.
- `PRIVACY_CONTACT_EMAIL` must be an approved public contact address before customer data collection is launched.
- Apply `database/001_stripe_order_persistence.sql` and configure the signed Stripe webhook before enabling checkout. See `docs/stripe-launch.md`.

## Migration controls

- Do not fabricate products, prices, testimonials, policies, availability, or bakery details.
- Do not present generated imagery as photographs of the founder's real work.
- Follow `docs/media-governance.md` before publishing any bakery or founder image.
- Resolve `docs/policy-launch-checklist.md` before enabling public payments or submissions.
- Complete `docs/seo-launch.md` before allowing search indexing.
- Do not expose pickup details before a confirmed purchase.
- Keep payment code inactive until the provider and credentials are confirmed.
- Keep search indexing disabled until the production domain and content are approved.

## Migration sequence

1. Foundation and CI.
2. Verified catalog and menu routes.
3. Cart and Stripe checkout with webhook-backed order state.
4. Custom-order workflow and deposits.
5. Authentic-work gallery and approved founder media.
6. Admin and customer access controls.
7. Concierge with approved knowledge and safe escalation.
8. Production content, accessibility, performance, and launch QA.
