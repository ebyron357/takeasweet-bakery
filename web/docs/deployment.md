# Deployment runbook

The application is deployment-ready but is not linked to a hosting project in source control. Creating a hosting project, selecting a domain, setting credentials, or promoting production changes external systems and requires the owner-approved values listed below.

## Vercel project setup

1. Import `ebyron357/takeasweet-bakery` into the approved Vercel account.
2. Set **Root Directory** to `web`. The repository root still contains the legacy application and is intentionally not the Next.js project root.
3. Keep framework detection set to Next.js. `web/vercel.json` pins `npm ci` and `npm run build` for reproducible installs and builds.
4. Use Node.js 22, matching GitHub Actions. Do not add `.vercel/project.json`, `VERCEL_TOKEN`, organization IDs, project IDs, or secrets to Git.
5. Enable Git integration so this feature branch receives a preview deployment before any production promotion.

No TakeASweet Vercel project was present in the connected account during the repository audit on July 19, 2026. Recheck before creating one to avoid duplicates.

## Environment scopes

Set variables in Vercel project settings, not committed `.env` files.

| Variable                        | Preview                                                      | Production                                             |
| ------------------------------- | ------------------------------------------------------------ | ------------------------------------------------------ |
| `NEXT_PUBLIC_SITE_URL`          | May be omitted to use the generated preview origin           | Required: approved final HTTPS origin                  |
| `SEARCH_INDEXING_ENABLED`       | `false`                                                      | `false` until SEO launch approval, then `true`         |
| `PAYMENTS_ENABLED`              | `false`                                                      | `false` until the Stripe launch runbook is complete    |
| `CUSTOM_ORDER_REQUESTS_ENABLED` | `false`                                                      | `false` until storage and policy approval are complete |
| `DATABASE_URL`                  | Isolated non-production database only if testing data writes | Production secret when a write feature is enabled      |
| `STRIPE_SECRET_KEY`             | Stripe test-mode key only if payment testing is approved     | Production secret when checkout is enabled             |
| `STRIPE_WEBHOOK_SECRET`         | Secret for the exact preview webhook endpoint, if used       | Secret for the production endpoint                     |
| `PRIVACY_CONTACT_EMAIL`         | Approved test/public contact if collection is enabled        | Approved public contact before collection              |

Preview and production must not share a writable database or Stripe live-mode credentials. `NEXT_PUBLIC_` values are visible to browsers; no secret belongs in a variable with that prefix.

## Preflight and preview verification

From `web/`, load the exact target environment and run:

```bash
npm ci
npm run format:check
npm run lint
npm run typecheck
npm run test
npm run deployment:check
npm run build
npm run quality:audit
```

The deployment preflight rejects an invalid production origin, ambiguous feature flags, incomplete payment or submission configuration, malformed database URLs, invalid privacy contacts, and preview indexing.

After a preview is ready, run the manual GitHub Actions workflow **Deployment smoke test** with its exact HTTPS origin, or run:

```bash
SMOKE_TEST_BASE_URL=https://preview.example.invalid npm run deployment:smoke
```

The smoke test verifies public information routes, metadata files, the manifest, and `/api/health`. If preview deployment protection is enabled, create an automation bypass secret in Vercel and store it only as the GitHub Actions secret `VERCEL_AUTOMATION_BYPASS_SECRET`. The test sends it using Vercel's documented protection-bypass header.

## Promotion and rollback

1. Complete `docs/launch-checklist.md` and attach evidence for manual browser, assistive-technology, policy, payment, and content review.
2. Promote only the exact preview commit that passed CI and smoke testing; do not rebuild a different commit during promotion.
3. Keep search indexing and write features disabled during the first production smoke test.
4. Enable each write feature separately only after its runbook passes. Run a Stripe test-mode order through the webhook path before live mode.
5. Record the production deployment ID, commit SHA, domain, environment review, database migration, Stripe webhook, and owner approval.
6. If smoke checks or runtime monitoring fail, disable the affected feature gate first and roll the production alias back to the last verified deployment.

`/api/health` proves that the Next.js process can serve requests. It intentionally does not query the database or disclose whether private credentials are configured. Payment and submission readiness must be verified through their dedicated gates and runbooks.
