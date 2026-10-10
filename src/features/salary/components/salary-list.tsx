import { formatDateLabel, formatMonthLabel, monthKeyOf } from "@/lib/dates";
import { formatINR, sumPaise } from "@/lib/money";
import type { SalaryRow } from "../queries";
import { SalaryRowActions } from "./salary-row-actions";

function groupByMonth(salaries: SalaryRow[]): Array<[string, SalaryRow[]]> {
  const groups = new Map<string, SalaryRow[]>();
  for (const salary of salaries) {
    const key = monthKeyOf(salary.dateKey);
    groups.set(key, [...(groups.get(key) ?? []), salary]);
  }
  return [...groups.entries()];
}

export function SalaryList({ salaries, today }: { salaries: SalaryRow[]; today: string }) {
  return (
    <div className="space-y-6">
      {groupByMonth(salaries).map(([monthKey, rows]) => (
        <section key={monthKey} aria-labelledby={`month-${monthKey}`}>
          <div className="mb-2 flex items-baseline justify-between px-1">
            <h2 id={`month-${monthKey}`} className="text-sm font-semibold">
              {formatMonthLabel(monthKey)}
            </h2>
            <span className="text-sm tabular-nums text-muted">
              Total {formatINR(sumPaise(rows.map((row) => row.amount)))}
            </span>
          </div>
          <ul className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-surface">
            {rows.map((salary) => (
              <li key={salary.id} className="flex items-center gap-4 px-4 py-3.5 md:px-5">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold tabular-nums text-income">
                    +{formatINR(salary.amount)}
                  </p>
                  <p className="truncate text-sm text-muted">
                    {formatDateLabel(salary.dateKey, today)}
                    {salary.note ? ` · ${salary.note}` : ""}
                  </p>
                </div>
                <SalaryRowActions salary={salary} />
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
