# TakeASweet Bakery — Environment and Ownership Matrix

## 1. Purpose

This is the authoritative non-secret matrix for production activation. It records which values are required, where they belong, who owns them, what they enable, and how they are verified.

Never place real credentials, tokens, webhook secrets, database passwords, private customer data, or recovery codes in this file or any committed environment file.

## 2. Environment Separation Rules

- Development, preview, and production must use separate writable databases.
- Preview must never use Stripe live-mode credentials.
- Preview and initial production QA must keep search indexing disabled.
- Public payments and custom-order collection must be activated independently.
- No secret may use the `NEXT_PUBLIC_` prefix.
- The production origin must be an approved HTTPS URL.
- Feature activation occurs only after the dependent policy, infrastructure, and acceptance gates pass.

## 3. Environment Variable Matrix

| Variable | Purpose | Development | Preview | Production | Secret | Dependency | Owner | Verification |
|---|---|---|---|---|---|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | Canonical public origin used for metadata and URL generation | Local URL allowed | May use generated preview URL | Required approved HTTPS domain | No | Deployment and SEO | Website owner | Run deployment preflight; inspect canonical URLs |
| `SEARCH_INDEXING_ENABLED` | Controls public search indexing | `false` | `false` | `false` until SEO acceptance, then `true` | No | Final domain, metadata, sitemap, robots review | Website owner | Inspect `/robots.txt`, sitemap, and page robots directives |
| `PAYMENTS_ENABLED` | Allows creation of new Stripe Checkout sessions | `false` unless controlled test | `false` unless approved test-mode flow | `false` until full Stripe launch gate passes | No | Database, Stripe, privacy contact, policies, payment QA | Business owner | Deployment preflight plus controlled checkout test |
| `CUSTOM_ORDER_REQUESTS_ENABLED` | Allows public custom-order submissions | `false` unless controlled test | `false` unless isolated test storage is approved | `false` until storage, privacy, and operating rules pass | No | Database, privacy contact, request policy, abuse controls | Business owner | Deployment preflight plus controlled form submission |
| `DATABASE_URL` | Connects the application to MySQL persistence | Local/development database | Isolated preview database | Production database | Yes | Orders, payment events, custom requests | Database owner | Migration check, connection test, controlled write/read |
| `STRIPE_SECRET_KEY` | Server-side Stripe API authentication | Test mode only | Test mode only | Live mode only when approved | Yes | Checkout creation and reconciliation | Stripe account owner | Stripe account mode check and controlled API operation |
| `STRIPE_WEBHOOK_SECRET` | Verifies Stripe webhook signatures | Local Stripe CLI secret | Exact preview endpoint secret if used | Exact production endpoint secret | Yes | Payment-state updates | Stripe account owner | Signed event accepted; invalid signature rejected |
| `PRIVACY_CONTACT_EMAIL` | Public destination for privacy requests and required collection disclosures | Approved test address if collection is enabled | Approved address if collection is enabled | Required approved public address before collection | No | Payments and custom-order submissions | Business owner | Deployment preflight and public policy review |
| `VERCEL_AUTOMATION_BYPASS_SECRET` | Allows authorized smoke tests through preview protection | Not required | GitHub Actions secret only when preview protection blocks automation | Normally not required | Yes | Protected preview smoke testing | Vercel owner | GitHub smoke workflow reaches preview without exposing secret |

## 4. Platform Ownership Matrix

| Platform | Required owner | Required access before handoff | Billing owner | Recovery requirement | Acceptance evidence |
|---|---|---|---|---|---|
| GitHub | Client or approved technical owner | Admin or maintain access | As agreed | At least two authorized recovery paths | Client opens repository, branches, PRs, issues, and Actions |
| Vercel | Client business account | Owner/admin | Client | Verified recovery email and team owner | Client sees project, root directory, domain, environment scopes, deployments, and rollback |
| Domain registrar | Client | Account owner | Client | MFA and recovery contact | Client accesses DNS, nameservers, renewal, and transfer lock |
| Stripe | Client business entity | Account owner/admin | Client | MFA, recovery, verified business contact | Client sees test/live modes, payments, webhooks, payouts, disputes, and team access |
| MySQL database | Client or approved technical owner | Owner/admin plus least-privilege application user | Client | Backup and restore access | Migration applied, backup recorded, restore method documented |
| Customer email/notifications | Client | Owner/admin | Client | Recovery contact and forwarding plan | Test message reaches approved destination |
| Analytics/Search Console | Client | Owner/admin | Client | Secondary owner where supported | Client sees property and verified domain after activation |

## 5. Production Activation Sequence

1. Confirm client-approved business rules and public contact information.
2. Confirm final logo, authentic product photographs, founder presentation, and gallery permissions.
3. Confirm platform ownership and recovery access.
4. Create or identify the Vercel project and set the root directory to `web`.
5. Configure preview values with indexing and public write features disabled.
6. Deploy the exact PR commit to preview.
7. Run GitHub Actions, preview smoke tests, browser QA, mobile QA, and accessibility checks.
8. Provision and back up the production database.
9. Apply `database/001_stripe_order_persistence.sql` and verify the expected schema.
10. Configure the approved production privacy contact and database connection.
11. Configure Stripe test-mode validation and the exact webhook endpoint.
12. Run the complete successful, failed, expired, delayed, duplicate-event, and reconciliation test matrix.
13. Confirm the final HTTPS domain and production canonical origin.
14. Deploy production with payments, custom submissions, and indexing still disabled.
15. Run production smoke tests and record the rollback deployment.
16. Enable custom-order submissions only after their separate acceptance test passes.
17. Enable payments only after the Stripe and order-persistence acceptance tests pass.
18. Enable search indexing last, after final content and SEO approval.
19. Record the live URL, release commit, deployment ID, database migration, Stripe endpoint, approvals, and handoff evidence.

## 6. Rollback Controls

### Website failure

1. Disable the affected feature flag.
2. Roll the production alias back to the last verified READY deployment.
3. Run health and public-route smoke tests.
4. Review recent orders and custom requests for interrupted activity.

### Payment failure

1. Set `PAYMENTS_ENABLED=false` to stop new checkout sessions.
2. Keep the webhook endpoint available so existing sessions can reconcile.
3. Review Stripe sessions, webhook delivery attempts, and matching local orders.
4. Communicate only verified customer impact.

### Submission failure

1. Set `CUSTOM_ORDER_REQUESTS_ENABLED=false`.
2. Preserve existing records.
3. Verify the database, privacy contact, and abuse controls before reactivation.

### Database failure

1. Disable dependent write features.
2. Do not run destructive migrations or restores without a verified backup and authorized owner.
3. Record the last successful backup, migration state, affected orders, and recovery action.

## 7. Evidence Record

Complete this table during launch. Do not record secrets.

| Item | Value or evidence location | Owner | Status |
|---|---|---|---|
| Release commit SHA |  |  | Not Started |
| Vercel project |  |  | Not Started |
| Preview deployment |  |  | Not Started |
| Production deployment |  |  | Not Started |
| Rollback deployment |  |  | Not Started |
| Final HTTPS domain |  |  | Blocked |
| Database migration evidence |  |  | Blocked |
| Database backup evidence |  |  | Blocked |
| Stripe test evidence |  |  | Blocked |
| Production webhook verification |  |  | Blocked |
| Custom-order submission verification |  |  | Blocked |
| SEO/indexing approval |  |  | Blocked |
| Client acceptance |  |  | Blocked |

Allowed statuses: Not Started, In Progress, Blocked, Failed Quality Control, Verified Complete.