import { db } from "@/lib/db";
import {
  currentMonthKey,
  dayRange,
  formatDateLabel,
  formatMonthLabel,
  isMonthKey,
  toDateKey,
} from "@/lib/dates";
import { type RawSearchParams, firstParam } from "@/lib/search-params";

export type DashboardView = "salary" | "month" | "all";

// Half-open range [start, end). A null bound means open-ended.
export type Period = {
  view: DashboardView;
  start: Date | null;
  end: Date | null;
  month: string;
  label: string;
  salaryDateKey: string | null;
};

// Default view starts at the latest salary date, so a new salary begins a fresh period.
export async function resolvePeriod(params: RawSearchParams, today: string): Promise<Period> {
  const rawView = firstParam(params.view);
  const rawMonth = firstParam(params.month);
  const month = isMonthKey(rawMonth) ? rawMonth : currentMonthKey();
  const view: DashboardView =
    rawView === "all" || rawView === "month" || rawView === "salary"
      ? rawView
      : isMonthKey(rawMonth)
        ? "month"
        : "salary";

  if (view === "all") {
    return { view, start: null, end: null, month, label: "All time", salaryDateKey: null };
  }

  if (view === "salary") {
    const latest = await db.salary.findFirst({
      where: { date: { lt: dayRange(today).end } },
      orderBy: { date: "desc" },
      select: { date: true },
    });
    if (latest) {
      const salaryDateKey = toDateKey(latest.date);
      return {
        view,
        start: latest.date,
        end: null,
        month,
        label: `Since salary on ${formatDateLabel(salaryDateKey, today)}`,
        salaryDateKey,
      };
    }
  }

  const { start, end } = monthRangeOf(month);
  return { view: "month", start, end, month, label: formatMonthLabel(month), salaryDateKey: null };
}

function monthRangeOf(month: string) {
  const [year, m] = month.split("-").map(Number) as [number, number];
  return { start: new Date(Date.UTC(year, m - 1, 1)), end: new Date(Date.UTC(year, m, 1)) };
}

export function dateWhere(period: Pick<Period, "start" | "end">) {
  if (!period.start && !period.end) return undefined;
  return {
    date: {
      ...(period.start ? { gte: period.start } : {}),
      ...(period.end ? { lt: period.end } : {}),
    },
  };
}
