/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useEffect, useMemo, useRef } from "react";
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
  ShieldCheck,
  CheckCircle2,
  ChevronDown,
  Check,
  Palette
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import QRCode from "qrcode";

export type ProjectorTheme = "sakura" | "cyber" | "aurora" | "synthwave" | "noir";

export interface ThemeConfig {
  id: ProjectorTheme;
  name: string;
  emoji: string;
  description: string;
  bgClass: string;
  glowBg: string;
  accentBorder: string;
  accentBadge: string;
  accentText: string;
  cornerColor: string;
  qrBackdrop: string;
  qrBorder: string;
}

export const THEMES: Record<ProjectorTheme, ThemeConfig> = {
  sakura: {
    id: "sakura",
    name: "Cherry Blossom",
    emoji: "🌸",
    description: "Falling sakura petals with soft rose glow",
    bgClass: "bg-[#0b0509]",
    glowBg: "radial-gradient(ellipse 90% 70% at 50% 15%, rgba(244, 114, 182, 0.14), transparent 70%)",
    accentBorder: "border-pink-500/30",
    accentBadge: "bg-pink-500/15 border-pink-400/30 text-pink-200",
    accentText: "text-pink-300",
    cornerColor: "border-pink-400/90",
    qrBackdrop: "bg-[#0c060a]/90 border-pink-500/30 shadow-[0_0_60px_rgba(244,114,182,0.18)]",
    qrBorder: "border-pink-400/80",
  },
  cyber: {
    id: "cyber",
    name: "Cyber Matrix",
    emoji: "⚡",
    description: "Neon emerald digital grid & high-tech terminal",
    bgClass: "bg-[#050906]",
    glowBg: "radial-gradient(ellipse 90% 70% at 50% 15%, rgba(16, 185, 129, 0.14), transparent 70%)",
    accentBorder: "border-emerald-500/30",
    accentBadge: "bg-emerald-500/15 border-emerald-400/30 text-emerald-200",
    accentText: "text-emerald-300",
    cornerColor: "border-emerald-400/90",
    qrBackdrop: "bg-[#050906]/90 border-emerald-500/30 shadow-[0_0_60px_rgba(16,185,129,0.18)]",
    qrBorder: "border-emerald-400/80",
  },
  aurora: {
    id: "aurora",
    name: "Celestial Aurora",
    emoji: "🌌",
    description: "Northern lights gradients & cosmic stardust",
    bgClass: "bg-[#05060d]",
    glowBg: "radial-gradient(ellipse 90% 70% at 50% 15%, rgba(99, 102, 241, 0.16), transparent 70%)",
    accentBorder: "border-indigo-500/30",
    accentBadge: "bg-indigo-500/15 border-indigo-400/30 text-indigo-200",
    accentText: "text-indigo-300",
    cornerColor: "border-indigo-400/90",
    qrBackdrop: "bg-[#05060d]/90 border-indigo-500/30 shadow-[0_0_60px_rgba(99,102,241,0.18)]",
    qrBorder: "border-indigo-400/80",
  },
  synthwave: {
    id: "synthwave",
    name: "Sunset Synth",
    emoji: "🌅",
    description: "Warm amber retrowave dusk & golden horizon",
    bgClass: "bg-[#0a0508]",
    glowBg: "radial-gradient(ellipse 90% 70% at 50% 15%, rgba(245, 158, 11, 0.14), transparent 70%)",
    accentBorder: "border-amber-500/30",
    accentBadge: "bg-amber-500/15 border-amber-400/30 text-amber-200",
    accentText: "text-amber-300",
    cornerColor: "border-amber-400/90",
    qrBackdrop: "bg-[#0a0508]/90 border-amber-500/30 shadow-[0_0_60px_rgba(245,158,11,0.18)]",
    qrBorder: "border-amber-400/80",
  },
  noir: {
    id: "noir",
    name: "Minimal Noir",
    emoji: "🪨",
    description: "Pitch black minimal contrast for pure focus",
    bgClass: "bg-[#060606]",
    glowBg: "radial-gradient(ellipse 90% 70% at 50% 15%, rgba(255, 255, 255, 0.05), transparent 70%)",
    accentBorder: "border-white/20",
    accentBadge: "bg-white/10 border-white/20 text-white",
    accentText: "text-white",
    cornerColor: "border-white/80",
    qrBackdrop: "bg-black/95 border-white/20 shadow-[0_0_60px_rgba(255,255,255,0.06)]",
    qrBorder: "border-white/80",
  },
};

/**
 * 60fps High-Performance Atmospheric Canvas
 * Renders realistic falling Sakura petals, cosmic aurora dust, or cyber matrix motes.
 */
function AtmosphericCanvas({ theme }: { theme: ProjectorTheme }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    // 🌸 Sakura Cherry Blossom Petal State
    interface SakuraPetal {
      x: number;
      y: number;
      size: number;
      speedY: number;
      speedX: number;
      rotation: number;
      rotationSpeed: number;
      sway: number;
      swaySpeed: number;
      flip: number;
      flipSpeed: number;
      color: string;
      opacity: number;
    }

    const petalColors = [
      "rgba(255, 182, 193,", // Light pink
      "rgba(255, 192, 203,", // Classic pink
      "rgba(255, 218, 224,", // Soft blossom
      "rgba(244, 114, 182,", // Vivid rose
      "rgba(251, 207, 232,", // Pale sakura
    ];

    const sakuraPetals: SakuraPetal[] = Array.from({ length: 48 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 9 + 8,
      speedY: Math.random() * 1.3 + 0.7,
      speedX: Math.random() * 1.2 + 0.4,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.025,
      sway: Math.random() * Math.PI * 2,
      swaySpeed: Math.random() * 0.025 + 0.015,
      flip: Math.random() * Math.PI,
      flipSpeed: Math.random() * 0.035 + 0.015,
      color: petalColors[Math.floor(Math.random() * petalColors.length)],
      opacity: Math.random() * 0.45 + 0.4,
    }));

    // 🌌 Stardust / Ambient Mote Particles (Aurora / Cyber / Synthwave)
    interface StardustParticle {
      x: number;
      y: number;
      size: number;
      speedY: number;
      speedX: number;
      opacity: number;
      pulse: number;
      pulseSpeed: number;
      color: string;
    }

    const starColors =
      theme === "cyber"
        ? ["rgba(52, 211, 153,", "rgba(16, 185, 129,", "rgba(110, 231, 183,"]
        : theme === "aurora"
        ? ["rgba(99, 102, 241,", "rgba(45, 212, 191,", "rgba(168, 85, 247,"]
        : theme === "synthwave"
        ? ["rgba(251, 146, 60,", "rgba(244, 63, 94,", "rgba(250, 204, 21,"]
        : ["rgba(255, 255, 255,"];

    const stardust: StardustParticle[] = Array.from({ length: 55 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 2.2 + 1,
      speedY: theme === "synthwave" ? -(Math.random() * 0.5 + 0.2) : Math.random() * 0.5 + 0.2,
      speedX: (Math.random() - 0.5) * 0.35,
      opacity: Math.random() * 0.7 + 0.2,
      pulse: Math.random() * Math.PI * 2,
      pulseSpeed: Math.random() * 0.03 + 0.015,
      color: starColors[Math.floor(Math.random() * starColors.length)],
    }));

    // Draw realistic natural cherry blossom petal
    const drawSakuraPetal = (p: SakuraPetal) => {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      ctx.scale(1, Math.cos(p.flip));

      ctx.beginPath();
      ctx.moveTo(0, -p.size);
      ctx.bezierCurveTo(p.size * 0.8, -p.size * 0.5, p.size * 0.85, p.size * 0.6, 0, p.size);
      ctx.bezierCurveTo(-p.size * 0.85, p.size * 0.6, -p.size * 0.8, -p.size * 0.5, 0, -p.size);
      ctx.closePath();

      ctx.fillStyle = `${p.color}${p.opacity})`;
      ctx.shadowColor = "rgba(255, 182, 193, 0.45)";
      ctx.shadowBlur = 5;
      ctx.fill();

      ctx.restore();
    };

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      if (theme === "sakura") {
        sakuraPetals.forEach((p) => {
          p.sway += p.swaySpeed;
          p.flip += p.flipSpeed;
          p.rotation += p.rotationSpeed;
          p.x += Math.sin(p.sway) * 1.6 + p.speedX;
          p.y += p.speedY;

          // Wrap around seamlessly
          if (p.y > height + 25) {
            p.y = -25;
            p.x = Math.random() * width;
          }
          if (p.x > width + 25) {
            p.x = -25;
          }

          drawSakuraPetal(p);
        });
      } else if (theme !== "noir") {
        stardust.forEach((s) => {
          s.pulse += s.pulseSpeed;
          const currentOpacity = Math.max(0.1, Math.min(1, s.opacity + Math.sin(s.pulse) * 0.25));
          s.y += s.speedY;
          s.x += s.speedX;

          if (s.y > height + 10) {
            s.y = -10;
            s.x = Math.random() * width;
          } else if (s.y < -10) {
            s.y = height + 10;
            s.x = Math.random() * width;
          }

          ctx.beginPath();
          ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
          ctx.fillStyle = `${s.color}${currentOpacity})`;
          ctx.shadowColor = `${s.color}0.8)`;
          ctx.shadowBlur = s.size * 3;
          ctx.fill();
        });
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
    };
  }, [theme]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ opacity: 0.95 }}
    />
  );
}

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
  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);
  const [drawerSearch, setDrawerSearch] = useState("");

  // Default theme is "sakura" (Cherry Blossom) as requested!
  const [theme, setTheme] = useState<ProjectorTheme>("sakura");

  // Read saved theme from localStorage on client mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("foss_projector_theme") as ProjectorTheme | null;
      if (saved && THEMES[saved]) {
        setTheme(saved);
      }
    }
  }, []);

  const activeTheme = THEMES[theme] || THEMES.sakura;

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
      width: 800,
      margin: 2,
      color: {
        dark: "#ffffff",
        light: "#050505",
      },
    }).then((url) => setQrDataUrl(url));

    fetchStatus();
    const interval = setInterval(fetchStatus, 3500); // Poll every 3.5s
    return () => clearInterval(interval);
  }, [slug]);

  // Keyboard shortcut listener (F for fullscreen, A for admin drawer, T for theme toggle, Esc to close)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        if (e.key === "Escape") {
          setIsAdminDrawerOpen(false);
          setIsThemeMenuOpen(false);
        }
        return;
      }

      if (e.key === "f" || e.key === "F") {
        e.preventDefault();
        toggleFullscreen();
      } else if (e.key === "a" || e.key === "A") {
        e.preventDefault();
        setIsAdminDrawerOpen((prev) => !prev);
      } else if (e.key === "t" || e.key === "T") {
        e.preventDefault();
        // Cycle to next theme
        const themeKeys: ProjectorTheme[] = ["sakura", "cyber", "aurora", "synthwave", "noir"];
        const nextIdx = (themeKeys.indexOf(theme) + 1) % themeKeys.length;
        const nextTheme = themeKeys[nextIdx];
        setTheme(nextTheme);
        localStorage.setItem("foss_projector_theme", nextTheme);
      } else if (e.key === "Escape") {
        setIsAdminDrawerOpen(false);
        setIsThemeMenuOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [theme]);

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
      <div className="min-h-screen bg-[#080808] flex flex-col items-center justify-center space-y-4 font-mono">
        <Loader2 className="w-10 h-10 text-white/40 animate-spin" />
        <p className="text-xs text-white/40 uppercase tracking-[0.3em]">
          INITIALIZING PRESENTATION DISPLAY...
        </p>
      </div>
    );
  }

  if (!data?.event) {
    return (
      <div className="min-h-screen bg-[#080808] flex flex-col items-center justify-center space-y-4 text-white font-mono">
        <p className="font-pixel text-xl text-white">EVENT_NOT_FOUND</p>
        <Link href="/events" className="text-xs text-white/50 hover:text-white uppercase tracking-widest">
          ← Return to Events
        </Link>
      </div>
    );
  }

  const hasPoster = Boolean(data.event.poster);

  return (
    <div
      className={`min-h-screen ${activeTheme.bgClass} text-white flex flex-col justify-between p-3 sm:p-6 lg:p-8 overflow-hidden relative font-mono selection:bg-white selection:text-black transition-colors duration-700`}
    >
      {/* Dynamic 60fps Atmospheric Canvas (Sakura petals / Aurora dust / Matrix motes) */}
      <AtmosphericCanvas theme={theme} />

      {/* Atmospheric Radial Ambient Glow */}
      <div
        className="fixed inset-0 pointer-events-none transition-all duration-1000 z-0"
        style={{ background: activeTheme.glowBg }}
      />

      {/* Subtle Monochrome / Cyber Grid Background Pattern */}
      <div className="fixed inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none z-0" />

      {/* ── Compact, Clean Header Bar (Clean & uncluttered, no clumsy oversized pixel title!) ── */}
      <header className="relative z-20 flex items-center justify-between gap-4 pb-3 border-b border-white/10">
        <div className="flex items-center gap-3 min-w-0">
          {/* FOSS Club Logo Badge */}
          <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/15 flex items-center justify-center text-white shrink-0 shadow-lg">
            <QrCode className="w-4 h-4 text-white/90" />
          </div>

          <div className="flex items-center gap-2.5 min-w-0 flex-wrap">
            <span className="text-[10px] sm:text-[11px] font-bold tracking-widest text-white uppercase font-mono">
              FOSS GCEE
            </span>
            <span className="text-white/30 hidden sm:inline">/</span>
            <span className={`text-[9px] uppercase tracking-widest font-mono px-2 py-0.5 rounded-full border ${activeTheme.accentBadge}`}>
              AUDITORIUM CHECK-IN
            </span>
            {data.event.category && (
              <span className="text-[9px] text-white/50 uppercase tracking-wider hidden md:inline font-mono">
                {data.event.category}
              </span>
            )}
          </div>
        </div>

        {/* Top Actions: Theme Switcher, Check-in Desk Peek & Fullscreen */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Theme Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsThemeMenuOpen((prev) => !prev)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/[0.05] border ${activeTheme.accentBorder} hover:bg-white/10 text-white transition-all cursor-pointer text-xs font-mono`}
              title="Change Stage Theme (Press 'T')"
            >
              <Palette className="w-3.5 h-3.5 opacity-70" />
              <span className="text-sm leading-none">{activeTheme.emoji}</span>
              <span className="hidden sm:inline text-[10px] uppercase font-bold tracking-wider">
                {activeTheme.name}
              </span>
              <ChevronDown className={`w-3 h-3 opacity-60 transition-transform duration-200 ${isThemeMenuOpen ? "rotate-180" : ""}`} />
            </button>

            {/* Dropdown Menu */}
            <AnimatePresence>
              {isThemeMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 mt-2 w-64 rounded-2xl bg-[#0f0f0f]/95 border border-white/20 p-2 shadow-2xl z-50 backdrop-blur-xl font-mono text-xs"
                >
                  <div className="px-3 py-2 text-[9px] text-white/40 uppercase tracking-widest border-b border-white/10 flex items-center justify-between">
                    <span>STAGE THEME</span>
                    <span className="text-[8px] bg-white/10 px-1.5 py-0.5 rounded">KEY: T</span>
                  </div>
                  <div className="py-1 space-y-1">
                    {Object.values(THEMES).map((th) => (
                      <button
                        key={th.id}
                        onClick={() => {
                          setTheme(th.id);
                          localStorage.setItem("foss_projector_theme", th.id);
                          setIsThemeMenuOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all cursor-pointer text-left ${
                          theme === th.id
                            ? "bg-white/15 text-white font-bold border border-white/20"
                            : "text-white/70 hover:bg-white/5 hover:text-white"
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="text-base">{th.emoji}</span>
                          <div>
                            <p className="text-xs font-medium">{th.name}</p>
                            <p className="text-[9px] text-white/40">{th.description}</p>
                          </div>
                        </div>
                        {theme === th.id && <Check className="w-3.5 h-3.5 text-white shrink-0" />}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Admin Attendees Peek Button */}
          <button
            onClick={() => setIsAdminDrawerOpen((prev) => !prev)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/[0.05] border border-white/15 hover:bg-white/15 hover:border-white/30 text-white transition-all cursor-pointer text-xs font-mono"
            title="Open Admin Check-in Drawer (Press 'A')"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-white/80" />
            <span className="hidden md:inline uppercase tracking-wider text-[10px] font-bold">
              Check-in Desk
            </span>
            <span className="px-1.5 py-0.5 rounded-full bg-white/20 text-[9px] font-bold">
              {data.checkedInCount}
            </span>
          </button>

          {/* Fullscreen Button */}
          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white/70 hover:text-white transition-all cursor-pointer"
            title={isFullscreen ? "Exit Fullscreen (F)" : "Enter Fullscreen (F)"}
          >
            {isFullscreen ? <Minimize className="w-3.5 h-3.5" /> : <Maximize className="w-3.5 h-3.5" />}
          </button>
        </div>
      </header>

      {/* ── Main Stage: Gigantic Event Poster (Left) & Prominent QR Code (Right) ── */}
      <main className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-5 xl:gap-8 items-center my-auto py-3 max-w-[1760px] mx-auto w-full flex-1">
        {/* Left Column: BIG Event Poster (Scaled up to maximum screen presence!) */}
        <div className="lg:col-span-7 xl:col-span-8 flex flex-col items-center justify-center w-full h-full">
          <div
            className={`relative group w-full rounded-3xl ${activeTheme.qrBackdrop} border ${activeTheme.accentBorder} p-3 sm:p-4 md:p-5 flex flex-col items-center justify-between backdrop-blur-xl transition-all duration-500 shadow-2xl h-[65vh] sm:h-[72vh] lg:h-[78vh] xl:h-[82vh] 2xl:h-[84vh]`}
          >
            {/* Cyber Corner Reticles in Theme Accent Color */}
            <div className={`absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 ${activeTheme.cornerColor}`} />
            <div className={`absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 ${activeTheme.cornerColor}`} />
            <div className={`absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 ${activeTheme.cornerColor}`} />
            <div className={`absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 ${activeTheme.cornerColor}`} />

            {/* Poster Canvas / Image Container (takes 100% available vertical & horizontal space!) */}
            <div className="relative w-full flex-1 min-h-0 flex items-center justify-center overflow-hidden rounded-2xl">
              {hasPoster ? (
                <img
                  src={data.event.poster}
                  alt={`${data.event.title} Poster`}
                  className="w-full h-full object-contain rounded-xl drop-shadow-[0_20px_50px_rgba(0,0,0,0.85)] transition-transform duration-500 hover:scale-[1.01]"
                />
              ) : (
                /* Fallback Stylized Graphic Poster when no uploaded poster is set */
                <div className="w-full h-full p-8 flex flex-col justify-between text-center relative overflow-hidden bg-gradient-to-b from-white/[0.04] to-black rounded-xl">
                  <div className="flex items-center justify-between text-white/40 text-[10px] uppercase tracking-widest border-b border-white/10 pb-3">
                    <span>FOSS CLUB · GCE ERODE</span>
                    <span className={activeTheme.accentText}>LIVE EVENT DISPLAY</span>
                  </div>

                  <div className="space-y-4 my-auto py-6">
                    <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center mx-auto text-white">
                      <Sparkles className="w-8 h-8" />
                    </div>
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-pixel text-white uppercase tracking-tight leading-tight px-4">
                      {data.event.title}
                    </h2>
                    {data.event.description && (
                      <p className="text-xs sm:text-sm text-white/60 line-clamp-3 max-w-lg mx-auto font-mono leading-relaxed px-4">
                        {data.event.description}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center justify-center gap-3 pt-3 border-t border-white/10 text-xs text-white/60 uppercase">
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

            {/* Poster Metadata Ribbon Below Image */}
            <div className="w-full mt-3 pt-2.5 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs text-white/70 uppercase tracking-wider px-2">
              <div className="flex items-center gap-4 flex-wrap">
                {data.event.startDate && (
                  <span className="flex items-center gap-1.5 font-mono text-[11px] text-white/90">
                    <Calendar className="w-3.5 h-3.5 opacity-60" /> {data.event.startDate}
                  </span>
                )}
                {data.event.startTime && (
                  <span className="flex items-center gap-1.5 font-mono text-[11px] text-white/90">
                    <Clock className="w-3.5 h-3.5 opacity-60" /> {data.event.startTime}
                  </span>
                )}
                {data.event.venue && (
                  <span className="flex items-center gap-1.5 font-mono text-[11px] text-white/90">
                    <MapPin className="w-3.5 h-3.5 opacity-60" /> {data.event.venue}
                  </span>
                )}
              </div>

              {data.event.category && (
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider border ${activeTheme.accentBadge}`}>
                  {data.event.category}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: High-Contrast QR Code for Scanning */}
        <div className="lg:col-span-5 xl:col-span-4 flex flex-col items-center justify-center text-center space-y-4 w-full">
          <div
            className={`relative group p-6 sm:p-7 rounded-3xl ${activeTheme.qrBackdrop} border ${activeTheme.accentBorder} flex flex-col items-center max-w-[450px] w-full backdrop-blur-xl transition-all duration-500`}
          >
            {/* Cyber Corner Reticles */}
            <div className={`absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 ${activeTheme.cornerColor}`} />
            <div className={`absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 ${activeTheme.cornerColor}`} />
            <div className={`absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 ${activeTheme.cornerColor}`} />
            <div className={`absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 ${activeTheme.cornerColor}`} />

            <div className="space-y-1 mb-4">
              <span className={`font-mono text-[9px] uppercase tracking-[0.25em] font-bold block ${activeTheme.accentText}`}>
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
              <div className="p-3.5 rounded-2xl bg-white shadow-2xl transition-transform hover:scale-[1.02]">
                <img
                  src={qrDataUrl}
                  alt="Check-in QR Code"
                  className="w-64 sm:w-72 md:w-80 lg:w-[280px] xl:w-[320px] aspect-square rounded-xl invert"
                />
              </div>
            ) : (
              <div className="w-64 sm:w-72 aspect-square flex items-center justify-center">
                <Loader2 className="w-10 h-10 text-white/40 animate-spin" />
              </div>
            )}

            {/* 3-Step Scan Instructions */}
            <div className="w-full grid grid-cols-3 gap-2 mt-5 pt-4 border-t border-white/10 text-[10px] text-white/60">
              <div className="space-y-1">
                <span className="font-pixel text-[9px] text-white block">01</span>
                <span>Open Camera</span>
              </div>
              <div className="space-y-1 border-x border-white/10 px-1">
                <span className="font-pixel text-[9px] text-white block">02</span>
                <span>Scan & Enter Email</span>
              </div>
              <div className="space-y-1">
                <span className="font-pixel text-[9px] text-white block">03</span>
                <span>Receive Pass</span>
              </div>
            </div>
          </div>

          {/* Direct URL Access Pill */}
          <div className="space-y-1 max-w-[450px] w-full">
            <p className="text-[9px] text-white/30 uppercase tracking-[0.25em]">DIRECT BROWSER ACCESS</p>
            <div className="text-xs text-white/90 bg-white/[0.04] px-4 py-2.5 rounded-xl border border-white/10 font-mono select-all truncate">
              {checkinUrl.replace(/^https?:\/\//, "")}
            </div>
          </div>
        </div>
      </main>

      {/* ── Admin Slide-Over Drawer: Privately peek who has checked in (Hotkey 'A') ── */}
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

      {/* ── Footer Bar ── */}
      <footer className="relative z-10 pt-3 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between text-[10px] text-white/30 gap-3 uppercase tracking-widest">
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
