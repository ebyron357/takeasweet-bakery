import { useEffect, useState } from "react";
import { ArrowDown, ArrowUp, Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import type { FaqItem, SiteImage, SiteImageKey, SiteSettings } from "@shared/site-settings";

/** Image slots used on the public pages, with where each one appears. */
const IMAGE_SLOTS: { key: SiteImageKey; label: string; hint: string }[] = [
  {
    key: "hero",
    label: "Home page hero",
    hint: "Large image at the top of the home page.",
  },
  {
    key: "founderPortrait",
    label: "Founder portrait",
    hint: "Home page story section and the Our Story page.",
  },
  {
    key: "community",
    label: "Community / family photo",
    hint: "Home page community section and the Our Story page.",
  },
  {
    key: "customOrders",
    label: "Custom orders",
    hint: "Top of the Custom Orders page.",
  },
  {
    key: "storyFeature",
    label: "Our Story closing image",
    hint: "Bottom of the Our Story page.",
  },
];

const SOCIAL_FIELDS = [
  { key: "facebook", label: "Facebook page" },
  { key: "instagram", label: "Instagram profile" },
  { key: "tiktok", label: "TikTok profile" },
] as const;

/** Editable image: empty strings are allowed while typing, cleaned up on save. */
type ImageDraft = { url: string; alt: string; caption: string };
const EMPTY_IMAGE: ImageDraft = { url: "", alt: "", caption: "" };

type Draft = Omit<SiteSettings, "logo" | "images" | "gallery"> & {
  logo: ImageDraft;
  images: Record<SiteImageKey, ImageDraft>;
  gallery: ImageDraft[];
};

function toDraft(settings: SiteSettings): Draft {
  const image = (value: SiteImage | null): ImageDraft => value ?? EMPTY_IMAGE;
  return {
    ...settings,
    logo: image(settings.logo),
    images: Object.fromEntries(
      IMAGE_SLOTS.map(slot => [slot.key, image(settings.images[slot.key])]),
    ) as Record<SiteImageKey, ImageDraft>,
    gallery: settings.gallery.map(image),
  };
}

/** Converts the draft to saved settings; returns an error message if it is incomplete. */
function fromDraft(draft: Draft): SiteSettings | string {
  const problems: string[] = [];
  const image = (value: ImageDraft, label: string): SiteImage | null => {
    const url = value.url.trim();
    if (!url) return null;
    if (!value.alt.trim()) problems.push(`${label} needs a description (alt text).`);
    return { url, alt: value.alt.trim(), caption: value.caption.trim() };
  };
  const faq: FaqItem[] = draft.faq
    .map(item => ({
      question: item.question.trim(),
      answer: item.answer.trim(),
    }))
    .filter(item => item.question || item.answer);
  if (faq.some(item => !item.question || !item.answer)) {
    problems.push("Every FAQ entry needs both a question and an answer.");
  }
  const settings: SiteSettings = {
    ...draft,
    logo: image(draft.logo, "Logo"),
    images: Object.fromEntries(
      IMAGE_SLOTS.map(slot => [slot.key, image(draft.images[slot.key], slot.label)]),
    ) as SiteSettings["images"],
    gallery: draft.gallery
      .map((item, index) => image(item, `Gallery photo ${index + 1}`))
      .filter((item): item is SiteImage => item !== null),
    faq,
  };
  return problems.length > 0 ? problems.join(" ") : settings;
}

function ImageFields({
  id,
  value,
  onChange,
}: {
  id: string;
  value: ImageDraft;
  onChange: (value: ImageDraft) => void;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-[4rem_1fr]">
      <div className="bg-muted size-16 overflow-hidden rounded-xl">
        {value.url.trim() && (
          <img src={value.url.trim()} alt="" className="size-full object-cover" />
        )}
      </div>
      <div className="space-y-2">
        <Input
          id={`${id}-url`}
          aria-label="Image URL"
          value={value.url}
          onChange={e => onChange({ ...value, url: e.target.value })}
          placeholder="Image URL (/manus-storage/… or https://…)"
        />
        <Input
          aria-label="Image description (alt text)"
          value={value.alt}
          onChange={e => onChange({ ...value, alt: e.target.value })}
          placeholder="Describe the image for screen readers"
        />
        <Input
          aria-label="Caption (optional)"
          value={value.caption}
          onChange={e => onChange({ ...value, caption: e.target.value })}
          placeholder="Caption shown under the image (optional)"
        />
      </div>
    </div>
  );
}

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="bg-card space-y-4 rounded-2xl border p-5">
      <div>
        <h3 className="font-display text-lg font-bold">{title}</h3>
        {description && <p className="text-muted-foreground text-sm">{description}</p>}
      </div>
      {children}
    </section>
  );
}

function move<T>(list: T[], from: number, to: number): T[] {
  if (to < 0 || to >= list.length) return list;
  const next = [...list];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

export default function SettingsTab() {
  const utils = trpc.useUtils();
  const { data, isLoading } = trpc.admin.getSettings.useQuery();
  const [draft, setDraft] = useState<Draft | null>(null);

  useEffect(() => {
    if (data) setDraft(toDraft(data.settings));
  }, [data]);

  const save = trpc.admin.updateSettings.useMutation({
    onSuccess: () => {
      toast.success("Settings saved");
      utils.admin.getSettings.invalidate();
      utils.site.settings.invalidate();
    },
    onError: err => toast.error(err.message),
  });

  if (isLoading || !data || !draft) {
    return <Loader2 className="mx-auto my-10 animate-spin" />;
  }

  const update = (patch: Partial<Draft>) => setDraft(d => (d ? { ...d, ...patch } : d));

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const result = fromDraft(draft);
    if (typeof result === "string") {
      toast.error(result);
      return;
    }
    save.mutate(result);
  };

  const stripeStatus = !data.stripeConfigured
    ? { label: "Stripe not connected", variant: "destructive" as const }
    : data.stripeTestMode
      ? { label: "Stripe test keys", variant: "secondary" as const }
      : { label: "Stripe live keys", variant: "default" as const };

  return (
    <form onSubmit={handleSave} className="max-w-3xl space-y-6">
      <Section
        title="Launch switches"
        description="Control what customers can do on the site. Changes apply within a minute."
      >
        <label className="bg-muted flex items-start justify-between gap-4 rounded-xl p-4">
          <span>
            <span className="block font-semibold">Client review mode</span>
            <span className="text-muted-foreground block text-sm">
              While on, forms send nothing, checkout is blocked, and search engines are asked not to
              index the site. Turn off to launch.
            </span>
          </span>
          <Switch
            checked={draft.reviewMode}
            onCheckedChange={v => update({ reviewMode: v })}
            aria-label="Client review mode"
          />
        </label>
        <label className="bg-muted flex items-start justify-between gap-4 rounded-xl p-4">
          <span>
            <span className="flex flex-wrap items-center gap-2 font-semibold">
              Online payments
              <Badge variant={stripeStatus.variant} className="rounded-full">
                {stripeStatus.label}
              </Badge>
            </span>
            <span className="text-muted-foreground block text-sm">
              Lets customers pay through Stripe Checkout. Only works once review mode is off and a
              Stripe key is installed in the project's secrets.
            </span>
          </span>
          <Switch
            checked={draft.paymentsEnabled}
            onCheckedChange={v => update({ paymentsEnabled: v })}
            aria-label="Online payments"
          />
        </label>
      </Section>

      <Section title="Business details" description="Leave a field empty to hide it on the site.">
        <div className="space-y-1.5">
          <Label htmlFor="s-announcement">Announcement bar</Label>
          <Input
            id="s-announcement"
            value={draft.announcement}
            onChange={e => update({ announcement: e.target.value })}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="s-area">Service area</Label>
          <Input
            id="s-area"
            value={draft.serviceArea}
            onChange={e => update({ serviceArea: e.target.value })}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="s-email">Public contact email</Label>
          <Input
            id="s-email"
            type="email"
            value={draft.contactEmail}
            onChange={e => update({ contactEmail: e.target.value })}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {SOCIAL_FIELDS.map(field => (
            <div key={field.key} className="space-y-1.5">
              <Label htmlFor={`s-${field.key}`}>{field.label}</Label>
              <Input
                id={`s-${field.key}`}
                type="url"
                value={draft.socialLinks[field.key]}
                onChange={e =>
                  update({
                    socialLinks: {
                      ...draft.socialLinks,
                      [field.key]: e.target.value,
                    },
                  })
                }
                placeholder="https://…"
              />
            </div>
          ))}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="s-pickup">Pickup instructions (private)</Label>
          <Textarea
            id="s-pickup"
            rows={3}
            value={draft.pickupInstructions}
            onChange={e => update({ pickupInstructions: e.target.value })}
          />
          <p className="text-muted-foreground text-xs">
            Shown only on the confirmation page after a customer has paid.
          </p>
        </div>
      </Section>

      <Section
        title="Images"
        description="Clear an image URL to remove that image; its section adjusts automatically."
      >
        <div className="space-y-1.5">
          <Label htmlFor="s-logo-url">Logo</Label>
          <ImageFields id="s-logo" value={draft.logo} onChange={logo => update({ logo })} />
        </div>
        {IMAGE_SLOTS.map(slot => (
          <div key={slot.key} className="space-y-1.5 border-t pt-4">
            <Label htmlFor={`s-${slot.key}-url`}>{slot.label}</Label>
            <p className="text-muted-foreground text-xs">{slot.hint}</p>
            <ImageFields
              id={`s-${slot.key}`}
              value={draft.images[slot.key]}
              onChange={value => update({ images: { ...draft.images, [slot.key]: value } })}
            />
          </div>
        ))}
      </Section>

      <Section
        title="Gallery"
        description="Authentic photos of your work. The Gallery page appears once there is at least one photo."
      >
        {draft.gallery.map((image, index) => (
          <div key={index} className="flex gap-2 border-t pt-4 first:border-t-0 first:pt-0">
            <div className="flex-1">
              <ImageFields
                id={`s-gallery-${index}`}
                value={image}
                onChange={value =>
                  update({
                    gallery: draft.gallery.map((g, i) => (i === index ? value : g)),
                  })
                }
              />
            </div>
            <div className="flex flex-col gap-1">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label="Move photo up"
                onClick={() => update({ gallery: move(draft.gallery, index, index - 1) })}
              >
                <ArrowUp className="size-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label="Move photo down"
                onClick={() => update({ gallery: move(draft.gallery, index, index + 1) })}
              >
                <ArrowDown className="size-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label="Remove photo"
                onClick={() =>
                  update({
                    gallery: draft.gallery.filter((_, i) => i !== index),
                  })
                }
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          className="rounded-full"
          onClick={() => update({ gallery: [...draft.gallery, EMPTY_IMAGE] })}
        >
          <Plus className="size-4" /> Add photo
        </Button>
      </Section>

      <Section
        title="FAQ"
        description="Shown on the FAQ page; the first four also appear on the home page."
      >
        {draft.faq.map((item, index) => (
          <div key={index} className="flex gap-2 border-t pt-4 first:border-t-0 first:pt-0">
            <div className="flex-1 space-y-2">
              <Input
                aria-label={`Question ${index + 1}`}
                value={item.question}
                onChange={e =>
                  update({
                    faq: draft.faq.map((f, i) =>
                      i === index ? { ...f, question: e.target.value } : f,
                    ),
                  })
                }
                placeholder="Question"
              />
              <Textarea
                aria-label={`Answer ${index + 1}`}
                rows={2}
                value={item.answer}
                onChange={e =>
                  update({
                    faq: draft.faq.map((f, i) =>
                      i === index ? { ...f, answer: e.target.value } : f,
                    ),
                  })
                }
                placeholder="Answer"
              />
            </div>
            <div className="flex flex-col gap-1">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label="Move question up"
                onClick={() => update({ faq: move(draft.faq, index, index - 1) })}
              >
                <ArrowUp className="size-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label="Move question down"
                onClick={() => update({ faq: move(draft.faq, index, index + 1) })}
              >
                <ArrowDown className="size-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label="Remove question"
                onClick={() => update({ faq: draft.faq.filter((_, i) => i !== index) })}
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          className="rounded-full"
          onClick={() => update({ faq: [...draft.faq, { question: "", answer: "" }] })}
        >
          <Plus className="size-4" /> Add question
        </Button>
      </Section>

      <div className="bg-background/90 sticky bottom-0 border-t py-4 backdrop-blur">
        <Button type="submit" className="rounded-full font-bold" disabled={save.isPending}>
          {save.isPending ? "Saving…" : "Save Settings"}
        </Button>
      </div>
    </form>
  );
}
