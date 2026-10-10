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
import { categoryNameField } from "@/lib/validation";
import { findCategoryByName } from "./queries";

const nameSchema = z.object({ name: categoryNameField });

function refresh() {
  revalidatePath("/", "layout");
}

function duplicateError(name: string, formData: FormData): ActionState {
  return {
    ...failure(`A category named "${name}" already exists.`, formData),
    fieldErrors: { name: "Choose a different name" },
  };
}

export async function createCategory(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = nameSchema.safeParse({ name: formData.get("name") ?? "" });
  if (!parsed.success) return validationError(parsed.error, formData);

  if (await findCategoryByName(db, parsed.data.name)) {
    return duplicateError(parsed.data.name, formData);
  }
  await db.category.create({ data: { name: parsed.data.name } });
  refresh();
  return success;
}

export async function renameCategory(
  id: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = nameSchema.safeParse({ name: formData.get("name") ?? "" });
  if (!parsed.success) return validationError(parsed.error, formData);

  const existing = await findCategoryByName(db, parsed.data.name);
  if (existing && existing.id !== id) return duplicateError(parsed.data.name, formData);

  const result = await db.category.updateMany({ where: { id }, data: { name: parsed.data.name } });
  if (result.count === 0) return failure("This category no longer exists.", formData);
  refresh();
  return success;
}

// A category that still has expenses is only deleted after those expenses move to another
// category, so no expense is ever lost or left without a category.
export async function deleteCategory(
  id: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const replacementId = String(formData.get("replacementId") ?? "");

  return db.$transaction(async (tx) => {
    const category = await tx.category.findUnique({
      where: { id },
      include: { _count: { select: { expenses: true } } },
    });
    if (!category) return failure("This category no longer exists.");

    if (category._count.expenses > 0) {
      if (!replacementId || replacementId === id) {
        return failure("Choose a category to move the existing expenses to.");
      }
      const replacement = await tx.category.findUnique({ where: { id: replacementId } });
      if (!replacement) return failure("The category you chose no longer exists.");
      await tx.expense.updateMany({ where: { categoryId: id }, data: { categoryId: replacementId } });
    }

    await tx.category.delete({ where: { id } });
    refresh();
    return success;
  });
}
