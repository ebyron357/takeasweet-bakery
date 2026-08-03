# Production launch checklist

This is the release record for the Next.js storefront. Checked repository controls are implemented and automated; unchecked items require real infrastructure, approved business information, assets, credentials, legal decisions, or evidence from the final deployment.

## Repository release gates

- [x] Next.js 15 App Router, strict TypeScript, Tailwind CSS, shadcn/ui configuration, linting, and formatting.
- [x] Responsive public routes, accessible navigation, cart, validated custom-request flow, error handling, and 404 handling.
- [x] Server-authoritative catalog, cart, price, quantity, and flavor validation.
- [x] Stripe Checkout architecture, durable pending orders, signed webhook handling, and idempotent payment-state updates.
- [x] Authentic-gallery provenance boundary and generated-media disclosure rules.
- [x] Privacy and order-information surfaces that avoid unapproved policy promises.
- [x] Canonical metadata, social cards, sitemap, robots, manifest, and factual structured data with indexing disabled by default.
- [x] CI formatting, lint, type checking, automated tests, production build, semantic output audit, and asset budgets.
- [x] Deployment environment preflight, health endpoint, deployment smoke test, and rollback runbook.
- [x] Provider-neutral, non-identifying analytics event hooks with no invented tracking ID or external data transfer.

## Owner-approved content and assets

- [ ] Confirm the public bakery name, catalog, prices, descriptions, and service-area wording one final time.
- [ ] Provide approved authentic baked-work photographs and any approved founder portrait, or approve launching the gallery in its transparent empty state.
- [ ] Approve any generated product imagery and its explicit illustrative disclosure before publication.
- [ ] Resolve every item in `docs/policy-launch-checklist.md`, including privacy contact, refunds, cancellations, lead times, delivery, allergens, substitutions, retention, and sales tax.
- [ ] Decide whether authenticated operations or a website assistant are actually required. Do not launch either without approved roles, content, assets, privacy rules, and escalation behavior.

## Hosting and domain

- [ ] Create or identify the owner-approved hosting project and set its root directory to `web`.
- [ ] Connect the repository and confirm preview deployments build the PR commit, not the legacy root application.
- [ ] Confirm the final HTTPS domain, DNS ownership, redirects, and `NEXT_PUBLIC_SITE_URL`.
- [ ] Keep `SEARCH_INDEXING_ENABLED=false` through preview and initial production QA.
- [ ] Run `npm run deployment:check` using the exact production environment.
- [ ] Run the deployment smoke workflow against preview and production.
- [ ] Record rollback ownership and the last known-good deployment.

## Database, forms, and payments

- [ ] Provision separate preview and production MySQL databases with encryption, least privilege, backups, restore testing, and an approved retention policy.
- [ ] Apply and verify `database/001_stripe_order_persistence.sql` against the production schema.
- [ ] Configure the approved privacy contact before collecting customer information.
- [ ] Register the exact Stripe webhook endpoint, select the documented events, and store the signing secret securely.
- [ ] Complete the Stripe test-mode lifecycle: checkout, pending order, signed webhook, paid state, duplicate event, delayed payment, expired session, and reconciliation.
- [ ] Confirm currency, tax, statement descriptor, fulfillment workflow, refund permissions, and Stripe live-mode account ownership.
- [ ] Enable `CUSTOM_ORDER_REQUESTS_ENABLED` and `PAYMENTS_ENABLED` separately only after their respective checks pass.
- [ ] Confirm bot and abuse controls for public forms in the deployed environment; add infrastructure rate limiting if launch traffic or risk requires it.

## Final experience and operations

- [ ] Complete the manual browser, keyboard, zoom, screen-reader, forced-colors, reduced-motion, axe, Lighthouse, and Core Web Vitals checks in `docs/accessibility-performance.md`.
- [ ] Verify social previews, canonical URLs, robots, sitemap, and structured data on the final origin; complete `docs/seo-launch.md` before indexing.
- [ ] Test mobile and desktop cart persistence, validation errors, disabled feature messaging, custom requests, Stripe return handling, and 404/error recovery.
- [ ] Connect the existing analytics event contract only after the owner approves a provider, consent requirements, retention, and real IDs. No analytics ID is invented in the repository.
- [ ] Configure runtime error monitoring, alert ownership, database monitoring, webhook failure review, and order reconciliation procedures.
- [ ] Review secrets for least privilege and confirm none appear in the repository, browser bundle, build output, or logs.
- [ ] Capture final owner, policy/legal, payment, deployment, and content approvals with dates.
- [ ] Mark the PR ready for review only when the remaining blockers are either completed or explicitly accepted for a gated, non-transactional launch.
