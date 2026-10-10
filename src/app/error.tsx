"use client";

import { buttonClass } from "@/components/ui/styles";

export default function ErrorPage({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="rounded-2xl border border-expense/30 bg-expense-soft p-8 text-center">
      <p className="font-semibold text-expense">Something went wrong loading this page.</p>
      <p className="mt-1 text-sm text-muted">Your data is safe. Try again, and restart the app if it keeps failing.</p>
      <button type="button" onClick={reset} className={buttonClass("primary", "mt-4")}>
        Try again
      </button>
    </div>
  );
}
