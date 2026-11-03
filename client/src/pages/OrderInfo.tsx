import { ScrollCraftGroup } from "@/components/scroll-craft-group";
import { Link } from "wouter";
import { MapPin, ReceiptText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { usePageTitle } from "@/hooks/usePageTitle";
import { ORDER_INFO_ICON_OPTIONS } from "@/lib/order-info-icons";
import NotFound from "@/pages/NotFound";

export default function OrderInfo() {
  const { settings, isLoading } = useSiteSettings();
  const sections = settings.orderInfo;
  // With no sections the page renders the 404 page, which sets its own title.
  usePageTitle(sections.length > 0 ? "Order Information" : undefined);
  if (isLoading) return null;
  if (sections.length === 0) return <NotFound />;

  return (
    <div className="container max-w-2xl py-12 md:py-16">
      <p className="text-secondary-foreground flex items-center gap-1.5 text-sm font-bold tracking-widest uppercase">
        <ReceiptText className="size-4" aria-hidden /> Order information
      </p>
      <h1 className="font-display mt-2 text-4xl font-extrabold">How ordering works</h1>
      <p className="text-muted-foreground mt-3">
        Everything you need to know about getting TakeASweet treats into your hands.
      </p>

      {settings.serviceArea && (
        <div className="bg-accent text-accent-foreground mt-6 inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-bold">
          <MapPin className="size-4" aria-hidden />
          {settings.serviceArea}
        </div>
      )}

      <ScrollCraftGroup className="mt-8 space-y-4">
        {sections.map((section, index) => {
          const { Icon } = ORDER_INFO_ICON_OPTIONS[section.icon];
          return (
            <section
              data-sc-entry
              key={index}
              aria-label={section.title}
              className="bg-card border-border/60 flex gap-4 rounded-xl border p-5 shadow-sm"
            >
              <span data-sc-rule aria-hidden="true" />
              <div className="bg-primary/20 flex size-11 shrink-0 items-center justify-center rounded-full">
                <Icon className="text-primary-foreground size-5" aria-hidden />
              </div>
              <div>
                <h2 className="font-display text-lg font-bold">{section.title}</h2>
                <p className="text-muted-foreground mt-1 text-sm leading-relaxed whitespace-pre-line">
                  {section.body}
                </p>
              </div>
            </section>
          );
        })}
      </ScrollCraftGroup>

      <div className="mt-10 flex flex-wrap gap-3">
        <Button asChild className="min-h-11 rounded-full font-bold">
          <Link href="/shop">Browse the Menu</Link>
        </Button>
        <Button asChild variant="outline" className="bg-card min-h-11 rounded-full font-bold">
          <Link href="/custom-orders">Request a Custom Order</Link>
        </Button>
      </div>
    </div>
  );
}
