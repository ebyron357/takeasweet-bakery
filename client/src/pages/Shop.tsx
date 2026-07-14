import { useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import CategorySection from "@/components/CategorySection";
import { trpc } from "@/lib/trpc";
import { CATEGORY_LABELS, formatPrice } from "@shared/bakery";

const CATEGORY_ORDER = ["limber", "treat-cups", "cookies", "cheesecake", "seasonal"] as const;
const FILTERS = ["all", ...CATEGORY_ORDER] as const;

/** Uniform-price note per category, derived from the live data. */
function priceNoteFor(products: { priceCents: number; size: string | null }[]): string | undefined {
  if (products.length === 0) return undefined;
  const prices = new Set(products.map(p => p.priceCents));
  if (prices.size !== 1) return undefined;
  const price = products[0].priceCents;
  if (price <= 0) return undefined;
  const sizes = Array.from(new Set(products.map(p => p.size).filter(Boolean)));
  const sizeText = sizes.length === 1 ? `${sizes[0]} — ` : "";
  return `${sizeText}${formatPrice(price)}${products.length > 1 ? " each" : ""}`;
}

export default function Shop() {
  const { data: products, isLoading } = trpc.products.list.useQuery();
  const [activeFilter, setActiveFilter] = useState<(typeof FILTERS)[number]>("all");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    let list = products ?? [];
    if (activeFilter !== "all") list = list.filter(p => p.category === activeFilter);
    const q = query.trim().toLowerCase();
    if (q) {
      list = list.filter(
        p =>
          p.name.toLowerCase().includes(q) ||
          (p.description ?? "").toLowerCase().includes(q) ||
          (p.flavorOptions ?? []).some(f => f.toLowerCase().includes(q)) ||
          (CATEGORY_LABELS[p.category] ?? "").toLowerCase().includes(q),
      );
    }
    return list;
  }, [products, activeFilter, query]);

  const grouped = useMemo(() => {
    const groups: Record<string, typeof filtered> = {};
    for (const product of filtered) {
      groups[product.category] = groups[product.category] ?? [];
      groups[product.category].push(product);
    }
    return groups;
  }, [filtered]);

  const visibleCategories = CATEGORY_ORDER.filter(c => grouped[c]?.length);

  return (
    <div className="container py-10 md:py-14">
      <div className="mb-8 text-center">
        <h1 className="font-display text-4xl font-extrabold sm:text-5xl">Menu</h1>
        <p className="text-muted-foreground mx-auto mt-2 max-w-md">
          Handmade in small batches. The menu changes with the seasons — grab your favorites while
          they last!
        </p>
      </div>

      {/* Search */}
      <div className="mx-auto mb-6 max-w-md">
        <label htmlFor="menu-search" className="sr-only">
          Search the menu
        </label>
        <div className="relative">
          <Search
            className="text-muted-foreground absolute top-1/2 left-3.5 size-4 -translate-y-1/2"
            aria-hidden
          />
          <Input
            id="menu-search"
            type="search"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search treats or flavors…"
            className="bg-card rounded-full pl-10"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              aria-label="Clear search"
              className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2"
            >
              <X className="size-4" />
            </button>
          )}
        </div>
      </div>

      {/* Category filter navigation — horizontally scrollable on mobile */}
      <nav
        aria-label="Menu categories"
        className="scrollbar-none -mx-4 mb-10 overflow-x-auto px-4 sm:mx-0 sm:px-0"
      >
        <div className="flex w-max gap-2 sm:w-auto sm:flex-wrap sm:justify-center">
          {FILTERS.map(filter => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              aria-pressed={activeFilter === filter}
              className={`focus-visible:ring-ring min-h-11 shrink-0 rounded-full px-4 py-2 text-sm font-bold transition-colors focus-visible:ring-2 focus-visible:outline-none sm:px-5 ${
                activeFilter === filter
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-card hover:bg-muted border"
              }`}
            >
              {filter === "all" ? "Everything" : CATEGORY_LABELS[filter]}
            </button>
          ))}
        </div>
      </nav>

      {isLoading ? (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="aspect-[3/4] rounded-2xl" />
          ))}
        </div>
      ) : visibleCategories.length === 0 ? (
        /* Empty state */
        <div className="py-16 text-center" role="status">
          <p className="text-4xl" aria-hidden>
            🍪
          </p>
          <h2 className="font-display mt-3 text-xl font-bold">
            {query ? `No treats match "${query}"` : "Nothing here right now"}
          </h2>
          <p className="text-muted-foreground mt-1 text-sm">
            {query
              ? "Try a different search, or browse everything."
              : "Check back soon for fresh batches!"}
          </p>
          {query && (
            <button
              onClick={() => {
                setQuery("");
                setActiveFilter("all");
              }}
              className="bg-primary text-primary-foreground mt-4 rounded-full px-5 py-2 text-sm font-bold"
            >
              Show Everything
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-14">
          {visibleCategories.map(category => (
            <CategorySection
              key={category}
              category={category}
              products={grouped[category]}
              priceNote={priceNoteFor(grouped[category])}
            />
          ))}
        </div>
      )}
    </div>
  );
}
