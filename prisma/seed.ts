import { PrismaClient } from "@prisma/client";

const DEFAULT_CATEGORIES = [
  "Food",
  "Tea & Snacks",
  "Travel",
  "Shopping",
  "Bills",
  "Health",
  "Gym",
  "Entertainment",
  "Other",
];

async function main() {
  const prisma = new PrismaClient();
  try {
    // Seed only into an empty table so a category deleted on purpose is never recreated.
    const count = await prisma.category.count();
    if (count > 0) return;
    await prisma.category.createMany({
      data: DEFAULT_CATEGORIES.map((name) => ({ name })),
    });
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
