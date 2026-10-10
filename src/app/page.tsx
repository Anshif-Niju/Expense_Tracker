import Link from "next/link";
import { MonthPicker } from "@/components/layout/month-picker";
import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { currentMonthKey, formatMonthLabel, todayKey } from "@/lib/dates";
import { type RawSearchParams, monthFromParams } from "@/lib/search-params";
import { listCategories } from "@/features/categories/queries";
import { SummaryCards } from "@/features/dashboard/components/summary-cards";
import { getDashboardSummary } from "@/features/dashboard/summary";
import { ExpenseList } from "@/features/expenses/components/expense-list";
import { listExpenses } from "@/features/expenses/queries";

const RECENT_LIMIT = 5;

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>;
}) {
  const month = monthFromParams(await searchParams);
  const today = todayKey();

  const [summary, monthExpenses, categories] = await Promise.all([
    getDashboardSummary(month, today),
    listExpenses({ mode: "month", month, categoryId: null }),
    listCategories(),
  ]);
  const recent = monthExpenses.slice(0, RECENT_LIMIT);
  const salaryDefaultDate = month === currentMonthKey() ? today : `${month}-01`;

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Salary, spending and what is left for the month."
        actions={<MonthPicker value={month} currentMonth={currentMonthKey()} />}
      />

      <SummaryCards summary={summary} month={month} salaryDefaultDate={salaryDefaultDate} />

      <section className="mt-8" aria-labelledby="recent-heading">
        <div className="mb-3 flex items-baseline justify-between">
          <h2 id="recent-heading" className="text-base font-semibold">
            Recent expenses in {formatMonthLabel(month)}
          </h2>
          {monthExpenses.length > 0 && (
            <Link href={`/expenses?month=${month}`} className="text-sm font-medium text-income hover:underline">
              View all ({monthExpenses.length})
            </Link>
          )}
        </div>
        {recent.length === 0 ? (
          <EmptyState
            title="No expenses this month"
            description="Use Add expense to record what you spend. It shows up here straight away."
          />
        ) : (
          <ExpenseList expenses={recent} categories={categories} today={today} />
        )}
      </section>
    </>
  );
}
