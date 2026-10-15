/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import {
  Calendar,
  MapPin,
  Clock,
  Loader2,
  ArrowRight,
  UserCheck,
  UserPlus,
  Check,
  AlertCircle,
  Sparkles,
  Ticket,
  Mail,
  User,
  Phone,
  Building2,
  GraduationCap,
  ChevronRight,
  RotateCcw
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

interface EventData {
  id: string;
  title: string;
  slug: string;
  venue?: string;
  startDate?: string;
  startTime?: string;
  poster?: string;
  category?: string;
  description?: string;
}

interface CheckedInParticipant {
  name: string;
  email: string;
  department?: string;
  year?: number;
  college?: string;
  checkedInAt: string;
}

const DEPARTMENTS = ["CSE", "IT", "ECE", "EEE", "MECH", "CIVIL"];
const YEARS = [
  { val: "1", label: "1st Yr" },
  { val: "2", label: "2nd Yr" },
  { val: "3", label: "3rd Yr" },
  { val: "4", label: "4th Yr" },
];

export default function AttendeeCheckinPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [event, setEvent] = useState<EventData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"existing" | "spot">("existing");

  // Form Inputs
  const [email, setEmail] = useState("");
  const [spotName, setSpotName] = useState("");
  const [spotEmail, setSpotEmail] = useState("");
  const [spotDept, setSpotDept] = useState("CSE");
  const [customDept, setCustomDept] = useState("");
  const [spotYear, setSpotYear] = useState("2");
  const [spotCollege, setSpotCollege] = useState("Government College of Engineering, Erode");
  const [showCollegeInput, setShowCollegeInput] = useState(false);
  const [spotMobile, setSpotMobile] = useState("");

  // Submission State
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [notRegisteredHint, setNotRegisteredHint] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<{
    already: boolean;
    participant: CheckedInParticipant;
  } | null>(null);

  useEffect(() => {
    if (!slug) return;
    fetch(`/api/events/checkin?slug=${slug}`)
      .then((res) => res.json())
      .then((d) => {
        if (d.success) {
          setEvent(d.event);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [slug]);

  const handleExistingCheckin = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.toLowerCase().trim();
    if (!cleanEmail) {
      setErrorMessage("Please enter your registered email address.");
      return;
    }

    setSubmitting(true);
    setErrorMessage(null);
    setNotRegisteredHint(null);

    try {
      const res = await fetch("/api/events/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventSlug: slug,
          email: cleanEmail,
        }),
      });

      const d = await res.json();
      if (!d.success) {
        if (d.notRegistered) {
          setNotRegisteredHint(cleanEmail);
          setErrorMessage("This email is not registered yet. Use Spot Registration below to register and check in instantly.");
        } else {
          setErrorMessage(d.error || "Check-in failed. Please verify your email.");
        }
        return;
      }

      setSuccessData({
        already: d.alreadyCheckedIn,
        participant: d.participant,
      });
    } catch {
      setErrorMessage("Network error. Please check your connection and retry.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSwitchToSpot = () => {
    if (notRegisteredHint) {
      setSpotEmail(notRegisteredHint);
    } else if (email) {
      setSpotEmail(email.trim().toLowerCase());
    }
    setActiveTab("spot");
    setErrorMessage(null);
    setNotRegisteredHint(null);
  };

  const handleSpotCheckin = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = spotEmail.toLowerCase().trim();
    const cleanName = spotName.trim();
    const deptToUse = spotDept === "OTHER" ? (customDept.trim() || "General") : spotDept;

    if (!cleanEmail || !cleanName) {
      setErrorMessage("Full name and email are required.");
      return;
    }

    setSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/events/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventSlug: slug,
          email: cleanEmail,
          name: cleanName,
          department: deptToUse,
          year: Number(spotYear) || 1,
          college: spotCollege.trim() || "Government College of Engineering, Erode",
          mobile: spotMobile.trim(),
          spotRegister: true,
        }),
      });

      const d = await res.json();
      if (!d.success) {
        setErrorMessage(d.error || "Spot registration and check-in failed.");
        return;
      }

      setSuccessData({
        already: d.alreadyCheckedIn,
        participant: d.participant,
      });
    } catch {
      setErrorMessage("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[100dvh] bg-[#080808] flex flex-col items-center justify-center space-y-4 px-4 font-mono text-white">
        <Loader2 className="w-9 h-9 text-white/50 animate-spin" />
        <p className="text-xs text-white/40 uppercase tracking-[0.25em]">Loading Check-in Terminal...</p>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-[100dvh] bg-[#080808] flex flex-col items-center justify-center p-6 text-center space-y-4 font-mono text-white">
        <p className="font-pixel text-xl text-white">EVENT_NOT_FOUND</p>
        <p className="text-xs text-white/40 max-w-xs">
          This check-in link may have expired or is invalid. Please verify the URL or ask an organizer.
        </p>
        <Link href="/events" className="text-xs text-white/70 hover:text-white underline uppercase tracking-wider">
          ← View All Events
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-[#070707] text-white flex flex-col justify-between p-3.5 sm:p-6 lg:p-8 font-mono selection:bg-white selection:text-black relative">
      {/* Background Ambience */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(255,255,255,0.06),transparent_70%)] pointer-events-none" />
      <div className="fixed inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:3rem_3rem] pointer-events-none" />

      {/* ── Top Event Showcase Card (Optimized for Mobile Viewing) ── */}
      <div className="max-w-md mx-auto w-full pt-2 sm:pt-4 pb-4 space-y-3 relative z-10">
        {/* Sleek FOSS Brand Pill */}
        <div className="flex items-center justify-between">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.06] border border-white/15 text-white/80 text-[10px] uppercase font-bold tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            FOSS GCEE · LIVE CHECK-IN
          </div>
          {event.category && (
            <span className="text-[10px] text-white/50 uppercase tracking-widest font-mono bg-white/[0.03] px-2.5 py-0.5 rounded-full border border-white/10">
              {event.category}
            </span>
          )}
        </div>

        {/* Compact Event Banner with Poster Preview */}
        <div className="p-3.5 sm:p-4 rounded-2xl bg-white/[0.03] border border-white/15 backdrop-blur-xl flex items-center gap-3.5 shadow-xl">
          {event.poster ? (
            <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-xl overflow-hidden bg-black border border-white/15 shrink-0 shadow-md">
              <img
                src={event.poster}
                alt={event.title}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="w-14 h-14 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center shrink-0 text-white">
              <Sparkles className="w-6 h-6" />
            </div>
          )}

          <div className="min-w-0 flex-1">
            <h1 className="text-sm sm:text-base font-bold text-white uppercase tracking-tight leading-snug line-clamp-2">
              {event.title}
            </h1>
            <div className="flex items-center gap-3 text-[10px] text-white/60 uppercase tracking-wider mt-1.5 flex-wrap">
              {event.startDate && (
                <span className="flex items-center gap-1 font-mono">
                  <Calendar className="w-3 h-3 opacity-60" /> {event.startDate}
                </span>
              )}
              {event.venue && (
                <span className="flex items-center gap-1 font-mono truncate max-w-[150px]">
                  <MapPin className="w-3 h-3 opacity-60" /> {event.venue}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Main Interactive Section: Pass or Form ── */}
      <div className="max-w-md mx-auto w-full my-auto relative z-10 pb-4">
        {successData ? (
          /* ── Premium Digital Entrance Pass (Holographic Cyber Ticket) ── */
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="relative rounded-3xl bg-[#0d0d0d] border border-white/20 p-5 sm:p-7 shadow-[0_0_50px_rgba(255,255,255,0.08)] space-y-5 overflow-hidden"
          >
            {/* Ticket Notches (Perforated ticket cutout aesthetic) */}
            <div className="absolute top-1/2 -left-3.5 -translate-y-1/2 w-6 h-6 rounded-full bg-[#070707] border-r border-white/20" />
            <div className="absolute top-1/2 -right-3.5 -translate-y-1/2 w-6 h-6 rounded-full bg-[#070707] border-l border-white/20" />

            {/* Top Pass Status & Emblem */}
            <div className="text-center space-y-2">
              <div className="w-14 h-14 rounded-2xl bg-white text-black flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(255,255,255,0.25)]">
                <Check className="w-8 h-8 stroke-[3]" />
              </div>
              <div>
                <span className="inline-block text-[10px] uppercase font-mono font-bold tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 px-3 py-1 rounded-full whitespace-nowrap">
                  {successData.already ? "ATTENDANCE ALREADY VERIFIED" : "CHECK-IN CONFIRMED"}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold font-mono text-white uppercase tracking-tight break-words pt-1 max-w-sm mx-auto leading-tight">
                {successData.participant.name}
              </h2>
            </div>

            {/* Digital Pass Stub */}
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-dashed border-white/20 text-xs space-y-3">
              <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-2.5">
                <span className="text-white/45 uppercase text-[10px] tracking-wider shrink-0 font-mono font-medium">Pass ID</span>
                <span className="font-mono text-white text-xs font-bold shrink-0">
                  PASS-{event.slug.slice(0, 4).toUpperCase()}-{Math.abs(successData.participant.email.split("").reduce((a, b) => ((a << 5) - a) + b.charCodeAt(0), 0) % 9000 + 1000)}
                </span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-3 border-b border-white/10 pb-2.5">
                <span className="text-white/45 uppercase text-[10px] tracking-wider shrink-0 font-mono font-medium">Department</span>
                <span className="text-white font-medium text-xs sm:text-right leading-snug">
                  {successData.participant.department || "General"}
                  {successData.participant.year ? ` · Yr ${successData.participant.year}` : ""}
                </span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-3 border-b border-white/10 pb-2.5">
                <span className="text-white/45 uppercase text-[10px] tracking-wider shrink-0 font-mono font-medium">Email</span>
                <span className="text-white/80 font-mono text-xs sm:text-right truncate max-w-full sm:max-w-[220px]">
                  {successData.participant.email}
                </span>
              </div>

              <div className="flex items-center justify-between gap-3 pt-0.5">
                <span className="text-white/45 uppercase text-[10px] tracking-wider shrink-0 font-mono font-medium">Timestamp</span>
                <span className="text-emerald-300 font-mono text-xs font-bold bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20 shrink-0">
                  {new Date(successData.participant.checkedInAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </div>

            {/* Instruction Notice */}
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/10 text-center text-xs text-white/60 leading-relaxed font-mono">
              🎉 You are verified! Please proceed into the hall and take your seat.
            </div>

            {/* Action Buttons */}
            <div className="pt-1 flex flex-col gap-2.5">
              <Link
                href={`/events/${slug}`}
                className="w-full py-3.5 px-4 rounded-xl bg-white text-black font-mono text-xs uppercase font-bold hover:bg-white/90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-lg"
              >
                <span>View Event Schedule</span>
                <ArrowRight className="w-4 h-4 shrink-0" />
              </Link>
              <button
                type="button"
                onClick={() => {
                  setSuccessData(null);
                  setEmail("");
                  setNotRegisteredHint(null);
                  setErrorMessage(null);
                }}
                className="w-full py-3 rounded-xl bg-white/[0.04] border border-white/10 hover:bg-white/10 text-white/70 hover:text-white font-mono text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Check In Another Attendee
              </button>
            </div>
          </motion.div>
        ) : (
          /* ── Check-in Form Container ── */
          <div className="p-4 sm:p-6 rounded-3xl bg-[#0c0c0c]/90 border border-white/15 backdrop-blur-2xl shadow-2xl space-y-4">
            {/* Segmented Tab Bar (Full Width & Big Touch Targets) */}
            <div className="grid grid-cols-2 p-1 rounded-2xl bg-white/[0.04] border border-white/10 text-xs">
              <button
                type="button"
                onClick={() => {
                  setActiveTab("existing");
                  setErrorMessage(null);
                  setNotRegisteredHint(null);
                }}
                className={`py-3 rounded-xl text-xs font-mono uppercase transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  activeTab === "existing"
                    ? "bg-white text-black font-bold shadow-md"
                    : "text-white/50 hover:text-white"
                }`}
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Pre-Registered</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab("spot");
                  setErrorMessage(null);
                  setNotRegisteredHint(null);
                }}
                className={`py-3 rounded-xl text-xs font-mono uppercase transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  activeTab === "spot"
                    ? "bg-white text-black font-bold shadow-md"
                    : "text-white/50 hover:text-white"
                }`}
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Spot / Walk-in</span>
              </button>
            </div>

            {/* Error & Warning Alert Banner */}
            {errorMessage && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/20 text-white text-xs space-y-2"
              >
                <div className="flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
                  <span className="text-white/90 leading-relaxed">{errorMessage}</span>
                </div>

                {/* Instant 1-Tap Switch to Spot Registration */}
                {notRegisteredHint && (
                  <button
                    type="button"
                    onClick={handleSwitchToSpot}
                    className="w-full mt-2 py-2.5 px-3 rounded-xl bg-white text-black font-bold text-xs uppercase flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all"
                  >
                    <span>Spot Register with {notRegisteredHint}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </motion.div>
            )}

            {/* Tab 1: Pre-Registered Email Verification */}
            {activeTab === "existing" ? (
              <form onSubmit={handleExistingCheckin} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] text-white/50 uppercase tracking-widest pl-1 block font-mono">
                    Registered Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none" />
                    <input
                      type="email"
                      required
                      inputMode="email"
                      autoComplete="email"
                      autoCapitalize="none"
                      autoCorrect="off"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. bharath@gmail.com"
                      className="w-full pl-10 pr-4 py-3.5 bg-white/[0.04] border border-white/15 rounded-2xl text-white placeholder:text-white/25 focus:outline-none focus:border-white/60 focus:ring-2 focus:ring-white/10 text-base transition-all font-mono"
                    />
                  </div>
                  <p className="text-[10px] text-white/35 pl-1 leading-normal">
                    Enter the email you used while registering for this event.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-4 bg-white text-black font-pixel text-xs uppercase font-bold rounded-2xl hover:bg-white/90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(255,255,255,0.18)] disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? (
                    <Loader2 className="w-4 h-4 animate-spin text-black" />
                  ) : (
                    <Check className="w-4 h-4 stroke-[3]" />
                  )}
                  {submitting ? "VERIFYING..." : "CONFIRM_CHECK_IN"}
                </button>

                {/* Quick Switch to Spot Link */}
                <div className="text-center pt-1">
                  <button
                    type="button"
                    onClick={() => setActiveTab("spot")}
                    className="text-[11px] text-white/40 hover:text-white transition-colors cursor-pointer"
                  >
                    Didn&apos;t register earlier? <span className="text-white underline">Spot Register here</span>
                  </button>
                </div>
              </form>
            ) : (
              /* Tab 2: Spot / Walk-in Registration (Mobile Optimized Chips & Inputs) */
              <form onSubmit={handleSpotCheckin} className="space-y-3.5">
                {/* Full Name */}
                <div className="space-y-1">
                  <label className="text-[10px] text-white/50 uppercase tracking-wider pl-1 block font-mono">
                    Full Name *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none" />
                    <input
                      type="text"
                      required
                      autoComplete="name"
                      value={spotName}
                      onChange={(e) => setSpotName(e.target.value)}
                      placeholder="e.g. Bharath Kumar"
                      className="w-full pl-10 pr-4 py-3 bg-white/[0.04] border border-white/15 rounded-xl text-white placeholder:text-white/25 focus:outline-none focus:border-white/60 text-base font-mono"
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-1">
                  <label className="text-[10px] text-white/50 uppercase tracking-wider pl-1 block font-mono">
                    Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none" />
                    <input
                      type="email"
                      required
                      inputMode="email"
                      autoComplete="email"
                      autoCapitalize="none"
                      autoCorrect="off"
                      value={spotEmail}
                      onChange={(e) => setSpotEmail(e.target.value)}
                      placeholder="e.g. bharath@gmail.com"
                      className="w-full pl-10 pr-4 py-3 bg-white/[0.04] border border-white/15 rounded-xl text-white placeholder:text-white/25 focus:outline-none focus:border-white/60 text-base font-mono"
                    />
                  </div>
                </div>

                {/* Department Selection (1-Tap Mobile Chips) */}
                <div className="space-y-1.5">
                  <label className="text-[10px] text-white/50 uppercase tracking-wider pl-1 block font-mono">
                    Department
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {DEPARTMENTS.map((dept) => (
                      <button
                        key={dept}
                        type="button"
                        onClick={() => setSpotDept(dept)}
                        className={`py-2 px-1 rounded-xl text-xs font-mono font-medium transition-all cursor-pointer ${
                          spotDept === dept
                            ? "bg-white text-black font-bold shadow-md"
                            : "bg-white/[0.04] border border-white/10 text-white/60 hover:text-white"
                        }`}
                      >
                        {dept}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Year Selection (1-Tap Segmented Pills) */}
                <div className="space-y-1.5">
                  <label className="text-[10px] text-white/50 uppercase tracking-wider pl-1 block font-mono">
                    Year of Study
                  </label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {YEARS.map((yr) => (
                      <button
                        key={yr.val}
                        type="button"
                        onClick={() => setSpotYear(yr.val)}
                        className={`py-2 px-1 rounded-xl text-xs font-mono font-medium transition-all cursor-pointer ${
                          spotYear === yr.val
                            ? "bg-white text-black font-bold shadow-md"
                            : "bg-white/[0.04] border border-white/10 text-white/60 hover:text-white"
                        }`}
                      >
                        {yr.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Mobile Phone (Optional) */}
                <div className="space-y-1">
                  <label className="text-[10px] text-white/50 uppercase tracking-wider pl-1 block font-mono">
                    Phone Number (Optional)
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none" />
                    <input
                      type="tel"
                      inputMode="tel"
                      autoComplete="tel"
                      value={spotMobile}
                      onChange={(e) => setSpotMobile(e.target.value)}
                      placeholder="e.g. 9876543210"
                      className="w-full pl-10 pr-4 py-3 bg-white/[0.04] border border-white/15 rounded-xl text-white placeholder:text-white/25 focus:outline-none focus:border-white/60 text-base font-mono"
                    />
                  </div>
                </div>

                {/* College (Collapsible / Customizable) */}
                <div className="pt-1">
                  {showCollegeInput ? (
                    <div className="space-y-1">
                      <label className="text-[10px] text-white/50 uppercase tracking-wider pl-1 block font-mono">
                        College / Institution
                      </label>
                      <div className="relative">
                        <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none" />
                        <input
                          type="text"
                          value={spotCollege}
                          onChange={(e) => setSpotCollege(e.target.value)}
                          placeholder="College name"
                          className="w-full pl-10 pr-4 py-2.5 bg-white/[0.04] border border-white/15 rounded-xl text-xs text-white placeholder:text-white/25 focus:outline-none focus:border-white/60 font-mono"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between text-[11px] text-white/40 px-1">
                      <span className="truncate max-w-[260px]">GCE Erode</span>
                      <button
                        type="button"
                        onClick={() => setShowCollegeInput(true)}
                        className="text-white/70 hover:text-white underline text-[10px] uppercase font-mono"
                      >
                        Change College
                      </button>
                    </div>
                  )}
                </div>

                {/* Submit Spot Registration Button */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-4 mt-2 bg-white text-black font-pixel text-xs uppercase font-bold rounded-2xl hover:bg-white/90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(255,255,255,0.18)] disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? (
                    <Loader2 className="w-4 h-4 animate-spin text-black" />
                  ) : (
                    <UserPlus className="w-4 h-4" />
                  )}
                  {submitting ? "REGISTERING..." : "REGISTER_AND_CHECK_IN"}
                </button>
              </form>
            )}
          </div>
        )}
      </div>

      {/* ── Footer ── */}
      <footer className="max-w-md mx-auto w-full pt-4 pb-2 text-center text-[10px] text-white/30 uppercase tracking-widest relative z-10 font-mono">
        Free and Open Source Software Club · GCE Erode
      </footer>
    </div>
  );
}
