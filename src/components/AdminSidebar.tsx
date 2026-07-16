"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  Settings, 
  LogOut,
  ShieldCheck,
  Menu,
  X,
  GitCommit,
  PanelTop,
  BookOpen,
  MessageSquare
} from "lucide-react";
import { cn } from "@/lib/utils";

import { logoutAction } from "@/app/(admin)/admin/login/actions";

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/admin" },
  { icon: PanelTop, label: "Site CMS", href: "/admin/site-cms", highlight: true },
  { icon: Users, label: "Members", href: "/admin/members" },
  { icon: Calendar, label: "Events", href: "/admin/events" },
  { icon: GitCommit, label: "Contributions", href: "/admin/contributions" },
  { icon: BookOpen, label: "Blogs", href: "/admin/blogs" },
  { icon: MessageSquare, label: "Feedback", href: "/admin/feedback" },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mobile Toggle */}
      <div className="lg:hidden fixed bottom-6 right-6 z-[60]">
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="w-14 h-14 rounded-2xl bg-white text-black flex items-center justify-center shadow-2xl active:scale-95 transition-all"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar Overlay */}
      {isOpen && (
        <div 
          onClick={() => setIsOpen(false)}
          className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-[50]"
        />
      )}

      <aside className={cn(
        "fixed lg:sticky top-0 left-0 z-[50] h-screen bg-[#0a0a0a] border-r border-white/10 flex flex-col transition-all duration-500 ease-in-out",
        "w-64",
        isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        <div className="p-6 flex items-center gap-3 border-b border-white/5">
          <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 text-black" />
          </div>
          <span className="font-pixel text-[10px] tracking-wider text-white">ADMIN PANEL</span>
        </div>

        <nav className="flex-1 p-4 flex flex-col gap-1">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            const isHighlight = "highlight" in item && item.highlight;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 font-mono text-xs group",
                  isActive
                    ? "bg-white text-black"
                    : isHighlight
                    ? "text-white bg-white/[0.06] border border-white/10 hover:bg-white/[0.10]"
                    : "text-white/50 hover:text-white hover:bg-white/5"
                )}
              >
                <item.icon className={cn("w-4 h-4", isActive ? "text-black" : isHighlight ? "text-white" : "text-white/40 group-hover:text-white")} />
                {item.label}
                {isHighlight && !isActive && (
                  <span className="ml-auto px-1.5 py-0.5 rounded text-[8px] bg-white/10 text-white/60 font-pixel">CMS</span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/5">
          <button 
            onClick={async () => {
              if (confirm("Logout from admin panel?")) await logoutAction();
            }}
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-red-100 hover:text-red-300 hover:bg-red-400/10 transition-all duration-200 font-mono text-xs w-full text-left bg-red-500/10 border border-red-500/20"
          >
            <LogOut className="w-4 h-4" />
            Logout Session
          </button>
        </div>
      </aside>
    </>
  );
}
