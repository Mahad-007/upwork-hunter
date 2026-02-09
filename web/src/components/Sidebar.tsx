"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { LayoutDashboard, Search, FileText, BarChart3, MessageSquare, User, Settings, Menu, X, Zap } from "lucide-react";

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
      <button onClick={() => setOpen(true)} className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-xl bg-white/[0.06] border border-white/[0.08] text-gray-300">
        <Menu size={20} />
      </button>

      {open && <div className="fixed inset-0 bg-black/60 z-40 lg:hidden" onClick={() => setOpen(false)} />}

      <aside className={`fixed top-0 left-0 h-full w-64 bg-[#0a0a0a] border-r border-white/[0.06] z-50 flex flex-col transition-transform duration-300 ${open ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}>
        <div className="p-6 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <Zap size={18} className="text-white" />
            </div>
            <span className="text-lg font-bold">Upwork Hunter</span>
          </Link>
          <button onClick={() => setOpen(false)} className="lg:hidden text-gray-400"><X size={20} /></button>
        </div>

        <nav className="flex-1 px-3 space-y-1">
          {links.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link key={href} href={href} onClick={() => setOpen(false)}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  active ? "bg-gradient-to-r from-blue-600/20 to-purple-600/20 text-white border border-blue-500/20" : "text-gray-400 hover:text-white hover:bg-white/[0.04]"
                }`}>
                <Icon size={18} />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 mx-3 mb-4 rounded-xl bg-gradient-to-br from-blue-600/10 to-purple-600/10 border border-blue-500/10">
          <p className="text-xs font-semibold text-blue-400 mb-1">Pro Tip</p>
          <p className="text-xs text-gray-400">Use Vibe Scan to describe your ideal job in plain English.</p>
        </div>
      </aside>
    </>
  );
}
