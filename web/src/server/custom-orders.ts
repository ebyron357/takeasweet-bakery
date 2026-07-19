import { z } from "zod";

import { customEventTypes } from "@/types/custom-order";

export { customEventTypes } from "@/types/custom-order";

const weddingPattern = /\b(wedding|bridal|bride|groom|elopement)\b/i;
const isoDatePattern = /^\d{4}-\d{2}-\d{2}$/;

function isTodayOrLater(value: string) {
  if (!isoDatePattern.test(value)) return false;

  const date = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime())) return false;

  const [year, month, day] = value.split("-").map(Number);
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() + 1 !== month ||
    date.getUTCDate() !== day
  ) {
    return false;
  }

  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  return date >= today;
}

export const customOrderRequestSchema = z
  .object({
    name: z.string().trim().min(2).max(120),
    email: z.email().max(254),
    phone: z.string().trim().max(40).optional().default(""),
    eventType: z.enum(customEventTypes),
    eventDate: z.string().refine(isTodayOrLater, {
      message: "Choose a valid date that is not in the past.",
    }),
    quantity: z.coerce.number().int().min(1).max(1000),
    details: z.string().trim().min(10).max(5000),
    website: z.string().max(200).optional().default(""),
  })
  .superRefine((request, context) => {
    if (
      weddingPattern.test(request.eventType) ||
      weddingPattern.test(request.details)
    ) {
      context.addIssue({
        code: "custom",
        path: ["details"],
        message: "TakeASweet is not accepting wedding orders.",
      });
    }
  });

export type CustomOrderRequest = z.infer<typeof customOrderRequestSchema>;
