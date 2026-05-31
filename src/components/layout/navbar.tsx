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
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-600 to-purple-600">
              <Zap className="h-4 w-4 text-white" />
            </div>
            <span className="text-base font-bold text-white">
              Viral Caption <span className="text-violet-400">Studio</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6">
            <Link href="#features" className="text-sm text-white/60 hover:text-white transition-colors">
              Features
            </Link>
            <Link href="#pricing" className="text-sm text-white/60 hover:text-white transition-colors">
              Pricing
            </Link>
            <Link href="#faq" className="text-sm text-white/60 hover:text-white transition-colors">
              FAQ
            </Link>
          </div>

          {/* CTA */}
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

          {/* Mobile toggle */}
          <button
            className="md:hidden text-white/70 hover:text-white"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-white/10 bg-gray-950 px-4 py-4 space-y-3">
          <Link href="#features" className="block text-sm text-white/70 hover:text-white py-2">Features</Link>
          <Link href="#pricing" className="block text-sm text-white/70 hover:text-white py-2">Pricing</Link>
          <Link href="#faq" className="block text-sm text-white/70 hover:text-white py-2">FAQ</Link>
          <div className="flex flex-col gap-2 pt-2 border-t border-white/10">
            {session ? (
              <Link href="/dashboard"><Button className="w-full" size="sm">Dashboard</Button></Link>
            ) : (
              <>
                <Link href="/login"><Button variant="outline" className="w-full" size="sm">Sign In</Button></Link>
                <Link href="/register"><Button className="w-full" size="sm">Get Started Free</Button></Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
