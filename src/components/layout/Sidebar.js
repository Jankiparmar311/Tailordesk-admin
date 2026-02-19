"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  HomeIcon,
  UsersIcon,
  ClipboardDocumentListIcon,
} from "@heroicons/react/24/outline";

export default function Sidebar() {
  const pathname = usePathname();

  const menu = [
    { name: "Dashboard", path: "/dashboard", icon: HomeIcon },
    { name: "Customers", path: "/customers", icon: UsersIcon },
    { name: "Orders", path: "/orders", icon: ClipboardDocumentListIcon },
  ];

  return (
    <aside className="w-64 bg-slate-50 border-r border-gray-200 min-h-screen flex flex-col">
      {/* Logo */}
      <div className="px-6 py-5 bg-white">
        <h2 className="text-xl font-semibold text-indigo-600">TailorDesk</h2>
      </div>

      {/* Menu */}
      <nav className="flex-1 p-4 space-y-1">
        <p className="px-3 mb-2 text-xs font-semibold text-gray-400 uppercase">
          Menu
        </p>

        {menu.map((item) => {
          const active = pathname.startsWith(item.path);
          const Icon = item.icon;

          return (
            <Link
              key={item.path}
              href={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all
                ${
                  active
                    ? "bg-indigo-100 text-indigo-700"
                    : "text-gray-600 hover:bg-white hover:shadow-sm"
                }`}
            >
              <Icon
                className={`h-5 w-5 ${
                  active ? "text-indigo-600" : "text-gray-400"
                }`}
              />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t text-xs border-gray-200 text-gray-400">
        TailorDesk © {new Date().getFullYear()}
      </div>
    </aside>
  );
}
