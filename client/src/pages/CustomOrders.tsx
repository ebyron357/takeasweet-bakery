import { useState } from "react";
import { CalendarHeart, CheckCircle2, ClipboardList, HandCoins, PartyPopper } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { containsWeddingKeyword, CUSTOM_EVENT_TYPES } from "@shared/bakery";

import ImagePlaceholder from "@/components/ImagePlaceholder";

const STEPS = [
  {
    icon: ClipboardList,
    title: "1. Send your request",
    text: "Tell us about your event, date, and how many treats you need.",
  },
  {
    icon: CheckCircle2,
    title: "2. We review & approve",
    text: "We'll confirm we can make your date and send a quote within a few days.",
  },
  {
    icon: HandCoins,
    title: "3. Deposit locks it in",
    text: "Large and custom orders require approval and a deposit to reserve your spot.",
  },
  {
    icon: PartyPopper,
    title: "4. Treat time!",
    text: "Pick up your fresh-baked custom goodies and enjoy the party.",
  },
];

export default function CustomOrders() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    eventType: "",
    eventDate: "",
    quantity: "",
    details: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const submit = trpc.customOrders.submit.useMutation({
    onSuccess: () => {
      setSubmitted(true);
      toast.success("Request received! We'll be in touch soon.");
    },
    onError: err => toast.error(err.message),
  });

  const [fieldError, setFieldError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFieldError(null);
    // Client-side wedding block for instant feedback
    if (containsWeddingKeyword(`${form.eventType} ${form.details}`)) {
      setFieldError(
        "We aren't able to take wedding orders right now — but we'd love to help with birthdays, showers, and other celebrations!",
      );
      toast.error("Wedding orders aren't accepted.");
      return;
    }
    const quantity = parseInt(form.quantity, 10);
    if (!quantity || quantity < 1) {
      setFieldError("Please enter how many treats you need (at least 1).");
      toast.error("Please enter how many treats you need.");
      return;
    }
    submit.mutate({
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim() || undefined,
      eventType: form.eventType,
      eventDate: form.eventDate,
      quantity,
      details: form.details.trim() || undefined,
    });
  };

  if (submitted) {
    return (
      <div className="container max-w-xl py-20 text-center">
        <div className="bg-primary/20 mx-auto flex size-16 items-center justify-center rounded-full">
          <CheckCircle2 className="text-primary-foreground size-8" />
        </div>
        <h1 className="font-display mt-4 text-3xl font-extrabold">Request received!</h1>
        <p className="text-muted-foreground mt-3">
          Thanks for thinking of TakeASweet for your celebration. We review every request by hand
          and will email you with an answer and a quote. If approved, a deposit will reserve your
          date.
        </p>
        <Button
          className="mt-6 rounded-full font-bold"
          onClick={() => {
            setSubmitted(false);
            setForm({
              name: "",
              email: "",
              phone: "",
              eventType: "",
              eventDate: "",
              quantity: "",
              details: "",
            });
          }}
        >
          Submit Another Request
        </Button>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <section className="bg-secondary/40">
        <div className="container grid items-center gap-8 py-12 md:grid-cols-2 md:py-16">
          <div>
            <p className="text-secondary-foreground flex items-center gap-1.5 text-sm font-bold tracking-widest uppercase">
              <CalendarHeart className="size-4" /> Custom orders
            </p>
            <h1 className="font-display mt-1 text-4xl font-extrabold sm:text-5xl">
              Treats made just for your party
            </h1>
            <p className="text-muted-foreground mt-4 max-w-md">
              Birthdays, baby showers, graduations, team celebrations — we love baking something
              special for your big day. Please note: we aren't able to take{" "}
              <strong>wedding orders</strong> at this time.
            </p>
          </div>
          <ImagePlaceholder
            label="Real custom-order photo goes here"
            ratio="wide"
            className="mx-auto w-full max-w-md"
          />
        </div>
      </section>

      {/* How it works */}
      <section className="container py-12">
        <h2 className="font-display mb-8 text-center text-3xl font-extrabold">How it works</h2>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map(step => (
            <div
              key={step.title}
              className="bg-card border-border/60 rounded-2xl border p-5 shadow-sm"
            >
              <step.icon className="text-secondary-foreground size-7" />
              <h3 className="font-display mt-3 font-bold">{step.title}</h3>
              <p className="text-muted-foreground mt-1 text-sm">{step.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Request form */}
      <section className="container max-w-2xl pb-16">
        <div className="bg-card border-border/60 rounded-3xl border p-6 shadow-sm sm:p-8">
          <h2 className="font-display text-2xl font-extrabold">Request a custom order</h2>
          <p className="text-muted-foreground mt-1 text-sm">
            Fill this out and we'll get back to you with a quote. Custom desserts welcome — no
            wedding orders, please!
          </p>
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="name">Your name *</Label>
                <Input
                  id="name"
                  required
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="Jamie Baker"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  placeholder="you@example.com"
                />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="phone">Phone (optional)</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={form.phone}
                  onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                  placeholder="(704) 555-0123"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="eventType">Event type *</Label>
                <Select
                  value={form.eventType}
                  onValueChange={v => setForm(f => ({ ...f, eventType: v }))}
                  required
                >
                  <SelectTrigger id="eventType" className="w-full">
                    <SelectValue placeholder="Choose your event" />
                  </SelectTrigger>
                  <SelectContent>
                    {CUSTOM_EVENT_TYPES.map(type => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="eventDate">Event date *</Label>
                <Input
                  id="eventDate"
                  type="date"
                  required
                  value={form.eventDate}
                  onChange={e => setForm(f => ({ ...f, eventDate: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="quantity">How many treats? *</Label>
                <Input
                  id="quantity"
                  type="number"
                  min={1}
                  required
                  value={form.quantity}
                  onChange={e => setForm(f => ({ ...f, quantity: e.target.value }))}
                  placeholder="24"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="details">Tell us about your vision</Label>
              <Textarea
                id="details"
                rows={4}
                value={form.details}
                onChange={e => setForm(f => ({ ...f, details: e.target.value }))}
                placeholder="Theme, colors, flavors, allergies to avoid, anything else we should know…"
              />
            </div>
            {fieldError && (
              <p
                role="alert"
                className="bg-destructive/10 text-destructive rounded-xl px-4 py-3 text-sm font-semibold"
              >
                {fieldError}
              </p>
            )}
            <p className="text-muted-foreground text-xs">
              Large and custom orders may require approval and a deposit. We aren't able to accept
              wedding orders. Fields marked * are required.
            </p>
            <Button
              type="submit"
              size="lg"
              className="min-h-12 w-full rounded-full text-base font-bold"
              disabled={submit.isPending || !form.eventType}
            >
              {submit.isPending ? "Sending…" : "Send My Request"}
            </Button>
          </form>
        </div>
      </section>
    </div>
  );
}
