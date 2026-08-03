export const confirmedOrderInformation = [
  {
    id: "service-area",
    title: "Charlotte service area",
    detail:
      "TakeASweet serves Charlotte, North Carolina, through local pickup and approved local delivery.",
  },
  {
    id: "pickup-privacy",
    title: "Pickup details stay private",
    detail:
      "The pickup location and next-step instructions are shown only after Stripe verifies a completed payment.",
  },
  {
    id: "custom-review",
    title: "Custom requests require review",
    detail:
      "Submitting a custom request does not confirm availability, pricing, delivery, or an order. Large or custom orders may require a deposit after review.",
  },
  {
    id: "weddings",
    title: "Wedding orders are not accepted",
    detail:
      "The custom-order form blocks wedding, bridal, bride, groom, and elopement requests.",
  },
  {
    id: "allergens",
    title: "Ask before relying on allergen information",
    detail:
      "Ingredients, allergen details, and cross-contact guidance have not been approved for publication. Confirm directly with the bakery before ordering.",
  },
  {
    id: "shipping",
    title: "No shipping",
    detail:
      "Shipping is not currently available. Fulfillment is limited to confirmed local pickup and approved local delivery.",
  },
] as const;

export const policyLaunchBlockers = [
  {
    id: "refund-cancellation",
    label: "Refund, cancellation, and rescheduling terms",
  },
  {
    id: "lead-time",
    label: "Order lead times and cutoff dates",
  },
  {
    id: "delivery",
    label: "Exact delivery boundary, schedule, and fees",
  },
  {
    id: "allergen-cross-contact",
    label: "Ingredient, allergen, and cross-contact statement",
  },
  {
    id: "substitutions",
    label: "Product substitution and appearance expectations",
  },
  {
    id: "privacy-contact",
    label: "Approved privacy contact address and retention schedule",
  },
] as const;
