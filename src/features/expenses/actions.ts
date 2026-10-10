"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import {
  type ActionState,
  failure,
  success,
  validationError,
} from "@/lib/action-state";
import { amountField, categoryNameField, dateField, optionalText } from "@/lib/validation";
import { getOrCreateCategory } from "@/features/categories/queries";

const NEW_CATEGORY = "__new__";

const expenseSchema = z
  .object({
    amount: amountField,
    date: dateField,
    categoryId: z.string().trim().min(1, "Select a category"),
    newCategory: z.string().trim().optional(),
    description: optionalText(200),
  })
  .superRefine((value, ctx) => {
    if (value.categoryId !== NEW_CATEGORY) return;
    const name = categoryNameField.safeParse(value.newCategory ?? "");
    if (!name.success) {
      ctx.addIssue({
        code: "custom",
        path: ["newCategory"],
        message: name.error.issues[0]?.message ?? "Enter a category name",
      });
    }
  });

function readForm(formData: FormData) {
  return expenseSchema.safeParse({
    amount: formData.get("amount") ?? "",
    date: formData.get("date") ?? "",
    categoryId: formData.get("categoryId") ?? "",
    newCategory: formData.get("newCategory") ?? "",
    description: formData.get("description") ?? "",
  });
}

function refresh() {
  revalidatePath("/", "layout");
}

async function resolveCategoryId(
  tx: Parameters<Parameters<typeof db.$transaction>[0]>[0],
  categoryId: string,
  newCategory: string | undefined,
): Promise<string | null> {
  if (categoryId === NEW_CATEGORY) {
    return (await getOrCreateCategory(tx, newCategory ?? "")).id;
  }
  const category = await tx.category.findUnique({ where: { id: categoryId } });
  return category?.id ?? null;
}

export async function createExpense(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = readForm(formData);
  if (!parsed.success) return validationError(parsed.error, formData);
  const { amount, date, categoryId, newCategory, description } = parsed.data;

  const saved = await db.$transaction(async (tx) => {
    const resolvedId = await resolveCategoryId(tx, categoryId, newCategory);
    if (!resolvedId) return false;
    await tx.expense.create({ data: { amount, date, description, categoryId: resolvedId } });
    return true;
  });
  if (!saved) return failure("That category no longer exists. Pick another one.", formData);

  refresh();
  return success;
}

export async function updateExpense(
  id: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = readForm(formData);
  if (!parsed.success) return validationError(parsed.error, formData);
  const { amount, date, categoryId, newCategory, description } = parsed.data;

  const result = await db.$transaction(async (tx) => {
    const resolvedId = await resolveCategoryId(tx, categoryId, newCategory);
    if (!resolvedId) return "no-category" as const;
    const updated = await tx.expense.updateMany({
      where: { id },
      data: { amount, date, description, categoryId: resolvedId },
    });
    return updated.count === 0 ? ("not-found" as const) : ("ok" as const);
  });

  if (result === "no-category") {
    return failure("That category no longer exists. Pick another one.", formData);
  }
  if (result === "not-found") return failure("This expense no longer exists.", formData);

  refresh();
  return success;
}

export async function deleteExpense(id: string): Promise<ActionState> {
  await db.expense.deleteMany({ where: { id } });
  refresh();
  return success;
}
