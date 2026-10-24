# SEO and indexing launch runbook

The application provides canonical metadata, Open Graph and Twitter cards, a web manifest, `robots.txt`, `sitemap.xml`, and factual JSON-LD. Search indexing remains denied by default so an unfinished domain or unapproved content cannot enter search results.

## What is implemented

- Page-specific titles, descriptions, canonical URLs, and social metadata.
- A branded social card that does not use unverified bakery photography.
- A sitemap containing the public information routes and all verified menu pages. Cart, checkout return, and API routes are excluded.
- Site and menu structured data based only on the approved name, service area, public routes, and verified catalog names.
- Product breadcrumb data without fabricated availability, ratings, reviews, images, address, hours, telephone, or offer claims.
- Two independent indexing safeguards: page-level robots metadata and `robots.txt`.

## Launch requirements

- [ ] Confirm the final public domain and set `NEXT_PUBLIC_SITE_URL` to its exact HTTPS origin.
- [ ] Confirm every public product name, price, description, and route with the bakery owner.
- [ ] Complete the privacy, customer-policy, payment, and media launch checklists.
- [ ] Add approved authentic or clearly disclosed illustrative images before adding image or Product rich-result claims.
- [ ] Verify the production social-card preview and canonical links.
- [ ] Validate the JSON-LD with a structured-data testing tool.
- [ ] Confirm `/robots.txt` denies crawling while `SEARCH_INDEXING_ENABLED=false`.
- [ ] Confirm `/sitemap.xml` contains only intended public URLs.
- [ ] Set `SEARCH_INDEXING_ENABLED=true` only after the final deployment passes launch QA.
- [ ] Verify the domain with the approved search-console account and submit `/sitemap.xml`.
- [ ] Connect the provider-neutral analytics events only after the owner selects a provider, approves consent and privacy requirements, and supplies the real identifier.

## Safety behavior

`SEARCH_INDEXING_ENABLED=true` has no effect for localhost or a non-HTTPS origin. This prevents a copied environment value from enabling indexing on a development deployment. Disabling the flag restores `noindex`, `nofollow`, and a site-wide crawl denial without affecting payment webhooks or existing order reconciliation.
