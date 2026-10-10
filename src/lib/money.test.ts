import { describe, expect, it } from "vitest";
import { formatINR, paiseToInputValue, parseRupeesToPaise, sumPaise } from "./money";

describe("parseRupeesToPaise", () => {
  it("parses whole rupees and decimals", () => {
    expect(parseRupeesToPaise("25000")).toBe(2_500_000);
    expect(parseRupeesToPaise("15.5")).toBe(1550);
    expect(parseRupeesToPaise("0.07")).toBe(7);
    expect(parseRupeesToPaise("₹1,25,000.50")).toBe(12_500_050);
  });

  it("rejects invalid input", () => {
    for (const bad of ["", "abc", "-5", "1.234", "1e5", "12.", ".5", "1 000"]) {
      expect(parseRupeesToPaise(bad)).toBeNull();
    }
  });

  it("avoids floating point drift", () => {
    const sum = sumPaise([parseRupeesToPaise("0.1")!, parseRupeesToPaise("0.2")!]);
    expect(sum).toBe(30);
  });
});

describe("formatting", () => {
  it("formats Indian currency", () => {
    expect(formatINR(2_500_000)).toBe("₹25,000.00");
    expect(formatINR(12_500_050)).toBe("₹1,25,000.50");
  });

  it("keeps the sign of negative balances", () => {
    expect(formatINR(-500_000)).toMatch(/^-/);
    expect(formatINR(-500_000)).toContain("5,000.00");
  });

  it("round-trips to input values", () => {
    expect(paiseToInputValue(2_500_000)).toBe("25000");
    expect(paiseToInputValue(1550)).toBe("15.50");
    expect(paiseToInputValue(7)).toBe("0.07");
  });
});
