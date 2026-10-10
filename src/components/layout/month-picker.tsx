"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { shiftMonth } from "@/lib/dates";
import { ChevronLeftIcon, ChevronRightIcon } from "@/components/ui/icons";
import { compactInputClass, iconButtonClass } from "@/components/ui/styles";

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

// Writes ?month=YYYY-MM and clears ?date so the page switches to whole-month mode.
export function MonthPicker({ value, currentMonth }: { value: string; currentMonth: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [yearText, monthText] = value.split("-") as [string, string];
  const year = Number(yearText);
  const month = Number(monthText);
  const thisYear = Number(currentMonth.slice(0, 4));
  const years = Array.from({ length: 8 }, (_, i) => thisYear - 6 + i);
  if (!years.includes(year)) years.push(year);
  years.sort((a, b) => a - b);

  function go(monthKey: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("month", monthKey);
    params.delete("date");
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="flex items-center gap-1" role="group" aria-label="Select month">
      <button
        type="button"
        className={iconButtonClass}
        onClick={() => go(shiftMonth(value, -1))}
        aria-label="Previous month"
      >
        <ChevronLeftIcon />
      </button>
      <select
        aria-label="Month"
        value={month}
        onChange={(event) => go(`${year}-${String(event.target.value).padStart(2, "0")}`)}
        className={compactInputClass}
      >
        {MONTHS.map((name, index) => (
          <option key={name} value={index + 1}>
            {name}
          </option>
        ))}
      </select>
      <select
        aria-label="Year"
        value={year}
        onChange={(event) => go(`${event.target.value}-${monthText}`)}
        className={compactInputClass}
      >
        {years.map((y) => (
          <option key={y} value={y}>
            {y}
          </option>
        ))}
      </select>
      <button
        type="button"
        className={iconButtonClass}
        onClick={() => go(shiftMonth(value, 1))}
        aria-label="Next month"
      >
        <ChevronRightIcon />
      </button>
    </div>
  );
}
