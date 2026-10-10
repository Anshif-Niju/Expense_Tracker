"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { idleState } from "@/lib/action-state";
import { Field } from "@/components/ui/field";
import { buttonClass, inputClass } from "@/components/ui/styles";
import { createCategory } from "../actions";

function AddButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} aria-busy={pending} className={buttonClass("primary")}>
      {pending ? "Adding…" : "Add category"}
    </button>
  );
}

export function AddCategoryForm() {
  const [state, action] = useActionState(createCategory, idleState);
  const error = state.fieldErrors?.name;

  return (
    <form action={action} noValidate className="flex flex-col gap-3 sm:flex-row sm:items-start">
      <div className="flex-1">
        <Field label="New category" htmlFor="name" error={error}>
          <input
            id="name"
            name="name"
            autoComplete="off"
            placeholder="For example, Bus or Personal"
            defaultValue={state.values?.name ?? ""}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? "name-error" : undefined}
            className={inputClass}
          />
        </Field>
        {state.status === "error" && state.message && (
          <p role="alert" className="mt-1 text-xs text-muted">
            {state.message}
          </p>
        )}
      </div>
      <div className="sm:mt-[1.65rem]">
        <AddButton />
      </div>
    </form>
  );
}
