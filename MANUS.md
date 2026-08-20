# Manus Execution Standard — TakeASweet Bakery

## Objective
Improve the existing TakeASweet Bakery production application without rebuilding it, duplicating it, or replacing its current architecture.

## Source of Truth
- Repository: `ebyron357/takeasweet-bakery`
- Working branch: create a dedicated feature branch from `main`
- Production source: this repository
- Existing stack, routes, database design, payment flow, and application structure must be preserved unless a verified defect requires a bounded correction.

## Required First Actions
1. Read `README.md` completely.
2. Inspect the current repository before proposing changes.
3. Read existing project documentation, task lists, schemas, tests, environment examples, and deployment configuration.
4. Produce a short checklist based only on confirmed repository state.
5. Continue from existing work; do not scaffold a replacement website.

## Active Product Scope
The target product is a premium custom bakery platform with:
- online ordering;
- deposits and full payments through Stripe;
- AI Bakery Concierge;
- product and custom-work gallery;
- cake builder;
- admin dashboard;
- customer portal.

The project is not a Shopify store. Preserve support for a direct payment gateway and the existing application architecture.

## Credit-Control Rules
- Use the least expensive capable Manus mode for inspection, bounded edits, content changes, routine styling, and ordinary testing.
- Do not conduct broad competitor research unless explicitly requested.
- Do not regenerate working pages, components, copy, or assets without a confirmed reason.
- Do not repeatedly rescan unchanged files.
- Group related edits into one bounded implementation pass followed by one verification pass.
- Do not run parallel agents on the same work.
- Do not use open-ended instructions such as “improve everything” or “continue until perfect.”
- Stop when the stated acceptance criteria pass or a true blocker is documented.
- Use GitHub as the permanent source of truth. Do not leave the only completed version inside Manus.

## Change Control
- Work on a feature branch.
- Preserve unrelated functionality.
- Never expose or commit secrets.
- Record exact files changed and why.
- Open a pull request; do not merge without passing the repository’s required checks.

## Minimum Verification
Run the applicable project commands, including:
- `pnpm check`
- `pnpm test`
- `pnpm build`

Also verify the affected user flow, responsive behavior, accessibility basics, and absence of visible placeholders or broken links. If a command is unavailable or fails because of missing authorized credentials, document the exact blocker and continue all unblocked checks.

## Completion Evidence
A task is complete only when Manus provides:
- branch name;
- commit hash;
- pull-request link;
- files changed;
- checks run and exact results;
- screenshots or preview URL for visual work;
- remaining blockers, if any.

Allowed statuses: Not Started, In Progress, Blocked, Failed Quality Control, Verified Complete.
