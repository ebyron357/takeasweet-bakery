import "dotenv/config";
import mysql from "mysql2/promise";

/**
 * Verified client menu — TakeASweet Cookies & Treats.
 * "CLIENT APPROVAL REQUIRED" marks missing info; it is internal-only and never
 * rendered on the customer-facing site.
 */
const APPROVAL = "CLIENT APPROVAL REQUIRED";

const internalDefaults = {
  leadTime: APPROVAL,
  ingredients: APPROVAL,
  allergens: APPROVAL,
  storageInstructions: APPROVAL,
};

const products = [
  // ---------- LIMBER: 5 oz — $1.50, one product with 8 flavor options ----------
  {
    name: "Limber",
    slug: "limber",
    description: "Frozen limber in your choice of flavor.",
    priceCents: 150,
    category: "limber",
    size: "5 oz",
    flavorOptions: [
      "Coconut",
      "Cherry",
      "Mango",
      "Pineapple",
      "Pina Colada",
      "Lemon",
      "Grape",
      "Tamarin", // spelling preserved until client confirms "Tamarind"
    ],
    maxFlavorSelections: 1,
    featured: true,
    sortOrder: 1,
    relatedSlugs: ["oreo-refresher", "banana-pudding"],
    ...internalDefaults,
  },

  // ---------- TREAT CUPS: 5 oz — $3.00 ----------
  ...[
    ["Oreo Refresher", "oreo-refresher"],
    ["Say Cheese Cup", "say-cheese-cup"],
    ["Red Velvetini", "red-velvetini"],
    ["The Rabbit's Carrot Cake", "the-rabbits-carrot-cake"],
    ["Banana Pudding", "banana-pudding"],
  ].map(([name, slug], i) => ({
    name,
    slug,
    description: null,
    priceCents: 300,
    category: "treat-cups",
    size: "5 oz",
    flavorOptions: null,
    maxFlavorSelections: null,
    featured: slug === "banana-pudding",
    sortOrder: 10 + i,
    relatedSlugs: null,
    ...internalDefaults,
  })),

  // ---------- COOKIES: $5.00 each ----------
  ...[
    ["Sprinkle Cookie", "sprinkle-cookie"],
    ["Banana Pudding Cookie", "banana-pudding-cookie"],
    ["Strawberry Lemonade", "strawberry-lemonade"],
    ["Nutter Butter", "nutter-butter"],
    ["Oreo", "oreo"],
  ].map(([name, slug], i) => ({
    name,
    slug,
    description: null,
    priceCents: 500,
    category: "cookies",
    size: null,
    flavorOptions: null,
    maxFlavorSelections: null,
    featured: slug === "sprinkle-cookie",
    sortOrder: 20 + i,
    relatedSlugs: null,
    ...internalDefaults,
  })),

  // ---------- FOUR CORNERS CHEESECAKE: $20.00 ----------
  {
    name: "Four Corners Cheesecake",
    slug: "four-corners-cheesecake",
    description: "Choose up to four flavor options.",
    priceCents: 2000,
    category: "cheesecake",
    size: null,
    flavorOptions: [
      "Strawberry",
      "Biscoff",
      "Oreo",
      "Nutella",
      "Cherry",
      "Blueberry Crumb",
      "Caramel",
      "Chocolate",
    ],
    maxFlavorSelections: 4,
    featured: true,
    sortOrder: 30,
    relatedSlugs: ["say-cheese-cup"],
    ...internalDefaults,
  },
];

async function seed() {
  const connection = await mysql.createConnection(process.env.DATABASE_URL);

  // Remove prior placeholder catalog entirely — verified data replaces it.
  await connection.execute("DELETE FROM products");

  for (const p of products) {
    await connection.execute(
      `INSERT INTO products
        (name, slug, description, priceCents, category, imageUrl, size,
         flavorOptions, maxFlavorSelections, quantityOptions, leadTime,
         pickupEligible, deliveryEligible, ingredients, allergens,
         storageInstructions, relatedSlugs, inStock, isSeasonal,
         isSeasonalActive, featured, sortOrder)
       VALUES (?, ?, ?, ?, ?, NULL, ?, ?, ?, NULL, ?, 1, 1, ?, ?, ?, ?, 1, 0, 1, ?, ?)`,
      [
        p.name,
        p.slug,
        p.description,
        p.priceCents,
        p.category,
        p.size,
        p.flavorOptions ? JSON.stringify(p.flavorOptions) : null,
        p.maxFlavorSelections,
        p.leadTime,
        p.ingredients,
        p.allergens,
        p.storageInstructions,
        p.relatedSlugs ? JSON.stringify(p.relatedSlugs) : null,
        p.featured ? 1 : 0,
        p.sortOrder,
      ],
    );
  }

  const [rows] = await connection.execute(
    "SELECT category, COUNT(*) as count FROM products GROUP BY category",
  );
  console.log("Seeded verified menu:", JSON.stringify(rows));
  await connection.end();
}

seed().catch(err => {
  console.error(err);
  process.exit(1);
});
