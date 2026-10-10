"use client";

import { useState } from "react";
import type { ActionState } from "@/lib/action-state";
import { paiseToInputValue } from "@/lib/money";
import { Field } from "@/components/ui/field";
import { FormModal } from "@/components/ui/form-modal";
import { inputClass } from "@/components/ui/styles";
import type { CategoryOption } from "@/features/categories/queries";
import { createExpense, updateExpense } from "../actions";
import type { ExpenseRow } from "../queries";

const NEW_CATEGORY = "__new__";

type ExpenseFormModalProps = {
  open: boolean;
  onClose: () => void;
  categories: CategoryOption[];
  today: string;
  expense?: ExpenseRow;
};

export function ExpenseFormModal({ open, onClose, categories, today, expense }: ExpenseFormModalProps) {
  return (
    <FormModal
      open={open}
      onClose={onClose}
      title={expense ? "Edit expense" : "Add expense"}
      submitLabel={expense ? "Save changes" : "Save expense"}
      action={expense ? updateExpense.bind(null, expense.id) : createExpense}
    >
      {(state) => (
        <ExpenseFields state={state} categories={categories} today={today} expense={expense} />
      )}
    </FormModal>
  );
}

function ExpenseFields({
  state,
  categories,
  today,
  expense,
}: {
  state: ActionState;
  categories: CategoryOption[];
  today: string;
  expense?: ExpenseRow;
}) {
  const values = state.values;
  const errors = state.fieldErrors ?? {};
  const [categoryId, setCategoryId] = useState(values?.categoryId ?? expense?.categoryId ?? "");
  const isNew = categoryId === NEW_CATEGORY;

  return (
    <>
      <Field label="Amount (₹)" htmlFor="amount" error={errors.amount}>
        <input
          id="amount"
          name="amount"
          inputMode="decimal"
          autoComplete="off"
          autoFocus
          placeholder="0.00"
          defaultValue={values?.amount ?? (expense ? paiseToInputValue(expense.amount) : "")}
          aria-invalid={Boolean(errors.amount)}
          aria-describedby={errors.amount ? "amount-error" : undefined}
          className={inputClass}
        />
      </Field>

      <Field label="Category" htmlFor="categoryId" error={errors.categoryId}>
        <select
          id="categoryId"
          name="categoryId"
          value={categoryId}
          onChange={(event) => setCategoryId(event.target.value)}
          aria-invalid={Boolean(errors.categoryId)}
          aria-describedby={errors.categoryId ? "categoryId-error" : undefined}
          className={inputClass}
        >
          <option value="">Select a category</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
          <option value={NEW_CATEGORY}>+ New category…</option>
        </select>
      </Field>

      {isNew && (
        <Field label="New category name" htmlFor="newCategory" error={errors.newCategory}>
          <input
            id="newCategory"
            name="newCategory"
            autoComplete="off"
            placeholder="For example, Bus"
            defaultValue={values?.newCategory ?? ""}
            aria-invalid={Boolean(errors.newCategory)}
            aria-describedby={errors.newCategory ? "newCategory-error" : undefined}
            className={inputClass}
          />
        </Field>
      )}

      <Field label="Date" htmlFor="date" error={errors.date}>
        <input
          id="date"
          name="date"
          type="date"
          defaultValue={values?.date ?? expense?.dateKey ?? today}
          aria-invalid={Boolean(errors.date)}
          aria-describedby={errors.date ? "date-error" : undefined}
          className={inputClass}
        />
      </Field>

      <Field label="Note (optional)" htmlFor="description" error={errors.description}>
        <input
          id="description"
          name="description"
          autoComplete="off"
          placeholder="For example, Lunch with team"
          defaultValue={values?.description ?? expense?.description ?? ""}
          aria-invalid={Boolean(errors.description)}
          aria-describedby={errors.description ? "description-error" : undefined}
          className={inputClass}
        />
      </Field>
    </>
  );
}
