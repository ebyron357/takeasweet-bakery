# Media governance

## Authentic-work gallery

The `/gallery` route may contain only photographs that the owner confirms show:

- an item actually baked by TakeASweet;
- an actual TakeASweet event, booth, or baking process; or
- the approved founder portrait.

Before publication, place optimized files under `public/media/authentic/` and add a record to `src/data/authentic-gallery.ts`. Every record requires approval source, approval date, meaningful alternative text, a factual caption, and intrinsic dimensions.

Do not move or copy the legacy Manus-generated product images into this directory. Placeholder, stock, reference, and generated imagery is prohibited from the authentic gallery.

## Illustrative product media

If generated product illustrations are approved later, store them separately under `public/media/illustrative/`. They must use the `illustrative-generated` media type and display this disclosure near the image:

> Illustrative image — not a photograph of TakeASweet's work.

Illustrative images must not be added to the authentic gallery or used as the founder portrait.

## Optimization checklist

1. Remove embedded location and device metadata before publication.
2. Crop without changing the underlying baked work.
3. Export responsive WebP or AVIF assets at an appropriate quality.
4. Record accurate width and height values.
5. Write factual alt text and captions without invented product claims.
6. Run the media-governance tests and production build.
