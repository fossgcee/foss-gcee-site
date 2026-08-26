/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import {
  Maximize,
  Minimize,
  QrCode,
  Check,
  Calendar,
  MapPin,
  Loader2,
  ExternalLink
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

    // High contrast Black & White QR Code
    QRCode.toDataURL(fullCheckinUrl, {
      width: 600,
      margin: 2,
      color: {
        dark: "#ffffff", // Pure White
        light: "#050505", // Pure Black
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
      <div className="min-h-screen bg-[#080808] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-10 h-10 text-white/40 animate-spin" />
        <p className="font-mono text-xs text-white/40 uppercase tracking-[0.3em]">
          INITIALIZING PROJECTOR DISPLAY...
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

  const total = data.totalRegistrations || 1;
  const count = data.checkedInCount;
  const percent = Math.min(100, Math.round((count / total) * 100));

  return (
    <div className="min-h-screen bg-[#080808] text-white flex flex-col justify-between p-6 sm:p-12 overflow-hidden relative font-mono selection:bg-white selection:text-black">
      {/* Subtle Monochrome Grid Background Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />

      {/* Header Bar */}
      <header className="relative z-10 flex items-center justify-between gap-6 pb-6 border-b border-white/10">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/15 flex items-center justify-center text-white shadow-[0_0_25px_rgba(255,255,255,0.05)]">
            <QrCode className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <span className="font-mono text-[9px] tracking-[0.25em] text-white uppercase font-bold bg-white/10 px-2.5 py-0.5 rounded-full border border-white/20">
                LIVE_CHECK_IN
              </span>
              <span className="font-mono text-[9px] text-white/40 uppercase tracking-widest">FOSS GCEE TERMINAL</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-pixel text-white uppercase mt-1.5 tracking-tight">
              {data.event.title}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-5 text-xs text-white/50 uppercase tracking-wider">
            {data.event.startDate && (
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-white/40" /> {data.event.startDate}
              </span>
            )}
            {data.event.venue && (
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-white/40" /> {data.event.venue}
              </span>
            )}
          </div>

          <button
            onClick={toggleFullscreen}
            className="p-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 text-white/70 hover:text-white transition-all cursor-pointer"
            title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
          >
            {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Main Grid: QR Code & Live Attendance Stats */}
      <main className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 my-auto py-8 items-center">
        {/* Left Column: Black & White QR Code Box */}
        <div className="lg:col-span-6 flex flex-col items-center justify-center text-center space-y-6">
          <div className="relative group p-6 rounded-3xl bg-black border border-white/20 shadow-[0_0_50px_rgba(255,255,255,0.05)] flex flex-col items-center">
            {/* Cyber Corner Brackets */}
            <div className="absolute top-2.5 left-2.5 w-3.5 h-3.5 border-t border-l border-white" />
            <div className="absolute top-2.5 right-2.5 w-3.5 h-3.5 border-t border-r border-white" />
            <div className="absolute bottom-2.5 left-2.5 w-3.5 h-3.5 border-b border-l border-white" />
            <div className="absolute bottom-2.5 right-2.5 w-3.5 h-3.5 border-b border-r border-white" />

            {qrDataUrl ? (
              <img
                src={qrDataUrl}
                alt="Check-in QR Code"
                className="w-72 sm:w-88 md:w-[380px] aspect-square rounded-xl shadow-2xl invert"
              />
            ) : (
              <div className="w-72 sm:w-88 aspect-square flex items-center justify-center">
                <Loader2 className="w-10 h-10 text-white/40 animate-spin" />
              </div>
            )}

            <div className="mt-4 flex items-center gap-2 text-white font-mono text-[10px] uppercase tracking-widest font-bold">
              SCAN WITH YOUR PHONE CAMERA
            </div>
          </div>

          <div className="space-y-1">
            <p className="text-[10px] text-white/30 uppercase tracking-[0.2em]">DIRECT ACCESS LINK</p>
            <p className="text-xs sm:text-sm text-white bg-white/[0.03] px-5 py-2.5 rounded-xl border border-white/10 font-mono">
              {checkinUrl.replace(/^https?:\/\//, "")}
            </p>
          </div>
        </div>

        {/* Right Column: Attendance Counter & Recent Checkins Stream */}
        <div className="lg:col-span-6 space-y-8">
          {/* Big Progress Counter */}
          <div className="p-8 sm:p-10 rounded-3xl bg-white/[0.02] border border-white/10 backdrop-blur-xl space-y-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <span className="text-xs text-white/40 uppercase tracking-[0.25em]">ATTENDANCE_METRIC</span>
              <span className="font-pixel text-lg text-white">{percent}%</span>
            </div>

            <div className="flex items-baseline gap-4">
              <span className="text-6xl sm:text-7xl font-pixel text-white">{count}</span>
              <span className="text-2xl sm:text-3xl text-white/30">/ {data.totalRegistrations} CHECKED IN</span>
            </div>

            {/* Monochrome Progress Bar */}
            <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden p-0.5 border border-white/10">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${percent}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="h-full bg-white rounded-full shadow-[0_0_15px_rgba(255,255,255,0.5)]"
              />
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2 text-xs">
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1">
                <p className="text-white/40 uppercase tracking-wider text-[10px]">Verified Present</p>
                <p className="text-2xl font-pixel text-white">{count}</p>
              </div>
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1">
                <p className="text-white/40 uppercase tracking-wider text-[10px]">Pending Arrival</p>
                <p className="text-2xl font-pixel text-white/50">{Math.max(0, data.totalRegistrations - count)}</p>
              </div>
            </div>
          </div>

          {/* Live Recent Check-in Feed */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-2">
              <p className="text-[10px] text-white/40 uppercase tracking-[0.2em] flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                LIVE_ATTENDEE_STREAM
              </p>
              <span className="text-[10px] text-white/30 uppercase">AUTO_SYNC</span>
            </div>

            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              <AnimatePresence>
                {data.recentCheckins.length === 0 ? (
                  <p className="p-6 text-center text-xs text-white/20 border border-dashed border-white/10 rounded-2xl uppercase tracking-widest">
                    Awaiting attendee check-ins...
                  </p>
                ) : (
                  data.recentCheckins.slice(0, 5).map((person, idx) => (
                    <motion.div
                      key={person.email + person.checkedInAt}
                      initial={{ opacity: 0, x: 20, scale: 0.95 }}
                      animate={{ opacity: 1, x: 0, scale: 1 }}
                      transition={{ duration: 0.3, delay: idx * 0.05 }}
                      className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-7 h-7 rounded-lg bg-white text-black font-pixel text-[10px] flex items-center justify-center shrink-0 font-bold">
                          ✓
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-white text-xs truncate uppercase tracking-tight">{person.name}</p>
                          <p className="text-[10px] text-white/40 truncate">
                            {person.department} {person.year ? `· Year ${person.year}` : ""}
                          </p>
                        </div>
                      </div>
                      <span className="text-[9px] font-mono text-white/80 border border-white/20 bg-white/5 px-2.5 py-1 rounded-md shrink-0 uppercase tracking-widest">
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
      <footer className="relative z-10 pt-4 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between text-[10px] text-white/30 gap-3 uppercase tracking-widest">
        <p>Free and Open Source Software Club · Government College of Engineering, Erode</p>
        <div className="flex items-center gap-4">
          <Link href={`/events/${slug}`} className="hover:text-white transition-colors flex items-center gap-1">
            Event Page <ExternalLink className="w-3 h-3" />
          </Link>
          <span>·</span>
          <Link href="/admin/events" className="hover:text-white transition-colors">
            Admin
          </Link>
        </div>
      </footer>
    </div>
  );
}
