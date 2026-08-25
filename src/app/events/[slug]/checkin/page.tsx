/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import {
  CheckCircle2,
  AlertCircle,
  Loader2,
  Calendar,
  MapPin,
  Sparkles,
  ArrowRight,
  UserCheck,
  UserPlus,
  ArrowLeft,
  ExternalLink,
  ShieldCheck
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
}

interface CheckedInParticipant {
  name: string;
  email: string;
  department?: string;
  year?: number;
  college?: string;
  checkedInAt: string;
}

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
  const [spotYear, setSpotYear] = useState("2");
  const [spotCollege, setSpotCollege] = useState("Government College of Engineering, Erode");
  const [spotMobile, setSpotMobile] = useState("");

  // Submission State
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
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
          setErrorMessage("We couldn't find this email in our pre-registered list. Please use the 'Spot Registration' tab below!");
          setSpotEmail(cleanEmail);
        } else {
          setErrorMessage(d.error || "Check-in failed. Please try again.");
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

  const handleSpotCheckin = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = spotEmail.toLowerCase().trim();
    const cleanName = spotName.trim();

    if (!cleanEmail || !cleanName) {
      setErrorMessage("Name and email are required for registration.");
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
          department: spotDept,
          year: Number(spotYear) || 1,
          college: spotCollege,
          mobile: spotMobile,
          spotRegister: true,
        }),
      });

      const d = await res.json();
      if (!d.success) {
        setErrorMessage(d.error || "Registration and check-in failed.");
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
      <div className="min-h-screen bg-[#060606] flex flex-col items-center justify-center space-y-4 px-4">
        <Loader2 className="w-10 h-10 text-emerald-400 animate-spin" />
        <p className="font-mono text-xs text-white/40 uppercase tracking-[0.25em]">Loading Event Check-In...</p>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-[#060606] flex flex-col items-center justify-center p-6 text-center space-y-4">
        <p className="font-pixel text-lg text-red-400">EVENT_NOT_FOUND</p>
        <p className="font-mono text-xs text-white/40">This check-in link may have expired or is invalid.</p>
        <Link href="/events" className="text-xs font-mono text-emerald-400 hover:underline">
          ← View All Events
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#060606] text-white flex flex-col justify-between p-4 sm:p-8 selection:bg-emerald-500 selection:text-black">
      {/* Background glow ambiance */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Header */}
      <div className="max-w-md mx-auto w-full pt-4 pb-6 text-center space-y-2 relative z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono text-[10px] uppercase font-bold tracking-widest mb-1">
          <Sparkles className="w-3 h-3" /> FOSS GCEE CHECK-IN
        </div>
        <h1 className="text-xl sm:text-2xl font-pixel text-white uppercase tracking-tight">
          {event.title}
        </h1>
        <div className="flex items-center justify-center gap-3 text-[11px] font-mono text-white/40 uppercase">
          {event.venue && (
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3 text-emerald-400" /> {event.venue}
            </span>
          )}
          {event.startDate && (
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3 text-emerald-400" /> {event.startDate}
            </span>
          )}
        </div>
      </div>

      {/* Main Form Container */}
      <div className="max-w-md mx-auto w-full my-auto relative z-10">
        {successData ? (
          /* Success Screen: Digital Pass */
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="p-6 sm:p-8 rounded-[32px] bg-gradient-to-b from-white/[0.04] to-black/80 border border-emerald-500/30 backdrop-blur-xl shadow-[0_0_50px_rgba(16,185,129,0.15)] space-y-6 text-center"
          >
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(16,185,129,0.3)]">
              <ShieldCheck className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-emerald-400 font-bold">
                {successData.already ? "ALREADY_VERIFIED" : "CHECK_IN_SUCCESSFUL"}
              </span>
              <h2 className="text-2xl font-pixel text-white uppercase">
                Welcome, {successData.participant.name}!
              </h2>
            </div>

            {/* Digital Badge Ticket */}
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 text-left font-mono text-xs space-y-3">
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-white/40 uppercase text-[10px]">Attendee</span>
                <span className="text-white font-bold">{successData.participant.name}</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-white/40 uppercase text-[10px]">Department</span>
                <span className="text-white/80">{successData.participant.department} {successData.participant.year ? `· Year ${successData.participant.year}` : ""}</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-white/40 uppercase text-[10px]">Email</span>
                <span className="text-white/80">{successData.participant.email}</span>
              </div>
              <div className="flex justify-between items-center pt-1">
                <span className="text-white/40 uppercase text-[10px]">Checked-In At</span>
                <span className="text-emerald-400 font-bold text-[11px]">
                  {new Date(successData.participant.checkedInAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>

            <p className="font-mono text-xs text-white/50 leading-relaxed">
              Please take your seat. Volunteers are around to assist you with installation and setup.
            </p>

            <div className="pt-2 flex flex-col gap-2">
              <Link
                href={`/events/${slug}`}
                className="w-full py-3.5 rounded-xl bg-white text-black font-pixel text-xs uppercase font-bold hover:bg-white/90 transition-all flex items-center justify-center gap-2"
              >
                View Agenda & Details <ArrowRight className="w-4 h-4" />
              </Link>
              <button
                onClick={() => {
                  setSuccessData(null);
                  setEmail("");
                }}
                className="w-full py-2.5 text-white/40 hover:text-white font-mono text-[10px] uppercase tracking-widest"
              >
                Check In Another Attendee
              </button>
            </div>
          </motion.div>
        ) : (
          /* Checkin Tabs & Form */
          <div className="p-6 sm:p-8 rounded-[32px] bg-white/[0.02] border border-white/10 backdrop-blur-xl shadow-2xl space-y-6">
            {/* Tab Selector */}
            <div className="grid grid-cols-2 p-1 rounded-2xl bg-black/60 border border-white/10 font-mono text-xs">
              <button
                onClick={() => {
                  setActiveTab("existing");
                  setErrorMessage(null);
                }}
                className={`py-2.5 rounded-xl font-bold uppercase transition-all flex items-center justify-center gap-2 ${
                  activeTab === "existing"
                    ? "bg-emerald-500 text-black shadow-lg"
                    : "text-white/40 hover:text-white"
                }`}
              >
                <UserCheck className="w-3.5 h-3.5" /> Registered
              </button>
              <button
                onClick={() => {
                  setActiveTab("spot");
                  setErrorMessage(null);
                }}
                className={`py-2.5 rounded-xl font-bold uppercase transition-all flex items-center justify-center gap-2 ${
                  activeTab === "spot"
                    ? "bg-emerald-500 text-black shadow-lg"
                    : "text-white/40 hover:text-white"
                }`}
              >
                <UserPlus className="w-3.5 h-3.5" /> Spot / New
              </button>
            </div>

            {errorMessage && (
              <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 font-mono text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {activeTab === "existing" ? (
              /* Registered Check-in Form */
              <form onSubmit={handleExistingCheckin} className="space-y-4 font-mono text-xs">
                <div className="space-y-1.5">
                  <label className="text-[10px] text-white/40 uppercase tracking-widest pl-1">
                    Enter Your Registered Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. bharath@gmail.com"
                    autoFocus
                    className="w-full px-4 py-3.5 bg-white/[0.03] border border-white/10 rounded-2xl text-white placeholder:text-white/20 focus:outline-none focus:border-emerald-500/50 text-sm"
                  />
                  <p className="text-[10px] text-white/30 pl-1">
                    The email you used during Google Form or FOSS United RSVP.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-4 bg-emerald-500 text-black font-pixel text-xs uppercase font-bold rounded-2xl hover:bg-emerald-400 transition-all flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(16,185,129,0.3)] disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                  {submitting ? "VERIFYING..." : "CONFIRM_CHECK_IN"}
                </button>
              </form>
            ) : (
              /* Spot Registration Form */
              <form onSubmit={handleSpotCheckin} className="space-y-4 font-mono text-xs">
                <div className="space-y-1">
                  <label className="text-[10px] text-white/40 uppercase tracking-wider pl-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={spotName}
                    onChange={(e) => setSpotName(e.target.value)}
                    placeholder="e.g. Bharath Kumar P"
                    className="w-full px-4 py-3 bg-white/[0.03] border border-white/10 rounded-xl text-white focus:outline-none focus:border-emerald-500/50"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-white/40 uppercase tracking-wider pl-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={spotEmail}
                    onChange={(e) => setSpotEmail(e.target.value)}
                    placeholder="e.g. bharath@gmail.com"
                    className="w-full px-4 py-3 bg-white/[0.03] border border-white/10 rounded-xl text-white focus:outline-none focus:border-emerald-500/50"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] text-white/40 uppercase tracking-wider pl-1">Department</label>
                    <input
                      type="text"
                      value={spotDept}
                      onChange={(e) => setSpotDept(e.target.value)}
                      placeholder="CSE, IT, ECE..."
                      className="w-full px-4 py-3 bg-white/[0.03] border border-white/10 rounded-xl text-white focus:outline-none focus:border-emerald-500/50"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-white/40 uppercase tracking-wider pl-1">Year of Study</label>
                    <select
                      value={spotYear}
                      onChange={(e) => setSpotYear(e.target.value)}
                      className="w-full px-4 py-3 bg-[#0d0d0d] border border-white/10 rounded-xl text-white focus:outline-none focus:border-emerald-500/50"
                    >
                      <option value="1">1st Year</option>
                      <option value="2">2nd Year</option>
                      <option value="3">3rd Year</option>
                      <option value="4">4th Year</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-white/40 uppercase tracking-wider pl-1">Phone Number (Optional)</label>
                  <input
                    type="text"
                    value={spotMobile}
                    onChange={(e) => setSpotMobile(e.target.value)}
                    placeholder="e.g. 9876543210"
                    className="w-full px-4 py-3 bg-white/[0.03] border border-white/10 rounded-xl text-white focus:outline-none focus:border-emerald-500/50"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-4 bg-emerald-500 text-black font-pixel text-xs uppercase font-bold rounded-2xl hover:bg-emerald-400 transition-all flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(16,185,129,0.3)] disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                  {submitting ? "REGISTERING..." : "REGISTER_AND_CHECK_IN"}
                </button>
              </form>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="max-w-md mx-auto w-full pt-6 pb-2 text-center text-[10px] font-mono text-white/30 uppercase tracking-widest relative z-10">
        Free & Open Source Software Club · GCE Erode
      </div>
    </div>
  );
}
