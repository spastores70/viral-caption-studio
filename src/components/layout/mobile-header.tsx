"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Zap, Menu } from "lucide-react";

const pageTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/generator": "AI Generator",
  "/saved": "Saved Content",
  "/templates": "Templates",
  "/billing": "Billing",
  "/settings": "Settings",
  "/admin": "Admin Panel",
};

interface MobileHeaderProps {
  onMenuClick: () => void;
}

export function MobileHeader({ onMenuClick }: MobileHeaderProps) {
  const pathname = usePathname();
  const title = pageTitles[pathname] || "Viral Caption Studio";

  return (
    <header className="fixed top-0 left-0 right-0 z-40 flex h-14 items-center justify-between px-4 bg-gray-950/95 backdrop-blur-xl border-b border-white/10 lg:hidden">
      <Link href="/dashboard" className="flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-violet-600 to-purple-600">
          <Zap className="h-3.5 w-3.5 text-white" />
        </div>
        <span className="text-sm font-bold text-white">{title}</span>
      </Link>

      <button
        onClick={onMenuClick}
        className="flex h-11 w-11 items-center justify-center rounded-xl text-white/60 hover:text-white active:bg-white/10 transition-colors -mr-2"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>
    </header>
  );
}
