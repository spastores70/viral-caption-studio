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
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/generator", label: "AI Generator", icon: Wand2 },
  { href: "/saved", label: "Saved Content", icon: Bookmark },
  { href: "/templates", label: "Templates", icon: FileText },
  { href: "/billing", label: "Billing", icon: CreditCard },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  const isAdmin = session?.user?.role === "ADMIN";
  const isPro = session?.user?.role === "PRO" || session?.user?.role === "ADMIN";

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-white/10 bg-gray-950/80 backdrop-blur-xl flex flex-col">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-white/10">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-600 to-purple-600">
          <Zap className="h-4 w-4 text-white" />
        </div>
        <div>
          <span className="text-sm font-bold text-white">Viral Caption</span>
          <span className="block text-xs text-violet-400">Studio</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group",
                isActive
                  ? "bg-violet-600/20 text-violet-300 border border-violet-500/30"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              )}
            >
              <Icon
                className={cn(
                  "h-4 w-4 shrink-0 transition-colors",
                  isActive ? "text-violet-400" : "text-white/40 group-hover:text-white/70"
                )}
              />
              {item.label}
              {item.href === "/generator" && (
                <ChevronRight className="ml-auto h-3 w-3 opacity-50" />
              )}
            </Link>
          );
        })}

        {isAdmin && (
          <Link
            href="/admin"
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group",
              pathname.startsWith("/admin")
                ? "bg-amber-600/20 text-amber-300 border border-amber-500/30"
                : "text-white/60 hover:text-white hover:bg-white/5"
            )}
          >
            <Shield
              className={cn(
                "h-4 w-4 shrink-0",
                pathname.startsWith("/admin") ? "text-amber-400" : "text-white/40 group-hover:text-white/70"
              )}
            />
            Admin Panel
          </Link>
        )}
      </nav>

      {/* User section */}
      <div className="border-t border-white/10 p-4">
        {!isPro && (
          <Link href="/billing">
            <div className="mb-3 rounded-lg bg-gradient-to-r from-violet-600/20 to-purple-600/20 border border-violet-500/30 p-3 cursor-pointer hover:from-violet-600/30 hover:to-purple-600/30 transition-all">
              <div className="flex items-center gap-2 mb-1">
                <Zap className="h-3 w-3 text-violet-400" />
                <span className="text-xs font-semibold text-violet-300">Upgrade to Pro</span>
              </div>
              <p className="text-xs text-white/50">Unlimited generations</p>
            </div>
          </Link>
        )}

        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={session?.user?.image || ""} />
            <AvatarFallback className="text-xs">
              {session?.user?.name?.charAt(0)?.toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">
              {session?.user?.name || "User"}
            </p>
            <div className="flex items-center gap-1">
              <Badge
                variant={isPro ? "pro" : "secondary"}
                className="text-[10px] px-1.5 py-0"
              >
                {session?.user?.role || "FREE"}
              </Badge>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 shrink-0"
            onClick={() => signOut({ callbackUrl: "/" })}
          >
            <LogOut className="h-3.5 w-3.5 text-white/40" />
          </Button>
        </div>
      </div>
    </aside>
  );
}
