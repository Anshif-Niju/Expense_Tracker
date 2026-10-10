import { z } from "zod";
import { parseDateKey } from "./dates";
import { MAX_PAISE, parseRupeesToPaise } from "./money";

export const amountField = z
  .string()
  .trim()
  .min(1, "Enter an amount")
  .transform((value, ctx) => {
    const paise = parseRupeesToPaise(value);
    if (paise === null) {
      ctx.addIssue({ code: "custom", message: "Enter a valid amount, like 150 or 150.50" });
      return z.NEVER;
    }
    if (paise <= 0) {
      ctx.addIssue({ code: "custom", message: "Amount must be greater than zero" });
      return z.NEVER;
    }
    if (paise > MAX_PAISE) {
      ctx.addIssue({ code: "custom", message: "Amount is too large" });
      return z.NEVER;
    }
    return paise;
  });

export const dateField = z
  .string()
  .trim()
  .min(1, "Select a date")
  .transform((value, ctx) => {
    const date = parseDateKey(value);
    const year = date?.getUTCFullYear() ?? 0;
    if (!date || year < 2000 || year > 2100) {
      ctx.addIssue({ code: "custom", message: "Select a valid date" });
      return z.NEVER;
    }
    return date;
  });

export function optionalText(max: number) {
  return z
    .string()
    .trim()
    .max(max, `Keep this under ${max} characters`)
    .transform((value) => (value === "" ? null : value));
}

export const categoryNameField = z
  .string()
  .trim()
  .min(1, "Enter a category name")
  .max(40, "Keep the name under 40 characters");
