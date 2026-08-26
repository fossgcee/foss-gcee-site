"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Calendar,
  LogOut,
  ShieldCheck,
  Menu,
  X,
  GitCommit,
  PanelTop,
  BookOpen,
  MessageSquare,
  ChevronRight,
  Megaphone,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { logoutAction } from "@/app/(admin)/admin/login/actions";

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/admin" },
  { icon: PanelTop, label: "Site CMS", href: "/admin/site-cms", highlight: true },
  { icon: Users, label: "Members", href: "/admin/members" },
  { icon: Calendar, label: "Events", href: "/admin/events" },
  { icon: Megaphone, label: "Campaigns", href: "/admin/campaigns" },
  { icon: GitCommit, label: "Contributions", href: "/admin/contributions" },
  { icon: BookOpen, label: "Blogs", href: "/admin/blogs" },
  { icon: MessageSquare, label: "Feedback", href: "/admin/feedback" },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  // Close drawer on route change
  useEffect(() => {
    const t = setTimeout(() => setIsOpen(false), 0);
    return () => clearTimeout(t);
  }, [pathname]);

  // Prevent body scroll when drawer open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  const currentPage = menuItems.find((m) => m.href === pathname || (m.href !== "/admin" && pathname.startsWith(m.href)))?.label ?? "Admin";

  return (
    <>
      {/* ── Mobile Top Bar ──────────────────────────────────── */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-[60] h-14 flex items-center justify-between px-4 bg-[#0a0a0a]/95 backdrop-blur-md border-b border-white/8">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-white flex items-center justify-center shrink-0">
            <ShieldCheck className="w-4 h-4 text-black" />
          </div>
          <span className="font-pixel text-[10px] tracking-wider text-white whitespace-nowrap">
            {currentPage.toUpperCase()}
          </span>
        </div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white active:scale-95 transition-all"
          aria-label="Toggle menu"
        >
          {isOpen ? <X className="w-4.5 h-4.5" /> : <Menu className="w-4.5 h-4.5" />}
        </button>
      </div>

      {/* ── Mobile Drawer Backdrop ───────────────────────────── */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="lg:hidden fixed inset-0 bg-black/70 backdrop-blur-sm z-[55]"
        />
      )}

      {/* ── Mobile Drawer (slides in from left) ─────────────── */}
      <div className={cn(
        "lg:hidden fixed top-14 left-0 bottom-0 z-[56] w-72 bg-[#0a0a0a] border-r border-white/10 flex flex-col transition-transform duration-300 ease-in-out",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Nav */}
        <nav className="flex-1 p-3 flex flex-col gap-1 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            const isHighlight = "highlight" in item && item.highlight;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-mono text-sm group",
                  isActive
                    ? "bg-white text-black"
                    : isHighlight
                    ? "text-white bg-white/[0.06] border border-white/10 hover:bg-white/[0.10]"
                    : "text-white/60 hover:text-white hover:bg-white/5"
                )}
              >
                <item.icon className={cn("w-4.5 h-4.5 shrink-0", isActive ? "text-black" : isHighlight ? "text-white" : "text-white/40 group-hover:text-white")} />
                <span className="flex-1">{item.label}</span>
                {isActive && <ChevronRight className="w-3.5 h-3.5 opacity-50" />}
                {isHighlight && !isActive && (
                  <span className="px-1.5 py-0.5 rounded text-[8px] bg-white/10 text-white/60 font-pixel">CMS</span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-3 border-t border-white/5">
          <button
            onClick={async () => {
              if (confirm("Logout from admin panel?")) await logoutAction();
            }}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-red-400/70 hover:text-red-400 hover:bg-red-400/10 transition-all font-mono text-sm w-full text-left bg-red-500/5 border border-red-500/10"
          >
            <LogOut className="w-4.5 h-4.5" />
            Logout Session
          </button>
        </div>
      </div>

      {/* ── Desktop Sidebar ─────────────────────────────────── */}
      <aside className="hidden lg:flex flex-col w-64 shrink-0 min-h-screen sticky top-0 bg-[#0a0a0a] border-r border-white/10">
        {/* Logo */}
        <div className="p-6 flex items-center gap-3 border-b border-white/5">
          <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 text-black" />
          </div>
          <span className="font-pixel text-[10px] tracking-wider text-white">ADMIN PANEL</span>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 flex flex-col gap-1">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            const isHighlight = "highlight" in item && item.highlight;
            return (
              <Link
                key={item.href}
                href={item.href}
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

        {/* Logout */}
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
