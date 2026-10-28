# TakeASweet Bakery — Operating Standard

This project operates at the highest professional standard. Every change ships
error-free, verified, and better than what the client asked for. "Good enough"
is not a passing grade. Read `SKILL.md` for the product scope and workflow;
this file sets the quality bar that every change must clear.

## Non-negotiables

- **Verified, not assumed.** Never report something as working unless it was
  run and observed working. Say exactly what was tested, how, and what was not.
- **No placeholders.** No "coming soon", lorem ipsum, fake testimonials, stand-in
  icons, generic social links, or marker strings on any public page. A section
  with no real content is hidden, not filled.
- **Nothing hard-coded that the owner should control.** Business details,
  images, FAQ, social links, launch switches, and policies live in the site
  settings (Admin → Site Settings) or the product catalog — not in code.
- **Fail closed.** If settings or data can't load, data collection and payments
  stay off and empty sections stay hidden. Never fail open.
- **Private stays private.** No pickup address, customer data, secrets, or keys
  on public pages, in client code, or in logs.
- **Never invent business facts.** Prices, policies, allergens, lead times, and
  claims come from the client. Missing facts are left empty and listed for the
  client — never guessed.

## Definition of done

A change is done only when every applicable gate passes:

1. `pnpm check` — zero type errors.
2. `pnpm test` — all tests pass; new behavior has tests, including the failure
   and permission paths.
3. `pnpm build` — production build succeeds.
4. **Database:** any schema change has a migration, applied to a real MySQL
   (throwaway container is fine) and read back through the app's own code.
5. **Site QA:** `node scripts/site-qa.mjs` against a running build passes — every
   public page at 1440px and 390px with no page errors, no horizontal scroll,
   exactly one `<h1>`, alt text on every image, and zero serious or critical
   axe accessibility violations.
6. **Visual review:** screenshots of every changed page at desktop and phone
   width, actually looked at. Check alignment, spacing, overlap, empty slots,
   text wrapping, and touch targets (44px minimum for primary controls on
   phones).
7. **Self-review:** re-read the full diff adversarially before pushing. Remove
   formatting noise, dead code, and anything not needed for the change.

## Design and accessibility bar

- Mobile-first. Every page must look intentional at 390px, not just "fit".
- WCAG 2.2 AA: text contrast, keyboard access with visible focus, labeled form
  fields, clear error messages, and respect for reduced-motion settings.
- Consistent components: reuse `ProductCard`, `CheckoutButton`, the settings
  hook (`useSiteSettings`), and existing tokens in `client/src/index.css` before
  creating anything new.
- Images always carry meaningful alt text; decorative images use `alt=""`.

## Code conventions

- Match the surrounding code: naming, comment density, and formatting. Client
  code and most server code use 100-column width with trailing commas;
  `server/site-meta.ts` follows `.prettierrc` (80 columns). Never reformat
  lines you did not change.
- Shared settings schema: `shared/site-settings.ts`. Server access:
  `server/site-settings.ts`. Client access: `client/src/hooks/useSiteSettings.ts`.
- Validate all input on the server with zod; the client check is a convenience.

## Git and delivery

- Work on a branch; never commit directly to `main`.
- Commit messages explain what changed and why.
- Open a pull request for review; the owner merges.
- Deployments that include a migration must run `pnpm db:push`.
- Reports to the owner are plain, specific, and honest: what was done, what was
  verified, what remains, and what is needed from the client.
