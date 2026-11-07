# TakeASweet — Client Handoff

This document has two parts:

1. **Handoff checklist** — what must happen before the site is handed over and
   launched, and who does it.
2. **Owner guide** — how the bakery runs the site day to day.

---

## Part 1 — Handoff checklist

### A. Decisions and accounts (agency + client)

- [ ] **Hosting ownership.** The site runs on Manus. Manus also provides admin
      sign-in, image storage (every `/manus-storage/…` image), and owner
      notifications. Decide one of:
      - transfer the Manus project to the client's own Manus account, or
      - keep it under the agency account with a written maintenance agreement.
      Moving to a different host is a separate project: sign-in, image storage,
      and notifications would need replacing.
- [ ] **Admin access.** Set `OWNER_OPEN_ID` to the client's Manus account so
      their sign-in becomes the admin. Confirm the client can open `/admin`.
- [ ] **Domain.** Register (or transfer) the domain in the client's name,
      point it at the site, then set `PUBLIC_SITE_URL` to the final
      `https://` address.
- [ ] **Stripe.** The client creates their own Stripe account (business
      details, bank account, identity verification). Then:
      1. Add their **test** secret key as `STRIPE_SECRET_KEY`.
      2. Create a webhook to `https://<domain>/api/stripe/webhook` for
         `checkout.session.completed`, `checkout.session.async_payment_succeeded`,
         `checkout.session.expired`, `checkout.session.async_payment_failed`;
         set its signing secret as `STRIPE_WEBHOOK_SECRET`.
      3. Run a test purchase with card `4242 4242 4242 4242` and confirm the
         order shows as **Paid** in Admin → Orders.
      4. Swap in the **live** key and a live-mode webhook secret.
- [ ] **Database.** The product catalog and all orders live only in the hosted
      database — the repository does not contain a copy of the menu. Take a
      backup before any account transfer or migration, and confirm backups are
      enabled on whichever account owns the database.
- [ ] **Run `pnpm db:push`** on the production database. Migration `0004`
      creates the Site Settings table; without it the site stays in review
      mode with payments off. Migration `0005` fills Order Information with
      the current page text, unless the owner has already saved some.

### B. Facts the client must provide or confirm

Nothing below may be invented. Until provided, the related section stays
hidden or general.

- [ ] **Pickup instructions** (private, shown only after payment). Current
      text promises: *"We'll email you within 24 hours…"* and *"Pickup is
      typically available Friday through Sunday."* — confirm or rewrite.
- [ ] **FAQ answers** (7 entries in Admin → Site Settings → FAQ): advance
      notice / weekly batches, pickup, delivery, payment methods, deposits,
      allergens, no wedding orders.
- [ ] **Order Information text** (5 sections in Admin → Site Settings →
      Order information): pickup, local delivery, no shipping, custom orders,
      payment. Confirm the delivery area, deposit, and payment wording.
- [ ] **Public contact email** (contact links are hidden while empty).
- [ ] **Social links** — Facebook, Instagram, TikTok (hidden while empty).
- [ ] **Logo** image.
- [ ] **Real photos** for the home hero and product cards (several current
      images are illustrative and labelled as such), plus gallery photos
      (the Gallery page appears once one photo is added).
- [ ] **Product details** — photo, description, lead time, ingredients,
      allergens, storage. Admin → Products lists what is missing per product.
- [ ] **Spelling** of the flavor "Tamarin" (vs. "Tamarind").
- [ ] **Delivery area, fees, minimums, refund and cancellation policy** —
      none are stated on the site today.
- [ ] **Privacy policy** — the current page is a general draft; have it
      reviewed before launch.
- [ ] **Wording still built into the pages.** Confirm these, or send new
      wording. Changing them needs your web developer:
      - Custom orders (home banner and Custom Orders page): deposit terms,
        "quote within a few days", and no wedding orders. The no-weddings
        rule is also enforced when a request is submitted.
      - Shop intro: "Handmade in small batches. The menu changes with the
        seasons."
      - Founder and family story (home, Our Story, footer): "kid-owned",
        "young Charlotte entrepreneur", local events and markets.
      - Privacy page: "home-based small business".

### C. Launch day (in order)

1. Deploy the final build and run `pnpm db:push`.
2. Client signs in to `/admin` and completes **Site Settings** and **Products**.
3. Complete one Stripe **test-mode** purchase end to end, then switch to live keys.
4. In Admin → Site Settings → Launch switches: turn **Client review mode off**,
   then turn **Online payments on**.
5. Run the site QA gate against the live URL:
   `QA_BASE=https://<domain> node scripts/site-qa.mjs`
6. Place one small real order and refund it from the Stripe dashboard.

---

## Part 2 — Owner guide

### Signing in

Go to `https://<your-site>/admin` and sign in. Only the owner account (and
any account later given the admin role) can see Admin; everyone else gets
"Not authorized". There is no Admin link on the public site.

### Launch switches (Admin → Site Settings)

| Switch | When ON | When OFF |
|---|---|---|
| **Client review mode** | Preview only: checkout blocked, forms send and store nothing, search engines asked not to index | Site is live: forms work, site can be indexed (once `PUBLIC_SITE_URL` is set) |
| **Online payments** | Cart can start a Stripe checkout (also needs review mode off and a Stripe key) | Cart shows "Online checkout isn't available right now. Please contact us…" |

The settings page shows which Stripe keys are installed: **Stripe not
connected**, **Stripe test keys**, or **Stripe live keys**. Changes apply
within about a minute.

### Business details, images, gallery, FAQ (Admin → Site Settings)

- **Leave a field empty to hide it** on the site — nothing shows a blank or a
  placeholder.
- **Images:** tap **Upload photo** next to any image to pick one from your
  phone or computer, or paste an `https://…` link. Then write a short
  description (alt text) for screen readers and press **Save Settings** — the
  photo isn't public until you save. Clear the link to remove an image; the
  page adjusts.
- **About uploads:** JPEG, PNG, or WebP. Photos are turned upright and resized
  automatically, and location and camera details are removed, so a photo
  taken at home never reveals where it was taken. If an iPhone photo is
  refused as the wrong type, it was saved in Apple's HEIC format: choose it
  from the Photos library on the iPhone itself, or export it as JPEG first.
- **Gallery** — authentic photos only; use the arrows to reorder.
- **FAQ** — the first four questions also appear on the home page. With no
  questions, the FAQ page and its menu link are hidden.
- **Order information** — the sections on the Order Information page. Give
  each one a title, a description, and an icon; use the arrows to reorder.
  Sections with the **Pickup**, **Delivery**, or **No shipping** icon also
  appear in the home page's "Pickup & Delivery" block, next to the service
  area. With no sections, the page and its footer link are hidden.
- **Pickup instructions** are private: customers see them only on the order
  confirmation page after paying. Never put the pickup address anywhere else.

### Products (Admin → Products)

- Add or edit a product: name, category, price, description, photo (**Upload
  photo**, then **Save**), size,
  flavor options (comma-separated), max flavor selections (e.g. 4 for Four
  Corners), quantity options, lead time, ingredients, allergens, storage.
- **In Stock** off shows the product as sold out. **Seasonal Active** off
  hides a seasonal item out of season.
- The "Missing:" note on a product lists customer-facing details not yet
  filled in.

### Orders (Admin → Orders)

Online orders arrive as **Pending** and become **Paid** automatically when
Stripe confirms payment (or **Cancelled** if the payment expires or fails).
Set **Fulfilled** once picked up or delivered. Refunds are issued from the
Stripe dashboard.

### Custom requests (Admin → Custom Requests)

Requests move through: **New → Approved → Deposit requested → Confirmed**, or
**Declined**. The site never charges for custom orders — send the quote and
deposit invoice yourself (for example, a Stripe invoice).

### Messages (Admin → Messages)

Messages from the Contact form. The owner is also notified of new orders,
custom requests, and messages through Manus notifications.

### If something looks wrong

- **Checkout says it isn't available** — check that review mode is off,
  online payments is on, and Stripe shows test or live keys.
- **A section disappeared** — its content is empty in Site Settings; a menu
  category appears only while it has at least one product (seasonal items
  with Seasonal Active off don't count).
- **A photo won't upload** — the message says why: wrong file type, too
  large, or a damaged file. "Photo upload isn't set up on this server" means
  the hosting storage service isn't connected; paste an image link instead
  and contact your web developer.
- **Settings won't save** — the page explains which field is invalid (for
  example, links must start with `https://`, every image needs alt text,
  every FAQ entry needs a question and an answer, and every Order Information
  section needs a title and a description).
- Anything else: contact your web developer with the page address and a
  screenshot.
