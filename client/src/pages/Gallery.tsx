import { Images } from "lucide-react";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import NotFound from "@/pages/NotFound";

/** Authentic photos of TakeASweet's work, managed in the admin settings. */
export default function Gallery() {
  const { settings, isLoading } = useSiteSettings();
  if (isLoading) return null;
  if (settings.gallery.length === 0) return <NotFound />;

  return (
    <div className="container py-12 md:py-16">
      <div className="text-center">
        <p className="text-secondary-foreground flex items-center justify-center gap-1.5 text-sm font-bold tracking-widest uppercase">
          <Images className="size-4" aria-hidden /> Gallery
        </p>
        <h1 className="font-display mt-2 text-4xl font-extrabold sm:text-5xl">
          Real treats, real moments
        </h1>
      </div>

      <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-3">
        {settings.gallery.map(image => (
          <figure key={image.url}>
            <img
              src={image.url}
              alt={image.alt}
              loading="lazy"
              decoding="async"
              className="aspect-square w-full rounded-2xl object-cover shadow-sm"
            />
            {image.caption && (
              <figcaption className="text-muted-foreground mt-2 text-center text-sm">
                {image.caption}
              </figcaption>
            )}
          </figure>
        ))}
      </div>
    </div>
  );
}
