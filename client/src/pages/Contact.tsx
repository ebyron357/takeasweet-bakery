import { useState } from "react";
import { CheckCircle2, Mail, MapPin } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { SERVICE_AREA_COPY } from "@shared/bakery";

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [submitted, setSubmitted] = useState(false);

  const submit = trpc.contact.submit.useMutation({
    onSuccess: () => {
      setSubmitted(true);
      toast.success("Message sent! We'll reply as soon as we can.");
    },
    onError: () => toast.error("Could not send your message. Please try again."),
  });

  return (
    <div className="container max-w-2xl py-12 md:py-16">
      <div className="text-center">
        <p className="text-secondary-foreground flex items-center justify-center gap-1.5 text-sm font-bold tracking-widest uppercase">
          <Mail className="size-4" /> Contact
        </p>
        <h1 className="font-display mt-2 text-4xl font-extrabold sm:text-5xl">Say hello!</h1>
        <p className="text-muted-foreground mx-auto mt-3 max-w-md">
          Questions about the menu, an order, or anything else? Drop us a note and we'll get back
          to you.
        </p>
        <div className="bg-accent text-accent-foreground mt-4 inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-bold">
          <MapPin className="size-4" />
          {SERVICE_AREA_COPY}
        </div>
      </div>

      {submitted ? (
        <div className="bg-card border-border/60 mt-10 rounded-3xl border p-8 text-center shadow-sm">
          <div className="bg-primary/20 mx-auto flex size-14 items-center justify-center rounded-full">
            <CheckCircle2 className="text-primary-foreground size-7" />
          </div>
          <h2 className="font-display mt-4 text-2xl font-extrabold">Message sent!</h2>
          <p className="text-muted-foreground mt-2 text-sm">
            Thanks for reaching out. We read every message and will reply by email soon.
          </p>
          <Button
            className="mt-5 rounded-full font-bold"
            onClick={() => {
              setSubmitted(false);
              setForm({ name: "", email: "", message: "" });
            }}
          >
            Send Another Message
          </Button>
        </div>
      ) : (
        <form
          className="bg-card border-border/60 mt-10 space-y-4 rounded-3xl border p-6 shadow-sm sm:p-8"
          onSubmit={e => {
            e.preventDefault();
            submit.mutate({
              name: form.name.trim(),
              email: form.email.trim(),
              message: form.message.trim(),
            });
          }}
        >
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
          <div className="space-y-1.5">
            <Label htmlFor="message">Message *</Label>
            <Textarea
              id="message"
              required
              rows={5}
              value={form.message}
              onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
              placeholder="How can we help?"
            />
          </div>
          <Button
            type="submit"
            size="lg"
            className="w-full rounded-full text-base font-bold"
            disabled={submit.isPending}
          >
            {submit.isPending ? "Sending…" : "Send Message"}
          </Button>
        </form>
      )}
    </div>
  );
}
