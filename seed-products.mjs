import "dotenv/config";
import mysql from "mysql2/promise";

const productsData = [
  // Cookies
  {
    name: "Classic Chocolate Chip",
    slug: "classic-chocolate-chip",
    description:
      "Our signature cookie — thick, golden, and loaded with melty chocolate chips. Baked fresh in small batches.",
    priceCents: 350,
    category: "cookies",
    imageUrl: "/manus-storage/prod-choc-chip_c24c06b1.png",
    featured: true,
    sortOrder: 1,
  },
  {
    name: "Sprinkle Party Cookie",
    slug: "sprinkle-party-cookie",
    description:
      "A soft frosted sugar cookie topped with a rainbow of pastel sprinkles. A little party in every bite.",
    priceCents: 375,
    category: "cookies",
    imageUrl: "/manus-storage/prod-sugar-sprinkle_0d051708.png",
    featured: true,
    sortOrder: 2,
  },
  {
    name: "Double Chocolate Dream",
    slug: "double-chocolate-dream",
    description:
      "Rich cocoa cookie dough studded with white chocolate chunks. For serious chocolate lovers.",
    priceCents: 375,
    category: "cookies",
    imageUrl: "/manus-storage/prod-double-choc_82122c30.png",
    featured: false,
    sortOrder: 3,
  },
  {
    name: "Cinnamon Snickerdoodle",
    slug: "cinnamon-snickerdoodle",
    description:
      "Soft and chewy with a crackly cinnamon-sugar top. A cozy classic made the TakeASweet way.",
    priceCents: 350,
    category: "cookies",
    imageUrl: "/manus-storage/prod-snickerdoodle_2b6a3480.png",
    featured: false,
    sortOrder: 4,
  },
  {
    name: "Half-Dozen Cookie Box",
    slug: "half-dozen-cookie-box",
    description:
      "Six assorted cookies picked from our current menu, packed in a cute box. Great for sharing (or not).",
    priceCents: 1800,
    category: "cookies",
    imageUrl: "/manus-storage/prod-cookie-box_f213c236.png",
    featured: true,
    sortOrder: 5,
  },
  // Treats
  {
    name: "Fudgy Brownie Square",
    slug: "fudgy-brownie-square",
    description: "A thick, fudgy brownie with a shiny crackle top. Baked from scratch, never boxed.",
    priceCents: 400,
    category: "treats",
    imageUrl: "/manus-storage/prod-brownie_b9daee8b.png",
    featured: true,
    sortOrder: 10,
  },
  {
    name: "Sprinkled Crispy Treat",
    slug: "sprinkled-crispy-treat",
    description:
      "A gooey marshmallow crispy square drizzled with pink and white chocolate and pastel sprinkles.",
    priceCents: 350,
    category: "treats",
    imageUrl: "/manus-storage/prod-rice-crispy_1a8a11b4.png",
    featured: false,
    sortOrder: 11,
  },
  {
    name: "Cake Pop Trio",
    slug: "cake-pop-trio",
    description:
      "Three hand-dipped cake pops in pastel pink, yellow, and blue with sprinkles. Perfect little gifts.",
    priceCents: 900,
    category: "treats",
    imageUrl: "/manus-storage/prod-cake-pops_270cc088.png",
    featured: true,
    sortOrder: 12,
  },
  // Seasonal
  {
    name: "Summer Lemonade Cookie",
    slug: "summer-lemonade-cookie",
    description:
      "A bright, zesty sugar cookie with pale yellow lemon glaze. Available for a limited time this summer.",
    priceCents: 400,
    category: "seasonal",
    imageUrl: "/manus-storage/prod-lemonade-cookie_c7a36ace.png",
    featured: true,
    sortOrder: 20,
  },
  {
    name: "Strawberry Crumble Bar",
    slug: "strawberry-crumble-bar",
    description:
      "Buttery oat crumble with a sweet strawberry filling. A summer favorite while berries are in season.",
    priceCents: 425,
    category: "seasonal",
    imageUrl: "/manus-storage/prod-berry-crumble_8ffb0399.png",
    featured: false,
    sortOrder: 21,
  },
];

async function seed() {
  const connection = await mysql.createConnection(process.env.DATABASE_URL);
  for (const p of productsData) {
    await connection.execute(
      `INSERT INTO products (name, slug, description, priceCents, category, imageUrl, inStock, isSeasonalActive, featured, sortOrder)
       VALUES (?, ?, ?, ?, ?, ?, 1, 1, ?, ?)
       ON DUPLICATE KEY UPDATE name = VALUES(name), description = VALUES(description), priceCents = VALUES(priceCents), imageUrl = VALUES(imageUrl)`,
      [p.name, p.slug, p.description, p.priceCents, p.category, p.imageUrl, p.featured ? 1 : 0, p.sortOrder],
    );
  }
  const [rows] = await connection.execute("SELECT COUNT(*) as count FROM products");
  console.log(`Seeded. Product count: ${rows[0].count}`);
  await connection.end();
}

seed().catch(err => {
  console.error(err);
  process.exit(1);
});
