# TakeASweet Cookies & Treats — Project TODO

## Setup & Foundation
- [x] Design tokens in index.css (sunshine yellow, soft pink, sky blue, cocoa brown, warm white) + Google Fonts
- [x] Database schema: products, orders, order_items, custom_order_requests, newsletter_subscribers, contact_messages
- [x] Generate original brand assets (logo, hero image, product photos, story image)
- [x] Seed product catalog (Cookies, Treats, Seasonal) with prices

## Core Storefront
- [x] Global layout: top nav (logo, links, cart icon w/ count), announcement banner, footer (newsletter + "Serving Charlotte, North Carolina.")
- [x] Homepage: hero banner, featured products carousel, brand story snippet, newsletter signup section
- [x] Shop All page: product grid organized by category (Cookies, Treats, Seasonal), visible prices, Add to Cart on cards
- [x] Product detail page: photo, name, price, description, Add to Cart
- [x] Cart: drawer/page with quantity management, remove items, subtotal

## Checkout & Orders
- [x] Stripe integration for standard product checkout
- [x] Order confirmation page revealing pickup details ONLY post-purchase
- [x] Orders stored in DB with status

## Custom Orders
- [x] Custom Order page: form (event type, date, quantity, details)
- [x] Wedding orders explicitly blocked in form validation (client + server)
- [x] Approval + deposit flow messaging (request → review → approval → deposit invoice)

## Content Pages
- [x] Our Story page: founder journey, young entrepreneurship, family support, Charlotte community (no private details, no age/school/address)
- [x] Contact page: inquiry form + exact copy "Serving Charlotte, North Carolina."

## Admin Panel
- [x] Role-gated admin route (admin role only)
- [x] Product management: add, edit, toggle in-stock, seasonal availability
- [x] View orders and custom order requests (approve/decline custom requests)

## Quality & Compliance
- [x] No residential/pickup address on any public page
- [x] Mobile-first responsive verification (375px + desktop)
- [x] Vitest tests for key server procedures (products, custom order wedding block, checkout)
- [x] Checkpoint and deliver

## Homepage Rebuild (Client Brief v2)
- [x] Announcement bar: "Fresh treats made in Charlotte — pickup and local delivery available."
- [x] Header nav: logo placeholder, Home, Shop, Menu, Custom Orders, Our Story, FAQ, Cart, mobile menu
- [x] Hero: image placeholder (no AI food imagery), headline "Big Dreams. Seriously Sweet Treats.", supporting copy, Shop the Menu + Meet the Founder buttons, kid-owned line
- [x] Featured Favorites cards: Banana Pudding, Cookies, Four Corners Cheesecake, Treat Cups (placeholders only, no invented prices/descriptions)
- [x] Shop by Category cards: Limber, Treat Cups, Cookies, Cheesecake, Seasonal Treats
- [x] Four Corners Cheesecake feature: $20, up to 4 flavors, flavors chosen before checkout, flavor-selection preview
- [x] Our Story section: "Built from a Big Idea", portrait placeholder, no age
- [x] Community section with booth/event photo placeholder
- [x] Custom Orders section (no weddings, review before payment, deposit for large orders)
- [x] Pickup & Delivery section (Charlotte, pickup after confirmation, local delivery in approved area, no shipping)
- [x] Testimonial component built but empty (no fake testimonials)
- [x] Social media links (Facebook, Instagram), no heavy feeds
- [x] FAQ preview section with editable Q&A (advance notice, pickup, delivery, payments, deposits, allergens, custom orders)
- [x] Footer: navigation, service area, contact links, social links, policies, copyright
- [x] Replace AI product imagery with neutral placeholders; update categories in DB (limber, treat-cups, cookies, cheesecake, seasonal)
- [x] FAQ page with full Q&A list
- [x] Design: mobile-first, large type, clean white space, playful organic shapes sparingly, no summer theme, no clutter
- [x] Test, checkpoint, deliver v2

## Verified Menu Catalog (Client Brief v3)
- [x] Extend products schema: size, flavorOptions, quantityOptions, leadTime, pickupEligible, deliveryEligible, ingredients, allergens, storage, relatedSlugs
- [x] Seed verified menu: 8 Limber flavors ($1.50/5oz), 5 Treat Cups ($3.00/5oz), 5 Cookies ($5.00), Four Corners Cheesecake ($20, 8 flavors)
- [x] Preserve "Tamarin" spelling until client confirms
- [x] Store "CLIENT APPROVAL REQUIRED" for missing data (admin-only, never shown publicly)
- [x] Menu page: category nav, search, filtering, product cards with price/flavors/availability/seasonal badge/pickup-delivery eligibility, order button, empty + sold-out states
- [x] Reusable ProductCard/CategorySection components driven by data (no layout editing needed to add products)
- [x] Update product detail page for flavor options from DB and new fields
- [x] Update admin panel for extended fields
- [x] Accessibility: semantic HTML, labels, keyboard nav
- [x] Update tests, checkpoint, deliver v3

## Targeted Refinement Pass (Client Brief v4 — no rebuilds, no image gen)
- [x] Audit current pages via screenshots before changing anything
- [x] Header/nav: deduplicate Shop vs Menu links, tidy mobile menu, focus states
- [x] Product cards: consistent ratios, reduce rounding, scannable price/options, cleaner sold-out state
- [x] Menu page: improved category nav and seasonal/sold-out states, price scanning
- [x] Product page: hierarchy, prominent add-to-cart, mobile-friendly option selectors
- [x] Custom order form: spacing, labels, validation, mobile usability (workflow unchanged)
- [x] Accessibility: contrast, focus-visible rings, touch targets (44px), heading hierarchy, reduced motion, form error states
- [x] Footer: contact/social/service area/policies easy to find (no address)
- [x] Verify desktop + mobile, checkpoint, report changes once

## Client-Review Preview (Client Brief v5 — controlled single pass)
- [x] Review mode flag: disable checkout (clear notice in cart), disable custom-order/contact/newsletter data transmission (client-side only confirmation)
- [x] Gallery page: reserved space for authentic photos, intentionally empty, no stock/generated images presented as real work
- [x] Privacy page (review-safe general policy, no invented specifics)
- [x] Order Information page (pickup/delivery/no-shipping/deposit rules from approved facts)
- [x] 404/error states polished
- [x] Homepage additions: gallery preview section, order info link in footer/policies
- [x] Nav/footer: add Gallery, Privacy, Order Info links; no duplicates
- [x] Verify no public "CLIENT APPROVAL REQUIRED" text and no broken links
- [x] Verify all required routes desktop + mobile, one pass
- [x] Push work to one GitHub feature branch (no merge), collect commit hash
- [x] Deliver preview URL + evidence report

## Bounded Correction Pass (Client Brief v6)
- [x] Remove public Admin nav link (header + mobile); keep /admin role-protected but undiscoverable
- [x] Remove all visible "photo coming soon" / "coming soon" messages site-wide
- [x] Generate 4 category-level illustrative images in ONE batch (Limber, Cookies, Four Corners Cheesecake, Treat Cups); consistent style; assign to products
- [x] Add one discreet site-level disclosure: "Some menu images are illustrative until authentic product photography is available."
- [x] Compact product cards: shorter image area (4:3), verified info only, clear actions; avoid cramped 4-col grids (switch to 3-col max on desktop)
- [x] Gallery: polished empty-gallery message without "coming soon" language
- [x] Hero/story: remove placeholder box language, elevate young-founder + Charlotte story visually
- [x] Refine TS brand mark presentation (less generic, no new permanent logo)
- [x] Newsletter submission disabled/removed during review (not just intercepted)
- [x] Confirm checkout + all data collection remain disabled; wedding block intact; no shipping; no address
- [x] Verify all 12 routes desktop + mobile, publish, deliver evidence
