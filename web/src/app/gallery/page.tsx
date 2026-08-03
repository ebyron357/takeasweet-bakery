import type { Metadata } from "next";
import Image from "next/image";
import { Camera } from "lucide-react";

import {
  approvedFounderPortrait,
  authenticGalleryItems,
} from "@/data/authentic-gallery";
import { createPageMetadata } from "@/lib/metadata";
import { isPublishableAuthenticMedia } from "@/lib/media";

export const metadata: Metadata = createPageMetadata({
  title: "Authentic Work Gallery",
  description:
    "Verified photographs of treats and community work created by TakeASweet Bakery.",
  path: "/gallery",
});

export default function GalleryPage() {
  const galleryItems = authenticGalleryItems.filter(
    isPublishableAuthenticMedia
  );
  const founderPortrait =
    approvedFounderPortrait &&
    isPublishableAuthenticMedia(approvedFounderPortrait)
      ? approvedFounderPortrait
      : null;

  return (
    <main className="mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-16">
      <header className="max-w-3xl">
        <p className="text-muted-foreground text-sm font-semibold tracking-widest uppercase">
          Verified photographs only
        </p>
        <h1 className="mt-2 text-4xl font-bold tracking-tight sm:text-5xl">
          Our real work
        </h1>
        <p className="text-muted-foreground mt-4 leading-7">
          This gallery is reserved exclusively for approved photographs of
          treats and community work created by TakeASweet. Stock, generated,
          reference, and unverified images are never shown here.
        </p>
      </header>

      {founderPortrait ? (
        <section
          className="bg-card mt-10 grid items-center gap-6 rounded-xl border p-5 sm:grid-cols-[minmax(0,16rem)_1fr] sm:p-8"
          aria-labelledby="founder-title"
        >
          <Image
            src={founderPortrait.src}
            alt={founderPortrait.alt}
            width={founderPortrait.width}
            height={founderPortrait.height}
            className="h-auto w-full rounded-lg object-cover"
            sizes="(min-width: 640px) 256px, 100vw"
          />
          <div>
            <h2 id="founder-title" className="text-2xl font-bold">
              Meet the founder
            </h2>
            <p className="text-muted-foreground mt-3 leading-7">
              {founderPortrait.caption}
            </p>
          </div>
        </section>
      ) : null}

      <section className="mt-12" aria-labelledby="gallery-title">
        <h2 id="gallery-title" className="text-3xl font-bold tracking-tight">
          Baked by TakeASweet
        </h2>

        {galleryItems.length > 0 ? (
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {galleryItems.map((item) => (
              <figure
                key={item.id}
                className="bg-card overflow-hidden rounded-xl border"
              >
                <Image
                  src={item.src}
                  alt={item.alt}
                  width={item.width}
                  height={item.height}
                  className="aspect-square h-auto w-full object-cover"
                  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                />
                <figcaption className="text-muted-foreground p-4 text-sm leading-6">
                  {item.caption}
                </figcaption>
              </figure>
            ))}
          </div>
        ) : (
          <div className="bg-muted mt-6 rounded-xl border p-8 text-center sm:p-12">
            <Camera
              className="text-muted-foreground mx-auto size-9"
              aria-hidden="true"
            />
            <p className="mt-4 font-bold">
              No photographs have been approved for publication yet.
            </p>
            <p className="text-muted-foreground mx-auto mt-2 max-w-xl text-sm leading-6">
              This gallery will remain empty until verified TakeASweet photos
              are available. Illustrative product images used elsewhere will be
              labeled and will never appear in this collection.
            </p>
          </div>
        )}
      </section>
    </main>
  );
}
