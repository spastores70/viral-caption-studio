"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { Zap, Menu, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const { data: session } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-gray-950/80 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 sm:h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-600 to-purple-600">
              <Zap className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white" />
            </div>
            <span className="text-sm sm:text-base font-bold text-white">
              Viral Caption <span className="text-violet-400">Studio</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6">
            <Link href="#features" className="text-sm text-white/60 hover:text-white transition-colors">Features</Link>
            <Link href="#pricing" className="text-sm text-white/60 hover:text-white transition-colors">Pricing</Link>
            <Link href="#faq" className="text-sm text-white/60 hover:text-white transition-colors">FAQ</Link>
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3">
            {session ? (
              <Link href="/dashboard">
                <Button size="sm">Go to Dashboard</Button>
              </Link>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm">Sign In</Button>
                </Link>
                <Link href="/register">
                  <Button size="sm">Get Started Free</Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile: CTA + hamburger */}
          <div className="flex md:hidden items-center gap-2">
            {session ? (
              <Link href="/dashboard">
                <Button size="sm" className="h-9 text-xs px-3">Dashboard</Button>
              </Link>
            ) : (
              <Link href="/register">
                <Button size="sm" className="h-9 text-xs px-3">Get Started</Button>
              </Link>
            )}
            <button
              className="flex h-10 w-10 items-center justify-center rounded-xl text-white/70 hover:text-white active:bg-white/10 transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-white/10 bg-gray-950 px-4 py-4 space-y-1">
          {[
            { href: "#features", label: "Features" },
            { href: "#pricing", label: "Pricing" },
            { href: "#faq", label: "FAQ" },
          ].map((item) => (
            <a
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className="flex items-center h-11 px-3 text-sm text-white/70 hover:text-white rounded-xl hover:bg-white/5 transition-colors"
            >
              {item.label}
            </a>
          ))}
          {!session && (
            <div className="pt-3 border-t border-white/10 flex flex-col gap-2">
              <Link href="/login" onClick={() => setMobileOpen(false)}>
                <Button variant="outline" className="w-full h-11">Sign In</Button>
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
