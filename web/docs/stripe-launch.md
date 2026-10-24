# Stripe launch runbook

Checkout must remain disabled until every item in this runbook and the policy launch checklist is complete. Never commit a credential or webhook signing secret.

## Required configuration

1. Create or select the approved Stripe account and confirm its business, tax, payout, and statement-descriptor settings with the bakery owner.
2. Apply `database/001_stripe_order_persistence.sql` to the production MySQL database and back up the database first.
3. Configure `DATABASE_URL`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `NEXT_PUBLIC_SITE_URL`, and `PRIVACY_CONTACT_EMAIL` in the deployment environment.
4. Register an HTTPS webhook endpoint at `/api/webhooks/stripe` and subscribe it to:
   - `checkout.session.completed`
   - `checkout.session.async_payment_succeeded`
   - `checkout.session.async_payment_failed`
   - `checkout.session.expired`
5. Keep `PAYMENTS_ENABLED=false` while testing. The webhook deliberately remains able to reconcile existing sessions when new checkout is disabled.
6. Complete the owner and legal review in `docs/policy-launch-checklist.md`.

Stripe requires the original request body, the `Stripe-Signature` header, and the endpoint secret to verify webhook signatures. The route follows that raw-body verification flow. See [Stripe webhook signature verification](https://docs.stripe.com/webhooks/signature).

## Test procedure

Use Stripe test-mode credentials and a non-production database.

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

1. Run a successful test checkout and confirm exactly one pending order is created before redirect.
2. Confirm the signed webhook changes that order to `paid`, saves the PaymentIntent identifier and customer contact fields, and does not duplicate its line items.
3. Resend the same event and confirm the event is acknowledged without changing the order again.
4. Test an expired session and a delayed-payment failure; only a pending order may become `cancelled`.
5. Confirm an invalid signature is rejected and a transient database failure returns an error so Stripe can retry.
6. Confirm the return page reconciles a paid session if its webhook delivery is delayed.
7. Run formatting, lint, type checking, tests, and the production build before setting `PAYMENTS_ENABLED=true`.

Stripe recommends webhook-driven fulfillment because customers are not guaranteed to reach the success page, and fulfillment must be safe to run more than once. See [Stripe Checkout fulfillment](https://docs.stripe.com/checkout/fulfillment).

## Operational rules

- Never fulfill an order solely because the browser reached the success URL.
- Investigate any Stripe Checkout Session that has no matching local order. Checkout creation tries to expire a session if local persistence fails.
- Do not delete processed event identifiers while Stripe could still retry them; the final retention period requires owner and legal approval.
- Refunds, cancellations, fulfillment completion, and customer notification remain manual until approved operational policies and authenticated administration are implemented.
