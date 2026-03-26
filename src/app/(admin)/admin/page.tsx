"use client";

import { useEffect, useState } from "react";
import { Users, CheckCircle2, XCircle, Terminal, ShieldCheck, ArrowRight } from "lucide-react";
import Link from "next/link";

interface Stats {
  total: number;
  verified: number;
  pending: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({ total: 0, verified: 0, pending: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/members")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          const verified = d.data.filter((m: { otpVerified: boolean }) => m.otpVerified).length;
          setStats({ total: d.count, verified, pending: d.count - verified });
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const statCards = [
    { label: "Total Registrations", value: stats.total, icon: Users, color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20" },
    { label: "Verified Members", value: stats.verified, icon: CheckCircle2, color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" },
    { label: "Pending Verification", value: stats.pending, icon: XCircle, color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20" },
  ];

  return (
    <div className="space-y-8 py-10">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-pixel text-white">DASHBOARD_OVERVIEW</h1>
        <p className="font-mono text-xs text-white/40">FOSS Club GCE Erode — Administration Console</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statCards.map((stat) => (
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

      {/* Quick links */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link
          href="/admin/members"
          className="group p-6 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/10 transition-all flex items-center justify-between"
        >
          <div>
            <p className="font-pixel text-sm text-white mb-1">VIEW_ALL_MEMBERS</p>
            <p className="font-mono text-[11px] text-white/40">Search, filter and manage registrations</p>
          </div>
          <ArrowRight className="w-5 h-5 text-white/30 group-hover:text-white group-hover:translate-x-1 transition-all" />
        </Link>

        <div className="p-6 rounded-2xl border border-emerald-500/10 bg-emerald-500/[0.03] flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-emerald-500" />
            </div>
            <div>
              <p className="font-pixel text-sm text-white mb-0.5">DB_CONNECTED</p>
              <p className="font-mono text-[10px] text-white/30">MongoDB Atlas · foss-website</p>
            </div>
          </div>
          <span className="px-3 py-1.5 rounded-lg bg-emerald-500 text-black font-mono text-[9px] font-bold tracking-wider">LIVE</span>
        </div>
      </div>

      {/* Activity placeholder */}
      <div className="space-y-3">
        <h2 className="text-xs font-pixel text-white/30 uppercase tracking-widest">RECENT_ACTIVITY</h2>
        <div className="rounded-2xl border border-white/5 bg-white/[0.01] p-16 flex flex-col items-center justify-center opacity-20">
          <Terminal className="w-10 h-10 mb-3" />
          <p className="font-mono text-xs italic">No recent activity to display.</p>
        </div>
      </div>
    </div>
  );
}
