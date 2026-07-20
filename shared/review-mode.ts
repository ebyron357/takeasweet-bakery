/**
 * CLIENT REVIEW MODE
 * While true: checkout is disabled, and forms (custom orders, contact,
 * newsletter) do not transmit customer data — they show a local-only
 * confirmation instead. Flip to false to restore full functionality
 * after client approval.
 */
export const CLIENT_REVIEW_MODE = true;

export const REVIEW_CHECKOUT_NOTICE =
  "Online checkout is disabled during client review. Prices and cart totals are shown for preview only.";

export const REVIEW_FORM_NOTICE =
  "During client review, this form does not send or store any information.";
