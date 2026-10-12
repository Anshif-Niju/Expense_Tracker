import Link from "next/link";
import type { DashboardView } from "../period";

const options: Array<{ view: DashboardView; label: string; href: string }> = [
  { view: "salary", label: "Since salary", href: "/?view=salary" },
  { view: "month", label: "Month", href: "/?view=month" },
  { view: "all", label: "All", href: "/?view=all" },
];

export function ViewSwitch({ value, month }: { value: DashboardView; month: string }) {
  return (
    <div
      role="group"
      aria-label="Dashboard period"
      className="inline-flex rounded-lg border border-line bg-surface p-0.5"
    >
      {options.map(({ view, label, href }) => (
        <Link
          key={view}
          href={view === "month" ? `${href}&month=${month}` : href}
          prefetch={false}
          aria-current={value === view ? "true" : undefined}
          className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
            value === view ? "bg-income text-white" : "text-muted hover:text-ink"
          }`}
        >
          {label}
        </Link>
      ))}
    </div>
  );
}
