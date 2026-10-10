"use client";

import { useCallback, useState } from "react";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { PencilIcon, TrashIcon } from "@/components/ui/icons";
import { iconButtonClass } from "@/components/ui/styles";
import { formatINR } from "@/lib/money";
import type { CategoryOption } from "@/features/categories/queries";
import { deleteExpense } from "../actions";
import type { ExpenseRow } from "../queries";
import { ExpenseFormModal } from "./expense-form";

export function ExpenseRowActions({
  expense,
  categories,
  today,
}: {
  expense: ExpenseRow;
  categories: CategoryOption[];
  today: string;
}) {
  const [mode, setMode] = useState<"edit" | "delete" | null>(null);
  const close = useCallback(() => setMode(null), []);

  return (
    <div className="flex items-center">
      <button
        type="button"
        onClick={() => setMode("edit")}
        className={iconButtonClass}
        aria-label={`Edit ${expense.description ?? expense.categoryName} expense`}
      >
        <PencilIcon />
      </button>
      <button
        type="button"
        onClick={() => setMode("delete")}
        className={`${iconButtonClass} hover:text-expense`}
        aria-label={`Delete ${expense.description ?? expense.categoryName} expense`}
      >
        <TrashIcon />
      </button>
      <ExpenseFormModal
        open={mode === "edit"}
        onClose={close}
        categories={categories}
        today={today}
        expense={expense}
      />
      <ConfirmModal
        open={mode === "delete"}
        onClose={close}
        title="Delete this expense?"
        message={`${formatINR(expense.amount)} for ${expense.categoryName} will be removed. This cannot be undone.`}
        confirmLabel="Delete expense"
        onConfirm={() => deleteExpense(expense.id)}
      />
    </div>
  );
}
