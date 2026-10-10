// Money is stored and calculated as integer paise to avoid floating-point errors.

export const MAX_PAISE = 1_000_000_000; // ₹1,00,00,000

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatINR(paise: number): string {
  return INR.format(paise / 100);
}

// Parses user input such as "25000", "25,000.50" or "₹15" into paise.
// Returns null when the text is not a valid amount with at most two decimals.
export function parseRupeesToPaise(input: string): number | null {
  const cleaned = input.trim().replace(/^₹\s*/, "").replace(/,/g, "");
  const match = /^(\d+)(?:\.(\d{1,2}))?$/.exec(cleaned);
  if (!match) return null;
  const rupees = Number(match[1]);
  const paise = Number((match[2] ?? "").padEnd(2, "0"));
  const total = rupees * 100 + paise;
  return Number.isSafeInteger(total) ? total : null;
}

export function paiseToInputValue(paise: number): string {
  const rupees = Math.floor(paise / 100);
  const rest = paise % 100;
  return rest === 0 ? String(rupees) : `${rupees}.${String(rest).padStart(2, "0")}`;
}

export function sumPaise(amounts: readonly number[]): number {
  return amounts.reduce((total, amount) => total + amount, 0);
}
