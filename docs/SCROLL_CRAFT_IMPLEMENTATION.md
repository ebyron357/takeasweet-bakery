# Scroll Craft integration

Source: https://github.com/nateherkai/scroll-craft at
75d81f74e83692add18cd7a8a8e078b8a887a579 (v0.3.1). MIT, Nate Herk;
full notice in SCROLL_CRAFT_LICENSE.txt. Adapts the vendorable engine's
one-shot IntersectionObserver flow-entry pattern to a lifecycle-managed React group.

Plan and scope: trace decorative brand-colored rules on existing public content.
Keep text, links, forms and semantic structure available immediately. Use scoped
CSS only; no global upstream resets, typography/colors, video loop, scroll
interception, new dependencies, analytics or collected data. Existing business
logic, operational pages and production configuration are outside this change.

Rules initialize without a reverse transition, animate once on entry and then
unobserve. Live reduced motion completes rules immediately and stops observing;
turning motion back on does not replay. No-JS and missing-observer fallbacks are
static. React unmount disconnects observers and preference listeners.

Rollback: revert this integration commit; no schema or configuration migration.
Verification and deployment evidence are recorded below before release.

## Verification — 2026-10-19
- Frozen install, TypeScript, 25 server tests, production build PASS. Existing
  Vite >500kB bundle warning remains; no production dependency added.
- Added Playwright development dependency and public-frontend browser CI.
- Local server launch BLOCKED by absent Stripe/OAuth runtime configuration; no
  credentials invented or settings changed. Browser checks use built Vite preview.
- The baseline SPA requires JavaScript for all pages; no-JS full-site availability
  is not claimed. Missing-observer fallback keeps the ordering guide usable.
- No payments, database migrations or live customer writes were exercised.
