"use client";

import { useCallback, useState } from "react";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { PencilIcon, TrashIcon } from "@/components/ui/icons";
import { iconButtonClass } from "@/components/ui/styles";
import { formatINR } from "@/lib/money";
import { deleteSalary } from "../actions";
import type { SalaryRow } from "../queries";
import { SalaryFormModal } from "./salary-form";

export function SalaryRowActions({ salary }: { salary: SalaryRow }) {
  const [mode, setMode] = useState<"edit" | "delete" | null>(null);
  const close = useCallback(() => setMode(null), []);

  return (
    <div className="flex items-center">
      <button
        type="button"
        onClick={() => setMode("edit")}
        className={iconButtonClass}
        aria-label={`Edit salary of ${formatINR(salary.amount)}`}
      >
        <PencilIcon />
      </button>
      <button
        type="button"
        onClick={() => setMode("delete")}
        className={`${iconButtonClass} hover:text-expense`}
        aria-label={`Delete salary of ${formatINR(salary.amount)}`}
      >
        <TrashIcon />
      </button>
      <SalaryFormModal open={mode === "edit"} onClose={close} defaultDate={salary.dateKey} salary={salary} />
      <ConfirmModal
        open={mode === "delete"}
        onClose={close}
        title="Delete this salary record?"
        message={`The ${formatINR(salary.amount)} salary will be removed and the monthly balance will drop by that amount. This cannot be undone.`}
        confirmLabel="Delete salary"
        onConfirm={() => deleteSalary(salary.id)}
      />
    </div>
  );
}
