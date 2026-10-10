import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { todayKey } from "@/lib/dates";
import { AddSalaryButton } from "@/features/salary/components/add-salary-button";
import { SalaryList } from "@/features/salary/components/salary-list";
import { listSalaries } from "@/features/salary/queries";

export default async function SalaryPage() {
  const today = todayKey();
  const salaries = await listSalaries();

  return (
    <>
      <PageHeader
        title="Salary"
        description="Salary is only recorded when you add it. Each record counts toward the month of its date."
        actions={
          <AddSalaryButton defaultDate={today} variant="income">
            Add salary
          </AddSalaryButton>
        }
      />

      {salaries.length === 0 ? (
        <EmptyState
          title="No salary recorded yet"
          description="Add the amount and the date you received it. The dashboard uses it to work out your remaining balance."
        />
      ) : (
        <SalaryList salaries={salaries} today={today} />
      )}
    </>
  );
}
