import { Link } from "wouter";
import { Camera, Images } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Gallery reserves space for authentic TakeASweet photography only.
 * Slots stay intentionally empty until real, approved photos are provided —
 * no stock or generated imagery is ever presented as TakeASweet's work.
 */
const RESERVED_SLOTS = [
  "Signature cookies",
  "Treat cups",
  "Four Corners Cheesecake",
  "Frozen limber",
  "Event booth",
  "Custom order spotlight",
];

export default function Gallery() {
  return (
    <div className="container py-12 md:py-16">
      <div className="text-center">
        <p className="text-secondary-foreground flex items-center justify-center gap-1.5 text-sm font-bold tracking-widest uppercase">
          <Images className="size-4" aria-hidden /> Gallery
        </p>
        <h1 className="font-display mt-2 text-4xl font-extrabold sm:text-5xl">
          Real treats, real moments
        </h1>
        <p className="text-muted-foreground mx-auto mt-3 max-w-md">
          Photos of TakeASweet's handmade treats and community events are on their way. Every image
          here will be the real thing — baked, decorated, and photographed by us.
        </p>
      </div>

      <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-3">
        {RESERVED_SLOTS.map(label => (
          <div
            key={label}
            role="img"
            aria-label={`Reserved for ${label} photo`}
            className="bg-muted border-border text-muted-foreground flex aspect-square flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-4 text-center"
          >
            <Camera className="size-6 opacity-60" aria-hidden />
            <span className="text-xs font-semibold">{label}</span>
            <span className="text-[11px]">Photo coming soon</span>
          </div>
        ))}
      </div>

      <div className="mt-10 text-center">
        <p className="text-muted-foreground text-sm">
          Want to see the treats in person? Order from the menu and taste for yourself.
        </p>
        <Button asChild className="mt-4 min-h-11 rounded-full font-bold">
          <Link href="/shop">Browse the Menu</Link>
        </Button>
      </div>
    </div>
  );
}
