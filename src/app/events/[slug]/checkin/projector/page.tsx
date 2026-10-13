/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams } from "next/navigation";
import {
  Maximize,
  Minimize,
  QrCode,
  Calendar,
  MapPin,
  Clock,
  Loader2,
  ExternalLink,
  Users,
  X,
  Search,
  Sparkles,
  Tag,
  ShieldCheck,
  CheckCircle2
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import QRCode from "qrcode";

interface CheckinState {
  event: {
    id: string;
    title: string;
    slug: string;
    venue?: string;
    startDate?: string;
    startTime?: string;
    poster?: string;
    category?: string;
    description?: string;
    registrationsCount: number;
  };
  totalRegistrations: number;
  checkedInCount: number;
  checkedInEmails: string[];
  recentCheckins: Array<{
    name: string;
    email: string;
    department?: string;
    year?: number;
    college?: string;
    checkedInAt: string;
  }>;
}

export default function ProjectorCheckinPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [data, setData] = useState<CheckinState | null>(null);
  const [loading, setLoading] = useState(true);
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [checkinUrl, setCheckinUrl] = useState<string>("");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isAdminDrawerOpen, setIsAdminDrawerOpen] = useState(false);
  const [drawerSearch, setDrawerSearch] = useState("");

  // Poll for live attendance updates
  const fetchStatus = async () => {
    try {
      const res = await fetch(`/api/events/checkin?slug=${slug}`);
      const json = await res.json();
      if (json.success) {
        setData(json);
      }
    } catch {
      // Ignore polling errors
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!slug) return;

    // Generate QR Code URL
    const origin = typeof window !== "undefined" ? window.location.origin : "https://fossgcee.org";
    const fullCheckinUrl = `${origin}/events/${slug}/checkin`;
    setCheckinUrl(fullCheckinUrl);

    // High contrast Black & White QR Code
    QRCode.toDataURL(fullCheckinUrl, {
      width: 700,
      margin: 2,
      color: {
        dark: "#ffffff", // Pure White
        light: "#050505", // Pure Black
      },
    }).then((url) => setQrDataUrl(url));

    fetchStatus();
    const interval = setInterval(fetchStatus, 3500); // Poll every 3.5s
    return () => clearInterval(interval);
  }, [slug]);

  // Keyboard shortcut listener (F for fullscreen, A for admin drawer, Esc to close)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts if typing inside an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        if (e.key === "Escape") {
          setIsAdminDrawerOpen(false);
        }
        return;
      }

      if (e.key === "f" || e.key === "F") {
        e.preventDefault();
        toggleFullscreen();
      } else if (e.key === "a" || e.key === "A") {
        e.preventDefault();
        setIsAdminDrawerOpen((prev) => !prev);
      } else if (e.key === "Escape") {
        setIsAdminDrawerOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  // Filtered attendees for the admin drawer
  const filteredAttendees = useMemo(() => {
    if (!data?.recentCheckins) return [];
    const q = drawerSearch.toLowerCase().trim();
    if (!q) return data.recentCheckins;
    return data.recentCheckins.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.department?.toLowerCase().includes(q)
    );
  }, [data?.recentCheckins, drawerSearch]);

  if (loading && !data) {
    return (
      <div className="min-h-screen bg-[#080808] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-10 h-10 text-white/40 animate-spin" />
        <p className="font-mono text-xs text-white/40 uppercase tracking-[0.3em]">
          INITIALIZING PRESENTATION DISPLAY...
        </p>
      </div>
    );
  }

  if (!data?.event) {
    return (
      <div className="min-h-screen bg-[#080808] flex flex-col items-center justify-center space-y-4 text-white">
        <p className="font-pixel text-xl text-white">EVENT_NOT_FOUND</p>
        <Link href="/events" className="text-xs font-mono text-white/50 hover:text-white uppercase tracking-widest">
          ← Return to Events
        </Link>
      </div>
    );
  }

  const hasPoster = Boolean(data.event.poster);

  return (
    <div className="min-h-screen bg-[#080808] text-white flex flex-col justify-between p-4 sm:p-8 lg:p-10 overflow-hidden relative font-mono selection:bg-white selection:text-black">
      {/* Subtle Monochrome Grid Background Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />

      {/* Header Bar */}
      <header className="relative z-10 flex items-center justify-between gap-4 pb-5 border-b border-white/10">
        <div className="flex items-center gap-4 min-w-0">
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-white/5 border border-white/15 flex items-center justify-center text-white shrink-0 shadow-[0_0_25px_rgba(255,255,255,0.05)]">
            <QrCode className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="font-mono text-[9px] tracking-[0.25em] text-white uppercase font-bold bg-white/10 px-2.5 py-0.5 rounded-full border border-white/20">
                CHECK_IN · DESK
              </span>
              <span className="font-mono text-[9px] text-white/40 uppercase tracking-widest hidden sm:inline">
                FOSS GCEE PRESENTATION
              </span>
              {data.event.category && (
                <span className="font-mono text-[9px] text-white/60 uppercase tracking-wider bg-white/[0.04] px-2 py-0.5 rounded border border-white/10">
                  {data.event.category}
                </span>
              )}
            </div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-pixel text-white uppercase mt-1 tracking-tight truncate">
              {data.event.title}
            </h1>
          </div>
        </div>

        {/* Top Actions: Admin Attendees Shortcut & Fullscreen Toggle */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Admin Attendees Peek Button */}
          <button
            onClick={() => setIsAdminDrawerOpen((prev) => !prev)}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-2xl bg-white/[0.06] border border-white/15 hover:bg-white/15 hover:border-white/30 text-white transition-all cursor-pointer text-xs font-mono"
            title="Open Admin Check-in Drawer (Press 'A')"
          >
            <ShieldCheck className="w-4 h-4 text-white/80" />
            <span className="hidden md:inline uppercase tracking-wider text-[11px] font-bold">
              Check-in Desk
            </span>
            <span className="px-2 py-0.5 rounded-full bg-white/20 text-[10px] font-bold">
              {data.checkedInCount}
            </span>
          </button>

          {/* Fullscreen Button */}
          <button
            onClick={toggleFullscreen}
            className="p-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 text-white/70 hover:text-white transition-all cursor-pointer"
            title={isFullscreen ? "Exit Fullscreen (F)" : "Enter Fullscreen (F)"}
          >
            {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Main Grid: Prominent Event Poster (Left) & Large QR Code (Right) */}
      <main className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 xl:gap-14 my-auto py-6 items-center max-w-[1720px] mx-auto w-full">
        {/* Left Column: BIG Event Poster Showcase */}
        <div className="lg:col-span-7 xl:col-span-7 flex flex-col items-center justify-center">
          <div className="relative group w-full max-w-[680px] rounded-3xl bg-black/80 border border-white/15 p-4 sm:p-5 shadow-[0_0_60px_rgba(255,255,255,0.06)] flex flex-col items-center">
            {/* Cyber Corner Brackets */}
            <div className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-white/70" />
            <div className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-white/70" />
            <div className="absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 border-white/70" />
            <div className="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 border-white/70" />

            {/* Poster Container */}
            <div className="relative w-full h-[46vh] sm:h-[54vh] md:h-[58vh] lg:h-[62vh] xl:h-[66vh] rounded-2xl overflow-hidden bg-white/[0.02] border border-white/10 flex items-center justify-center">
              {hasPoster ? (
                <img
                  src={data.event.poster}
                  alt={`${data.event.title} Poster`}
                  className="w-full h-full object-contain rounded-2xl shadow-2xl transition-transform duration-500 hover:scale-[1.01]"
                />
              ) : (
                /* Fallback Graphic Poster when no uploaded poster is set */
                <div className="w-full h-full p-8 flex flex-col justify-between text-center relative overflow-hidden bg-gradient-to-b from-white/[0.04] to-black">
                  <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-white/[0.03] blur-3xl pointer-events-none" />
                  <div className="flex items-center justify-between text-white/40 text-[10px] uppercase tracking-widest border-b border-white/10 pb-4">
                    <span>FOSS CLUB · GCE ERODE</span>
                    <span>EVENT DISPLAY</span>
                  </div>

                  <div className="space-y-4 my-auto py-6">
                    <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center mx-auto text-white">
                      <Sparkles className="w-8 h-8" />
                    </div>
                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-pixel text-white uppercase tracking-tight leading-tight px-4">
                      {data.event.title}
                    </h2>
                    {data.event.description && (
                      <p className="text-xs sm:text-sm text-white/60 line-clamp-3 max-w-md mx-auto font-mono leading-relaxed px-4">
                        {data.event.description}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center justify-center gap-3 pt-4 border-t border-white/10 text-xs text-white/60 uppercase">
                    {data.event.startDate && (
                      <span className="flex items-center gap-1.5 bg-white/5 px-3 py-1 rounded-full border border-white/10">
                        <Calendar className="w-3.5 h-3.5 text-white/40" /> {data.event.startDate}
                      </span>
                    )}
                    {data.event.venue && (
                      <span className="flex items-center gap-1.5 bg-white/5 px-3 py-1 rounded-full border border-white/10">
                        <MapPin className="w-3.5 h-3.5 text-white/40" /> {data.event.venue}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Poster Info Bar Below */}
            <div className="w-full mt-4 pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs text-white/60 uppercase tracking-wider px-2">
              <div className="flex items-center gap-4 flex-wrap">
                {data.event.startDate && (
                  <span className="flex items-center gap-1.5 font-mono text-[11px] text-white/80">
                    <Calendar className="w-3.5 h-3.5 text-white/40" /> {data.event.startDate}
                  </span>
                )}
                {data.event.startTime && (
                  <span className="flex items-center gap-1.5 font-mono text-[11px] text-white/80">
                    <Clock className="w-3.5 h-3.5 text-white/40" /> {data.event.startTime}
                  </span>
                )}
                {data.event.venue && (
                  <span className="flex items-center gap-1.5 font-mono text-[11px] text-white/80">
                    <MapPin className="w-3.5 h-3.5 text-white/40" /> {data.event.venue}
                  </span>
                )}
              </div>

              {data.event.category && (
                <span className="inline-flex items-center gap-1 font-mono text-[10px] text-white/50 bg-white/5 px-2.5 py-0.5 rounded-full border border-white/10">
                  <Tag className="w-3 h-3 text-white/40" /> {data.event.category}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Prominent QR Code for Attendees */}
        <div className="lg:col-span-5 xl:col-span-5 flex flex-col items-center justify-center text-center space-y-6">
          <div className="relative group p-6 sm:p-8 rounded-3xl bg-black border border-white/20 shadow-[0_0_60px_rgba(255,255,255,0.08)] flex flex-col items-center max-w-[460px] w-full">
            {/* Cyber Corner Brackets */}
            <div className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-white" />
            <div className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-white" />
            <div className="absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 border-white" />
            <div className="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 border-white" />

            <div className="space-y-1 mb-5">
              <span className="font-mono text-[9px] uppercase tracking-[0.25em] text-white/40 font-bold block">
                AUDITORIUM CHECK-IN
              </span>
              <h3 className="font-pixel text-lg sm:text-xl text-white uppercase tracking-tight">
                SCAN TO CHECK IN
              </h3>
              <p className="text-[11px] text-white/50 font-mono">
                Pre-registered & spot walk-ins welcome
              </p>
            </div>

            {/* High-Contrast QR Code */}
            {qrDataUrl ? (
              <div className="p-3 rounded-2xl bg-white shadow-2xl">
                <img
                  src={qrDataUrl}
                  alt="Check-in QR Code"
                  className="w-64 sm:w-76 md:w-80 lg:w-[320px] xl:w-[360px] aspect-square rounded-xl invert"
                />
              </div>
            ) : (
              <div className="w-64 sm:w-76 md:w-80 lg:w-[320px] aspect-square flex items-center justify-center">
                <Loader2 className="w-10 h-10 text-white/40 animate-spin" />
              </div>
            )}

            {/* 3-Step Scan Instructions */}
            <div className="w-full grid grid-cols-3 gap-2 mt-6 pt-5 border-t border-white/10 text-[10px] text-white/60">
              <div className="space-y-1">
                <span className="font-pixel text-[9px] text-white block">01</span>
                <span>Open Phone Camera</span>
              </div>
              <div className="space-y-1 border-x border-white/10 px-1">
                <span className="font-pixel text-[9px] text-white block">02</span>
                <span>Scan QR & Enter Email</span>
              </div>
              <div className="space-y-1">
                <span className="font-pixel text-[9px] text-white block">03</span>
                <span>Receive Entry Pass</span>
              </div>
            </div>
          </div>

          {/* Direct URL Access Pill */}
          <div className="space-y-1.5 max-w-md w-full">
            <p className="text-[9px] text-white/30 uppercase tracking-[0.25em]">DIRECT BROWSER ACCESS</p>
            <div className="text-xs sm:text-sm text-white bg-white/[0.04] px-5 py-2.5 rounded-xl border border-white/10 font-mono select-all">
              {checkinUrl.replace(/^https?:\/\//, "")}
            </div>
          </div>
        </div>
      </main>

      {/* Admin Slide-Over Drawer: Shows Who Checked In (Privately accessible to admin) */}
      <AnimatePresence>
        {isAdminDrawerOpen && (
          <div className="fixed inset-0 z-[120] flex justify-end">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAdminDrawerOpen(false)}
              className="absolute inset-0 bg-black/70 backdrop-blur-sm cursor-pointer"
            />

            {/* Drawer Content */}
            <motion.aside
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="relative w-full sm:w-[480px] bg-[#0c0c0c] border-l border-white/15 h-full p-6 sm:p-8 flex flex-col justify-between shadow-2xl z-10 font-mono"
            >
              {/* Drawer Header */}
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-4 border-b border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white text-black font-pixel text-xs flex items-center justify-center font-bold">
                      <ShieldCheck className="w-5 h-5 text-black" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-pixel text-xs text-white uppercase">ATTENDEE_DESK</span>
                        <span className="font-mono text-[9px] text-white/40 uppercase">ORGANIZER VIEW</span>
                      </div>
                      <p className="text-[11px] text-white/60">
                        {data.checkedInCount} verified check-ins
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => setIsAdminDrawerOpen(false)}
                    className="p-2 rounded-xl text-white/40 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Search Box */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30" />
                  <input
                    type="text"
                    value={drawerSearch}
                    onChange={(e) => setDrawerSearch(e.target.value)}
                    placeholder="Search attendee by name or email..."
                    className="w-full pl-9 pr-8 py-2.5 bg-white/[0.04] border border-white/10 rounded-xl text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-white/40 font-mono"
                  />
                  {drawerSearch && (
                    <button
                      onClick={() => setDrawerSearch("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Attendee Stream List */}
              <div className="my-4 flex-1 overflow-y-auto space-y-2.5 pr-1">
                {filteredAttendees.length === 0 ? (
                  <div className="py-16 text-center space-y-2 border border-dashed border-white/10 rounded-2xl p-6">
                    <Users className="w-8 h-8 text-white/20 mx-auto" />
                    <p className="text-xs text-white/40 uppercase tracking-wider font-pixel">
                      {drawerSearch ? "NO_MATCHING_ATTENDEES" : "NO_CHECKINS_YET"}
                    </p>
                    <p className="text-[11px] text-white/30">
                      {drawerSearch
                        ? "Try clearing your search term."
                        : "Attendees scanning the QR code will appear here in real time."}
                    </p>
                  </div>
                ) : (
                  filteredAttendees.map((attendee) => (
                    <div
                      key={attendee.email + attendee.checkedInAt}
                      className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-between gap-3 hover:border-white/20 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-white text-black font-pixel text-xs flex items-center justify-center shrink-0 font-bold">
                          ✓
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-white text-xs truncate uppercase">{attendee.name}</p>
                          <p className="text-[10px] text-white/40 truncate">{attendee.email}</p>
                          {(attendee.department || attendee.year) && (
                            <p className="text-[9px] text-white/60 truncate mt-0.5">
                              {attendee.department} {attendee.year ? `· Year ${attendee.year}` : ""}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="text-right shrink-0 space-y-1">
                        <span className="inline-flex items-center gap-1 text-[9px] font-mono text-white bg-white/10 border border-white/20 px-2 py-0.5 rounded">
                          <CheckCircle2 className="w-2.5 h-2.5" /> PRESENT
                        </span>
                        <p className="text-[9px] text-white/30 font-mono">
                          {new Date(attendee.checkedInAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Drawer Bottom Actions */}
              <div className="pt-4 border-t border-white/10 space-y-2.5">
                <Link
                  href={`/admin/events/${data.event.id}/registrations`}
                  target="_blank"
                  className="w-full py-3.5 rounded-xl bg-white text-black font-pixel text-[10px] uppercase font-bold hover:bg-white/90 transition-all flex items-center justify-center gap-2 shadow-lg"
                >
                  Full Admin Check-in Portal <ExternalLink className="w-3.5 h-3.5" />
                </Link>
                <button
                  onClick={() => setIsAdminDrawerOpen(false)}
                  className="w-full py-2.5 text-center text-[10px] text-white/40 hover:text-white uppercase tracking-widest cursor-pointer"
                >
                  Close Desk Overlay (Esc)
                </button>
              </div>
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      {/* Footer Info */}
      <footer className="relative z-10 pt-4 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between text-[10px] text-white/30 gap-3 uppercase tracking-widest">
        <p>Free and Open Source Software Club · Government College of Engineering, Erode</p>
        <div className="flex items-center gap-4">
          <Link href={`/events/${slug}`} className="hover:text-white transition-colors flex items-center gap-1">
            Event Page <ExternalLink className="w-3 h-3" />
          </Link>
          <span>·</span>
          <button
            onClick={() => setIsAdminDrawerOpen(true)}
            className="hover:text-white transition-colors cursor-pointer"
          >
            Check-ins ({data.checkedInCount})
          </button>
          <span>·</span>
          <Link
            href={`/admin/events/${data.event.id}/registrations`}
            target="_blank"
            className="hover:text-white transition-colors flex items-center gap-1"
          >
            Admin Portal <ExternalLink className="w-2.5 h-2.5" />
          </Link>
        </div>
      </footer>
    </div>
  );
}
