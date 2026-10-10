import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";

export type CategoryOption = { id: string; name: string };
export type CategoryWithCount = CategoryOption & { expenseCount: number };

export async function listCategories(): Promise<CategoryOption[]> {
  const categories = await db.category.findMany({ orderBy: { name: "asc" } });
  return categories.map(({ id, name }) => ({ id, name }));
}

export async function listCategoriesWithCounts(): Promise<CategoryWithCount[]> {
  const categories = await db.category.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { expenses: true } } },
  });
  return categories.map((category) => ({
    id: category.id,
    name: category.name,
    expenseCount: category._count.expenses,
  }));
}

type Client = Prisma.TransactionClient | typeof db;

// Names are compared case-insensitively: "tea" and "Tea" are the same category.
export async function findCategoryByName(client: Client, name: string) {
  const wanted = name.trim().toLowerCase();
  const all = await client.category.findMany();
  return all.find((category) => category.name.toLowerCase() === wanted) ?? null;
}

export async function getOrCreateCategory(client: Client, name: string) {
  const existing = await findCategoryByName(client, name);
  if (existing) return existing;
  return client.category.create({ data: { name: name.trim() } });
}
