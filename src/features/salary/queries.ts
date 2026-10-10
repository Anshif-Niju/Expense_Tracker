import { db } from "@/lib/db";
import { toDateKey } from "@/lib/dates";

export type SalaryRow = {
  id: string;
  amount: number;
  dateKey: string;
  note: string | null;
};

export async function listSalaries(range?: { start: Date; end: Date }): Promise<SalaryRow[]> {
  const salaries = await db.salary.findMany({
    where: range ? { date: { gte: range.start, lt: range.end } } : undefined,
    orderBy: [{ date: "desc" }, { createdAt: "desc" }],
  });
  return salaries.map((salary) => ({
    id: salary.id,
    amount: salary.amount,
    dateKey: toDateKey(salary.date),
    note: salary.note,
  }));
}
