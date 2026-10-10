import type { Metadata } from "next";
import { Schibsted_Grotesk } from "next/font/google";
import { BottomNav, SidebarNav } from "@/components/layout/nav";
import { todayKey } from "@/lib/dates";
import { AddExpenseButton } from "@/features/expenses/components/add-expense-button";
import { AddSalaryButton } from "@/features/salary/components/add-salary-button";
import { listCategories } from "@/features/categories/queries";
import "./globals.css";

const grotesk = Schibsted_Grotesk({ subsets: ["latin"], variable: "--font-grotesk" });

export const metadata: Metadata = {
  title: "Expense Tracker",
  description: "Track your monthly salary, daily expenses and remaining balance.",
};

export const dynamic = "force-dynamic";

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [categories, today] = [await listCategories(), todayKey()];

  return (
    <html lang="en" className={grotesk.variable}>
      <body className="min-h-dvh">
        <aside className="fixed inset-y-0 left-0 hidden w-60 flex-col bg-sidebar px-4 py-6 lg:flex">
          <p className="px-3 pb-8 text-lg font-semibold tracking-tight text-white">Expense Tracker</p>
          <SidebarNav />
        </aside>

        <div className="lg:pl-60">
          <header className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-line bg-paper/90 px-4 py-3 backdrop-blur sm:px-8">
            <p className="hidden text-base font-semibold tracking-tight sm:block lg:invisible">
              Expense Tracker
            </p>
            <div className="ml-auto flex items-center gap-2">
              <AddSalaryButton defaultDate={today} />
              <AddExpenseButton categories={categories} today={today} />
            </div>
          </header>
          <main className="mx-auto max-w-5xl px-4 pb-28 pt-6 sm:px-8 lg:pb-12">{children}</main>
        </div>

        <BottomNav />
      </body>
    </html>
  );
}
