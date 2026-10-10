// Dates are calendar dates ("YYYY-MM-DD" keys). In the database they are stored as UTC midnight,
// so a record always belongs to the calendar day and month the user picked.

export const APP_TIME_ZONE = "Asia/Kolkata";

const DATE_KEY = /^(\d{4})-(\d{2})-(\d{2})$/;
const MONTH_KEY = /^(\d{4})-(\d{2})$/;
const DAY_MS = 24 * 60 * 60 * 1000;

const todayFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: APP_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

export function todayKey(now: Date = new Date()): string {
  const parts = Object.fromEntries(
    todayFormatter.formatToParts(now).map((part) => [part.type, part.value]),
  );
  return `${parts.year}-${parts.month}-${parts.day}`;
}

export function currentMonthKey(now: Date = new Date()): string {
  return todayKey(now).slice(0, 7);
}

export function parseDateKey(key: string): Date | null {
  const match = DATE_KEY.exec(key);
  if (!match) return null;
  const [year, month, day] = [Number(match[1]), Number(match[2]), Number(match[3])];
  const date = new Date(Date.UTC(year, month - 1, day));
  const valid =
    date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
  return valid ? date : null;
}

export function toDateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function isMonthKey(key: string): boolean {
  const match = MONTH_KEY.exec(key);
  if (!match) return false;
  const month = Number(match[2]);
  return month >= 1 && month <= 12;
}

export function monthKeyOf(dateKey: string): string {
  return dateKey.slice(0, 7);
}

// Half-open range [start, end) covering one calendar month.
export function monthRange(monthKey: string): { start: Date; end: Date } {
  const [year, month] = monthKey.split("-").map(Number) as [number, number];
  return {
    start: new Date(Date.UTC(year, month - 1, 1)),
    end: new Date(Date.UTC(year, month, 1)),
  };
}

export function dayRange(dateKey: string): { start: Date; end: Date } {
  const start = parseDateKey(dateKey) ?? new Date(0);
  return { start, end: new Date(start.getTime() + DAY_MS) };
}

export function shiftMonth(monthKey: string, delta: number): string {
  const [year, month] = monthKey.split("-").map(Number) as [number, number];
  const shifted = new Date(Date.UTC(year, month - 1 + delta, 1));
  return `${shifted.getUTCFullYear()}-${String(shifted.getUTCMonth() + 1).padStart(2, "0")}`;
}

export function formatMonthLabel(monthKey: string): string {
  const { start } = monthRange(monthKey);
  return start.toLocaleDateString("en-IN", { month: "long", year: "numeric", timeZone: "UTC" });
}

export function formatDateLabel(dateKey: string, today: string = todayKey()): string {
  if (dateKey === today) return "Today";
  const todayDate = parseDateKey(today);
  if (todayDate && dateKey === toDateKey(new Date(todayDate.getTime() - DAY_MS))) {
    return "Yesterday";
  }
  const date = parseDateKey(dateKey);
  if (!date) return dateKey;
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}
