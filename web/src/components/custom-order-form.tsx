"use client";

import { useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { customEventTypes } from "@/types/custom-order";

type Status =
  | { type: "idle" }
  | { type: "success"; message: string }
  | { type: "error"; message: string };

const fieldClassName =
  "border-input bg-background focus-visible:ring-ring min-h-11 w-full rounded-md border px-3 py-2 text-base focus-visible:ring-2 focus-visible:outline-none";

export function CustomOrderForm() {
  const [status, setStatus] = useState<Status>({ type: "idle" });
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setStatus({ type: "idle" });

    const form = event.currentTarget;
    const formData = new FormData(form);
    const payload = Object.fromEntries(formData.entries());

    try {
      const response = await fetch("/api/custom-orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = (await response.json()) as {
        error?: string;
        success?: boolean;
      };

      if (!response.ok) {
        throw new Error(result.error ?? "The request could not be submitted.");
      }

      form.reset();
      setStatus({
        type: "success",
        message:
          "Your request was received for review. It is not confirmed until the bakery follows up.",
      });
    } catch (error) {
      setStatus({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "The request could not be submitted.",
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="mt-10 space-y-6" onSubmit={handleSubmit}>
      <div className="grid gap-6 sm:grid-cols-2">
        <label className="space-y-2 font-semibold">
          <span>Name</span>
          <input
            className={fieldClassName}
            type="text"
            name="name"
            autoComplete="name"
            minLength={2}
            maxLength={120}
            required
          />
        </label>
        <label className="space-y-2 font-semibold">
          <span>Email</span>
          <input
            className={fieldClassName}
            type="email"
            name="email"
            autoComplete="email"
            maxLength={254}
            required
          />
        </label>
        <label className="space-y-2 font-semibold">
          <span>Phone (optional)</span>
          <input
            className={fieldClassName}
            type="tel"
            name="phone"
            autoComplete="tel"
            maxLength={40}
          />
        </label>
        <label className="space-y-2 font-semibold">
          <span>Event type</span>
          <select className={fieldClassName} name="eventType" required>
            <option value="">Choose an event</option>
            {customEventTypes.map((eventType) => (
              <option value={eventType} key={eventType}>
                {eventType}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-2 font-semibold">
          <span>Event date</span>
          <input
            className={fieldClassName}
            type="date"
            name="eventDate"
            required
          />
        </label>
        <label className="space-y-2 font-semibold">
          <span>Estimated quantity</span>
          <input
            className={fieldClassName}
            type="number"
            name="quantity"
            min={1}
            max={1000}
            step={1}
            inputMode="numeric"
            required
          />
        </label>
      </div>

      <label className="block space-y-2 font-semibold">
        <span>Request details</span>
        <textarea
          className={`${fieldClassName} min-h-36 resize-y`}
          name="details"
          minLength={10}
          maxLength={5000}
          aria-describedby="details-help"
          required
        />
        <span
          id="details-help"
          className="text-muted-foreground block text-sm font-normal"
        >
          Include the treats, flavors, quantities, and other event details you
          want the bakery to review.
        </span>
      </label>

      <label className="sr-only" aria-hidden="true">
        Website
        <input type="text" name="website" tabIndex={-1} autoComplete="off" />
      </label>

      {status.type !== "idle" && (
        <p
          className={
            status.type === "error" ? "text-destructive" : "font-semibold"
          }
          role={status.type === "error" ? "alert" : "status"}
        >
          {status.message}
        </p>
      )}

      <Button type="submit" size="lg" disabled={submitting}>
        {submitting ? "Submitting…" : "Submit request"}
      </Button>
    </form>
  );
}
