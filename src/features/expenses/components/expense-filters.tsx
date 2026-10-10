"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { MonthPicker } from "@/components/layout/month-picker";
import { buttonClass, compactInputClass } from "@/components/ui/styles";
import type { CategoryOption } from "@/features/categories/queries";
import type { ExpenseFilters } from "../filters";

export function ExpenseFiltersBar({
  filters,
  categories,
  today,
}: {
  filters: ExpenseFilters;
  categories: CategoryOption[];
  today: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isToday = filters.mode === "day" && filters.date === today;
  const currentMonth = today.slice(0, 7);

  function update(changes: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(changes)) {
      if (value) params.set(key, value);
      else params.delete(key);
    }
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  }

  const activeMonth = filters.mode === "month" ? filters.month : filters.date.slice(0, 7);

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div role="group" aria-label="Filter by" className="flex rounded-lg border border-line bg-surface p-0.5">
        {(["day", "month"] as const).map((mode) => (
          <button
            key={mode}
            type="button"
            aria-pressed={filters.mode === mode}
            onClick={() =>
              mode === "day"
                ? update({ date: filters.mode === "day" ? filters.date : today, month: null })
                : update({ month: activeMonth, date: null })
            }
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              filters.mode === mode ? "bg-ink text-white" : "text-muted hover:text-ink"
            }`}
          >
            {mode === "day" ? "Day" : "Month"}
          </button>
        ))}
      </div>

      {filters.mode === "day" ? (
        <div className="flex items-center gap-2">
          <input
            type="date"
            aria-label="Expense date"
            value={filters.date}
            onChange={(event) => event.target.value && update({ date: event.target.value, month: null })}
            className={compactInputClass}
          />
          {!isToday && (
            <button type="button" className={buttonClass("secondary", "py-2")} onClick={() => update({ date: null, month: null })}>
              Today
            </button>
          )}
        </div>
      ) : (
        <MonthPicker value={filters.month} currentMonth={currentMonth} />
      )}

      <select
        aria-label="Filter by category"
        value={filters.categoryId ?? ""}
        onChange={(event) => update({ category: event.target.value || null })}
        className={compactInputClass}
      >
        <option value="">All categories</option>
        {categories.map((category) => (
          <option key={category.id} value={category.id}>
            {category.name}
          </option>
        ))}
      </select>
    </div>
  );
}
