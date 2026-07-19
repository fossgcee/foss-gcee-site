"use client";

import { useEffect, useState } from "react";
import {
  Users,
  CheckCircle2,
  XCircle,
  Terminal,
  ShieldCheck,
  ArrowRight,
  Calendar,
  GitCommit,
  PanelTop,
  TrendingUp,
  BookOpen,
  Megaphone,
} from "lucide-react";
import Link from "next/link";

interface Stats {
  total: number;
  verified: number;
  pending: number;
}

interface SiteStats {
  eventsCount: number;
  contributionsCount: number;
  boardMembersCount: number;
  galleryCount: number;
  blogsCount: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({ total: 0, verified: 0, pending: 0 });
  const [siteStats, setSiteStats] = useState<SiteStats>({
    eventsCount: 0,
    contributionsCount: 0,
    boardMembersCount: 0,
    galleryCount: 0,
    blogsCount: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/members").then(r => r.json()),
      fetch("/api/admin/events").then(r => r.json()).catch(() => ({ success: false, data: [] })),
      fetch("/api/admin/contributions").then(r => r.json()).catch(() => ({ success: false, data: [] })),
      fetch("/api/admin/site-config?section=boardmembers").then(r => r.json()).catch(() => ({ success: false, data: { members: [] } })),
      fetch("/api/admin/site-config?section=gallery").then(r => r.json()).catch(() => ({ success: false, data: { images: [] } })),
      fetch("/api/admin/blogs").then(r => r.json()).catch(() => ({ success: false, data: [] })),
    ]).then(([membersData, eventsData, contribData, boardData, galleryData, blogsData]) => {
      if (membersData.success) {
        const verified = membersData.data.filter((m: { otpVerified: boolean }) => m.otpVerified).length;
        setStats({ total: membersData.count, verified, pending: membersData.count - verified });
      }
      setSiteStats({
        eventsCount: eventsData.success ? eventsData.data.length : 0,
        contributionsCount: contribData.success ? contribData.count : 0,
        boardMembersCount: boardData.success ? (boardData.data?.members?.length || 0) : 0,
        galleryCount: galleryData.success ? (galleryData.data?.images?.length || 0) : 0,
        blogsCount: blogsData.success ? blogsData.data.length : 0,
      });
    }).finally(() => setLoading(false));
  }, []);

  const memberStatCards = [
    { label: "Total Registrations", value: stats.total, icon: Users, color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20" },
    { label: "Verified Members", value: stats.verified, icon: CheckCircle2, color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" },
    { label: "Pending Verification", value: stats.pending, icon: XCircle, color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20" },
  ];

  const cmsStatCards = [
    { label: "Events", value: siteStats.eventsCount, icon: Calendar, color: "text-violet-400", bg: "bg-violet-500/10 border-violet-500/20", href: "/admin/events" },
    { label: "Contributions", value: siteStats.contributionsCount, icon: GitCommit, color: "text-cyan-400", bg: "bg-cyan-500/10 border-cyan-500/20", href: "/admin/contributions" },
    { label: "Blogs", value: siteStats.blogsCount, icon: BookOpen, color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20", href: "/admin/blogs" },
    { label: "Board Members", value: siteStats.boardMembersCount, icon: TrendingUp, color: "text-rose-400", bg: "bg-rose-500/10 border-rose-500/20", href: "/admin/site-cms" },
  ];

  const quickLinks = [
    { href: "/admin/campaigns", label: "CAMPAIGNS_&_MAILING", desc: "Send mass emails & Telegram announcements", icon: Megaphone },
    { href: "/admin/members", label: "VIEW_ALL_MEMBERS", desc: "Search, filter and manage registrations", icon: Users },
    { href: "/admin/site-cms", label: "SITE_CMS", desc: "Edit hero, about, members, gallery, footer", icon: PanelTop },
    { href: "/admin/events", label: "EVENTS_MANAGER", desc: "Create and edit events", icon: Calendar },
    { href: "/admin/blogs", label: "BLOGS_MANAGER", desc: "Write and publish blogs", icon: BookOpen },
  ];

  return (
    <div className="space-y-8 py-10">
      <div className="flex flex-col gap-1">
        <h1 className="font-pixel text-white whitespace-nowrap text-[clamp(1.1rem,4vw,1.875rem)]">DASHBOARD_OVERVIEW</h1>
        <p className="font-mono text-xs text-white/40">FOSS Club GCE Erode — Administration Console</p>
      </div>

      {/* Member Stats Grid */}
      <div>
        <p className="font-mono text-[10px] uppercase tracking-widest text-white/25 mb-3">Member Registrations</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {memberStatCards.map((stat) => (
            <div
              key={stat.label}
              className="p-6 rounded-2xl border border-white/5 bg-white/[0.02] space-y-4 hover:border-white/10 transition-colors"
            >
              <div className="flex justify-between items-start">
                <div className={`p-3 rounded-xl border ${stat.bg} ${stat.color}`}>
                  <stat.icon className="w-5 h-5" />
                </div>
                <span className={`text-3xl font-pixel ${loading ? "animate-pulse text-white/20" : "text-white"}`}>
                  {loading ? "—" : stat.value}
                </span>
              </div>
              <p className="font-mono text-xs text-white/50">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CMS Stats Grid */}
      <div>
        <p className="font-mono text-[10px] uppercase tracking-widest text-white/25 mb-3">Site Content</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {cmsStatCards.map((stat) => (
            <Link
              key={stat.label}
              href={stat.href}
              className="p-5 rounded-2xl border border-white/5 bg-white/[0.02] space-y-3 hover:border-white/10 hover:bg-white/[0.04] transition-all group"
            >
              <div className={`w-9 h-9 rounded-xl border ${stat.bg} ${stat.color} flex items-center justify-center`}>
                <stat.icon className="w-4 h-4" />
              </div>
              <div>
                <span className={`text-2xl font-pixel block ${loading ? "animate-pulse text-white/20" : "text-white"}`}>
                  {loading ? "—" : stat.value}
                </span>
                <p className="font-mono text-[10px] text-white/40 mt-1">{stat.label}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Quick links */}
      <div>
        <p className="font-mono text-[10px] uppercase tracking-widest text-white/25 mb-3">Quick Access</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {quickLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="group p-5 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/10 transition-all flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                  <link.icon className="w-4 h-4 text-white/60" />
                </div>
                <div>
                  <p className="font-pixel text-sm text-white mb-0.5">{link.label}</p>
                  <p className="font-mono text-[11px] text-white/40">{link.desc}</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-white/30 group-hover:text-white group-hover:translate-x-1 transition-all" />
            </Link>
          ))}
        </div>
      </div>

      {/* DB Status + Recent Activity */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-5 rounded-2xl border border-emerald-500/10 bg-emerald-500/[0.03] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
            </div>
            <div>
              <p className="font-pixel text-xs text-white mb-0.5">DB_CONNECTED</p>
              <p className="font-mono text-[10px] text-white/30">Supabase · PostgreSQL</p>
            </div>
          </div>
          <span className="px-3 py-1.5 rounded-lg bg-emerald-500 text-black font-mono text-[9px] font-bold tracking-wider">LIVE</span>
        </div>

        <div className="p-5 rounded-2xl border border-white/5 bg-white/[0.01] flex flex-col items-center justify-center opacity-25">
          <Terminal className="w-6 h-6 mb-2" />
          <p className="font-mono text-xs italic">No recent activity to display.</p>
        </div>
      </div>
    </div>
  );
}
