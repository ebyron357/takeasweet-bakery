# Analytics event contract

The storefront emits a small provider-neutral browser event contract so an approved analytics provider can be connected later without rewriting customer flows. No provider SDK, tracking identifier, cookie, network request, or customer identity is included.

## Browser contract

Listen for the `takeasweet:analytics` `CustomEvent` on `window`. Its detail contains `schemaVersion: 1` and one typed event:

- `add_to_cart`: product slug, quantity, and selected-flavor count.
- `remove_from_cart`: product slug, quantity, and selected-flavor count.
- `change_cart_quantity`: product slug, previous quantity, and new quantity.
- `begin_checkout`: cart line count and total item count.
- `custom_order_request_submitted`: no properties.

The contract deliberately excludes names, email addresses, phone numbers, event details, payment identifiers, full URLs, IP addresses, and persistent visitor identifiers. It does not claim that a checkout or custom order converted; those outcomes require an approved server-side measurement design that respects Stripe, privacy, and retention decisions.

## Provider launch gate

Before registering a listener or adding any analytics SDK:

1. Approve the provider, business purpose, event mapping, retention, access, and deletion process.
2. Determine whether consent or a preference control is legally required for the actual deployment and audience.
3. Add the real provider identifier only through the deployment environment. Never invent an ID or commit a secret.
4. Update `/privacy` with the provider, data categories, cookies or storage, sharing, retention, and opt-out process.
5. Prevent duplicate events, exclude preview and staff traffic where appropriate, and verify that form or payment data is not captured.
6. Test the production adapter with browser developer tools and the provider's live debugger before relying on reports.

Until these steps are complete, the internal events remain local to the page and no analytics data leaves the application.
