import { Link } from "wouter";
import { CalendarHeart, MapPin, PackageX, ReceiptText, Store, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SERVICE_AREA_COPY } from "@shared/bakery";

const SECTIONS = [
  {
    icon: Store,
    title: "Pickup",
    body: "All standard orders are available for local pickup. Exact pickup details are shared after your order is confirmed — they are not published on the website.",
  },
  {
    icon: Truck,
    title: "Local delivery",
    body: "Local delivery is available within our approved Charlotte service area. Delivery arrangements are confirmed when your order is reviewed.",
  },
  {
    icon: PackageX,
    title: "No shipping",
    body: "We do not offer nationwide shipping at this time. TakeASweet is local love only — for now!",
  },
  {
    icon: CalendarHeart,
    title: "Custom orders",
    body: "Custom dessert requests are welcome for birthdays, showers, and celebrations. A request is not a confirmed order: every request is reviewed first, and large or custom orders may require approval and a deposit. Wedding orders are not accepted.",
  },
  {
    icon: ReceiptText,
    title: "Payment",
    body: "Standard menu items can be paid for online once checkout is active. Custom orders are invoiced after approval.",
  },
];

export default function OrderInfo() {
  return (
    <div className="container max-w-2xl py-12 md:py-16">
      <p className="text-secondary-foreground flex items-center gap-1.5 text-sm font-bold tracking-widest uppercase">
        <ReceiptText className="size-4" aria-hidden /> Order information
      </p>
      <h1 className="font-display mt-2 text-4xl font-extrabold">How ordering works</h1>
      <p className="text-muted-foreground mt-3">
        Everything you need to know about getting TakeASweet treats into your hands.
      </p>

      <div className="bg-accent text-accent-foreground mt-6 inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-bold">
        <MapPin className="size-4" aria-hidden />
        {SERVICE_AREA_COPY}
      </div>

      <div className="mt-8 space-y-4">
        {SECTIONS.map(section => (
          <section
            key={section.title}
            aria-label={section.title}
            className="bg-card border-border/60 flex gap-4 rounded-xl border p-5 shadow-sm"
          >
            <div className="bg-primary/20 flex size-11 shrink-0 items-center justify-center rounded-full">
              <section.icon className="text-primary-foreground size-5" aria-hidden />
            </div>
            <div>
              <h2 className="font-display text-lg font-bold">{section.title}</h2>
              <p className="text-muted-foreground mt-1 text-sm leading-relaxed">{section.body}</p>
            </div>
          </section>
        ))}
      </div>

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
