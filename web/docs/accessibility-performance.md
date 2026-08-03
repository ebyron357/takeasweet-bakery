# Accessibility and performance verification

The project treats accessibility and performance as release gates, not one-time scores. CI runs the production build and then `npm run quality:audit` against the generated output.

## Automated release gates

- Every prerendered page must declare `en-US`, expose one main landmark and one level-one heading, and provide a working keyboard skip link.
- Every prerendered image must include alternative text, including an explicitly empty alternative for decorative images.
- Transactional and API routes must remain absent from the sitemap.
- Generated social images must remain valid 1200×630 PNG files.
- Each application route must remain below 150 KiB of compressed JavaScript according to the production manifest.
- Each generated stylesheet must remain below 30 KiB compressed.
- ESLint, TypeScript, unit tests, and the production build remain separate required checks.

## Implemented interaction safeguards

- Minimum 44-pixel targets for primary links, buttons, cart controls, and fields.
- Visible keyboard focus treatment and a focusable skip-link target.
- Semantic navigation, main, section, fieldset, legend, label, status, and alert elements.
- Quantity limits are enforced and disabled controls expose their state.
- Cart quantity and form submission state are announced to assistive technology.
- Reduced-motion preferences disable smooth scrolling and nonessential transitions.
- Responsive content uses fluid grids and avoids fixed content widths.
- No external font dependency; the system font stack avoids font-loading delay and layout shift.

## Manual pre-launch checks

Automated checks cannot prove full conformance. Before launch, test the final deployment with current desktop and mobile browsers, keyboard-only navigation, browser zoom at 200% and 400%, a screen reader, forced colors, reduced motion, and an automated accessibility engine. Measure Core Web Vitals on the deployed production origin under mobile throttling.

Record any issue with its route, viewport, browser or assistive technology, reproduction steps, severity, and resolution. Do not publish a perfect accessibility or performance score without evidence from the final deployed site.
