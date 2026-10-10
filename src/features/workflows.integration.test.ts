import { execSync } from "node:child_process";
import { existsSync, rmSync } from "node:fs";
import path from "node:path";
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

// Runs the real server actions and queries against a throwaway SQLite database.
const TEST_DB = path.resolve(process.cwd(), "prisma", "test-workflows.db");
process.env.DATABASE_URL = `file:${TEST_DB.replace(/\\/g, "/")}`;

type Modules = {
  db: typeof import("@/lib/db").db;
  categories: typeof import("./categories/actions");
  expenses: typeof import("./expenses/actions");
  salary: typeof import("./salary/actions");
  summary: typeof import("./dashboard/summary");
  expenseQueries: typeof import("./expenses/queries");
  categoryQueries: typeof import("./categories/queries");
};
let m: Modules;

function form(values: Record<string, string>): FormData {
  const data = new FormData();
  for (const [key, value] of Object.entries(values)) data.set(key, value);
  return data;
}

const idle = { status: "idle" } as const;

async function categoryId(name: string) {
  const category = await m.db.category.findFirstOrThrow({ where: { name } });
  return category.id;
}

beforeAll(async () => {
  for (const suffix of ["", "-journal"]) rmSync(`${TEST_DB}${suffix}`, { force: true });
  execSync("npx prisma migrate deploy", { stdio: "pipe", env: process.env });
  m = {
    db: (await import("@/lib/db")).db,
    categories: await import("./categories/actions"),
    expenses: await import("./expenses/actions"),
    salary: await import("./salary/actions"),
    summary: await import("./dashboard/summary"),
    expenseQueries: await import("./expenses/queries"),
    categoryQueries: await import("./categories/queries"),
  };
}, 120_000);

afterAll(async () => {
  await m?.db.$disconnect();
  for (const suffix of ["", "-journal"]) rmSync(`${TEST_DB}${suffix}`, { force: true });
  expect(existsSync(TEST_DB)).toBe(false);
});

beforeEach(async () => {
  await m.db.expense.deleteMany();
  await m.db.salary.deleteMany();
  await m.db.category.deleteMany();
  await m.db.category.createMany({ data: ["Food", "Travel", "Other"].map((name) => ({ name })) });
});

describe("salary and balance", () => {
  it("shows salary 25,000, expenses 5,000 and balance 20,000 for the month", async () => {
    await m.salary.createSalary(idle, form({ amount: "25000", date: "2026-10-01" }));
    const food = await categoryId("Food");
    await m.expenses.createExpense(
      idle,
      form({ amount: "5000", date: "2026-10-12", categoryId: food }),
    );

    const summary = await m.summary.getDashboardSummary("2026-10", "2026-10-12");
    expect(summary).toEqual({ salary: 2_500_000, expenses: 500_000, balance: 2_000_000, today: 500_000 });
  });

  it("does not carry salary or expenses into other months", async () => {
    await m.salary.createSalary(idle, form({ amount: "25000", date: "2026-10-31" }));
    const food = await categoryId("Food");
    await m.expenses.createExpense(idle, form({ amount: "100", date: "2026-10-31", categoryId: food }));
    await m.expenses.createExpense(idle, form({ amount: "40", date: "2026-11-01", categoryId: food }));

    const oct = await m.summary.getDashboardSummary("2026-10", "2026-10-31");
    const nov = await m.summary.getDashboardSummary("2026-11", "2026-10-31");
    expect(oct).toMatchObject({ salary: 2_500_000, expenses: 10_000 });
    expect(nov).toMatchObject({ salary: 0, expenses: 4_000, balance: -4_000 });
  });

  it("ignores a repeated identical submit but allows a different salary", async () => {
    const data = { amount: "25000", date: "2026-10-01", note: "October" };
    await m.salary.createSalary(idle, form(data));
    await m.salary.createSalary(idle, form(data));
    expect(await m.db.salary.count()).toBe(1);

    await m.salary.createSalary(idle, form({ ...data, amount: "1000", note: "Bonus" }));
    expect(await m.db.salary.count()).toBe(2);
  });

  it("never creates salary on its own when reading months", async () => {
    await m.summary.getDashboardSummary("2026-10", "2026-10-12");
    await m.summary.getDashboardSummary("2026-11", "2026-10-12");
    expect(await m.db.salary.count()).toBe(0);
  });

  it("edits and deletes salary", async () => {
    await m.salary.createSalary(idle, form({ amount: "25000", date: "2026-10-01" }));
    const { id } = await m.db.salary.findFirstOrThrow();

    const edited = await m.salary.updateSalary(id, idle, form({ amount: "26000.50", date: "2026-09-30" }));
    expect(edited.status).toBe("success");
    const row = await m.db.salary.findFirstOrThrow();
    expect(row.amount).toBe(2_600_050);
    expect(row.date.toISOString()).toBe("2026-09-30T00:00:00.000Z");

    await m.salary.deleteSalary(id);
    expect(await m.db.salary.count()).toBe(0);
  });

  it("rejects invalid salary input", async () => {
    const result = await m.salary.createSalary(idle, form({ amount: "0", date: "2026-10-01" }));
    expect(result.status).toBe("error");
    expect(result.fieldErrors?.amount).toBe("Amount must be greater than zero");
    expect(await m.db.salary.count()).toBe(0);
  });
});

describe("expenses", () => {
  it("rejects zero, negative and missing values", async () => {
    const food = await categoryId("Food");
    const zero = await m.expenses.createExpense(idle, form({ amount: "0", date: "2026-10-01", categoryId: food }));
    const negative = await m.expenses.createExpense(idle, form({ amount: "-5", date: "2026-10-01", categoryId: food }));
    const noCategory = await m.expenses.createExpense(idle, form({ amount: "5", date: "2026-10-01", categoryId: "" }));
    expect(zero.fieldErrors?.amount).toBeTruthy();
    expect(negative.fieldErrors?.amount).toBeTruthy();
    expect(noCategory.fieldErrors?.categoryId).toBeTruthy();
    expect(await m.db.expense.count()).toBe(0);
  });

  it("creates a new category from the expense form and reuses it case-insensitively", async () => {
    const data = { amount: "30", date: "2026-10-12", categoryId: "__new__" };
    await m.expenses.createExpense(idle, form({ ...data, newCategory: "Bus" }));
    await m.expenses.createExpense(idle, form({ ...data, newCategory: "bus" }));

    expect(await m.db.category.count({ where: { name: { in: ["Bus", "bus"] } } })).toBe(1);
    expect(await m.db.expense.count()).toBe(2);
  });

  it("filters by day, month and category, newest first", async () => {
    const [food, travel] = [await categoryId("Food"), await categoryId("Travel")];
    const add = (amount: string, date: string, categoryId: string) =>
      m.expenses.createExpense(idle, form({ amount, date, categoryId }));
    await add("10", "2026-10-01", food);
    await add("20", "2026-10-12", travel);
    await add("30", "2026-10-12", food);
    await add("40", "2026-11-02", food);

    const day = await m.expenseQueries.listExpenses({ mode: "day", date: "2026-10-12", categoryId: null });
    expect(day.map((e) => e.amount)).toEqual([3000, 2000]);

    const month = await m.expenseQueries.listExpenses({ mode: "month", month: "2026-10", categoryId: null });
    expect(month.map((e) => e.dateKey)).toEqual(["2026-10-12", "2026-10-12", "2026-10-01"]);

    const foodOnly = await m.expenseQueries.listExpenses({ mode: "month", month: "2026-10", categoryId: food });
    expect(foodOnly.map((e) => e.amount)).toEqual([3000, 1000]);
  });

  it("edits and deletes an expense", async () => {
    const [food, travel] = [await categoryId("Food"), await categoryId("Travel")];
    await m.expenses.createExpense(idle, form({ amount: "100", date: "2026-10-12", categoryId: food, description: "Lunch" }));
    const { id } = await m.db.expense.findFirstOrThrow();

    const result = await m.expenses.updateExpense(
      id,
      idle,
      form({ amount: "120.50", date: "2026-10-13", categoryId: travel, description: "" }),
    );
    expect(result.status).toBe("success");
    const updated = await m.db.expense.findFirstOrThrow();
    expect(updated).toMatchObject({ amount: 12_050, categoryId: travel, description: null });

    await m.expenses.deleteExpense(id);
    expect(await m.db.expense.count()).toBe(0);
  });
});

describe("categories", () => {
  it("blocks duplicate names regardless of case", async () => {
    const result = await m.categories.createCategory(idle, form({ name: "food" }));
    expect(result.status).toBe("error");
    expect(await m.db.category.count()).toBe(3);
  });

  it("keeps expenses attached after a rename", async () => {
    const food = await categoryId("Food");
    await m.expenses.createExpense(idle, form({ amount: "10", date: "2026-10-01", categoryId: food }));

    await m.categories.renameCategory(food, idle, form({ name: "Meals" }));
    const rows = await m.expenseQueries.listExpenses({ mode: "month", month: "2026-10", categoryId: null });
    expect(rows.map((r) => r.categoryName)).toEqual(["Meals"]);
  });

  it("moves expenses to a replacement before deleting a used category", async () => {
    const [food, other] = [await categoryId("Food"), await categoryId("Other")];
    await m.expenses.createExpense(idle, form({ amount: "10", date: "2026-10-01", categoryId: food }));

    const refused = await m.categories.deleteCategory(food, idle, form({}));
    expect(refused.status).toBe("error");
    expect(await m.db.category.count({ where: { id: food } })).toBe(1);

    const done = await m.categories.deleteCategory(food, idle, form({ replacementId: other }));
    expect(done.status).toBe("success");
    const rows = await m.expenseQueries.listExpenses({ mode: "month", month: "2026-10", categoryId: null });
    expect(rows.map((r) => r.categoryName)).toEqual(["Other"]);
  });

  it("deletes an unused category directly", async () => {
    const travel = await categoryId("Travel");
    const result = await m.categories.deleteCategory(travel, idle, form({}));
    expect(result.status).toBe("success");
    expect(await m.db.category.count()).toBe(2);
  });
});
