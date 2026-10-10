export type ButtonVariant = "primary" | "income" | "secondary" | "danger" | "ghost";

const base =
  "inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60";

const variants: Record<ButtonVariant, string> = {
  primary: "bg-ink text-white hover:bg-black",
  income: "bg-income text-white hover:bg-[#126239]",
  secondary: "border border-line bg-surface text-ink hover:bg-paper",
  danger: "bg-expense text-white hover:bg-[#962c23]",
  ghost: "text-muted hover:bg-paper hover:text-ink",
};

export function buttonClass(variant: ButtonVariant = "secondary", extra = ""): string {
  return `${base} ${variants[variant]} ${extra}`.trim();
}

export const inputClass =
  "block w-full rounded-lg border border-line bg-surface px-3 py-2.5 text-sm text-ink placeholder:text-muted/70 focus:border-income focus:outline-none focus:ring-2 focus:ring-income/25 aria-[invalid=true]:border-expense";

export const iconButtonClass =
  "inline-flex size-9 items-center justify-center rounded-lg text-muted transition-colors hover:bg-paper hover:text-ink";
