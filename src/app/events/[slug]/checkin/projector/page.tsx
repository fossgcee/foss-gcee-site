/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import {
  Users,
  Sparkles,
  Maximize,
  Minimize,
  QrCode,
  CheckCircle2,
  Calendar,
  MapPin,
  Loader2,
  ArrowLeft,
  ExternalLink,
  Wifi
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

    QRCode.toDataURL(fullCheckinUrl, {
      width: 600,
      margin: 2,
      color: {
        dark: "#10b981", // Emerald 500
        light: "#050505", // Dark background
      },
    }).then((url) => setQrDataUrl(url));

    fetchStatus();
    const interval = setInterval(fetchStatus, 3000); // Poll every 3s
    return () => clearInterval(interval);
  }, [slug]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  if (loading && !data) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-12 h-12 text-emerald-400 animate-spin" />
        <p className="font-mono text-sm text-emerald-400/60 uppercase tracking-[0.3em]">
          Initializing Projector Check-In Display...
        </p>
      </div>
    );
  }

  if (!data?.event) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center space-y-4 text-white">
        <p className="font-pixel text-xl text-red-400">EVENT_NOT_FOUND</p>
        <Link href="/events" className="text-xs font-mono text-white/50 hover:text-white">
          ← Return to Events
        </Link>
      </div>
    );
  }

  const total = data.totalRegistrations || 1;
  const count = data.checkedInCount;
  const percent = Math.min(100, Math.round((count / total) * 100));

  return (
    <div className="min-h-screen bg-[#030303] text-white flex flex-col justify-between p-6 sm:p-12 overflow-hidden relative selection:bg-emerald-500 selection:text-black">
      {/* Background glow ambiance */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-emerald-500/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Header Bar */}
      <header className="relative z-10 flex items-center justify-between gap-6 pb-6 border-b border-white/10">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shadow-[0_0_25px_rgba(16,185,129,0.2)]">
            <QrCode className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <span className="font-mono text-[10px] tracking-[0.25em] text-emerald-400 uppercase font-bold bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                LIVE_CHECK_IN
              </span>
              <span className="font-mono text-[10px] text-white/40 uppercase">FOSS GCEE EVENT TERMINAL</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-pixel text-white uppercase mt-1 tracking-tight">
              {data.event.title}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-4 text-xs font-mono text-white/50 uppercase">
            {data.event.startDate && (
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-emerald-400" /> {data.event.startDate}
              </span>
            )}
            {data.event.venue && (
              <span className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-emerald-400" /> {data.event.venue}
              </span>
            )}
          </div>

          <button
            onClick={toggleFullscreen}
            className="p-3 rounded-2xl bg-white/[0.04] border border-white/10 hover:bg-white/10 text-white transition-all cursor-pointer"
            title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
          >
            {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Main Grid: QR Code & Live Attendance Stats */}
      <main className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 my-auto py-8 items-center">
        {/* Left Column: Huge QR Code Box */}
        <div className="lg:col-span-6 flex flex-col items-center justify-center text-center space-y-6">
          <div className="relative group p-6 rounded-[36px] bg-black/80 border-2 border-emerald-500/30 shadow-[0_0_80px_rgba(16,185,129,0.15)] flex flex-col items-center">
            {/* Corner Cyber Accents */}
            <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-emerald-400" />
            <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-emerald-400" />
            <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-emerald-400" />
            <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-emerald-400" />

            {qrDataUrl ? (
              <img
                src={qrDataUrl}
                alt="Check-in QR Code"
                className="w-72 sm:w-96 md:w-[400px] aspect-square rounded-2xl shadow-2xl"
              />
            ) : (
              <div className="w-72 sm:w-96 aspect-square flex items-center justify-center">
                <Loader2 className="w-12 h-12 text-emerald-400 animate-spin" />
              </div>
            )}

            <div className="mt-4 flex items-center gap-2 text-emerald-400 font-mono text-xs uppercase tracking-widest font-bold">
              <Sparkles className="w-4 h-4 animate-pulse" /> SCAN WITH ANY PHONE CAMERA
            </div>
          </div>

          <div className="space-y-1">
            <p className="font-mono text-xs text-white/40 uppercase tracking-widest">Direct Link</p>
            <p className="font-mono text-sm sm:text-base text-white/90 bg-white/[0.03] px-4 py-2 rounded-xl border border-white/10">
              {checkinUrl.replace(/^https?:\/\//, "")}
            </p>
          </div>
        </div>

        {/* Right Column: Attendance Counter & Recent Checkins Stream */}
        <div className="lg:col-span-6 space-y-8">
          {/* Big Progress Counter */}
          <div className="p-8 sm:p-10 rounded-[32px] bg-white/[0.02] border border-white/10 backdrop-blur-xl space-y-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs text-white/40 uppercase tracking-[0.25em]">ATTENDANCE_METRIC</span>
              <span className="font-pixel text-xl text-emerald-400">{percent}%</span>
            </div>

            <div className="flex items-baseline gap-4">
              <span className="text-6xl sm:text-7xl font-pixel text-white">{count}</span>
              <span className="text-2xl sm:text-3xl font-mono text-white/30">/ {data.totalRegistrations} CHECKED IN</span>
            </div>

            {/* Custom Progress Bar */}
            <div className="w-full h-4 bg-white/[0.05] rounded-full overflow-hidden p-0.5 border border-white/10">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${percent}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="h-full bg-gradient-to-r from-emerald-500 to-emerald-300 rounded-full shadow-[0_0_20px_rgba(16,185,129,0.8)]"
              />
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2 text-xs font-mono">
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1">
                <p className="text-white/40 uppercase tracking-wider text-[10px]">Verified Check-Ins</p>
                <p className="text-2xl font-pixel text-emerald-400">{count}</p>
              </div>
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1">
                <p className="text-white/40 uppercase tracking-wider text-[10px]">Awaiting Arrival</p>
                <p className="text-2xl font-pixel text-white/60">{Math.max(0, data.totalRegistrations - count)}</p>
              </div>
            </div>
          </div>

          {/* Live Recent Check-in Feed */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-2">
              <p className="font-mono text-[10px] text-white/40 uppercase tracking-[0.2em] flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                LIVE_ATTENDEE_FEED
              </p>
              <span className="font-mono text-[10px] text-white/30 uppercase">Auto-refreshing</span>
            </div>

            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              <AnimatePresence>
                {data.recentCheckins.length === 0 ? (
                  <p className="p-6 text-center font-mono text-xs text-white/20 border border-dashed border-white/10 rounded-2xl uppercase">
                    Awaiting first attendee check-in...
                  </p>
                ) : (
                  data.recentCheckins.slice(0, 5).map((person, idx) => (
                    <motion.div
                      key={person.email + person.checkedInAt}
                      initial={{ opacity: 0, x: 20, scale: 0.95 }}
                      animate={{ opacity: 1, x: 0, scale: 1 }}
                      transition={{ duration: 0.3, delay: idx * 0.05 }}
                      className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 font-pixel text-xs flex items-center justify-center shrink-0">
                          ✓
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-white text-xs truncate uppercase">{person.name}</p>
                          <p className="text-[10px] font-mono text-white/40 truncate">
                            {person.department} {person.year ? `· Year ${person.year}` : ""}
                          </p>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono text-emerald-300 font-bold bg-emerald-500/20 px-2.5 py-1 rounded-lg shrink-0 uppercase">
                        CHECKED IN
                      </span>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </main>

      {/* Footer Info */}
      <footer className="relative z-10 pt-4 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between text-xs font-mono text-white/30 gap-3">
        <p className="uppercase tracking-widest">
          Free and Open Source Software Club · Government College of Engineering, Erode
        </p>
        <div className="flex items-center gap-4">
          <Link href={`/events/${slug}`} className="hover:text-white transition-colors uppercase flex items-center gap-1">
            Event Info <ExternalLink className="w-3 h-3" />
          </Link>
          <span>·</span>
          <Link href="/admin/events" className="hover:text-white transition-colors uppercase">
            Admin Panel
          </Link>
        </div>
      </footer>
    </div>
  );
}
