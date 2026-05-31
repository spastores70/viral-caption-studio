"use client";

import { useState } from "react";
import { Sidebar } from "./sidebar";
import { MobileNav } from "./mobile-nav";
import { MobileHeader } from "./mobile-header";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Desktop sidebar */}
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Mobile top header */}
      <MobileHeader onMenuClick={() => setSidebarOpen(true)} />

      {/* Main content */}
      <main className="lg:ml-64">
        {/* Top padding for mobile header, bottom padding for bottom nav */}
        <div className="min-h-screen pt-14 pb-20 lg:pt-0 lg:pb-0 px-4 py-4 lg:p-8">
          {children}
        </div>
      </main>

      {/* Mobile bottom navigation */}
      <MobileNav onMoreClick={() => setSidebarOpen(true)} />
    </div>
  );
}
