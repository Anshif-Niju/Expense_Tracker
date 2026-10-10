import type { ReactNode } from "react";
import { formatMonthLabel } from "@/lib/dates";
import { formatINR } from "@/lib/money";
import { AddSalaryButton } from "@/features/salary/components/add-salary-button";
import type { DashboardSummary } from "../summary";

function SmallCard({
  label,
  tone,
  value,
  children,
}: {
  label: string;
  tone: "income" | "expense";
  value: string;
  children?: ReactNode;
}) {
  const dot = tone === "income" ? "bg-income" : "bg-expense";
  const text = tone === "income" ? "text-income" : "text-expense";
  return (
    <section className="rounded-2xl border border-line bg-surface p-5">
      <h2 className="flex items-center gap-2 text-sm text-muted">
        <span className={`size-2 rounded-full ${dot}`} aria-hidden="true" />
        {label}
      </h2>
      <p className={`mt-2 text-2xl font-semibold tabular-nums ${text}`}>{value}</p>
      {children}
    </section>
  );
}

export function SummaryCards({
  summary,
  month,
  salaryDefaultDate,
}: {
  summary: DashboardSummary;
  month: string;
  salaryDefaultDate: string;
}) {
  const { salary, expenses, balance, today } = summary;
  const negative = balance < 0;
  const spentPercent =
    salary > 0 ? Math.min(100, Math.round((expenses / salary) * 100)) : expenses > 0 ? 100 : 0;
  const barLabel =
    salary === 0
      ? expenses > 0
        ? "Expenses recorded, but no salary added for this month."
        : "Nothing recorded for this month yet."
      : negative
        ? `Spent ${formatINR(-balance)} more than the salary.`
        : `${formatINR(expenses)} of ${formatINR(salary)} spent (${spentPercent}%).`;

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <section
        className={`rounded-2xl border p-6 md:col-span-3 ${
          negative ? "border-expense/30 bg-expense-soft" : "border-income/20 bg-income-soft"
        }`}
      >
        <h2 className="text-sm text-muted">Remaining balance · {formatMonthLabel(month)}</h2>
        <p
          className={`mt-2 text-4xl font-semibold tracking-tight tabular-nums sm:text-5xl ${
            negative ? "text-expense" : "text-income"
          }`}
        >
          {formatINR(balance)}
        </p>
        <div
          className="mt-5 h-2 overflow-hidden rounded-full bg-white/70"
          role="progressbar"
          aria-label="Share of salary spent"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={spentPercent}
        >
          <div
            className={`h-full rounded-full ${negative ? "bg-expense" : "bg-income"}`}
            style={{ width: `${spentPercent}%` }}
          />
        </div>
        <p className="mt-2 text-sm text-muted">{barLabel}</p>
      </section>

      <SmallCard label="Monthly salary" tone="income" value={formatINR(salary)}>
        {salary === 0 && (
          <div className="mt-3">
            <AddSalaryButton defaultDate={salaryDefaultDate} className="px-3 py-1.5">
              Add salary for {formatMonthLabel(month).split(" ")[0]}
            </AddSalaryButton>
          </div>
        )}
      </SmallCard>
      <SmallCard label="Total expenses" tone="expense" value={formatINR(expenses)} />
      <SmallCard label="Today's expenses" tone="expense" value={formatINR(today)} />
    </div>
  );
}
