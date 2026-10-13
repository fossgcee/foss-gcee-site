"use client";
/* eslint-disable @next/next/no-img-element */

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  MapPin,
  Clock,
  Users,
  ArrowRight,
  Zap,
  History,
  Terminal,
  ChevronLeft,
  ChevronRight,
  Star,
  ExternalLink,
} from "lucide-react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

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
  speaker?: string;
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
  const [featuredIndex, setFeaturedIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

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

  const upcoming = events
    .filter(e => !isPast(e))
    .sort((a, b) => a.startDate.localeCompare(b.startDate));

  const past = events
    .filter(e => isPast(e))
    .sort((a, b) => b.startDate.localeCompare(a.startDate));

  // Cycle list: featured events first (upcoming featured, then past featured).
  // If no events marked as featured, fallback to all upcoming events, or recent past events.
  const featuredUpcoming = events
    .filter(e => e.isFeatured && !isPast(e))
    .sort((a, b) => a.startDate.localeCompare(b.startDate));
  const featuredPast = events
    .filter(e => e.isFeatured && isPast(e))
    .sort((a, b) => b.startDate.localeCompare(a.startDate));
  const featuredList = [...featuredUpcoming, ...featuredPast];

  const cycleList: LiveEvent[] = featuredList.length > 0
    ? featuredList
    : (upcoming.length > 0 ? upcoming : past.slice(0, 3));

  // Current featured event
  const safeIndex = cycleList.length > 0 ? featuredIndex % cycleList.length : 0;
  const featured = cycleList[safeIndex] ?? null;

  // Upcoming events stay longer (8500ms) than past events (4000ms)
  const isCurrentUpcoming = featured ? !isPast(featured) : false;
  const slideDuration = isCurrentUpcoming ? 8500 : 4000;

  useEffect(() => {
    if (cycleList.length <= 1 || isPaused) return;

    const timer = setTimeout(() => {
      setFeaturedIndex(prev => (prev + 1) % cycleList.length);
    }, slideDuration);

    return () => clearTimeout(timer);
  }, [cycleList.length, safeIndex, slideDuration, isPaused]);

  // Keep upcoming list always visible, up to 4 items
  const moreUp = upcoming.slice(0, 4);
  const recentPast = past.slice(0, 4);

  const handleNext = () => {
    if (cycleList.length <= 1) return;
    setFeaturedIndex(prev => (prev + 1) % cycleList.length);
  };

  const handlePrev = () => {
    if (cycleList.length <= 1) return;
    setFeaturedIndex(prev => (prev - 1 + cycleList.length) % cycleList.length);
  };

  /* ── GSAP animations ───────────────────────────────────────── */
  useGSAP(() => {
    if (loading) return;
    gsap.from(".comm-heading", {
      immediateRender: false,
      scrollTrigger: { trigger: ".comm-heading", start: "top 85%" },
      y: 40, opacity: 0, duration: 0.8, ease: "power3.out",
    });
    if (featured) {
      gsap.from(".featured-card", {
        immediateRender: false,
        scrollTrigger: { trigger: ".featured-card", start: "top 80%" },
        y: 40, opacity: 0, duration: 0.9, ease: "power3.out",
      });
    }

    if (recentPast.length > 0) {
      gsap.from(".past-item", {
        immediateRender: false,
        scrollTrigger: { trigger: ".past-list", start: "top 80%" },
        x: -30, opacity: 0, duration: 0.6, stagger: 0.1, ease: "power2.out",
      });
    }

    if (moreUp.length > 0) {
      gsap.from(".upcoming-item", {
        immediateRender: false,
        scrollTrigger: { trigger: ".upcoming-list", start: "top 80%" },
        x: 30, opacity: 0, duration: 0.6, stagger: 0.1, ease: "power2.out",
      });
    }
  }, { scope: sectionRef, dependencies: [loading] });

  return (
    <section id="community" ref={sectionRef} className="py-14 sm:py-24 px-4 sm:px-6 lg:px-8 2xl:px-12 relative bg-bg">
      <div className="max-w-7xl 2xl:max-w-[1440px] mx-auto">

        {/* ── Heading ─────────────────────────────────────────── */}
        <div className="comm-heading text-center mb-10 sm:mb-16">
          <span className="tag-badge mb-4 inline-block">{"// community"}</span>
          <h2 className="text-3xl sm:text-4xl 2xl:text-5xl font-bold mt-3 text-muted">
            Events &amp; <span className="text-text">Activities</span>
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-sm sm:text-base 2xl:text-lg text-muted-2">
            From workshops to hackathons — explore what we&apos;re currently hosting and look back at past milestones.
          </p>
        </div>

        {/* ── Loading skeleton ─────────────────────────────────── */}
        {loading && (
          <div className="flex flex-col items-center gap-3 py-16 text-muted-2">
            <Terminal className="w-8 h-8 animate-pulse" />
            <p className="font-mono text-xs uppercase tracking-widest">Fetching events...</p>
          </div>
        )}

        {/* ── Featured / Terminal Card with Interactive Slider ── */}
        {!loading && featured && (
          <div
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            className="featured-card rounded-2xl overflow-hidden w-full max-w-5xl xl:max-w-6xl mx-auto bg-bg-2 border border-border-2 shadow-[0_0_60px_var(--surface-2)] mb-16 transition-all relative"
          >
            {/* Window chrome */}
            <div className="flex flex-wrap items-center justify-between gap-3 px-4 sm:px-6 py-3 border-b border-border bg-surface">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500/80 inline-block" />
                <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
                <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
                <span className="ml-3 font-mono text-[11px] sm:text-xs text-muted flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5" />
                  session: fossgcee@live-events
                </span>
              </div>

              {/* Slider Controls in Chrome */}
              <div className="flex items-center gap-2 sm:gap-3">
                {/* Status tag */}
                <span
                  className={`font-mono text-[10px] px-2.5 py-0.5 rounded-full border uppercase tracking-wider flex items-center gap-1.5 transition-all ${
                    featured.status === "upcoming"
                      ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.25)]"
                      : "bg-surface-2 border-border text-muted"
                  }`}
                >
                  {featured.status === "upcoming" ? (
                    <>
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      ⚡ live soon
                    </>
                  ) : (
                    "✓ completed"
                  )}
                </span>

                {/* Slider counter & controls if multiple items */}
                {cycleList.length > 1 && (
                  <div className="flex items-center gap-1.5 pl-2 border-l border-border/80">
                    <span className="font-mono text-[10px] sm:text-[11px] text-muted-2 px-1">
                      {safeIndex + 1}/{cycleList.length}
                    </span>
                    <button
                      onClick={handlePrev}
                      className="p-1 rounded-md text-muted hover:text-text hover:bg-surface-2 transition-colors border border-border/50"
                      title="Previous event"
                      aria-label="Previous event"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={handleNext}
                      className="p-1 rounded-md text-muted hover:text-text hover:bg-surface-2 transition-colors border border-border/50"
                      title="Next event"
                      aria-label="Next event"
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Terminal Body with Stable Height & Smooth Animated Transition */}
            <div className="p-4 sm:p-7 md:p-8 font-mono text-sm relative">
              {/* Terminal command line */}
              <div className="flex flex-wrap items-center justify-between gap-2 mb-4 pb-2 border-b border-border/40 text-xs">
                <p className="text-text/90">
                  <span className="text-muted-2">FOSSGCEE</span>
                  <span className="text-muted">:~$ </span>
                  <span className="text-text font-semibold">cat current-event.txt</span>
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-muted-2 text-[11px]">
                    $ auto-cycle: {isPaused ? "paused (hovered)" : `${slideDuration / 1000}s`}
                  </span>
                </div>
              </div>

              {/* Main content area with fixed min-height to prevent jumping */}
              <div className="min-h-[290px] sm:min-h-[230px] flex flex-col justify-center">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={featured._id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.22, ease: "easeOut" }}
                    className="flex flex-col sm:flex-row gap-6 md:gap-8 items-start sm:items-center w-full"
                  >
                    {/* Fixed dimensions poster container */}
                    <div className="shrink-0 relative w-[140px] h-[140px] sm:w-[170px] sm:h-[170px] rounded-xl overflow-hidden border border-border bg-surface flex items-center justify-center">
                      {featured.poster ? (
                        <img
                          src={featured.poster}
                          alt={featured.title}
                          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center text-muted-2 p-4 text-center">
                          <Terminal className="w-8 h-8 opacity-40 mb-2" />
                          <span className="text-[10px] tracking-widest uppercase opacity-60">FOSS_EVENT</span>
                        </div>
                      )}
                    </div>

                    {/* Details grid with guaranteed layout stability */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 lg:gap-x-12 gap-y-3.5 flex-1 w-full">
                      {/* Title: Fixed height container */}
                      <div className="sm:col-span-2">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-[10px] uppercase tracking-widest text-muted">TITLE:</p>
                          {featured.isFeatured && (
                            <span className="inline-flex items-center gap-1 font-mono text-[9px] px-2 py-0.2 rounded bg-amber-500/10 border border-amber-500/20 text-amber-400">
                              <Star className="w-2.5 h-2.5 fill-amber-400" /> Featured
                            </span>
                          )}
                        </div>
                        <p className="text-base sm:text-lg font-bold text-text line-clamp-2 leading-snug">
                          {featured.title}
                        </p>
                      </div>

                      {/* Date */}
                      <div>
                        <p className="text-[10px] uppercase tracking-widest mb-1 text-muted">DATE:</p>
                        <p className="text-xs sm:text-sm text-text/85 flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-muted-2 shrink-0" />
                          <span>{fmt(featured.startDate)} {featured.endDate && featured.endDate !== featured.startDate ? `→ ${fmt(featured.endDate)}` : ""}</span>
                        </p>
                      </div>

                      {/* Time */}
                      <div>
                        <p className="text-[10px] uppercase tracking-widest mb-1 text-muted">TIME (IST):</p>
                        <p className="text-xs sm:text-sm text-text/85 flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-muted-2 shrink-0" />
                          <span>{featured.startTime} – {featured.endTime}</span>
                        </p>
                      </div>

                      {/* Venue */}
                      <div>
                        <p className="text-[10px] uppercase tracking-widest mb-1 text-muted">VENUE:</p>
                        <p className="text-xs sm:text-sm text-text/85 flex items-center gap-1.5 truncate">
                          <MapPin className="w-3.5 h-3.5 text-muted-2 shrink-0" />
                          <span className="truncate">{featured.venue}</span>
                        </p>
                      </div>

                      {/* Handled by / Speaker */}
                      <div>
                        <p className="text-[10px] uppercase tracking-widest mb-1 text-muted">
                          {featured.speaker ? "SPEAKER:" : "LEAD / HANDLED BY:"}
                        </p>
                        <p className="text-xs sm:text-sm text-text/85 truncate">
                          {featured.speaker || featured.handledBy || "FOSS Club Team"}
                        </p>
                      </div>

                      {/* Additional row: Registrations & Category */}
                      <div className="sm:col-span-2 pt-1 flex flex-wrap items-center gap-4 text-xs text-muted-2">
                        {featured.registrationsCount > 0 && (
                          <div className="flex items-center gap-1.5 text-text/80">
                            <Users className="w-3.5 h-3.5 text-emerald-400" />
                            <span>{featured.registrationsCount} attendees registered</span>
                          </div>
                        )}
                        <span className="font-mono text-[10px] uppercase px-2 py-0.5 rounded bg-surface border border-border text-muted">
                          Category: {featured.category}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Bottom bar with slide selector pills and action button */}
              <div className="mt-6 pt-4 border-t border-border/50 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <p className="text-muted font-mono text-xs sm:text-sm">
                    FOSSGCEE:~$
                    <span className="inline-block w-2 h-4 ml-1 align-middle animate-blink bg-muted-2" />
                  </p>

                  {/* Slide selector pills */}
                  {cycleList.length > 1 && (
                    <div className="flex items-center gap-1.5 pl-2">
                      {cycleList.map((ev, idx) => (
                        <button
                          key={ev._id}
                          onClick={() => setFeaturedIndex(idx)}
                          className={`h-1.5 rounded-full transition-all duration-300 ${
                            idx === safeIndex
                              ? "w-6 bg-text shadow-sm"
                              : "w-2 bg-border-2 hover:bg-muted"
                          }`}
                          title={ev.title}
                          aria-label={`Jump to event ${idx + 1}`}
                        />
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <Link
                    href={`/events/${featured.slug}`}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl font-mono text-xs font-semibold transition-all duration-200 hover:scale-105 bg-surface-2 border border-border text-text hover:border-text/40 shadow-sm"
                  >
                    $ ./view_more.sh <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Countdown progress bar line at bottom */}
            {cycleList.length > 1 && !isPaused && (
              <div className="h-1 w-full bg-surface-2 overflow-hidden">
                <motion.div
                  key={`${featured._id}-${safeIndex}`}
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: slideDuration / 1000, ease: "linear" }}
                  className="h-full bg-text/40"
                />
              </div>
            )}
          </div>
        )}

        {/* ── No events at all ────────────────────────────────── */}
        {!loading && events.length === 0 && (
          <div className="text-center py-16 border border-dashed border-border-2 rounded-2xl">
            <Terminal className="w-8 h-8 mx-auto mb-3 text-muted-2" />
            <p className="font-mono text-xs text-muted uppercase tracking-widest">No events in database yet.</p>
          </div>
        )}

        {/* ── Past | Upcoming grid ─────────────────────────── */}
        {!loading && (recentPast.length > 0 || moreUp.length > 0) && (
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8 xl:gap-12">

            {/* Past events timeline */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-mono text-[11px] sm:text-xs uppercase tracking-widest text-muted flex items-center gap-2">
                  <History className="w-3.5 h-3.5" /> Past Events
                </h3>
                <span className="font-mono text-[10px] text-muted-2">Archive</span>
              </div>
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
                          {ev.isFeatured && (
                            <span className="font-mono text-[9px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1">
                              <Star className="w-2.5 h-2.5 fill-amber-400" /> featured
                            </span>
                          )}
                        </div>
                        <p className="font-semibold text-sm text-text mb-1">{ev.title}</p>
                        <p className="text-xs text-muted-2 flex items-center gap-1.5 flex-wrap">
                          <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {ev.venue}</span>
                          {ev.registrationsCount > 0 && (
                            <span className="ml-2 flex items-center gap-1">
                              <Users className="w-3 h-3" /> {ev.registrationsCount} attended
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

            {/* Upcoming events list — Always shows upcoming events without disappearing! */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-mono text-[11px] sm:text-xs uppercase tracking-widest text-muted flex items-center gap-2">
                  <Zap className="w-3.5 h-3.5 text-amber-400" /> Upcoming Events
                </h3>
                <span className="font-mono text-[10px] text-emerald-400">Scheduled</span>
              </div>

              {moreUp.length === 0 ? (
                <div className="p-8 rounded-2xl border border-dashed border-border-2 text-center">
                  <p className="font-mono text-xs text-muted leading-relaxed">
                    No upcoming events scheduled right now. Check back soon or join our community!
                  </p>
                  <Link
                    href="/join"
                    className="inline-flex items-center gap-1.5 mt-4 font-mono text-xs text-text hover:underline"
                  >
                    Join Discord / Telegram <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
              ) : (
                <div className="upcoming-list flex flex-col gap-4">
                  {moreUp.map(ev => (
                    <div
                      key={ev._id}
                      className="upcoming-item glass-card p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group hover:-translate-y-0.5 transition-transform"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5">
                          <p className="font-semibold text-sm text-text truncate">{ev.title}</p>
                          {ev.isFeatured && (
                            <span className="font-mono text-[9px] px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-0.5 shrink-0">
                              <Star className="w-2.5 h-2.5 fill-amber-400" /> featured
                            </span>
                          )}
                        </div>
                        <p className="font-mono text-xs text-muted-2 flex items-center gap-3 flex-wrap">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-text/60" />
                            {fmt(ev.startDate)}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-text/60" />
                            {ev.venue}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-text/60" />
                            {ev.startTime}
                          </span>
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <Link
                          href={`/events/${ev.slug}`}
                          className="px-3 py-1.5 rounded-lg font-mono text-[10px] font-semibold bg-text text-bg hover:opacity-90 transition-opacity flex items-center gap-1 shadow-sm"
                        >
                          Register / Details <ArrowRight className="w-3 h-3" />
                        </Link>
                      </div>
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
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-mono text-[13px] font-semibold transition-all duration-200 hover:scale-105 bg-text text-bg shadow-[0_0_20px_rgba(0,0,0,0.4)] dark:shadow-[0_0_24px_rgba(255,255,255,0.3)]"
            >
              $ ./view_all_events.sh <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}

      </div>
    </section>
  );
}

