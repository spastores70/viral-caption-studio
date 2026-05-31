"use client";

import { Sidebar } from "./sidebar";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-gray-950">
      <Sidebar />
      <main className="flex-1 ml-64 overflow-y-auto">
        <div className="min-h-full p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
