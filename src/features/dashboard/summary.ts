import { db } from "@/lib/db";
import { dayRange, monthRange } from "@/lib/dates";
import { sumPaise } from "@/lib/money";
import { type Period, dateWhere } from "./period";

export type DashboardSummary = {
  salary: number;
  expenses: number;
  balance: number;
  today: number;
};

export function computeSummary(input: {
  salaries: readonly number[];
  monthExpenses: readonly number[];
  todayExpenses: readonly number[];
}): DashboardSummary {
  const salary = sumPaise(input.salaries);
  const expenses = sumPaise(input.monthExpenses);
  return {
    salary,
    expenses,
    balance: salary - expenses,
    today: sumPaise(input.todayExpenses),
  };
}

// Sums happen in JS over integer paise, so totals stay exact regardless of database int width.
export async function getDashboardSummary(monthKey: string, today: string): Promise<DashboardSummary> {
  const month = monthRange(monthKey);
  const day = dayRange(today);

  const [salaries, monthExpenses, todayExpenses] = await Promise.all([
    db.salary.findMany({
      where: { date: { gte: month.start, lt: month.end } },
      select: { amount: true },
    }),
    db.expense.findMany({
      where: { date: { gte: month.start, lt: month.end } },
      select: { amount: true },
    }),
    db.expense.findMany({
      where: { date: { gte: day.start, lt: day.end } },
      select: { amount: true },
    }),
  ]);

  return computeSummary({
    salaries: salaries.map((row) => row.amount),
    monthExpenses: monthExpenses.map((row) => row.amount),
    todayExpenses: todayExpenses.map((row) => row.amount),
  });
}

export async function getPeriodSummary(period: Period, today: string): Promise<DashboardSummary> {
  const where = dateWhere(period);
  const day = dayRange(today);

  const [salaries, expenses, todayExpenses] = await Promise.all([
    db.salary.findMany({ where, select: { amount: true } }),
    db.expense.findMany({ where, select: { amount: true } }),
    db.expense.findMany({
      where: { date: { gte: day.start, lt: day.end } },
      select: { amount: true },
    }),
  ]);

  return computeSummary({
    salaries: salaries.map((row) => row.amount),
    monthExpenses: expenses.map((row) => row.amount),
    todayExpenses: todayExpenses.map((row) => row.amount),
  });
}
