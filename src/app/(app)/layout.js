"use client";
import { useState } from "react";
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";

export default function DashboardLayout({ children, title }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex bg-gray-100 min-h-screen relative">
      {/* Sidebar */}
      <div
        className={`
          fixed inset-y-0 left-0 z-40 transform
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
          transition-transform duration-300
          lg:translate-x-0 lg:static lg:flex
        `}
      >
        <Sidebar />
      </div>

      {/* Overlay (mobile only) */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-30 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Content */}
      <div className="flex-1 flex flex-col">
        <Header title={title} onMenuClick={() => setIsSidebarOpen(true)} />
        <main className="p-4 sm:p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
