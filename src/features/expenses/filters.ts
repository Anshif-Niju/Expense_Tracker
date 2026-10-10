import {
  dayRange,
  isMonthKey,
  monthRange,
  parseDateKey,
  todayKey,
} from "@/lib/dates";
import { type RawSearchParams, firstParam } from "@/lib/search-params";

export type ExpenseFilters =
  | { mode: "day"; date: string; categoryId: string | null }
  | { mode: "month"; month: string; categoryId: string | null };

// Today by default. A "date" param selects one day, a "month" param selects a whole month.
export function parseExpenseFilters(
  params: RawSearchParams,
  today: string = todayKey(),
): ExpenseFilters {
  const categoryId = firstParam(params.category) || null;
  const date = firstParam(params.date);
  const month = firstParam(params.month);

  if (parseDateKey(date)) return { mode: "day", date, categoryId };
  if (isMonthKey(month)) return { mode: "month", month, categoryId };
  return { mode: "day", date: today, categoryId };
}

export function filterRange(filters: ExpenseFilters): { start: Date; end: Date } {
  return filters.mode === "day" ? dayRange(filters.date) : monthRange(filters.month);
}
