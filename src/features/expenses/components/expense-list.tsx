import { formatDateLabel } from "@/lib/dates";
import { formatINR } from "@/lib/money";
import type { CategoryOption } from "@/features/categories/queries";
import type { ExpenseRow } from "../queries";
import { ExpenseRowActions } from "./expense-row-actions";

const columns = "md:grid-cols-[minmax(0,1.1fr)_minmax(0,1.6fr)_7rem_8rem_5rem]";

export function ExpenseList({
  expenses,
  categories,
  today,
  showDate = true,
}: {
  expenses: ExpenseRow[];
  categories: CategoryOption[];
  today: string;
  showDate?: boolean;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-surface">
      <div
        className={`hidden gap-4 border-b border-line px-5 py-3 text-xs font-medium text-muted md:grid ${columns}`}
      >
        <span>Category</span>
        <span>Description</span>
        <span>{showDate ? "Date" : ""}</span>
        <span className="text-right">Amount</span>
        <span className="sr-only">Actions</span>
      </div>
      <ul className="divide-y divide-line">
        {expenses.map((expense) => (
          <li
            key={expense.id}
            className={`grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-1 px-4 py-3.5 md:px-5 ${columns}`}
          >
            <span className="col-start-1 row-start-1 text-sm font-medium md:col-auto md:row-auto">
              {expense.categoryName}
            </span>
            <span className="col-start-1 row-start-2 truncate text-sm text-muted md:col-auto md:row-auto">
              {expense.description ?? <span className="text-muted/60">No note</span>}
              <span className="md:hidden">
                {" · "}
                {formatDateLabel(expense.dateKey, today)}
              </span>
            </span>
            <span className="hidden text-sm text-muted md:block">
              {showDate ? formatDateLabel(expense.dateKey, today) : ""}
            </span>
            <span className="col-start-2 row-start-1 text-right text-sm font-semibold tabular-nums text-expense md:col-auto md:row-auto">
              {formatINR(expense.amount)}
            </span>
            <span className="col-start-2 row-start-2 flex justify-end md:col-auto md:row-auto">
              <ExpenseRowActions expense={expense} categories={categories} today={today} />
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
