"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  Settings, 
  LogOut,
  ShieldCheck
} from "lucide-react";
import { cn } from "@/lib/utils";

import { logoutAction } from "@/app/(admin)/admin/login/actions";

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/admin" },
  { icon: Users, label: "Members", href: "/admin/members" },
  { icon: Calendar, label: "Events", href: "/admin/events" },
  { icon: Settings, label: "Settings", href: "/admin/settings" },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r border-white/10 bg-[#0a0a0a] flex flex-col h-screen sticky top-0">
      <div className="p-6 flex items-center gap-3 border-b border-white/5">
        <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center">
          <ShieldCheck className="w-5 h-5 text-black" />
        </div>
        <span className="font-pixel text-[10px] tracking-wider text-white">ADMIN PANEL</span>
      </div>

      <nav className="flex-1 p-4 flex flex-col gap-2">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 font-mono text-xs group",
                isActive 
                  ? "bg-white text-black" 
                  : "text-white/50 hover:text-white hover:bg-white/5"
              )}
            >
              <item.icon className={cn("w-4 h-4", isActive ? "text-black" : "text-white/40 group-hover:text-white")} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/5">
        <button 
          onClick={async () => await logoutAction()}
          className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-400/10 transition-all duration-200 font-mono text-xs w-full text-left"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>
    </aside>
  );
}
