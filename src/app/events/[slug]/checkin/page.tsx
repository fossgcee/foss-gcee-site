/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import {
  Calendar,
  MapPin,
  Loader2,
  ArrowRight,
  UserCheck,
  UserPlus,
  Check,
  AlertCircle
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

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
          setErrorMessage("This email wasn't found in pre-registrations. Please use the 'Spot / Walk-in' tab below.");
          setSpotEmail(cleanEmail);
        } else {
          setErrorMessage(d.error || "Check-in failed. Please retry.");
        }
        return;
      }

      setSuccessData({
        already: d.alreadyCheckedIn,
        participant: d.participant,
      });
    } catch {
      setErrorMessage("Network error. Please check your internet connection and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSpotCheckin = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = spotEmail.toLowerCase().trim();
    const cleanName = spotName.trim();

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
          department: spotDept,
          year: Number(spotYear) || 1,
          college: spotCollege,
          mobile: spotMobile,
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
      <div className="min-h-screen bg-[#080808] flex flex-col items-center justify-center space-y-4 px-4 font-mono text-white">
        <Loader2 className="w-8 h-8 text-white/40 animate-spin" />
        <p className="text-[10px] text-white/40 uppercase tracking-[0.25em]">Loading Event Terminal...</p>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-[#080808] flex flex-col items-center justify-center p-6 text-center space-y-4 font-mono text-white">
        <p className="font-pixel text-base text-white">EVENT_NOT_FOUND</p>
        <p className="text-xs text-white/40">This check-in link may have expired or is invalid.</p>
        <Link href="/events" className="text-xs text-white/60 hover:text-white underline uppercase tracking-wider">
          ← View All Events
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080808] text-white flex flex-col justify-between p-4 sm:p-8 font-mono selection:bg-white selection:text-black relative">
      {/* Monochrome Grid Background Pattern */}
      <div className="fixed inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:3rem_3rem] pointer-events-none" />

      {/* Header */}
      <div className="max-w-md mx-auto w-full pt-4 pb-6 text-center space-y-3 relative z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/15 text-white/80 font-mono text-[9px] uppercase font-bold tracking-widest">
          FOSS GCEE · CHECK_IN
        </div>
        <h1 className="text-lg sm:text-xl md:text-2xl font-pixel text-white uppercase tracking-tight break-words leading-snug">
          {event.title}
        </h1>
        <div className="flex items-center justify-center gap-4 text-[10px] text-white/40 uppercase tracking-wider">
          {event.venue && (
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3 text-white/40" /> {event.venue}
            </span>
          )}
          {event.startDate && (
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3 text-white/40" /> {event.startDate}
            </span>
          )}
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-md mx-auto w-full my-auto relative z-10">
        {successData ? (
          /* Success Screen: Black & White Cyber Ticket Pass */
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="p-6 sm:p-8 rounded-3xl bg-black border border-white/20 backdrop-blur-xl shadow-2xl space-y-6 text-center"
          >
            {/* Top Pass Emblem */}
            <div className="w-14 h-14 rounded-2xl bg-white text-black flex items-center justify-center mx-auto shadow-[0_0_25px_rgba(255,255,255,0.2)]">
              <Check className="w-8 h-8 stroke-[3]" />
            </div>

            <div className="space-y-1.5">
              <span className="text-[9px] uppercase tracking-[0.25em] text-white/50 font-bold">
                {successData.already ? "ATTENDANCE_ALREADY_CONFIRMED" : "CHECK_IN_CONFIRMED"}
              </span>
              <h2 className="text-lg sm:text-xl font-pixel text-white uppercase tracking-tight break-words leading-snug">
                {successData.participant.name}
              </h2>
            </div>

            {/* Monospace Digital Ticket */}
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-dashed border-white/20 text-left text-xs space-y-3">
              <div className="flex justify-between border-b border-white/10 pb-2">
                <span className="text-white/40 uppercase text-[9px] tracking-wider">Attendee</span>
                <span className="text-white font-bold uppercase">{successData.participant.name}</span>
              </div>
              <div className="flex justify-between border-b border-white/10 pb-2">
                <span className="text-white/40 uppercase text-[9px] tracking-wider">Department</span>
                <span className="text-white/80">
                  {successData.participant.department} {successData.participant.year ? `· Year ${successData.participant.year}` : ""}
                </span>
              </div>
              <div className="flex justify-between border-b border-white/10 pb-2">
                <span className="text-white/40 uppercase text-[9px] tracking-wider">Email</span>
                <span className="text-white/80 truncate max-w-[200px]">{successData.participant.email}</span>
              </div>
              <div className="flex justify-between items-center pt-1">
                <span className="text-white/40 uppercase text-[9px] tracking-wider">Verified Timestamp</span>
                <span className="text-white font-bold text-[10px] bg-white/10 px-2 py-0.5 rounded border border-white/20">
                  {new Date(successData.participant.checkedInAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>

            <p className="text-[11px] text-white/40 leading-relaxed">
              Your attendance has been registered on the projector display. Please proceed into the hall.
            </p>

            <div className="pt-2 flex flex-col gap-3">
              <Link
                href={`/events/${slug}`}
                className="w-full py-3.5 rounded-xl bg-white text-black font-pixel text-[10px] uppercase font-bold hover:bg-white/90 transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,255,255,0.1)]"
              >
                Event Schedule & Details <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <button
                onClick={() => {
                  setSuccessData(null);
                  setEmail("");
                }}
                className="w-full py-2 text-white/30 hover:text-white text-[10px] uppercase tracking-widest transition-colors cursor-pointer"
              >
                Check In Another Attendee
              </button>
            </div>
          </motion.div>
        ) : (
          /* Checkin Tabs & Form */
          <div className="p-6 sm:p-8 rounded-3xl bg-black border border-white/15 backdrop-blur-xl shadow-2xl space-y-6">
            {/* Tab Selector */}
            <div className="grid grid-cols-2 p-1 rounded-xl bg-white/[0.04] border border-white/10 text-xs">
              <button
                onClick={() => {
                  setActiveTab("existing");
                  setErrorMessage(null);
                }}
                className={`py-2.5 rounded-lg font-pixel text-[9px] uppercase transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  activeTab === "existing"
                    ? "bg-white text-black shadow-md font-bold"
                    : "text-white/40 hover:text-white"
                }`}
              >
                <UserCheck className="w-3 h-3" /> Registered
              </button>
              <button
                onClick={() => {
                  setActiveTab("spot");
                  setErrorMessage(null);
                }}
                className={`py-2.5 rounded-lg font-pixel text-[9px] uppercase transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  activeTab === "spot"
                    ? "bg-white text-black shadow-md font-bold"
                    : "text-white/40 hover:text-white"
                }`}
              >
                <UserPlus className="w-3 h-3" /> Spot / Walk-in
              </button>
            </div>

            {errorMessage && (
              <div className="p-3.5 rounded-xl bg-white/5 border border-white/20 text-white text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-white/60" />
                <span className="text-white/80">{errorMessage}</span>
              </div>
            )}

            {activeTab === "existing" ? (
              /* Registered Check-in Form */
              <form onSubmit={handleExistingCheckin} className="space-y-4 text-xs">
                <div className="space-y-2">
                  <label className="text-[10px] text-white/40 uppercase tracking-widest pl-1 block">
                    Registered Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. bharath@gmail.com"
                    autoFocus
                    className="w-full px-4 py-3.5 bg-white/[0.03] border border-white/15 rounded-xl text-white placeholder:text-white/20 focus:outline-none focus:border-white/50 text-sm"
                  />
                  <p className="text-[10px] text-white/30 pl-1">
                    Enter the email provided during RSVP.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-4 bg-white text-black font-pixel text-xs uppercase font-bold rounded-xl hover:bg-white/90 transition-all flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(255,255,255,0.15)] disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin text-black" /> : <Check className="w-4 h-4 stroke-[3]" />}
                  {submitting ? "VERIFYING..." : "CONFIRM_CHECK_IN"}
                </button>
              </form>
            ) : (
              /* Spot Registration Form */
              <form onSubmit={handleSpotCheckin} className="space-y-4 text-xs">
                <div className="space-y-1">
                  <label className="text-[10px] text-white/40 uppercase tracking-wider pl-1 block">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={spotName}
                    onChange={(e) => setSpotName(e.target.value)}
                    placeholder="e.g. Bharath Kumar P"
                    className="w-full px-4 py-3 bg-white/[0.03] border border-white/15 rounded-xl text-white focus:outline-none focus:border-white/50"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-white/40 uppercase tracking-wider pl-1 block">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={spotEmail}
                    onChange={(e) => setSpotEmail(e.target.value)}
                    placeholder="e.g. bharath@gmail.com"
                    className="w-full px-4 py-3 bg-white/[0.03] border border-white/15 rounded-xl text-white focus:outline-none focus:border-white/50"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] text-white/40 uppercase tracking-wider pl-1 block">Department</label>
                    <input
                      type="text"
                      value={spotDept}
                      onChange={(e) => setSpotDept(e.target.value)}
                      placeholder="CSE, IT, ECE..."
                      className="w-full px-4 py-3 bg-white/[0.03] border border-white/15 rounded-xl text-white focus:outline-none focus:border-white/50"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-white/40 uppercase tracking-wider pl-1 block">Year</label>
                    <select
                      value={spotYear}
                      onChange={(e) => setSpotYear(e.target.value)}
                      className="w-full px-4 py-3 bg-[#0d0d0d] border border-white/15 rounded-xl text-white focus:outline-none focus:border-white/50"
                    >
                      <option value="1">1st Year</option>
                      <option value="2">2nd Year</option>
                      <option value="3">3rd Year</option>
                      <option value="4">4th Year</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-white/40 uppercase tracking-wider pl-1 block">Phone (Optional)</label>
                  <input
                    type="text"
                    value={spotMobile}
                    onChange={(e) => setSpotMobile(e.target.value)}
                    placeholder="e.g. 9876543210"
                    className="w-full px-4 py-3 bg-white/[0.03] border border-white/15 rounded-xl text-white focus:outline-none focus:border-white/50"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-4 bg-white text-black font-pixel text-xs uppercase font-bold rounded-xl hover:bg-white/90 transition-all flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(255,255,255,0.15)] disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin text-black" /> : <UserPlus className="w-4 h-4" />}
                  {submitting ? "REGISTERING..." : "REGISTER_AND_CHECK_IN"}
                </button>
              </form>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="max-w-md mx-auto w-full pt-6 pb-2 text-center text-[10px] text-white/30 uppercase tracking-widest relative z-10">
        Free and Open Source Software Club · GCE Erode
      </div>
    </div>
  );
}
