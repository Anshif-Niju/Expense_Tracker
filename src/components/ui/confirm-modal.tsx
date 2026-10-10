"use client";

import { useState, useTransition } from "react";
import type { ActionState } from "@/lib/action-state";
import { Modal } from "./modal";
import { buttonClass } from "./styles";

type ConfirmModalProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  message: string;
  confirmLabel: string;
  onConfirm: () => Promise<ActionState>;
};

export function ConfirmModal({ open, onClose, title, message, confirmLabel, onConfirm }: ConfirmModalProps) {
  return (
    <Modal open={open} onClose={onClose} title={title}>
      <ConfirmBody
        onClose={onClose}
        message={message}
        confirmLabel={confirmLabel}
        onConfirm={onConfirm}
      />
    </Modal>
  );
}

function ConfirmBody({
  onClose,
  message,
  confirmLabel,
  onConfirm,
}: Pick<ConfirmModalProps, "onClose" | "message" | "confirmLabel" | "onConfirm">) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function confirm() {
    startTransition(async () => {
      try {
        const result = await onConfirm();
        if (result.status === "error") setError(result.message ?? "Could not delete. Try again.");
        else onClose();
      } catch {
        setError("Could not delete. Check your connection and try again.");
      }
    });
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted">{message}</p>
      {error && (
        <p role="alert" className="rounded-lg bg-expense-soft px-3 py-2 text-sm text-expense">
          {error}
        </p>
      )}
      <div className="flex justify-end gap-2">
        <button type="button" onClick={onClose} className={buttonClass("secondary")}>
          Cancel
        </button>
        <button
          type="button"
          onClick={confirm}
          disabled={pending}
          aria-busy={pending}
          className={buttonClass("danger")}
        >
          {pending ? "Deleting…" : confirmLabel}
        </button>
      </div>
    </div>
  );
}
