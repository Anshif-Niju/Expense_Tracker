"use client";

import { type ReactNode, useCallback, useState } from "react";
import { PlusIcon } from "@/components/ui/icons";
import { buttonClass } from "@/components/ui/styles";
import type { CategoryOption } from "@/features/categories/queries";
import { ExpenseFormModal } from "./expense-form";

export function AddExpenseButton({
  categories,
  today,
  className = "",
  children = "Add expense",
}: {
  categories: CategoryOption[];
  today: string;
  className?: string;
  children?: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={buttonClass("primary", className)}>
        <PlusIcon />
        {children}
      </button>
      <ExpenseFormModal open={open} onClose={close} categories={categories} today={today} />
    </>
  );
}
