import Link from "next/link";
import { MonthPicker } from "@/components/layout/month-picker";
import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { currentMonthKey, todayKey } from "@/lib/dates";
import type { RawSearchParams } from "@/lib/search-params";
import { listCategories } from "@/features/categories/queries";
import { SummaryCards } from "@/features/dashboard/components/summary-cards";
import { ViewSwitch } from "@/features/dashboard/components/view-switch";
import { resolvePeriod } from "@/features/dashboard/period";
import { getPeriodSummary } from "@/features/dashboard/summary";
import { ExpenseList } from "@/features/expenses/components/expense-list";
import { listExpensesInPeriod } from "@/features/expenses/queries";

const RECENT_LIMIT = 5;

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>;
}) {
  const today = todayKey();
  const period = await resolvePeriod(await searchParams, today);

  const [summary, periodExpenses, categories] = await Promise.all([
    getPeriodSummary(period, today),
    listExpensesInPeriod(period),
    listCategories(),
  ]);
  const recent = periodExpenses.slice(0, RECENT_LIMIT);
  const expensesHref =
    period.view === "month" ? `/expenses?month=${period.month}` : `/expenses?month=${currentMonthKey()}`;

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Salary, spending and what is left."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <ViewSwitch value={period.view} month={period.month} />
            {period.view === "month" && (
              <MonthPicker value={period.month} currentMonth={currentMonthKey()} />
            )}
          </div>
        }
      />

      <SummaryCards summary={summary} periodLabel={period.label} salaryDefaultDate={today} />

      <section className="mt-8" aria-labelledby="recent-heading">
        <div className="mb-3 flex items-baseline justify-between">
          <h2 id="recent-heading" className="text-base font-semibold">
            Recent expenses · {period.label}
          </h2>
          {periodExpenses.length > 0 && (
            <Link href={expensesHref} prefetch={false} className="text-sm font-medium text-income hover:underline">
              View all ({periodExpenses.length})
            </Link>
          )}
        </div>
        {recent.length === 0 ? (
          <EmptyState
            title="No expenses in this period"
            description="Use Add expense to record what you spend. It shows up here straight away."
          />
        ) : (
          <ExpenseList expenses={recent} categories={categories} today={today} />
        )}
      </section>
    </>
  );
}
