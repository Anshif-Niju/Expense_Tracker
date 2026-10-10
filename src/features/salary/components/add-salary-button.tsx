"use client";

import { type ReactNode, useCallback, useState } from "react";
import { PlusIcon } from "@/components/ui/icons";
import { type ButtonVariant, buttonClass } from "@/components/ui/styles";
import { SalaryFormModal } from "./salary-form";

export function AddSalaryButton({
  defaultDate,
  variant = "secondary",
  className = "",
  children = "Add salary",
}: {
  defaultDate: string;
  variant?: ButtonVariant;
  className?: string;
  children?: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={buttonClass(variant, className)}>
        <PlusIcon />
        {children}
      </button>
      <SalaryFormModal open={open} onClose={close} defaultDate={defaultDate} />
    </>
  );
}
