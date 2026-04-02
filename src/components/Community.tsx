"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Calendar, MapPin, Clock, Users, ArrowRight, Zap, History, Terminal } from "lucide-react";

interface LiveEvent {
  _id: string;
  title: string;
  slug: string;
  description: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  venue: string;
  category: string;
  handledBy: string;
  poster?: string;
  status: "upcoming" | "completed" | "draft";
  isFeatured?: boolean;
  registrationsCount: number;
}

/** IST-aware today string "YYYY-MM-DD" */
function todayIST(): string {
  const ist = new Date(Date.now() + 5.5 * 60 * 60 * 1000);
  return ist.toISOString().slice(0, 10);
}

/** "2026-06-26" → "26 Jun 2026" */
function fmt(d: string): string {
  if (!d) return "";
  const [y, m, day] = d.split("-");
  return new Date(+y, +m - 1, +day).toLocaleDateString("en-GB", {
    day: "2-digit", month: "short", year: "numeric",
  });
}

export default function Community() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [events, setEvents] = useState<LiveEvent[]>([]);
  const [loading, setLoading] = useState(true);

  /* ── Fetch from live API ───────────────────────────────────── */
  useEffect(() => {
    fetch("/api/events")
      .then(r => r.json())
      .then(d => { if (d.success) setEvents(d.data); })
      .finally(() => setLoading(false));
  }, []);

  /* ── Derive past / upcoming ────────────────────────────────── */
  const today = todayIST();

  const isPast = (e: LiveEvent) =>
    e.status === "completed" || (e.endDate && e.endDate < today);

  // Featured: manual flag first, then soonest upcoming, then most-recent past
  const upcoming = events.filter(e => !isPast(e)).sort((a, b) => a.startDate.localeCompare(b.startDate));
  const past     = events.filter(e => isPast(e)).sort((a, b) => b.startDate.localeCompare(a.startDate));

  const featured  = events.find(e => e.isFeatured) ?? upcoming[0] ?? null;
  const moreUp    = upcoming.filter(e => e._id !== featured?._id).slice(0, 3);
  const recentPast = past.slice(0, 4);

  /* ── GSAP animations ───────────────────────────────────────── */
  useEffect(() => {
    if (loading) return;
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      gsap.from(".comm-heading", {
        immediateRender: false,
        scrollTrigger: { trigger: ".comm-heading", start: "top 85%" },
        y: 40, opacity: 0, duration: 0.8, ease: "power3.out",
      });
      gsap.from(".featured-card", {
        immediateRender: false,
        scrollTrigger: { trigger: ".featured-card", start: "top 80%" },
        y: 40, opacity: 0, duration: 0.9, ease: "power3.out",
      });
      gsap.from(".past-item", {
        immediateRender: false,
        scrollTrigger: { trigger: ".past-list", start: "top 80%" },
        x: -30, opacity: 0, duration: 0.6, stagger: 0.1, ease: "power2.out",
      });
      gsap.from(".upcoming-item", {
        immediateRender: false,
        scrollTrigger: { trigger: ".upcoming-list", start: "top 80%" },
        x: 30, opacity: 0, duration: 0.6, stagger: 0.1, ease: "power2.out",
      });
    }, sectionRef);
    return () => ctx.revert();
  }, [loading]);

  return (
    <section id="community" ref={sectionRef} className="py-24 px-4 sm:px-6 lg:px-8 relative bg-bg">
      <div className="max-w-6xl mx-auto">

        {/* ── Heading ─────────────────────────────────────────── */}
        <div className="comm-heading text-center mb-16">
          <span className="tag-badge mb-4 inline-block">// community</span>
          <h2 className="text-3xl sm:text-4xl font-bold mt-3 text-text">
            Events &amp; <span className="text-text">Activities</span>
          </h2>
          <p className="mt-4 max-w-xl mx-auto text-sm sm:text-base text-muted-2">
            From installations to hackathons — here&apos;s what we&apos;ve been up to and what&apos;s coming.
          </p>
        </div>

        {/* ── Loading skeleton ─────────────────────────────────── */}
        {loading && (
          <div className="flex flex-col items-center gap-3 py-16 text-muted-2">
            <Terminal className="w-8 h-8 animate-pulse" />
            <p className="font-mono text-xs uppercase tracking-widest">Fetching events...</p>
          </div>
        )}

        {/* ── Featured / next upcoming terminal card ───────────── */}
        {!loading && featured && (
          <div className="featured-card rounded-2xl overflow-hidden w-full max-w-4xl mx-auto bg-bg-2 border border-border-2 shadow-[0_0_60px_var(--surface-2)] mb-16">
            {/* Window chrome */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-surface">
              <span className="w-3 h-3 rounded-full bg-border-2" />
              <span className="w-3 h-3 rounded-full bg-border" />
              <span className="w-3 h-3 rounded-full bg-surface-2" />
              <span className="ml-3 font-mono text-[11px] text-muted">terminal</span>
              <span className="ml-auto font-mono text-[10px] px-2 py-0.5 rounded bg-surface-2 border border-border text-muted uppercase tracking-widest">
                {featured.status === "upcoming" ? "⚡ live soon" : "✓ completed"}
              </span>
            </div>

            {/* Body */}
            <div className="p-6 sm:p-8 font-mono text-sm">
              <p className="mb-1 text-text/90">
                <span className="text-muted-2">FOSSGCEE</span>
                <span className="text-muted">:~$ </span>
                <span className="text-text">cat current-event.txt</span>
              </p>
              <p className="mb-6 text-muted-2 text-xs">$ Fetched live from database</p>

              <div className="flex flex-col sm:flex-row gap-8 items-start">
                {/* Poster */}
                {featured.poster && (
                  <div className="shrink-0 relative w-[160px] h-[160px] rounded-xl overflow-hidden border border-border">
                    <img src={featured.poster} alt={featured.title} className="w-full h-full object-cover" />
                  </div>
                )}

                {/* Details grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-5 flex-1">
                  <div className="sm:col-span-2">
                    <p className="text-[10px] uppercase tracking-widest mb-1 text-muted">Title:</p>
                    <p className="text-base font-semibold text-text">{featured.title}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-widest mb-1 text-muted">Date:</p>
                    <p className="text-sm text-text/80">{fmt(featured.startDate)} → {fmt(featured.endDate)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-widest mb-1 text-muted">Time (IST):</p>
                    <p className="text-sm text-text/80">{featured.startTime} – {featured.endTime}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-widest mb-1 text-muted">Venue:</p>
                    <p className="text-sm text-text/80">{featured.venue}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-widest mb-1 text-muted">Handled By:</p>
                    <p className="text-sm text-text/80">{featured.handledBy}</p>
                  </div>
                  {featured.registrationsCount > 0 && (
                    <div>
                      <p className="text-[10px] uppercase tracking-widest mb-1 text-muted">Registrations:</p>
                      <p className="text-sm text-text/80 flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5" /> {featured.registrationsCount}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-8 flex items-center justify-between">
                <p className="text-muted font-mono text-sm">
                  FOSSGCEE:~$
                  <span className="inline-block w-2 h-4 ml-1 align-middle animate-blink bg-muted-2" />
                </p>
                <Link
                  href={`/events/${featured.slug}`}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl font-mono text-xs font-semibold transition-all duration-200 hover:scale-105 bg-surface-2 border border-border text-text/80"
                >
                  $ ./view_more.sh →
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* ── No events at all ────────────────────────────────── */}
        {!loading && events.length === 0 && (
          <div className="text-center py-16 border border-dashed border-border-2 rounded-2xl">
            <Terminal className="w-8 h-8 mx-auto mb-3 text-muted-2" />
            <p className="font-mono text-xs text-muted uppercase tracking-widest">No events in database yet.</p>
          </div>
        )}

        {/* ── Past | More Upcoming grid ─────────────────────────── */}
        {!loading && (recentPast.length > 0 || moreUp.length > 0) && (
          <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-10">

            {/* Past events timeline */}
            <div>
              <h3 className="font-mono text-[11px] uppercase tracking-widest mb-6 text-muted flex items-center gap-2">
                <History className="w-3.5 h-3.5" /> Past Events
              </h3>
              {recentPast.length === 0 ? (
                <p className="font-mono text-xs text-muted">No past events yet.</p>
              ) : (
                <div className="past-list relative pl-6 border-l border-border space-y-5">
                  {recentPast.map(ev => (
                    <div key={ev._id} className="past-item relative group">
                      <div className="absolute -left-[22px] top-3 w-3 h-3 rounded-full border-2 border-muted bg-surface-2 transition-colors group-hover:border-text" />
                      <div className="glass-card p-5 group-hover:-translate-x-0.5 transition-transform">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-mono text-[10px] text-text flex items-center gap-1">
                            <Calendar className="w-3 h-3" /> {fmt(ev.startDate)}
                          </span>
                          <span className="font-mono text-[9px] px-2 py-0.5 rounded-full bg-surface text-muted-2 border border-border capitalize">
                            {ev.category}
                          </span>
                        </div>
                        <p className="font-semibold text-sm text-text mb-1">{ev.title}</p>
                        <p className="text-xs text-muted-2 flex items-center gap-1.5">
                          <MapPin className="w-3 h-3" /> {ev.venue}
                          {ev.registrationsCount > 0 && (
                            <span className="ml-2 flex items-center gap-1">
                              <Users className="w-3 h-3" /> {ev.registrationsCount}
                            </span>
                          )}
                        </p>
                        <Link
                          href={`/events/${ev.slug}`}
                          className="inline-flex items-center gap-1.5 mt-3 font-mono text-[11px] text-muted hover:text-text transition-colors"
                        >
                          View details <ArrowRight className="w-3 h-3" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* More upcoming events */}
            <div>
              <h3 className="font-mono text-[11px] uppercase tracking-widest mb-6 text-muted flex items-center gap-2">
                <Zap className="w-3.5 h-3.5" /> Upcoming Events
              </h3>
              {moreUp.length === 0 ? (
                <p className="font-mono text-xs text-muted">
                  {upcoming.length === 1
                    ? "Only the featured event above is scheduled."
                    : "No more upcoming events — check back soon."}
                </p>
              ) : (
                <div className="upcoming-list flex flex-col gap-4">
                  {moreUp.map(ev => (
                    <div key={ev._id} className="upcoming-item glass-card p-5 flex items-start justify-between gap-4 group hover:-translate-y-0.5 transition-transform">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm mb-1.5 text-text truncate">{ev.title}</p>
                        <p className="font-mono text-xs text-muted-2 flex items-center gap-2 flex-wrap">
                          <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{fmt(ev.startDate)}</span>
                          <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{ev.venue}</span>
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{ev.startTime}</span>
                        </p>
                      </div>
                      <span className="shrink-0 font-mono text-[9px] px-2.5 py-1 rounded-full bg-surface-2 text-text border border-border-2">
                        ⚡ soon
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}

        {/* ── View all events CTA ─────────────────────────────── */}
        {!loading && events.length > 0 && (
          <div className="mt-14 text-center">
            <Link
              href="/events"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-mono text-[13px] font-semibold transition-all duration-200 hover:scale-105 bg-text text-bg shadow-[0_0_20px_rgba(0,0,0,0.4)] dark:shadow-[0_0_24px_rgba(255,255,255,0.3)]"
            >
              $ ./view_all_events.sh <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}

      </div>
    </section>
  );
}
