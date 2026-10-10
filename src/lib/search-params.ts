import { currentMonthKey, isMonthKey } from "./dates";

export type RawSearchParams = Record<string, string | string[] | undefined>;

export function firstParam(value: string | string[] | undefined): string {
  return (Array.isArray(value) ? value[0] : value) ?? "";
}

export function monthFromParams(params: RawSearchParams): string {
  const month = firstParam(params.month);
  return isMonthKey(month) ? month : currentMonthKey();
}
