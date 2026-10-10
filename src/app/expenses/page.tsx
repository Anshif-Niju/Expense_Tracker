import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { formatDateLabel, formatMonthLabel, todayKey } from "@/lib/dates";
import { formatINR, sumPaise } from "@/lib/money";
import type { RawSearchParams } from "@/lib/search-params";
import { listCategories } from "@/features/categories/queries";
import { AddExpenseButton } from "@/features/expenses/components/add-expense-button";
import { ExpenseFiltersBar } from "@/features/expenses/components/expense-filters";
import { ExpenseList } from "@/features/expenses/components/expense-list";
import { parseExpenseFilters } from "@/features/expenses/filters";
import { listExpenses } from "@/features/expenses/queries";

export default async function ExpensesPage({ searchParams }: { searchParams: Promise<RawSearchParams> }) {
  const today = todayKey();
  const filters = parseExpenseFilters(await searchParams, today);
  const [expenses, categories] = await Promise.all([listExpenses(filters), listCategories()]);

  const total = sumPaise(expenses.map((expense) => expense.amount));
  const periodLabel =
    filters.mode === "day"
      ? formatDateLabel(filters.date, today)
      : formatMonthLabel(filters.month);
  const filtered = filters.categoryId !== null || !(filters.mode === "day" && filters.date === today);

  return (
    <>
      <PageHeader title="Expenses" description="Everything you spent, newest first." />

      <div className="mb-5">
        <ExpenseFiltersBar filters={filters} categories={categories} today={today} />
      </div>

      <div className="mb-3 flex items-baseline justify-between px-1">
        <h2 className="text-base font-semibold">{periodLabel}</h2>
        <p className="text-sm text-muted">
          {expenses.length} {expenses.length === 1 ? "expense" : "expenses"} ·{" "}
          <span className="font-semibold tabular-nums text-expense">{formatINR(total)}</span>
        </p>
      </div>

      {expenses.length === 0 ? (
        <EmptyState
          title={filtered ? "No expenses match these filters" : "No expenses today"}
          description={
            filtered
              ? "Try another date, month or category."
              : "Add what you spend and it appears here right away."
          }
          action={<AddExpenseButton categories={categories} today={today} />}
        />
      ) : (
        <ExpenseList
          expenses={expenses}
          categories={categories}
          today={today}
          showDate={filters.mode === "month"}
        />
      )}
    </>
  );
}
