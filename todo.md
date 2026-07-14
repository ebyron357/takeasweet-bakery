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
- [ ] Checkpoint and deliver
