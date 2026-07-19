# TakeASweet Next.js application

This directory is the production Next.js 15 migration target. The existing Vite/Express application remains intact while routes and backend capabilities are moved in verified increments.

## Local verification

```bash
npm ci
npm run format:check
npm run lint
npm run typecheck
npm run build
```

## Migration controls

- Do not fabricate products, prices, testimonials, policies, availability, or bakery details.
- Do not present generated imagery as photographs of the founder's real work.
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
