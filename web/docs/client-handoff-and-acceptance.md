# TakeASweet Bakery — Client Handoff and Acceptance Guide

## 1. Purpose

This is the complete operating and acceptance guide for returning the TakeASweet Bakery website to the client. It supplements the technical deployment, Stripe, privacy, SEO, media, accessibility, and launch runbooks already in this repository. It does not replace those technical controls.

The website must not be described as fully launched until the production deployment, business rules, authentic content, payment flow, access transfer, and final client acceptance are verified.

## 2. Confirmed Operating Boundaries

- The business is TakeASweet Bakery.
- The website supports direct ordering and is not a Shopify store.
- Stripe is the planned payment gateway.
- The service area is Charlotte, North Carolina.
- Shipping is not offered.
- Wedding orders are not accepted.
- A private residential or pickup address must not appear publicly.
- Pickup details must not be exposed before the approved confirmation stage.
- Authentic bakery photographs are required for the real-work gallery.
- Fake testimonials, invented policies, unsupported food claims, invented availability, and unapproved contact information are prohibited.

## 3. Current Delivery Status

### Verified foundation

- Production Next.js storefront exists on `agent/nextjs-production-migration`.
- The verified menu, product pages, cart, custom-order workflow, Stripe architecture, signed webhook handling, order persistence, privacy pages, SEO, accessibility foundations, deployment preflight, smoke tests, and rollback guidance are implemented.
- GitHub Actions for PR #1 passed on the previously tested head.
- Public payments, public submissions, and search indexing remain disabled until their separate launch gates pass.

### Remaining launch blockers

- Final client business-rule approvals.
- Approved logo, real product photography, founder image or avatar, and gallery assets.
- Final public contact details and social links.
- Vercel project, domain, database, Stripe, and production environment ownership.
- Live end-to-end testing and client acceptance.

## 4. Client Decisions Still Required

### Required before launch

1. Confirm the customer-facing email address.
2. Confirm whether a public phone number will be displayed.
3. Provide the approved Facebook and Instagram links.
4. Confirm whether `Tamarin` is the correct menu spelling.
5. Confirm the current menu items, prices, sizes, flavors, option limits, and availability.
6. Confirm the Four Corners Cheesecake price and flavor-selection rules.
7. Confirm regular-order lead times.
8. Confirm the pickup process and how private pickup details are communicated.
9. Confirm whether local delivery is active at launch and, if so, the approved area, fee, minimum, and exclusions.
10. Confirm custom-order lead time, deposit amount, balance due date, and deposit-refund rule.
11. Approve cancellation, refund, missed-pickup, order-change, and substitution rules.
12. Approve allergen, cross-contact, storage, refrigeration, and freshness language.
13. Approve the final logo and authentic photographs.
14. Confirm the final domain and the authorized owners of Vercel, Stripe, the database, and the domain.
15. Confirm who receives administrator access and who gives final launch approval.

### Optional before launch

- Approved testimonials.
- Additional gallery categories.
- Public founder quote.
- Analytics provider activation.
- Search Console and Bing Webmaster Tools connection.
- Customer accounts or additional staff roles.

## 5. Website Operations

### 5.1 Product and menu management

The authorized owner should be able to:

1. Open the administration area using an individual account.
2. Locate the product record.
3. Change only confirmed public values such as name, price, flavor options, size, availability, or seasonal status.
4. Save the change.
5. Open the public menu and product page in a private browser window.
6. Verify the new value appears correctly and that no internal approval marker is visible.

Do not publish unconfirmed ingredients, allergens, storage instructions, availability, claims, or prices.

### 5.2 Sold-out and seasonal controls

- Use the existing availability controls rather than deleting products.
- Mark unavailable items sold out so customers receive a clear state.
- Use seasonal status only for approved seasonal items.
- Recheck the public menu after every status change.

### 5.3 Order management

For each order, the authorized operator should verify:

- order reference;
- payment state;
- selected products and flavors;
- quantity and total;
- customer contact details;
- pickup or approved-delivery instructions;
- fulfillment notes.

Never treat a browser redirect to the success page as proof of payment. Payment fulfillment must rely on the persisted order state and verified Stripe webhook or reconciliation result.

### 5.4 Payment-state meanings

- `pending`: checkout started but payment is not confirmed;
- `paid`: Stripe confirmation has been processed;
- `cancelled`: an eligible pending checkout expired or failed;
- `refunded`: funds were returned according to an approved policy and the local record was updated.

Do not manually mark an order paid without matching authorized payment evidence.

### 5.5 Custom-order requests

1. Review the requested event, date, quantity, and details.
2. Confirm the request is not for a wedding.
3. Check capacity and the approved lead-time rule.
4. Approve or decline the request.
5. Send approved pricing and deposit instructions outside the public request form.
6. Record the decision and payment state.
7. Do not describe a request as a confirmed order before approval and required payment.

### 5.6 Refunds and cancellations

The technical refund process must not be used until the client approves the policy. When approved:

1. Confirm the request qualifies under the written policy.
2. Identify the matching order and Stripe payment.
3. Record the reason and approving person.
4. Issue the authorized refund in Stripe.
5. Update the local order state and internal notes.
6. Send the approved customer communication.
7. Retain non-sensitive evidence according to the approved retention policy.

## 6. Authentic Media and Gallery Management

Only approved real photographs may be placed in the authentic bakery gallery.

For each image:

1. Confirm the bakery owns the image or has permission to publish it.
2. Confirm consent for every identifiable person.
3. Remove private location, school, address, or sensitive metadata when necessary.
4. Crop and optimize the image without misrepresenting the product.
5. Add accurate alt text describing the visible item.
6. Verify the public gallery on mobile and desktop.

Do not place stock, generated, placeholder, competitor, or unverified images in the authentic gallery.

## 7. Platform Ownership and Access Transfer

| Platform | Intended owner | Required access | Billing responsibility | Delivery verification |
|---|---|---|---|---|
| GitHub repository | Client or approved technical owner | Admin or maintain access | As agreed | Client can open repository and PR history |
| Vercel | Client business account | Owner/admin | Client | Client can see project, domain, deployments, and rollback controls |
| Domain registrar | Client | Account owner | Client | Client can access DNS and renewal settings |
| Stripe | Client business entity | Account owner/admin | Client | Client can see payments, webhooks, payouts, and support settings |
| Production database | Client or approved technical owner | Owner/admin with least-privilege app credentials | Client | Backup, restore, and credential ownership confirmed |
| Email/notifications | Client | Owner/admin | Client | Order and support destinations verified |
| Analytics/Search tools | Client | Owner/admin | Client | Property ownership and data access verified |

Credentials must never be pasted into this repository or this guide. Use an approved password manager and individual accounts wherever possible.

## 8. Deployment and Rollback Summary

Normal release sequence:

1. Complete repository checks.
2. Produce a preview deployment from the exact PR commit.
3. Run preview smoke tests and manual QA.
4. Confirm production environment values without exposing secrets.
5. Promote the verified commit.
6. Run production smoke tests with payments, submissions, and indexing still gated as required.
7. Activate one write feature at a time.
8. Record the production deployment, commit SHA, domain, and rollback candidate.

Emergency sequence:

1. Disable the affected feature flag.
2. Preserve webhook reconciliation for existing payment sessions.
3. Roll the production alias back to the last verified READY deployment.
4. Verify public routes and health checks.
5. Review pending orders and customer communications.
6. Record the incident, cause, correction, and recovery evidence.

See `docs/deployment.md` and `docs/stripe-launch.md` for the authoritative technical procedures.

## 9. Final Acceptance Test Record

Use only these statuses: Not Started, In Progress, Blocked, Failed Quality Control, Verified Complete.

| Area | Test action | Expected result | Evidence | Status |
|---|---|---|---|---|
| Homepage | Open on mobile and desktop | Approved branding, copy, navigation, and calls to action render correctly | Screenshots | Not Started |
| Menu | Review all categories and items | Approved names, prices, sizes, flavors, availability, and seasonal states | Screenshots and catalog sign-off | Blocked |
| Product pages | Open each product route | Correct product information and valid option selection | Route record | Not Started |
| Cart | Add, change, and remove items | Server-approved totals and options remain correct | Screen recording or test record | Not Started |
| Custom orders | Submit valid and wedding-related requests | Valid request follows approved process; wedding request is rejected | Test record | Not Started |
| Checkout | Run successful test-mode payment | Exactly one order becomes paid through verified Stripe handling | Stripe and database evidence | Blocked |
| Failed payment | Run declined or failed test | No paid fulfillment occurs; state remains safe | Stripe and database evidence | Blocked |
| Duplicate protection | Resend or retry payment event | No duplicate order or duplicate line items | Event and database evidence | Blocked |
| Pickup privacy | Inspect public and unpaid states | Private pickup details are not exposed prematurely | Screenshots | Not Started |
| Gallery | Review approved images | Only authentic, consented images with accurate alt text appear | Asset approval record | Blocked |
| Forms | Test validation and errors | Errors are clear, accessible, and do not lose entered data unnecessarily | Test record | Not Started |
| Accessibility | Keyboard, screen-reader spot check, 200% zoom, reduced motion | Critical journeys remain usable | Manual QA record | Not Started |
| Browsers | Test Chrome, Edge, Safari, and Firefox | No material route or interaction failure | Browser matrix | Not Started |
| Mobile | Test representative iPhone and Android widths | Navigation, forms, products, and cart remain usable | Screenshots | Not Started |
| SEO | Verify metadata, robots, sitemap, canonical origin | Correct production values; preview remains non-indexable | Validator output | Blocked |
| Security | Review headers, secrets, and browser output | Required headers present; no secret or private data exposed | Audit record | Not Started |
| Deployment | Run health and route smoke tests | Required routes and `/api/health` pass | Workflow or command output | Blocked |
| Rollback | Revert to prior READY deployment | Site recovers and critical routes pass | Deployment evidence | Blocked |

## 10. Client Acceptance

The client should approve each item only after reviewing the live production result.

- [ ] Business name, menu, prices, sizes, flavors, and availability approved.
- [ ] Branding, logo, founder presentation, and authentic photographs approved.
- [ ] Pickup, delivery, lead time, custom-order, cancellation, refund, allergen, storage, and privacy rules approved.
- [ ] Successful and failed payment tests reviewed.
- [ ] Admin access received and password recovery verified.
- [ ] GitHub, Vercel, domain, Stripe, database, and related ownership received or formally assigned.
- [ ] Product, order, custom-request, refund, media, deployment, and rollback training received.
- [ ] Known limitations and post-launch backlog reviewed.
- [ ] Final production URL approved.
- [ ] Website authorized for public launch.

Client name: ______________________________

Approver role: ____________________________

Signature: _______________________________

Date: ___________________________________

Final production URL: _____________________

Release commit: ___________________________

## 11. Maintenance Schedule

### Weekly

- Review new orders, failed payments, pending sessions, and custom requests.
- Confirm currently available and sold-out products.
- Check the public contact route and critical ordering journey.

### Monthly

- Review prices, menu details, photos, social links, and policy accuracy.
- Review Stripe webhook failures and database backup status.
- Review website users and platform access.
- Check broken links, search indexing, and analytics only if approved and active.

### Quarterly

- Test rollback and backup recovery procedures.
- Review dependencies and security notices.
- Review client ownership, billing, recovery contacts, and documentation.

## 12. Known Limitations and Post-Launch Work

Do not describe these as shipped unless verified in the production application:

- customer accounts or customer portal;
- expanded staff-role management;
- automated refund policy decisions;
- advanced delivery-zone calculation;
- automated custom-order invoicing;
- AI bakery concierge;
- large gallery filtering system;
- advanced analytics or marketing automation.

Launch-required work must remain separate from optional future enhancements in GitHub Issue #3.