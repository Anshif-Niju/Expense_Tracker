import type { ZodError } from "zod";

export type ActionState = {
  status: "idle" | "success" | "error";
  message?: string;
  fieldErrors?: Record<string, string>;
  // Submitted values, so a failed form keeps what the user typed.
  values?: Record<string, string>;
};

export const idleState: ActionState = { status: "idle" };

export function formValues(formData: FormData): Record<string, string> {
  const values: Record<string, string> = {};
  for (const [key, value] of formData.entries()) {
    if (typeof value === "string") values[key] = value;
  }
  return values;
}

export function validationError(error: ZodError, formData: FormData): ActionState {
  const fieldErrors: Record<string, string> = {};
  for (const issue of error.issues) {
    const field = String(issue.path[0] ?? "form");
    if (!(field in fieldErrors)) fieldErrors[field] = issue.message;
  }
  return {
    status: "error",
    message: "Fix the highlighted fields and try again.",
    fieldErrors,
    values: formValues(formData),
  };
}

export function failure(message: string, formData?: FormData): ActionState {
  return { status: "error", message, values: formData ? formValues(formData) : undefined };
}

export const success: ActionState = { status: "success" };
