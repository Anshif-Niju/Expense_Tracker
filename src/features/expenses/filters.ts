import {
  dayRange,
  isMonthKey,
  monthRange,
  parseDateKey,
  todayKey,
} from "@/lib/dates";

export type ExpenseFilters =
  | { mode: "day"; date: string; categoryId: string | null }
  | { mode: "month"; month: string; categoryId: string | null };

type RawParams = Record<string, string | string[] | undefined>;

function first(value: string | string[] | undefined): string {
  return (Array.isArray(value) ? value[0] : value) ?? "";
}

// Today by default. A "date" param selects one day, a "month" param selects a whole month.
export function parseExpenseFilters(params: RawParams, today: string = todayKey()): ExpenseFilters {
  const categoryId = first(params.category) || null;
  const date = first(params.date);
  const month = first(params.month);

  if (parseDateKey(date)) return { mode: "day", date, categoryId };
  if (isMonthKey(month)) return { mode: "month", month, categoryId };
  return { mode: "day", date: today, categoryId };
}

export function filterRange(filters: ExpenseFilters): { start: Date; end: Date } {
  return filters.mode === "day" ? dayRange(filters.date) : monthRange(filters.month);
}
