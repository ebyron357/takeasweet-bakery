/**
 * CLIENT REVIEW MODE
 *
 * While true: customer-data collection stays disabled — the custom order,
 * contact, and newsletter forms show a local-only confirmation and transmit
 * nothing. Flip to false after client approval to enable them.
 */
export const CLIENT_REVIEW_MODE = true;

/**
 * PAYMENTS
 *
 * PAYMENTS_ENABLED   – whether the cart may start a Stripe Checkout session.
 * PAYMENTS_TEST_MODE – whether the store is running against Stripe TEST keys.
 *                      Drives all customer-facing "test mode" wording.
 * PAYMENTS_LIVE      – derived: live payments only when test mode is off.
 *
 * Stripe is currently configured with TEST keys only (sk_test / pk_test), so
 * no real money can move. To go live, the client must own a verified Stripe
 * account, live keys must be installed in project settings, and
 * PAYMENTS_TEST_MODE must be set to false.
 */
export const PAYMENTS_ENABLED = true;
export const PAYMENTS_TEST_MODE = true;
export const PAYMENTS_LIVE = PAYMENTS_ENABLED && !PAYMENTS_TEST_MODE;

export const REVIEW_CHECKOUT_NOTICE =
  "Test mode: checkout runs through Stripe's test environment, so no real payment is taken and no card is charged.";

export const REVIEW_FORM_NOTICE =
  "During client review, this form does not send or store any information.";
