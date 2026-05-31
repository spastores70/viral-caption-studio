"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Wand2, Bookmark, FileText, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Home", icon: LayoutDashboard },
  { href: "/generator", label: "Generate", icon: Wand2 },
  { href: "/saved", label: "Saved", icon: Bookmark },
  { href: "/templates", label: "Templates", icon: FileText },
];

interface MobileNavProps {
  onMoreClick: () => void;
}

export function MobileNav({ onMoreClick }: MobileNavProps) {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-gray-950/95 backdrop-blur-xl border-t border-white/10 lg:hidden">
      <div className="flex items-center justify-around h-16 px-2 safe-area-inset-bottom">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 min-w-[44px] min-h-[44px] px-3 py-1 rounded-xl transition-all",
                isActive
                  ? "text-violet-400"
                  : "text-white/40 active:text-white/70"
              )}
            >
              <div
                className={cn(
                  "flex h-7 w-7 items-center justify-center rounded-lg transition-all",
                  isActive && "bg-violet-600/20"
                )}
              >
                <Icon className="h-5 w-5" />
              </div>
              <span className="text-[10px] font-medium leading-none">{item.label}</span>
            </Link>
          );
        })}

        <button
          onClick={onMoreClick}
          className="flex flex-col items-center justify-center gap-0.5 min-w-[44px] min-h-[44px] px-3 py-1 rounded-xl text-white/40 active:text-white/70 transition-all"
        >
          <div className="flex h-7 w-7 items-center justify-center rounded-lg">
            <MoreHorizontal className="h-5 w-5" />
          </div>
          <span className="text-[10px] font-medium leading-none">More</span>
        </button>
      </div>
    </nav>
  );
}
