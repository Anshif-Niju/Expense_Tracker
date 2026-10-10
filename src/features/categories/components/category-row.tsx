"use client";

import { useCallback, useState } from "react";
import { idleState } from "@/lib/action-state";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { Field } from "@/components/ui/field";
import { FormModal } from "@/components/ui/form-modal";
import { PencilIcon, TrashIcon } from "@/components/ui/icons";
import { iconButtonClass, inputClass } from "@/components/ui/styles";
import { deleteCategory, renameCategory } from "../actions";
import type { CategoryWithCount } from "../queries";

export function CategoryRow({
  category,
  others,
}: {
  category: CategoryWithCount;
  others: CategoryWithCount[];
}) {
  const [mode, setMode] = useState<"rename" | "delete" | null>(null);
  const close = useCallback(() => setMode(null), []);
  const countLabel =
    category.expenseCount === 0
      ? "No expenses"
      : `${category.expenseCount} ${category.expenseCount === 1 ? "expense" : "expenses"}`;
  const defaultReplacement = (others.find((c) => c.name === "Other") ?? others[0])?.id ?? "";

  return (
    <li className="flex items-center gap-4 px-4 py-3 md:px-5">
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{category.name}</p>
        <p className="text-xs text-muted">{countLabel}</p>
      </div>
      <div className="flex items-center">
        <button
          type="button"
          onClick={() => setMode("rename")}
          className={iconButtonClass}
          aria-label={`Rename ${category.name}`}
        >
          <PencilIcon />
        </button>
        <button
          type="button"
          onClick={() => setMode("delete")}
          className={`${iconButtonClass} hover:text-expense`}
          aria-label={`Delete ${category.name}`}
        >
          <TrashIcon />
        </button>
      </div>

      <FormModal
        open={mode === "rename"}
        onClose={close}
        title="Rename category"
        description="Existing expenses keep this category under its new name."
        submitLabel="Save name"
        action={renameCategory.bind(null, category.id)}
      >
        {(state) => (
          <Field label="Name" htmlFor="name" error={state.fieldErrors?.name}>
            <input
              id="name"
              name="name"
              autoComplete="off"
              autoFocus
              defaultValue={state.values?.name ?? category.name}
              aria-invalid={Boolean(state.fieldErrors?.name)}
              aria-describedby={state.fieldErrors?.name ? "name-error" : undefined}
              className={inputClass}
            />
          </Field>
        )}
      </FormModal>

      {category.expenseCount === 0 ? (
        <ConfirmModal
          open={mode === "delete"}
          onClose={close}
          title={`Delete ${category.name}?`}
          message="This category has no expenses. It will be removed from the category list."
          confirmLabel="Delete category"
          onConfirm={() => deleteCategory(category.id, idleState, new FormData())}
        />
      ) : (
        <FormModal
          open={mode === "delete"}
          onClose={close}
          title={`Delete ${category.name}?`}
          description={`${countLabel} use this category. Move them to another category first so nothing is lost.`}
          submitLabel="Move and delete"
          submitVariant="danger"
          action={deleteCategory.bind(null, category.id)}
        >
          {() => (
            <Field label="Move expenses to" htmlFor="replacementId">
              <select
                id="replacementId"
                name="replacementId"
                defaultValue={defaultReplacement}
                className={inputClass}
              >
                {others.map((other) => (
                  <option key={other.id} value={other.id}>
                    {other.name}
                  </option>
                ))}
              </select>
            </Field>
          )}
        </FormModal>
      )}
    </li>
  );
}
