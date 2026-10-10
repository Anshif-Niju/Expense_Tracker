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
import { amountField, dateField, optionalText } from "@/lib/validation";

// A repeated submit (double click, retry) of the same salary inside this window is ignored.
const DUPLICATE_WINDOW_MS = 15_000;

const salarySchema = z.object({
  amount: amountField,
  date: dateField,
  note: optionalText(200),
});

function readForm(formData: FormData) {
  return salarySchema.safeParse({
    amount: formData.get("amount") ?? "",
    date: formData.get("date") ?? "",
    note: formData.get("note") ?? "",
  });
}

function refresh() {
  revalidatePath("/", "layout");
}

export async function createSalary(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = readForm(formData);
  if (!parsed.success) return validationError(parsed.error, formData);
  const { amount, date, note } = parsed.data;

  const duplicate = await db.salary.findFirst({
    where: {
      amount,
      date,
      note,
      createdAt: { gte: new Date(Date.now() - DUPLICATE_WINDOW_MS) },
    },
  });
  if (!duplicate) await db.salary.create({ data: { amount, date, note } });

  refresh();
  return success;
}

export async function updateSalary(
  id: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = readForm(formData);
  if (!parsed.success) return validationError(parsed.error, formData);

  const result = await db.salary.updateMany({ where: { id }, data: parsed.data });
  if (result.count === 0) return failure("This salary record no longer exists.", formData);

  refresh();
  return success;
}

export async function deleteSalary(id: string): Promise<ActionState> {
  await db.salary.deleteMany({ where: { id } });
  refresh();
  return success;
}
