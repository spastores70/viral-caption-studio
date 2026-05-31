"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import {
  LayoutDashboard,
  Wand2,
  Bookmark,
  FileText,
  CreditCard,
  Settings,
  Shield,
  LogOut,
  Zap,
  X,
  ImageIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/generator", label: "Caption Generator", icon: Wand2 },
  { href: "/images", label: "Image Generator", icon: ImageIcon, badge: "New" },
  { href: "/saved", label: "Saved Content", icon: Bookmark },
  { href: "/templates", label: "Templates", icon: FileText },
  { href: "/billing", label: "Billing", icon: CreditCard },
  { href: "/settings", label: "Settings", icon: Settings },
];

interface SidebarProps {
  open?: boolean;
  onClose?: () => void;
}

export function Sidebar({ open = false, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();

  const isAdmin = session?.user?.role === "ADMIN";
  const isPro =
    session?.user?.role === "PRO" || session?.user?.role === "ADMIN";

  const handleNavClick = () => {
    onClose?.();
  };

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo + close button */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-600 to-purple-600 shrink-0">
            <Zap className="h-4 w-4 text-white" />
          </div>
          <div>
            <span className="text-sm font-bold text-white">Viral Caption</span>
            <span className="block text-xs text-violet-400">Studio</span>
          </div>
        </div>
        {/* Close button — only shown on mobile */}
        <button
          onClick={onClose}
          className="lg:hidden flex h-8 w-8 items-center justify-center rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href ||
            pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={handleNavClick}
              className={cn(
                "flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all min-h-[44px]",
                isActive
                  ? "bg-violet-600/20 text-violet-300 border border-violet-500/30"
                  : "text-white/60 hover:text-white hover:bg-white/5 active:bg-white/10"
              )}
            >
              <Icon
                className={cn(
                  "h-4 w-4 shrink-0",
                  isActive ? "text-violet-400" : "text-white/40"
                )}
              />
              <span className="flex-1">{item.label}</span>
              {(item as any).badge && (
                <span className="text-[9px] font-bold bg-violet-600 text-white rounded-full px-1.5 py-0.5 leading-none">
                  {(item as any).badge}
                </span>
              )}
            </Link>
          );
        })}

        {isAdmin && (
          <Link
            href="/admin"
            onClick={handleNavClick}
            className={cn(
              "flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all min-h-[44px]",
              pathname.startsWith("/admin")
                ? "bg-amber-600/20 text-amber-300 border border-amber-500/30"
                : "text-white/60 hover:text-white hover:bg-white/5 active:bg-white/10"
            )}
          >
            <Shield
              className={cn(
                "h-4 w-4 shrink-0",
                pathname.startsWith("/admin")
                  ? "text-amber-400"
                  : "text-white/40"
              )}
            />
            Admin Panel
          </Link>
        )}
      </nav>

      {/* Upgrade CTA */}
      <div className="px-3 pb-2">
        {!isPro && (
          <Link href="/billing" onClick={handleNavClick}>
            <div className="mb-3 rounded-xl bg-gradient-to-r from-violet-600/20 to-purple-600/20 border border-violet-500/30 p-3 cursor-pointer hover:from-violet-600/30 hover:to-purple-600/30 transition-all active:scale-[0.98]">
              <div className="flex items-center gap-2 mb-1">
                <Zap className="h-3 w-3 text-violet-400" />
                <span className="text-xs font-semibold text-violet-300">
                  Upgrade to Pro
                </span>
              </div>
              <p className="text-xs text-white/50">Unlimited generations</p>
            </div>
          </Link>
        )}

        {/* User section */}
        <div className="flex items-center gap-3 px-2 py-2">
          <Avatar className="h-8 w-8 shrink-0">
            <AvatarImage src={session?.user?.image || ""} />
            <AvatarFallback className="text-xs">
              {session?.user?.name?.charAt(0)?.toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-white truncate">
              {session?.user?.name || "User"}
            </p>
            <Badge
              variant={isPro ? "pro" : "secondary"}
              className="text-[9px] px-1 py-0 h-4"
            >
              {session?.user?.role || "FREE"}
            </Badge>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0"
            onClick={() => signOut({ callbackUrl: "/" })}
          >
            <LogOut className="h-3.5 w-3.5 text-white/40" />
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar — always visible on lg+ */}
      <aside className="hidden lg:flex fixed left-0 top-0 z-40 h-screen w-64 flex-col border-r border-white/10 bg-gray-950/80 backdrop-blur-xl">
        {sidebarContent}
      </aside>

      {/* Mobile drawer overlay */}
      {open && (
        <div
          className="fixed inset-0 z-50 lg:hidden"
          onClick={onClose}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          {/* Drawer */}
          <aside
            className="absolute left-0 top-0 h-full w-72 bg-gray-950 border-r border-white/10 flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
}
