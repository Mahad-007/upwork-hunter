"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Search,
  FileText,
  User,
  Settings,
  Briefcase,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/jobs", label: "Jobs", icon: Search },
  { href: "/proposals", label: "Proposals", icon: FileText },
  { href: "/profile", label: "Profile", icon: User },
  { href: "/settings", label: "Settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setOpen(!open)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-gray-900 rounded-lg border border-gray-800"
      >
        {open ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Overlay */}
      {open && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 h-full w-64 bg-gray-900 border-r border-gray-800 z-40 flex flex-col transition-transform lg:translate-x-0",
          !open && "-translate-x-full"
        )}
      >
        <div className="p-6 border-b border-gray-800">
          <Link href="/dashboard" className="flex items-center gap-2">
            <Briefcase className="text-brand-500" size={24} />
            <span className="text-lg font-bold">Upwork Hunter</span>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {nav.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  active
                    ? "bg-brand-600/20 text-brand-400"
                    : "text-gray-400 hover:bg-gray-800 hover:text-gray-200"
                )}
              >
                <item.icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-800 text-xs text-gray-500">
          AI-Powered Job Hunting
        </div>
      </aside>
    </>
  );
}
