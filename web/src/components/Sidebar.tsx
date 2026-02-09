"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { LayoutDashboard, Search, FileText, BarChart3, MessageSquare, User, Settings, Menu, X, Zap } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";

const links = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/jobs", label: "Vibe Scan", icon: Search },
  { href: "/proposals", label: "Proposals", icon: FileText },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/auto-reply", label: "Auto-Reply", icon: MessageSquare },
  { href: "/profile", label: "Profile", icon: User },
  { href: "/settings", label: "Settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      <button onClick={() => setOpen(true)} className="lg:hidden fixed top-4 left-4 z-50 p-2 border-2 border-black dark:border-green-500/50 bg-white dark:bg-[#111]" style={{ boxShadow: "3px 3px 0px black" }}>
        <Menu size={20} />
      </button>

      {open && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setOpen(false)} />}

      <aside className={`fixed top-0 left-0 h-full w-64 bg-white dark:bg-[#0a0a0a] border-r-2 border-black dark:border-green-500/40 z-50 flex flex-col transition-transform duration-300 ${open ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}>
        <div className="p-6 flex items-center justify-between border-b-2 border-black dark:border-green-500/40">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-green-500 border-2 border-black flex items-center justify-center" style={{ boxShadow: "2px 2px 0px black" }}>
              <Zap size={18} className="text-black" />
            </div>
            <span className="text-lg font-bold">Upwork Hunter</span>
          </Link>
          <button onClick={() => setOpen(false)} className="lg:hidden"><X size={20} /></button>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {links.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link key={href} href={href} onClick={() => setOpen(false)}
                className={`flex items-center gap-3 px-4 py-2.5 text-sm font-bold transition-all duration-200 border-2 ${
                  active
                    ? "bg-green-500 text-black border-black dark:border-black"
                    : "border-transparent hover:border-black dark:hover:border-green-500/40 hover:bg-gray-50 dark:hover:bg-white/5"
                }`}
                style={active ? { boxShadow: "3px 3px 0px black" } : {}}>
                <Icon size={18} />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="px-4 pb-4 flex items-center justify-between">
          <ThemeToggle />
          <div className="px-3 py-2 border-2 border-black dark:border-green-500/40 bg-green-100 dark:bg-green-500/10 text-xs font-bold" style={{ boxShadow: "2px 2px 0px black" }}>
            <span className="text-green-700 dark:text-green-400">PRO TIP:</span>
            <span className="text-black dark:text-gray-300 ml-1">Try Vibe Scan</span>
          </div>
        </div>
      </aside>
    </>
  );
}
