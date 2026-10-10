"use client";

import { type ReactNode, useActionState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import { type ActionState, idleState } from "@/lib/action-state";
import { Modal } from "./modal";
import { type ButtonVariant, buttonClass } from "./styles";

export function SubmitButton({
  children,
  pendingLabel = "Saving…",
  variant = "primary",
}: {
  children: ReactNode;
  pendingLabel?: string;
  variant?: ButtonVariant;
}) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} aria-busy={pending} className={buttonClass(variant)}>
      {pending ? pendingLabel : children}
    </button>
  );
}

type FormModalProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  submitLabel: string;
  submitVariant?: ButtonVariant;
  action: (state: ActionState, formData: FormData) => Promise<ActionState>;
  children: (state: ActionState) => ReactNode;
};

export function FormModal({ open, onClose, title, description, ...rest }: FormModalProps) {
  return (
    <Modal open={open} onClose={onClose} title={title} description={description}>
      <FormBody onClose={onClose} {...rest} />
    </Modal>
  );
}

function FormBody({
  onClose,
  submitLabel,
  submitVariant,
  action,
  children,
}: Omit<FormModalProps, "open" | "title" | "description">) {
  const [state, formAction] = useActionState(action, idleState);

  useEffect(() => {
    if (state.status === "success") onClose();
  }, [state, onClose]);

  return (
    <form action={formAction} className="space-y-4" noValidate>
      {state.status === "error" && state.message && (
        <p
          role="alert"
          className="rounded-lg border border-expense/30 bg-expense-soft px-3 py-2 text-sm text-expense"
        >
          {state.message}
        </p>
      )}
      {children(state)}
      <div className="flex justify-end gap-2 pt-2">
        <button type="button" onClick={onClose} className={buttonClass("secondary")}>
          Cancel
        </button>
        <SubmitButton variant={submitVariant}>{submitLabel}</SubmitButton>
      </div>
    </form>
  );
}
