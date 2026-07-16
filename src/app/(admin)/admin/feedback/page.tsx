"use client";

import { useState, useEffect, useMemo } from "react";
import {
  MessageSquare, Star, Trash2, Calendar, RefreshCw,
  BarChart2, PieChart, Users, ChevronDown, Filter, TrendingUp
} from "lucide-react";

interface FeedbackItem {
  _id: string;
  name?: string;
  email?: string;
  year?: number;
  department?: string;
  eventName: string;
  rating: number;
  comments?: string;
  createdAt: string;
}

/* ── Tiny reusable chart primitives (pure SVG, no deps) ─────── */

function RatingBar({ label, count, max, color = "#f59e0b" }: { label: string; count: number; max: number; color?: string }) {
  const pct = max > 0 ? (count / max) * 100 : 0;
  return (
    <div className="flex items-center gap-3 group">
      <span className="font-mono text-[11px] text-white/50 w-16 shrink-0">{label}</span>
      <div className="flex-1 h-2.5 bg-white/5 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
      <span className="font-mono text-[11px] text-white/40 w-6 text-right shrink-0">{count}</span>
    </div>
  );
}

function StarDistributionChart({ feedbacks }: { feedbacks: FeedbackItem[] }) {
  const dist = [5, 4, 3, 2, 1].map((s) => ({
    star: s,
    count: feedbacks.filter((f) => f.rating === s).length,
  }));
  const max = Math.max(...dist.map((d) => d.count), 1);
  const colors = ["#22c55e", "#86efac", "#f59e0b", "#f97316", "#ef4444"];

  return (
    <div className="space-y-2">
      {dist.map((d, i) => (
        <RatingBar
          key={d.star}
          label={`★ ${d.star}`}
          count={d.count}
          max={max}
          color={colors[i]}
        />
      ))}
    </div>
  );
}

function DeptBarChart({ feedbacks }: { feedbacks: FeedbackItem[] }) {
  const deptMap: Record<string, number> = {};
  feedbacks.forEach((f) => {
    if (f.department) deptMap[f.department] = (deptMap[f.department] || 0) + 1;
  });
  const sorted = Object.entries(deptMap).sort((a, b) => b[1] - a[1]).slice(0, 8);
  const max = Math.max(...sorted.map((d) => d[1]), 1);
  const palette = ["#6366f1", "#8b5cf6", "#a78bfa", "#c4b5fd", "#818cf8", "#93c5fd", "#67e8f9", "#34d399"];

  if (sorted.length === 0) return <p className="font-mono text-xs text-white/30 text-center py-6">No department data</p>;

  return (
    <div className="space-y-2">
      {sorted.map(([dept, count], i) => (
        <RatingBar key={dept} label={dept} count={count} max={max} color={palette[i % palette.length]} />
      ))}
    </div>
  );
}

function YearDonutChart({ feedbacks }: { feedbacks: FeedbackItem[] }) {
  const yearMap: Record<string, number> = {};
  feedbacks.forEach((f) => {
    const k = f.year ? `Year ${f.year}` : "Unknown";
    yearMap[k] = (yearMap[k] || 0) + 1;
  });
  const total = feedbacks.length;
  const entries = Object.entries(yearMap).sort((a, b) => a[0].localeCompare(b[0]));
  const colors = ["#6366f1", "#f59e0b", "#22c55e", "#ef4444", "#a78bfa"];

  // Build SVG donut segments
  const r = 60, cx = 70, cy = 70, stroke = 22;
  const circ = 2 * Math.PI * r;
  let offset = 0;
  const segments = entries.map(([label, count], i) => {
    const pct = total > 0 ? count / total : 0;
    const dash = pct * circ;
    const seg = { label, count, pct, dash, offset, color: colors[i % colors.length] };
    offset += dash;
    return seg;
  });

  if (total === 0) return <p className="font-mono text-xs text-white/30 text-center py-6">No data</p>;

  return (
    <div className="flex flex-col sm:flex-row items-center gap-6">
      <div className="relative shrink-0">
        <svg width="140" height="140" viewBox="0 0 140 140">
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={stroke} />
          {segments.map((seg) => (
            <circle
              key={seg.label}
              cx={cx} cy={cy} r={r}
              fill="none"
              stroke={seg.color}
              strokeWidth={stroke}
              strokeDasharray={`${seg.dash} ${circ - seg.dash}`}
              strokeDashoffset={circ / 4 - seg.offset}
              strokeLinecap="butt"
            />
          ))}
          <text x={cx} y={cy - 4} textAnchor="middle" className="fill-white" style={{ fontFamily: "monospace", fontSize: 20, fill: "white" }}>{total}</text>
          <text x={cx} y={cy + 14} textAnchor="middle" style={{ fontFamily: "monospace", fontSize: 9, fill: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: 1 }}>total</text>
        </svg>
      </div>
      <div className="space-y-2 w-full">
        {segments.map((seg) => (
          <div key={seg.label} className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: seg.color }} />
              <span className="font-mono text-[11px] text-white/60">{seg.label}</span>
            </div>
            <span className="font-mono text-[11px] text-white/40">{seg.count} ({Math.round(seg.pct * 100)}%)</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function AvgRatingGauge({ avg }: { avg: number }) {
  const pct = avg / 5;
  const color = avg >= 4 ? "#22c55e" : avg >= 3 ? "#f59e0b" : "#ef4444";
  const r = 48, cx = 60, cy = 60;
  const circ = Math.PI * r; // half circle
  const dash = pct * circ;

  return (
    <div className="flex flex-col items-center gap-2">
      <svg width="120" height="70" viewBox="0 0 120 70">
        <path d={`M 12 60 A ${r} ${r} 0 0 1 108 60`} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="14" strokeLinecap="round" />
        <path d={`M 12 60 A ${r} ${r} 0 0 1 108 60`} fill="none" stroke={color} strokeWidth="14" strokeLinecap="round"
          strokeDasharray={`${dash} ${circ}`} style={{ transition: "stroke-dasharray 1s ease-out" }} />
        <text x="60" y="55" textAnchor="middle" style={{ fontFamily: "monospace", fontSize: 22, fontWeight: "bold", fill: "white" }}>{avg.toFixed(1)}</text>
      </svg>
      <p className="font-mono text-[10px] text-white/30 uppercase tracking-widest">out of 5.0</p>
    </div>
  );
}

function EventRatingSummaryRow({ eventName, feedbacks }: { eventName: string; feedbacks: FeedbackItem[] }) {
  const avg = feedbacks.reduce((a, f) => a + f.rating, 0) / feedbacks.length;
  const color = avg >= 4 ? "text-emerald-400" : avg >= 3 ? "text-amber-400" : "text-red-400";
  const barColor = avg >= 4 ? "#22c55e" : avg >= 3 ? "#f59e0b" : "#ef4444";

  return (
    <div className="flex items-center gap-4 py-2.5 border-b border-white/5 last:border-0">
      <div className="flex-1 min-w-0">
        <p className="font-mono text-xs text-white truncate">{eventName}</p>
        <p className="font-mono text-[10px] text-white/30 mt-0.5">{feedbacks.length} response{feedbacks.length !== 1 ? "s" : ""}</p>
      </div>
      <div className="w-24 h-1.5 bg-white/5 rounded-full overflow-hidden shrink-0">
        <div className="h-full rounded-full" style={{ width: `${(avg / 5) * 100}%`, backgroundColor: barColor, transition: "width 0.8s ease" }} />
      </div>
      <span className={`font-mono text-sm font-bold shrink-0 ${color}`}>{avg.toFixed(1)}</span>
    </div>
  );
}

/* ── Main Page ───────────────────────────────────────────────── */

export default function AdminFeedbackPage() {
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<string>("__all__");
  const [activeTab, setActiveTab] = useState<"overview" | "event" | "comments">("overview");

  const fetchFeedback = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/feedback");
      const data = await res.json();
      if (data.success) setFeedbacks(data.data);
    } catch (err) {
      console.error("Failed to fetch feedback", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchFeedback(); }, []);

  const deleteFeedback = async (id: string) => {
    if (!confirm("Delete this feedback entry?")) return;
    try {
      const res = await fetch(`/api/admin/feedback?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) setFeedbacks((prev) => prev.filter((f) => f._id !== id));
    } catch (err) {
      console.error("Failed to delete feedback", err);
    }
  };

  const eventNames = useMemo(() => [...new Set(feedbacks.map((f) => f.eventName))].sort(), [feedbacks]);

  const filtered = useMemo(
    () => selectedEvent === "__all__" ? feedbacks : feedbacks.filter((f) => f.eventName === selectedEvent),
    [feedbacks, selectedEvent]
  );

  const avgRating = filtered.length > 0
    ? filtered.reduce((a, f) => a + f.rating, 0) / filtered.length
    : 0;

  const highestRated = useMemo(() => {
    const map: Record<string, number[]> = {};
    feedbacks.forEach((f) => { if (!map[f.eventName]) map[f.eventName] = []; map[f.eventName].push(f.rating); });
    return Object.entries(map)
      .map(([name, ratings]) => ({ name, avg: ratings.reduce((a, b) => a + b, 0) / ratings.length, count: ratings.length }))
      .sort((a, b) => b.avg - a.avg);
  }, [feedbacks]);

  const statsCards = [
    { label: "Total Responses", value: feedbacks.length, icon: MessageSquare, color: "text-violet-400" },
    { label: "Events Covered", value: eventNames.length, icon: BarChart2, color: "text-blue-400" },
    { label: "Overall Avg Rating", value: `${(feedbacks.length > 0 ? feedbacks.reduce((a, f) => a + f.rating, 0) / feedbacks.length : 0).toFixed(1)} ★`, icon: Star, color: "text-amber-400" },
    { label: "With Comments", value: feedbacks.filter((f) => f.comments && f.comments.trim()).length, icon: TrendingUp, color: "text-emerald-400" },
  ];

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-48 bg-white/10 rounded" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-24 bg-white/5 rounded-2xl" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="h-64 bg-white/5 rounded-2xl" />
          <div className="h-64 bg-white/5 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-pixel text-white">FEEDBACK</h1>
          <p className="font-mono text-xs text-white/40 mt-1">Analytics & participant responses</p>
        </div>
        <button
          onClick={fetchFeedback}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 font-mono text-xs text-white transition-all"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh
        </button>
      </div>

      {feedbacks.length === 0 ? (
        <div className="text-center py-24 border border-dashed border-white/10 rounded-2xl bg-white/[0.02]">
          <MessageSquare className="w-12 h-12 text-white/20 mx-auto mb-4" />
          <h2 className="font-mono text-sm text-white">No feedback yet</h2>
          <p className="font-mono text-xs text-white/40 mt-1">When participants submit feedback, analytics will appear here.</p>
        </div>
      ) : (
        <>
          {/* Stat Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {statsCards.map((s) => (
              <div key={s.label} className="p-4 rounded-2xl bg-white/[0.03] border border-white/8 flex flex-col gap-2">
                <s.icon className={`w-4 h-4 ${s.color}`} />
                <p className={`font-mono text-2xl font-bold ${s.color}`}>{s.value}</p>
                <p className="font-mono text-[10px] text-white/30 uppercase tracking-widest leading-snug">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Tab Bar */}
          <div className="flex gap-1 p-1 bg-white/[0.03] border border-white/8 rounded-xl w-fit">
            {(["overview", "event", "comments"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-1.5 rounded-lg font-mono text-[11px] uppercase tracking-widest transition-all ${
                  activeTab === tab ? "bg-white text-black" : "text-white/40 hover:text-white"
                }`}
              >
                {tab === "overview" ? "Overview" : tab === "event" ? "Event Analysis" : "Comments"}
              </button>
            ))}
          </div>

          {/* OVERVIEW TAB */}
          {activeTab === "overview" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Avg Rating Gauge */}
                <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/8 flex flex-col items-center justify-center gap-3">
                  <p className="font-mono text-[10px] text-white/40 uppercase tracking-widest">Overall Avg Rating</p>
                  <AvgRatingGauge avg={feedbacks.length > 0 ? feedbacks.reduce((a, f) => a + f.rating, 0) / feedbacks.length : 0} />
                  <div className="flex gap-0.5">
                    {[1,2,3,4,5].map((s) => (
                      <Star key={s} className={`w-4 h-4 ${s <= Math.round(avgRating) ? "text-amber-400 fill-amber-400" : "text-white/10"}`} />
                    ))}
                  </div>
                </div>

                {/* Star Distribution */}
                <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/8 space-y-4">
                  <p className="font-mono text-[10px] text-white/40 uppercase tracking-widest">Rating Distribution</p>
                  <StarDistributionChart feedbacks={feedbacks} />
                </div>

                {/* Year Breakdown */}
                <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/8 space-y-4">
                  <p className="font-mono text-[10px] text-white/40 uppercase tracking-widest">Year Breakdown</p>
                  <YearDonutChart feedbacks={feedbacks} />
                </div>
              </div>

              {/* Department + Event Ranking */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/8 space-y-4">
                  <div className="flex items-center gap-2">
                    <PieChart className="w-4 h-4 text-violet-400" />
                    <p className="font-mono text-[10px] text-white/40 uppercase tracking-widest">Responses by Department</p>
                  </div>
                  <DeptBarChart feedbacks={feedbacks} />
                </div>

                <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/8 space-y-2">
                  <div className="flex items-center gap-2 mb-3">
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                    <p className="font-mono text-[10px] text-white/40 uppercase tracking-widest">Event Rating Ranking</p>
                  </div>
                  {highestRated.length === 0
                    ? <p className="font-mono text-xs text-white/30 text-center py-6">No data</p>
                    : highestRated.map((e) => (
                        <EventRatingSummaryRow key={e.name} eventName={e.name} feedbacks={feedbacks.filter(f => f.eventName === e.name)} />
                      ))
                  }
                </div>
              </div>
            </div>
          )}

          {/* EVENT ANALYSIS TAB */}
          {activeTab === "event" && (
            <div className="space-y-4">
              {/* Event Filter */}
              <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                <div className="flex items-center gap-2 text-white/40">
                  <Filter className="w-4 h-4" />
                  <span className="font-mono text-[10px] uppercase tracking-widest">Filter by Event</span>
                </div>
                <div className="relative">
                  <select
                    value={selectedEvent}
                    onChange={(e) => setSelectedEvent(e.target.value)}
                    className="appearance-none bg-white/5 border border-white/10 rounded-xl px-4 py-2 pr-8 font-mono text-xs text-white focus:outline-none focus:ring-1 focus:ring-white/20 cursor-pointer"
                    style={{ backgroundImage: "none" }}
                  >
                    <option value="__all__" className="bg-[#111]">All Events</option>
                    {eventNames.map((n) => <option key={n} value={n} className="bg-[#111]">{n}</option>)}
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-white/40 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
                <span className="font-mono text-[10px] text-white/30">{filtered.length} response{filtered.length !== 1 ? "s" : ""}</span>
              </div>

              {/* Per-event Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/8 flex flex-col items-center gap-3">
                  <p className="font-mono text-[10px] text-white/40 uppercase tracking-widest">Avg Rating</p>
                  <AvgRatingGauge avg={avgRating} />
                  <div className="flex gap-0.5">
                    {[1,2,3,4,5].map((s) => (
                      <Star key={s} className={`w-4 h-4 ${s <= Math.round(avgRating) ? "text-amber-400 fill-amber-400" : "text-white/10"}`} />
                    ))}
                  </div>
                </div>

                <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/8 space-y-4">
                  <p className="font-mono text-[10px] text-white/40 uppercase tracking-widest">Rating Distribution</p>
                  <StarDistributionChart feedbacks={filtered} />
                </div>

                <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/8 space-y-4">
                  <p className="font-mono text-[10px] text-white/40 uppercase tracking-widest">Year Breakdown</p>
                  <YearDonutChart feedbacks={filtered} />
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/8 space-y-4">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-400" />
                  <p className="font-mono text-[10px] text-white/40 uppercase tracking-widest">Department Breakdown</p>
                </div>
                <DeptBarChart feedbacks={filtered} />
              </div>
            </div>
          )}

          {/* COMMENTS TAB */}
          {activeTab === "comments" && (
            <div className="space-y-3">
              {/* Filter */}
              <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                <div className="flex items-center gap-2 text-white/40">
                  <Filter className="w-4 h-4" />
                  <span className="font-mono text-[10px] uppercase tracking-widest">Filter</span>
                </div>
                <div className="relative">
                  <select
                    value={selectedEvent}
                    onChange={(e) => setSelectedEvent(e.target.value)}
                    className="appearance-none bg-white/5 border border-white/10 rounded-xl px-4 py-2 pr-8 font-mono text-xs text-white focus:outline-none focus:ring-1 focus:ring-white/20 cursor-pointer"
                    style={{ backgroundImage: "none" }}
                  >
                    <option value="__all__" className="bg-[#111]">All Events</option>
                    {eventNames.map((n) => <option key={n} value={n} className="bg-[#111]">{n}</option>)}
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-white/40 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                {filtered.map((f) => (
                  <div key={f._id} className="p-5 rounded-2xl bg-white/[0.02] border border-white/8 flex flex-col gap-3 hover:border-white/15 transition-colors">
                    {/* Event + Rating */}
                    <div className="flex justify-between items-start gap-2">
                      <div className="min-w-0">
                        <p className="font-mono text-[10px] text-white/40 uppercase tracking-widest truncate">{f.eventName}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Calendar className="w-3 h-3 text-white/20" />
                          <span className="font-mono text-[10px] text-white/30">{new Date(f.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="flex gap-0.5 shrink-0 bg-black/20 p-1 rounded-lg border border-white/5">
                        {[1,2,3,4,5].map((s) => (
                          <Star key={s} className={`w-3 h-3 ${s <= f.rating ? "text-amber-400 fill-amber-400" : "text-white/10 fill-white/5"}`} />
                        ))}
                      </div>
                    </div>

                    {/* Comment */}
                    <p className="font-mono text-xs text-white/60 whitespace-pre-wrap italic flex-1 leading-relaxed">
                      &ldquo;{f.comments?.trim() || "No comments provided."}&rdquo;
                    </p>

                    {/* Footer */}
                    <div className="pt-3 border-t border-white/5 flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-mono text-xs text-white truncate">
                          {f.name || "Anonymous"}
                          {f.department && f.year && (
                            <span className="text-white/30 ml-1 text-[10px] uppercase">· {f.department} Y{f.year}</span>
                          )}
                        </p>
                        <p className="font-mono text-[10px] text-white/30 truncate">{f.email || "No email"}</p>
                      </div>
                      <button
                        onClick={() => deleteFeedback(f._id)}
                        className="p-1.5 rounded-lg text-red-400/40 hover:text-red-400 hover:bg-red-400/10 transition-colors shrink-0"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}

                {filtered.length === 0 && (
                  <div className="col-span-full text-center py-16 text-white/30 font-mono text-sm">
                    No feedback entries for this selection.
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
