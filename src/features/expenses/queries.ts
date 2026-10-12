import { db } from "@/lib/db";
import { toDateKey } from "@/lib/dates";
import { dateWhere } from "@/features/dashboard/period";
import { type ExpenseFilters, filterRange } from "./filters";

export type ExpenseRow = {
  id: string;
  amount: number;
  dateKey: string;
  categoryId: string;
  categoryName: string;
  description: string | null;
};

export async function listExpenses(filters: ExpenseFilters): Promise<ExpenseRow[]> {
  const { start, end } = filterRange(filters);
  const expenses = await db.expense.findMany({
    where: {
      date: { gte: start, lt: end },
      ...(filters.categoryId ? { categoryId: filters.categoryId } : {}),
    },
    include: { category: true },
    orderBy: [{ date: "desc" }, { createdAt: "desc" }],
  });
  return expenses.map((expense) => ({
    id: expense.id,
    amount: expense.amount,
    dateKey: toDateKey(expense.date),
    categoryId: expense.categoryId,
    categoryName: expense.category.name,
    description: expense.description,
  }));
}

export async function listExpensesInPeriod(period: {
  start: Date | null;
  end: Date | null;
}): Promise<ExpenseRow[]> {
  const expenses = await db.expense.findMany({
    where: dateWhere(period),
    include: { category: true },
    orderBy: [{ date: "desc" }, { createdAt: "desc" }],
  });
  return expenses.map((expense) => ({
    id: expense.id,
    amount: expense.amount,
    dateKey: toDateKey(expense.date),
    categoryId: expense.categoryId,
    categoryName: expense.category.name,
    description: expense.description,
  }));
}
