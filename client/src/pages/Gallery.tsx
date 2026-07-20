import { Link } from "wouter";
import { Heart, Images } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * The gallery holds only client-approved photographs of TakeASweet's actual
 * work. Until those are provided, it shows a polished empty state — no stock
 * or generated imagery is ever presented as the bakery's real work.
 */
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
      </div>

      {/* Polished empty state — populated only with authentic photography */}
      <div className="bg-secondary/30 mx-auto mt-10 max-w-xl rounded-3xl p-10 text-center">
        <div className="bg-card mx-auto flex size-16 items-center justify-center rounded-full shadow-sm">
          <Heart className="text-secondary-foreground size-7" aria-hidden />
        </div>
        <h2 className="font-display mt-5 text-2xl font-extrabold">
          We're saving this space for the real thing
        </h2>
        <p className="text-muted-foreground mx-auto mt-3 max-w-md text-sm leading-relaxed">
          Every photo in this gallery will be an authentic TakeASweet bake — mixed, decorated, and
          photographed by us here in Charlotte. We only share our actual work, so this page fills
          up as we do what we love.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Button asChild className="min-h-11 rounded-full font-bold">
            <Link href="/shop">Browse the Menu</Link>
          </Button>
          <Button asChild variant="outline" className="bg-card min-h-11 rounded-full font-bold">
            <Link href="/our-story">Meet the Founder</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
