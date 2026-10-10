import { describe, expect, it } from "vitest";
import { filterRange, parseExpenseFilters } from "./filters";

describe("parseExpenseFilters", () => {
  it("defaults to today", () => {
    expect(parseExpenseFilters({}, "2026-10-10")).toEqual({
      mode: "day",
      date: "2026-10-10",
      categoryId: null,
    });
  });

  it("selects a specific day or month with a category", () => {
    expect(parseExpenseFilters({ date: "2026-09-03", category: "abc" }, "2026-10-10")).toEqual({
      mode: "day",
      date: "2026-09-03",
      categoryId: "abc",
    });
    expect(parseExpenseFilters({ month: "2026-09" }, "2026-10-10")).toEqual({
      mode: "month",
      month: "2026-09",
      categoryId: null,
    });
  });

  it("ignores invalid values", () => {
    expect(parseExpenseFilters({ date: "nope", month: "2026-99" }, "2026-10-10").mode).toBe("day");
  });

  it("maps filters to non-overlapping ranges", () => {
    const day = filterRange({ mode: "day", date: "2026-10-31", categoryId: null });
    const month = filterRange({ mode: "month", month: "2026-10", categoryId: null });
    expect(day.end.getTime()).toBe(month.end.getTime());
  });
});
