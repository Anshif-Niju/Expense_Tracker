"use client";

import { paiseToInputValue } from "@/lib/money";
import { Field } from "@/components/ui/field";
import { FormModal } from "@/components/ui/form-modal";
import { inputClass } from "@/components/ui/styles";
import { createSalary, updateSalary } from "../actions";
import type { SalaryRow } from "../queries";

export function SalaryFormModal({
  open,
  onClose,
  defaultDate,
  salary,
}: {
  open: boolean;
  onClose: () => void;
  defaultDate: string;
  salary?: SalaryRow;
}) {
  return (
    <FormModal
      open={open}
      onClose={onClose}
      title={salary ? "Edit salary" : "Add salary"}
      description={salary ? undefined : "Record a salary you received. Nothing is added automatically."}
      submitLabel={salary ? "Save changes" : "Save salary"}
      submitVariant="income"
      action={salary ? updateSalary.bind(null, salary.id) : createSalary}
    >
      {(state) => {
        const values = state.values;
        const errors = state.fieldErrors ?? {};
        return (
          <>
            <Field label="Salary amount (₹)" htmlFor="amount" error={errors.amount}>
              <input
                id="amount"
                name="amount"
                inputMode="decimal"
                autoComplete="off"
                autoFocus
                placeholder="25000"
                defaultValue={values?.amount ?? (salary ? paiseToInputValue(salary.amount) : "")}
                aria-invalid={Boolean(errors.amount)}
                aria-describedby={errors.amount ? "amount-error" : undefined}
                className={inputClass}
              />
            </Field>
            <Field
              label="Date received"
              htmlFor="date"
              error={errors.date}
              hint="The month of this date decides which month's dashboard it counts toward."
            >
              <input
                id="date"
                name="date"
                type="date"
                defaultValue={values?.date ?? salary?.dateKey ?? defaultDate}
                aria-invalid={Boolean(errors.date)}
                aria-describedby={errors.date ? "date-error" : undefined}
                className={inputClass}
              />
            </Field>
            <Field label="Note (optional)" htmlFor="note" error={errors.note}>
              <input
                id="note"
                name="note"
                autoComplete="off"
                placeholder="For example, October salary"
                defaultValue={values?.note ?? salary?.note ?? ""}
                aria-invalid={Boolean(errors.note)}
                aria-describedby={errors.note ? "note-error" : undefined}
                className={inputClass}
              />
            </Field>
          </>
        );
      }}
    </FormModal>
  );
}
