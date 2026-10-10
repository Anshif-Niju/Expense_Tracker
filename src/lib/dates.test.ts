import { describe, expect, it } from "vitest";
import {
  dayRange,
  formatDateLabel,
  isMonthKey,
  monthRange,
  parseDateKey,
  shiftMonth,
  toDateKey,
  todayKey,
} from "./dates";

describe("dates", () => {
  it("parses only real calendar dates", () => {
    expect(toDateKey(parseDateKey("2026-10-01")!)).toBe("2026-10-01");
    expect(parseDateKey("2026-02-30")).toBeNull();
    expect(parseDateKey("2026-13-01")).toBeNull();
    expect(parseDateKey("10/01/2026")).toBeNull();
  });

  it("computes today in the app time zone", () => {
    // 20:00 UTC on 31 Oct is already 1 Nov in India.
    expect(todayKey(new Date("2026-10-31T20:00:00Z"))).toBe("2026-11-01");
    expect(todayKey(new Date("2026-10-31T10:00:00Z"))).toBe("2026-10-31");
  });

  it("builds half-open month ranges that never overlap", () => {
    const oct = monthRange("2026-10");
    const nov = monthRange("2026-11");
    expect(oct.end.getTime()).toBe(nov.start.getTime());
    expect(toDateKey(oct.start)).toBe("2026-10-01");
    expect(monthRange("2026-12").end.toISOString()).toBe("2027-01-01T00:00:00.000Z");
  });

  it("builds day ranges", () => {
    const { start, end } = dayRange("2026-10-31");
    expect(end.getTime() - start.getTime()).toBe(86_400_000);
  });

  it("shifts months across year boundaries", () => {
    expect(shiftMonth("2026-01", -1)).toBe("2025-12");
    expect(shiftMonth("2026-12", 1)).toBe("2027-01");
  });

  it("validates month keys", () => {
    expect(isMonthKey("2026-10")).toBe(true);
    expect(isMonthKey("2026-00")).toBe(false);
    expect(isMonthKey("2026-1")).toBe(false);
  });

  it("labels today and yesterday", () => {
    expect(formatDateLabel("2026-10-10", "2026-10-10")).toBe("Today");
    expect(formatDateLabel("2026-10-09", "2026-10-10")).toBe("Yesterday");
    expect(formatDateLabel("2026-09-01", "2026-10-10")).toMatch(/^1 Sep\w* 2026$/);
  });
});
