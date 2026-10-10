"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentType, SVGProps } from "react";
import { DashboardIcon, ReceiptIcon, TagIcon, WalletIcon } from "@/components/ui/icons";

const items: Array<{
  href: string;
  label: string;
  Icon: ComponentType<SVGProps<SVGSVGElement>>;
}> = [
  { href: "/", label: "Dashboard", Icon: DashboardIcon },
  { href: "/expenses", label: "Expenses", Icon: ReceiptIcon },
  { href: "/categories", label: "Categories", Icon: TagIcon },
  { href: "/salary", label: "Salary", Icon: WalletIcon },
];

function useIsActive() {
  const pathname = usePathname();
  return (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));
}

export function SidebarNav() {
  const isActive = useIsActive();
  return (
    <nav aria-label="Main" className="flex flex-col gap-1">
      {items.map(({ href, label, Icon }) => (
        <Link
          key={href}
          href={href}
          aria-current={isActive(href) ? "page" : undefined}
          className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
            isActive(href)
              ? "bg-white/12 text-white"
              : "text-white/65 hover:bg-white/8 hover:text-white"
          }`}
        >
          <Icon />
          {label}
        </Link>
      ))}
    </nav>
  );
}

export function BottomNav() {
  const isActive = useIsActive();
  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-20 grid grid-cols-4 border-t border-line bg-surface pb-[env(safe-area-inset-bottom)] lg:hidden"
    >
      {items.map(({ href, label, Icon }) => (
        <Link
          key={href}
          href={href}
          aria-current={isActive(href) ? "page" : undefined}
          className={`flex flex-col items-center gap-1 py-2.5 text-xs font-medium ${
            isActive(href) ? "text-income" : "text-muted"
          }`}
        >
          <Icon />
          {label}
        </Link>
      ))}
    </nav>
  );
}
