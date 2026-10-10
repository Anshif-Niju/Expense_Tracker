import { describe, expect, it } from "vitest";
import { computeSummary } from "./summary";

describe("computeSummary", () => {
  it("matches the worked example: 25,000 salary, 5,000 spent", () => {
    const summary = computeSummary({
      salaries: [2_500_000],
      monthExpenses: [150_000, 350_000],
      todayExpenses: [1500, 3000],
    });
    expect(summary).toEqual({
      salary: 2_500_000,
      expenses: 500_000,
      balance: 2_000_000,
      today: 4500,
    });
  });

  it("sums several salary entries recorded in one month", () => {
    const summary = computeSummary({
      salaries: [2_000_000, 500_000],
      monthExpenses: [],
      todayExpenses: [],
    });
    expect(summary.salary).toBe(2_500_000);
    expect(summary.balance).toBe(2_500_000);
  });

  it("shows zero salary and a negative balance when nothing was added", () => {
    const summary = computeSummary({ salaries: [], monthExpenses: [10_000], todayExpenses: [] });
    expect(summary.salary).toBe(0);
    expect(summary.balance).toBe(-10_000);
  });

  it("does not let today's spending depend on the selected month", () => {
    const summary = computeSummary({ salaries: [], monthExpenses: [], todayExpenses: [2500] });
    expect(summary.today).toBe(2500);
    expect(summary.expenses).toBe(0);
  });
});
