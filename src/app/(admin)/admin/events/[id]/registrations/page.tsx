/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Users,
  Search,
  Plus,
  Upload,
  Download,
  Mail,
  Loader2,
  Trash2,
  X,
  Phone,
  Calendar,
  MapPin,
  CheckCircle2,
  QrCode,
  CircleDot,
  RefreshCw,
  ExternalLink,
  GraduationCap,
  Building2,
  Sparkles,
  Copy,
  Check,
  CheckCheck,
  RotateCcw
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

interface EventMetadata {
  id: string;
  title: string;
  slug: string;
  startDate?: string;
  venue?: string;
  registrationMode?: string;
  externalRsvpUrl?: string;
  registrationsCount: number;
}

interface MemberRegistration {
  _id: string;
  name: string;
  department: string;
  college: string;
  year: number;
  mobile: string;
  email: string;
  registeredAt: string;
}

const formatDeptShort = (dept: string) => {
  if (!dept) return "General";
  const match = dept.match(/\(([^)]+)\)/);
  if (match) return match[1];
  return dept;
};

const getYearDisplay = (year: number) => {
  if (!year || year <= 0) return null;
  if (year === 1) return "1st Year";
  if (year === 2) return "2nd Year";
  if (year === 3) return "3rd Year";
  if (year === 4) return "4th Year";
  return `Year ${year}`;
};

const getYearBadgeColor = (year: number) => {
  switch (year) {
    case 1:
      return "border-sky-500/30 bg-sky-500/10 text-sky-300";
    case 2:
      return "border-emerald-500/30 bg-emerald-500/10 text-emerald-300";
    case 3:
      return "border-amber-500/30 bg-amber-500/10 text-amber-300";
    case 4:
      return "border-purple-500/30 bg-purple-500/10 text-purple-300";
    default:
      return "border-white/20 bg-white/5 text-white/80";
  }
};

export default function AdminEventRegistrationsPage() {
  const params = useParams();
  const id = params.id as string;

  const [event, setEvent] = useState<EventMetadata | null>(null);
  const [registrations, setRegistrations] = useState<MemberRegistration[]>([]);
  const [checkedInEmails, setCheckedInEmails] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDept, setSelectedDept] = useState("all");
  const [selectedYear, setSelectedYear] = useState<string>("all");
  const [attendanceFilter, setAttendanceFilter] = useState<"all" | "checkedin" | "pending">("all");
  const [copiedLink, setCopiedLink] = useState(false);

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [isDeletingEmail, setIsDeletingEmail] = useState<string | null>(null);
  const [isTogglingEmail, setIsTogglingEmail] = useState<string | null>(null);
  const [isImportingCsv, setIsImportingCsv] = useState(false);
  const [csvImportStatus, setCsvImportStatus] = useState<string | null>(null);

  // Add Participant Form State
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    department: "Information Technology (IT)",
    college: "Government College of Engineering, Erode",
    year: "2",
    mobile: "",
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [isSavingParticipant, setIsSavingParticipant] = useState(false);

  // Email Notification State
  const [emailSubject, setEmailSubject] = useState("");
  const [emailMessage, setEmailMessage] = useState("");
  const [testEmail, setTestEmail] = useState("");
  const [isEmailing, setIsEmailing] = useState(false);
  const [isTestEmailing, setIsTestEmailing] = useState(false);
  const [emailStatus, setEmailStatus] = useState<string | null>(null);

  // Fetch Event, Registrations & Live Check-ins
  const fetchRegistrations = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const [regRes, checkinRes] = await Promise.all([
        fetch(`/api/admin/events/registrations?id=${id}`),
        fetch(`/api/events/checkin?id=${id}`),
      ]);

      const regData = await regRes.json();
      const checkinData = await checkinRes.json();

      if (regData.success) {
        setEvent(regData.event);
        setRegistrations(regData.data || []);
        if (!silent) {
          setEmailSubject(`Important Update: ${regData.event?.title || "FOSS GCEE Event"}`);
        }
      }

      if (checkinData.success && checkinData.checkedInEmails) {
        setCheckedInEmails(new Set(checkinData.checkedInEmails.map((e: string) => e.toLowerCase())));
      }
    } catch {
      console.error("Failed to load registrations");
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchRegistrations();

      // Silent live check-in polling every 3.5s
      const interval = setInterval(() => {
        fetch(`/api/events/checkin?id=${id}`)
          .then((res) => res.json())
          .then((checkinData) => {
            if (checkinData.success && checkinData.checkedInEmails) {
              setCheckedInEmails(new Set(checkinData.checkedInEmails.map((e: string) => e.toLowerCase())));
            }
          })
          .catch(() => {});
      }, 3500);

      return () => clearInterval(interval);
    }
  }, [id]);

  // Unique departments for filter
  const departments = useMemo(() => {
    const set = new Set<string>();
    registrations.forEach((r) => {
      if (r.department) set.add(r.department);
    });
    return Array.from(set).sort();
  }, [registrations]);

  // Only show separate mobile column if more than 20% of participants have a mobile number
  const hasMobileColumn = useMemo(() => {
    if (registrations.length === 0) return false;
    const withMobile = registrations.filter((r) => r.mobile && r.mobile.trim().length > 0).length;
    return withMobile / registrations.length >= 0.2;
  }, [registrations]);

  // Filtered registrations
  const filteredRegistrations = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return registrations.filter((r) => {
      const isChecked = checkedInEmails.has(r.email.toLowerCase());

      const matchSearch =
        !q ||
        r.name.toLowerCase().includes(q) ||
        r.email.toLowerCase().includes(q) ||
        r.department?.toLowerCase().includes(q) ||
        r.college?.toLowerCase().includes(q) ||
        r.mobile?.includes(q);

      const matchDept = selectedDept === "all" || r.department === selectedDept;

      const matchYear =
        selectedYear === "all" ||
        (selectedYear === "unknown" && (!r.year || r.year <= 0)) ||
        r.year === Number(selectedYear);

      const matchAttendance =
        attendanceFilter === "all" ||
        (attendanceFilter === "checkedin" && isChecked) ||
        (attendanceFilter === "pending" && !isChecked);

      return matchSearch && matchDept && matchYear && matchAttendance;
    });
  }, [registrations, checkedInEmails, searchQuery, selectedDept, selectedYear, attendanceFilter]);

  const checkedInCount = useMemo(() => {
    return registrations.filter((r) => checkedInEmails.has(r.email.toLowerCase())).length;
  }, [registrations, checkedInEmails]);

  const totalCount = registrations.length;
  const checkinPercent = totalCount > 0 ? Math.round((checkedInCount / totalCount) * 100) : 0;
  const pendingCount = Math.max(0, totalCount - checkedInCount);

  // Manual Add Participant Handler
  const handleSaveParticipant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim()) {
      setFormError("Name and valid email are required.");
      return;
    }

    setIsSavingParticipant(true);
    setFormError(null);

    try {
      const res = await fetch("/api/admin/events/registrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId: id,
          participant: {
            name: formData.name.trim(),
            email: formData.email.trim().toLowerCase(),
            department: formData.department.trim(),
            college: formData.college.trim(),
            year: Number(formData.year) || 0,
            mobile: formData.mobile.trim(),
          },
        }),
      });

      const d = await res.json();
      if (!d.success) {
        setFormError(d.error || "Failed to add participant.");
        return;
      }

      setRegistrations(d.data.registrations);
      if (event) {
        setEvent({ ...event, registrationsCount: d.data.count });
      }
      setIsAddModalOpen(false);
      setFormData({
        name: "",
        email: "",
        department: "Information Technology (IT)",
        college: "Government College of Engineering, Erode",
        year: "2",
        mobile: "",
      });
    } catch {
      setFormError("An unexpected error occurred.");
    } finally {
      setIsSavingParticipant(false);
    }
  };

  // Toggle Check-in status directly from desk / mobile
  const handleToggleCheckin = async (email: string) => {
    if (!event) return;
    const targetEmail = email.toLowerCase().trim();
    setIsTogglingEmail(targetEmail);

    try {
      const res = await fetch("/api/admin/events/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId: event.id,
          email: targetEmail,
          action: "toggle",
        }),
      });

      const d = await res.json();
      if (d.success) {
        setCheckedInEmails(new Set(d.checkedInEmails.map((e: string) => e.toLowerCase())));
      }
    } catch {
      alert("Failed to update check-in status");
    } finally {
      setIsTogglingEmail(null);
    }
  };

  // Reset / Clear all attendance check-ins
  const handleClearCheckins = async () => {
    if (!event) return;
    if (!confirm("Are you sure you want to reset all attendance check-ins for this event? This will mark all attendees as pending.")) return;
    try {
      const res = await fetch("/api/admin/events/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId: event.id,
          action: "clear",
        }),
      });
      const d = await res.json();
      if (d.success) {
        setCheckedInEmails(new Set());
      }
    } catch {
      alert("Failed to reset check-ins");
    }
  };

  // CSV Import Handler
  const handleImportCsv = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !event) return;

    const body = new FormData();
    body.append("eventId", event.id);
    body.append("file", file);

    setIsImportingCsv(true);
    setCsvImportStatus(null);
    try {
      const res = await fetch("/api/admin/events/registrations", {
        method: "POST",
        body,
      });
      const d = await res.json();

      if (!d.success) {
        setCsvImportStatus(d.error || "CSV import failed.");
        return;
      }

      setRegistrations(d.data.registrations);
      setEvent((prev) => (prev ? { ...prev, registrationsCount: d.data.count } : prev));
      setCsvImportStatus(`✓ Success: ${d.data.inserted} added, ${d.data.updated} updated (with Year & Dept), ${d.data.skipped} skipped.`);
    } catch {
      setCsvImportStatus("CSV import failed. Please check the file formatting.");
    } finally {
      setIsImportingCsv(false);
      e.target.value = "";
    }
  };

  // CSV Export Handler
  const handleExportCsv = () => {
    if (registrations.length === 0 || !event) return;

    const escapeCell = (val: string | number | undefined | null) => {
      const str = String(val ?? "");
      if (str.includes(",") || str.includes('"') || str.includes("\n")) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const headers = ["Name", "Email", "Department", "College", "Year", "Mobile", "Attendance", "Registered At"];
    const rows = registrations.map((r) => {
      const isChecked = checkedInEmails.has(r.email.toLowerCase());
      return [
        escapeCell(r.name),
        escapeCell(r.email),
        escapeCell(r.department),
        escapeCell(r.college),
        escapeCell(r.year ? getYearDisplay(r.year) : ""),
        escapeCell(r.mobile),
        escapeCell(isChecked ? "CHECKED_IN" : "PENDING"),
        escapeCell(r.registeredAt ? new Date(r.registeredAt).toLocaleString() : ""),
      ];
    });

    const csvContent = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${event.slug || "event"}-registrations-attendance.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Delete Participant Handler
  const handleDeleteParticipant = async (email: string) => {
    if (!event || !confirm(`Remove ${email} from this event?`)) return;

    setIsDeletingEmail(email);
    try {
      const res = await fetch(`/api/admin/events/registrations?eventId=${event.id}&email=${encodeURIComponent(email)}`, {
        method: "DELETE",
      });
      const d = await res.json();
      if (d.success) {
        setRegistrations((prev) => prev.filter((r) => r.email.toLowerCase() !== email.toLowerCase()));
        setEvent((prev) => (prev ? { ...prev, registrationsCount: prev.registrationsCount - 1 } : prev));
      } else {
        alert(d.error || "Failed to remove participant");
      }
    } catch {
      alert("Failed to remove participant");
    } finally {
      setIsDeletingEmail(null);
    }
  };

  // Broadcast Email Handler
  const handleSendEmail = async () => {
    if (!event) return;
    const subject = emailSubject.trim();
    const message = emailMessage.trim();
    if (!subject || !message) {
      setEmailStatus("Subject and message are required.");
      return;
    }
    setIsEmailing(true);
    setEmailStatus(null);
    try {
      const res = await fetch("/api/admin/events/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventSlug: event.slug,
          subject,
          message,
        }),
      });
      const d = await res.json();
      if (!d.success) {
        setEmailStatus(d.error || "Failed to send email.");
        return;
      }
      setEmailStatus(`✓ Sent to ${d.data.recipients} registrants in ${d.data.batches} batches.`);
    } catch {
      setEmailStatus("Failed to send email.");
    } finally {
      setIsEmailing(false);
    }
  };

  // Send Test Email Handler
  const handleSendTestEmail = async () => {
    if (!event) return;
    const subject = emailSubject.trim();
    const message = emailMessage.trim();
    const tEmail = testEmail.trim();
    if (!subject || !message || !tEmail) {
      setEmailStatus("Subject, message, and test email are required.");
      return;
    }
    setIsTestEmailing(true);
    setEmailStatus(null);
    try {
      const res = await fetch("/api/admin/events/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventSlug: event.slug,
          subject,
          message,
          testEmail: tEmail,
        }),
      });
      const d = await res.json();
      if (!d.success) {
        setEmailStatus(d.error || "Failed to send test email.");
        return;
      }
      setEmailStatus(`✓ Test email sent successfully to ${tEmail}.`);
    } catch {
      setEmailStatus("Failed to send test email.");
    } finally {
      setIsTestEmailing(false);
    }
  };

  const handleCopyCheckinLink = () => {
    if (!event) return;
    const url = `${window.location.origin}/events/${event.slug}/checkin`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  if (loading) {
    return (
      <div className="py-32 flex flex-col items-center justify-center space-y-4 font-mono">
        <Loader2 className="w-10 h-10 text-emerald-400 animate-spin" />
        <p className="text-xs text-white/60 tracking-[0.25em] uppercase font-semibold">Loading Registration Desk...</p>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="py-20 max-w-4xl mx-auto text-center space-y-4 font-mono">
        <p className="font-pixel text-white text-lg">EVENT_RECORD_NOT_FOUND</p>
        <Link href="/admin/events" className="inline-flex items-center gap-2 text-xs text-white/70 hover:text-white uppercase tracking-widest">
          <ArrowLeft className="w-4 h-4" /> Return to Events
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8 py-4 sm:py-8 max-w-7xl mx-auto px-3 sm:px-6 font-mono">
      {/* ── Breadcrumb & Top Bar ── */}
      <div className="flex flex-col gap-4 pb-6 border-b border-white/10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/admin/events"
            className="inline-flex items-center gap-2 text-xs text-white/70 hover:text-white uppercase tracking-widest transition-colors py-1 font-semibold group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Events / {event.title}
          </Link>

          {/* Live Sync Pill */}
          <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/15">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] uppercase font-mono tracking-wider text-emerald-300 font-bold">
              Live Sync Active
            </span>
            <button
              onClick={() => fetchRegistrations(true)}
              className="p-1 rounded hover:bg-white/10 text-white/60 hover:text-white transition-colors"
              title="Refresh attendance records"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Title & Metadata */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-2 max-w-3xl">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-pixel text-white uppercase tracking-tight break-words">
              {event.title}
            </h1>
            <div className="flex items-center gap-x-4 gap-y-1.5 text-xs text-white/70 flex-wrap font-mono">
              <span className="flex items-center gap-1.5 text-white/80">
                <MapPin className="w-3.5 h-3.5 text-white/50" /> {event.venue || "Campus Venue"}
              </span>
              {event.startDate && (
                <span className="flex items-center gap-1.5 text-white/80">
                  <Calendar className="w-3.5 h-3.5 text-white/50" /> {event.startDate}
                </span>
              )}
              <Link
                href={`/events/${event.slug}`}
                target="_blank"
                className="inline-flex items-center gap-1 text-sky-400 hover:text-sky-300 transition-colors"
              >
                <span>/events/{event.slug}</span>
                <ExternalLink className="w-3 h-3" />
              </Link>
            </div>
          </div>

          {/* Quick Check-in Link Copy */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyCheckinLink}
              className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-white text-[11px] font-mono flex items-center gap-2 transition-all cursor-pointer"
              title="Copy mobile self check-in link for students"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-white/60" />}
              <span>{copiedLink ? "COPIED_URL!" : "COPY_CHECKIN_LINK"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── Executive Attendance KPI Cards (Grid of 4) ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Registrations */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-col justify-between space-y-2 hover:border-white/20 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-wider text-white/60 font-semibold">Total RSVPs</span>
            <Users className="w-4 h-4 text-white/40" />
          </div>
          <div className="space-y-0.5">
            <p className="text-2xl sm:text-3xl font-pixel text-white font-bold">{totalCount}</p>
            <p className="text-[10px] text-white/50">Registered Attendees</p>
          </div>
        </div>

        {/* Checked In / Present */}
        <div className="p-4 sm:p-5 rounded-2xl bg-emerald-500/[0.06] border border-emerald-500/25 flex flex-col justify-between space-y-2 hover:border-emerald-500/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-wider text-emerald-300 font-semibold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Checked In
            </span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="space-y-0.5">
            <p className="text-2xl sm:text-3xl font-pixel text-emerald-300 font-bold">{checkedInCount}</p>
            <p className="text-[10px] text-emerald-400/70">Verified At Venue</p>
          </div>
        </div>

        {/* Pending Arrival */}
        <div className="p-4 sm:p-5 rounded-2xl bg-amber-500/[0.05] border border-amber-500/20 flex flex-col justify-between space-y-2 hover:border-amber-500/35 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-wider text-amber-300 font-semibold">Pending</span>
            <CircleDot className="w-4 h-4 text-amber-400" />
          </div>
          <div className="space-y-0.5">
            <p className="text-2xl sm:text-3xl font-pixel text-amber-300 font-bold">{pendingCount}</p>
            <p className="text-[10px] text-amber-400/70">Awaiting Check-in</p>
          </div>
        </div>

        {/* Attendance Rate & Progress Bar */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-col justify-between space-y-2 hover:border-white/20 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-wider text-white/60 font-semibold">Attendance Rate</span>
            <Sparkles className="w-4 h-4 text-white/40" />
          </div>
          <div className="space-y-1.5">
            <div className="flex items-baseline justify-between">
              <p className="text-2xl sm:text-3xl font-pixel text-white font-bold">{checkinPercent}%</p>
              <span className="text-[10px] text-white/60 font-mono">{checkedInCount} of {totalCount}</span>
            </div>
            {/* Progress Meter Bar */}
            <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-emerald-300 transition-all duration-500"
                style={{ width: `${Math.min(100, Math.max(0, checkinPercent))}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── Main Action Bar (High Impact Toolbar) ── */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white/[0.02] border border-white/10 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Projector Kiosk Launcher */}
        <Link
          href={`/events/${event.slug}/checkin/projector`}
          target="_blank"
          className="flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-gradient-to-r from-white to-gray-200 text-black font-pixel text-xs uppercase font-bold hover:brightness-105 active:scale-98 transition-all shadow-[0_0_25px_rgba(255,255,255,0.15)] shrink-0"
        >
          <QrCode className="w-4 h-4" />
          <span>PROJECTOR_KIOSK_QR</span>
        </Link>

        {/* Secondary Action Buttons */}
        <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 flex-wrap">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center justify-center gap-1.5 px-4 py-3 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 text-white font-pixel text-[10px] uppercase transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ WALK_IN</span>
          </button>

          <label className="flex items-center justify-center gap-1.5 px-4 py-3 rounded-xl bg-white/[0.05] hover:bg-white/10 border border-white/15 text-white font-pixel text-[10px] uppercase transition-all cursor-pointer">
            {isImportingCsv ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
            <span>{isImportingCsv ? "IMPORTING..." : "IMPORT_CSV"}</span>
            <input
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              onChange={handleImportCsv}
              disabled={isImportingCsv}
            />
          </label>

          <button
            onClick={handleExportCsv}
            disabled={registrations.length === 0}
            className="flex items-center justify-center gap-1.5 px-4 py-3 rounded-xl bg-white/[0.05] hover:bg-white/10 border border-white/15 text-white font-pixel text-[10px] uppercase transition-all disabled:opacity-40"
          >
            <Download className="w-3.5 h-3.5" />
            <span>EXPORT_CSV</span>
          </button>

          <button
            onClick={() => setIsEmailModalOpen(true)}
            className="flex items-center justify-center gap-1.5 px-4 py-3 rounded-xl bg-white/[0.05] hover:bg-white/10 border border-white/15 text-white font-pixel text-[10px] uppercase transition-all"
          >
            <Mail className="w-3.5 h-3.5" />
            <span>BROADCAST_EMAIL</span>
          </button>

          {checkedInCount > 0 && (
            <button
              onClick={handleClearCheckins}
              className="flex items-center justify-center gap-1.5 px-4 py-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/25 text-red-400 font-pixel text-[10px] uppercase transition-all cursor-pointer"
              title="Reset all attendance check-ins back to pending"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>RESET_ATTENDANCE</span>
            </button>
          )}
        </div>
      </div>

      {/* CSV Import Notification Banner */}
      {csvImportStatus && (
        <div className={`p-4 rounded-xl border text-xs flex items-center justify-between ${csvImportStatus.startsWith("✓") ? "bg-emerald-500/10 border-emerald-500/25 text-emerald-300" : "bg-red-500/10 border-red-500/20 text-red-300"}`}>
          <span className="font-mono">{csvImportStatus}</span>
          <button onClick={() => setCsvImportStatus(null)} className="p-1 hover:opacity-80">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ── Filter & Search Control Panel ── */}
      <div className="space-y-3 p-4 sm:p-5 rounded-2xl bg-white/[0.02] border border-white/10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Search box (spanning 6 cols on md) */}
          <div className="relative md:col-span-6">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by student name, email, roll no, mobile..."
              className="w-full pl-10 pr-9 py-3 bg-white/[0.04] border border-white/15 rounded-xl text-xs text-white placeholder:text-white/40 focus:outline-none focus:border-white/50 transition-all font-mono"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Department Filter (spanning 3 cols) */}
          <div className="md:col-span-3">
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="w-full px-3.5 py-3 bg-[#111] border border-white/15 rounded-xl text-xs text-white focus:outline-none focus:border-white/50 transition-all cursor-pointer font-mono font-medium"
            >
              <option value="all">All Departments ({registrations.length})</option>
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept} ({registrations.filter((r) => r.department === dept).length})
                </option>
              ))}
            </select>
          </div>

          {/* Year Filter (spanning 3 cols) */}
          <div className="md:col-span-3">
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="w-full px-3.5 py-3 bg-[#111] border border-white/15 rounded-xl text-xs text-white focus:outline-none focus:border-white/50 transition-all cursor-pointer font-mono font-medium"
            >
              <option value="all">All Years of Study ({registrations.length})</option>
              <option value="1">1st Year ({registrations.filter((r) => r.year === 1).length})</option>
              <option value="2">2nd Year ({registrations.filter((r) => r.year === 2).length})</option>
              <option value="3">3rd Year ({registrations.filter((r) => r.year === 3).length})</option>
              <option value="4">4th Year ({registrations.filter((r) => r.year === 4).length})</option>
              <option value="unknown">Unspecified ({registrations.filter((r) => !r.year || r.year <= 0).length})</option>
            </select>
          </div>
        </div>

        {/* Quick Attendance Filter Tabs */}
        <div className="flex items-center justify-between gap-3 pt-2 border-t border-white/5 flex-wrap">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
            <button
              onClick={() => setAttendanceFilter("all")}
              className={`px-3.5 py-2 rounded-xl text-xs font-mono uppercase transition-all whitespace-nowrap ${
                attendanceFilter === "all"
                  ? "bg-white text-black font-bold shadow"
                  : "bg-white/[0.04] border border-white/15 text-white/70 hover:text-white hover:bg-white/10"
              }`}
            >
              All Attendees ({totalCount})
            </button>
            <button
              onClick={() => setAttendanceFilter("checkedin")}
              className={`px-3.5 py-2 rounded-xl text-xs font-mono uppercase transition-all flex items-center gap-1.5 whitespace-nowrap ${
                attendanceFilter === "checkedin"
                  ? "bg-emerald-400 text-black font-bold shadow"
                  : "bg-emerald-500/[0.08] border border-emerald-500/25 text-emerald-300 hover:bg-emerald-500/15"
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Present ({checkedInCount})</span>
            </button>
            <button
              onClick={() => setAttendanceFilter("pending")}
              className={`px-3.5 py-2 rounded-xl text-xs font-mono uppercase transition-all flex items-center gap-1.5 whitespace-nowrap ${
                attendanceFilter === "pending"
                  ? "bg-amber-400 text-black font-bold shadow"
                  : "bg-amber-500/[0.08] border border-amber-500/25 text-amber-300 hover:bg-amber-500/15"
              }`}
            >
              <CircleDot className="w-3.5 h-3.5" />
              <span>Pending ({pendingCount})</span>
            </button>
          </div>

          <div className="text-xs text-white/60 font-mono">
            Showing <strong className="text-white">{filteredRegistrations.length}</strong> of {totalCount}
          </div>
        </div>
      </div>

      {/* ── Empty State ── */}
      {registrations.length === 0 ? (
        <div className="py-24 px-4 rounded-3xl border border-dashed border-white/20 bg-white/[0.01] flex flex-col items-center justify-center space-y-4 text-center">
          <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
            <Users className="w-8 h-8 text-white/40" />
          </div>
          <div className="space-y-1">
            <p className="font-pixel text-base text-white uppercase font-bold">NO_ATTENDEES_REGISTERED</p>
            <p className="text-xs text-white/60 max-w-md mx-auto leading-relaxed">
              Import attendees from your RSVP CSV file or add walk-in participants manually at the front desk.
            </p>
          </div>
          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-5 py-3 rounded-xl bg-white text-black font-pixel text-xs uppercase font-bold hover:bg-white/90 transition-all cursor-pointer"
            >
              + ADD_WALK_IN
            </button>
            <label className="px-5 py-3 rounded-xl bg-white/10 border border-white/20 text-white font-pixel text-xs uppercase font-bold hover:bg-white/15 transition-all cursor-pointer">
              UPLOAD_CSV
              <input type="file" accept=".csv,text/csv" className="hidden" onChange={handleImportCsv} />
            </label>
          </div>
        </div>
      ) : filteredRegistrations.length === 0 ? (
        <div className="py-16 px-4 rounded-3xl border border-dashed border-white/20 bg-white/[0.01] flex flex-col items-center justify-center space-y-3 text-center">
          <p className="font-pixel text-sm text-white uppercase">NO_MATCHING_RECORDS</p>
          <p className="text-xs text-white/60">No participants matched your current search and filters.</p>
          <button
            onClick={() => {
              setSearchQuery("");
              setSelectedDept("all");
              setSelectedYear("all");
              setAttendanceFilter("all");
            }}
            className="px-4 py-2 rounded-xl bg-white/10 border border-white/20 text-xs text-white hover:bg-white/15 transition-all font-mono"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <>
          {/* ── Mobile Touch Cards Layout (< md screens) ── */}
          <div className="space-y-3 md:hidden">
            {filteredRegistrations.map((participant) => {
              const isChecked = checkedInEmails.has(participant.email.toLowerCase());
              const isToggling = isTogglingEmail === participant.email.toLowerCase();
              const yearText = getYearDisplay(participant.year);

              return (
                <div
                  key={participant.email}
                  className={`p-4 rounded-2xl border transition-all space-y-3 ${
                    isChecked
                      ? "bg-emerald-500/[0.03] border-emerald-500/25"
                      : "bg-white/[0.03] border-white/10"
                  }`}
                >
                  {/* Top: Avatar, Name & Attendance Badge */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-10 h-10 rounded-xl font-pixel text-xs flex items-center justify-center shrink-0 border ${
                          isChecked
                            ? "bg-emerald-400 text-black font-bold border-emerald-400 shadow-sm"
                            : "bg-white/10 border-white/20 text-white font-bold"
                        }`}
                      >
                        {isChecked ? "✓" : participant.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-white text-sm uppercase truncate">{participant.name}</p>
                        <a
                          href={`mailto:${participant.email}`}
                          className="text-xs text-white/70 truncate block hover:text-white transition-colors"
                        >
                          {participant.email}
                        </a>
                      </div>
                    </div>

                    {isChecked ? (
                      <span className="shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[10px] font-bold uppercase tracking-wider whitespace-nowrap">
                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> PRESENT
                      </span>
                    ) : (
                      <span className="shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/5 border border-white/15 text-white/60 text-[10px] uppercase tracking-wider font-semibold whitespace-nowrap">
                        <CircleDot className="w-3.5 h-3.5 opacity-60 shrink-0" /> PENDING
                      </span>
                    )}
                  </div>

                  {/* Badges: Department & Year */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="px-2.5 py-1 rounded-lg bg-white/[0.05] border border-white/15 text-white/90 text-[11px] font-semibold">
                      {participant.department || "General"}
                    </span>
                    {yearText && (
                      <span className={`px-2.5 py-1 rounded-lg border text-[11px] font-bold ${getYearBadgeColor(participant.year)}`}>
                        {yearText}
                      </span>
                    )}
                    {participant.college && (
                      <span className="px-2.5 py-1 rounded-lg bg-white/[0.03] border border-white/10 text-white/60 text-[10px] truncate max-w-[220px]">
                        {participant.college}
                      </span>
                    )}
                  </div>

                  {/* Actions & Contact */}
                  <div className={`flex items-center gap-3 pt-3 border-t border-white/10 ${participant.mobile ? "justify-between" : "justify-end"}`}>
                    {participant.mobile && (
                      <a
                        href={`tel:${participant.mobile}`}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white hover:text-emerald-300 transition-colors font-mono"
                      >
                        <Phone className="w-3.5 h-3.5 text-white/50" />
                        <span>{participant.mobile}</span>
                      </a>
                    )}

                    <div className="flex items-center gap-2 flex-1 sm:flex-none justify-end">
                      <button
                        onClick={() => handleToggleCheckin(participant.email)}
                        disabled={isToggling}
                        className={`flex-1 sm:flex-none h-11 px-4 rounded-xl font-pixel text-xs uppercase transition-all flex items-center justify-center gap-2 active:scale-95 cursor-pointer font-bold whitespace-nowrap ${
                          isChecked
                            ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30"
                            : "bg-white text-black hover:bg-white/90 shadow-lg"
                        }`}
                      >
                        {isToggling ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : isChecked ? (
                          <CheckCheck className="w-4 h-4 text-emerald-300" />
                        ) : (
                          <CheckCircle2 className="w-4 h-4 text-black" />
                        )}
                        <span>{isChecked ? "CHECKED" : "CHECK IN"}</span>
                      </button>

                      <button
                        onClick={() => handleDeleteParticipant(participant.email)}
                        disabled={isDeletingEmail === participant.email}
                        className="p-2.5 rounded-xl border border-white/10 text-white/50 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                        title="Delete attendee"
                      >
                        {isDeletingEmail === participant.email ? (
                          <Loader2 className="w-4 h-4 animate-spin text-red-400" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ── Desktop Data Table View (hidden md:block) ── */}
          <div className="hidden md:block rounded-2xl border border-white/15 overflow-hidden bg-black/40 shadow-2xl">
            <div className="overflow-x-auto min-w-full">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-white/15 bg-white/[0.04] text-[10px] text-white/75 font-semibold uppercase tracking-widest font-mono">
                    <th className="py-4 px-5 w-12 text-center">#</th>
                    <th className="py-4 px-5">Participant Name & Email</th>
                    <th className="py-4 px-5">Department</th>
                    <th className="py-4 px-5">Year of Study</th>
                    <th className="py-4 px-5 whitespace-nowrap min-w-[120px]">Attendance</th>
                    {hasMobileColumn && <th className="py-4 px-5">Mobile</th>}
                    <th className="py-4 px-5 text-right whitespace-nowrap">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {filteredRegistrations.map((participant, index) => {
                    const isChecked = checkedInEmails.has(participant.email.toLowerCase());
                    const isToggling = isTogglingEmail === participant.email.toLowerCase();
                    const yearText = getYearDisplay(participant.year);

                    return (
                      <tr
                        key={participant.email}
                        className={`transition-colors group ${
                          isChecked ? "bg-emerald-500/[0.02] hover:bg-emerald-500/[0.05]" : "hover:bg-white/[0.03]"
                        }`}
                      >
                        <td className="py-4 px-5 text-white/50 font-mono text-[11px] text-center">{index + 1}</td>
                        
                        {/* Name & Email (and Phone if no dedicated column) */}
                        <td className="py-4 px-5">
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-9 h-9 rounded-xl font-pixel text-xs flex items-center justify-center shrink-0 border ${
                                isChecked
                                  ? "bg-emerald-400 text-black font-bold border-emerald-400 shadow-sm"
                                  : "bg-white/10 border-white/20 text-white font-bold"
                              }`}
                            >
                              {isChecked ? "✓" : participant.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0 max-w-[280px]">
                              <p className="font-bold text-white uppercase text-sm truncate">{participant.name}</p>
                              <div className="flex items-center gap-2 flex-wrap">
                                <a
                                  href={`mailto:${participant.email}`}
                                  className="text-white/65 hover:text-white transition-colors text-xs truncate"
                                >
                                  {participant.email}
                                </a>
                                {!hasMobileColumn && participant.mobile && (
                                  <a
                                    href={`tel:${participant.mobile}`}
                                    className="inline-flex items-center gap-1 text-[11px] text-emerald-400 hover:text-emerald-300 font-mono transition-colors shrink-0"
                                    title="Call participant"
                                  >
                                    <Phone className="w-3 h-3" />
                                    {participant.mobile}
                                  </a>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Department */}
                        <td className="py-4 px-5">
                          <span className="inline-block px-2.5 py-1 rounded-lg bg-white/[0.05] border border-white/15 text-white/90 text-xs font-semibold whitespace-nowrap">
                            {formatDeptShort(participant.department)}
                          </span>
                        </td>

                        {/* Year of Study */}
                        <td className="py-4 px-5">
                          {yearText ? (
                            <span className={`inline-block px-2.5 py-1 rounded-lg border text-xs font-bold whitespace-nowrap ${getYearBadgeColor(participant.year)}`}>
                              {yearText}
                            </span>
                          ) : (
                            <span className="text-white/40 text-xs font-mono">—</span>
                          )}
                        </td>

                        {/* Attendance Status */}
                        <td className="py-4 px-5 whitespace-nowrap">
                          {isChecked ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[10px] font-bold uppercase tracking-wider whitespace-nowrap shrink-0">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> PRESENT
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/5 border border-white/15 text-white/60 text-[10px] uppercase tracking-wider font-semibold whitespace-nowrap shrink-0">
                              <CircleDot className="w-3.5 h-3.5 opacity-60 shrink-0" /> PENDING
                            </span>
                          )}
                        </td>

                        {/* Mobile (conditional) */}
                        {hasMobileColumn && (
                          <td className="py-4 px-5 whitespace-nowrap">
                            {participant.mobile ? (
                              <a
                                href={`tel:${participant.mobile}`}
                                className="inline-flex items-center gap-1.5 text-white/80 hover:text-emerald-300 transition-colors font-mono text-xs"
                              >
                                <Phone className="w-3 h-3 text-white/50" />
                                <span>{participant.mobile}</span>
                              </a>
                            ) : (
                              <span className="text-white/40 font-mono">—</span>
                            )}
                          </td>
                        )}

                        {/* Actions */}
                        <td className="py-4 px-5 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleToggleCheckin(participant.email)}
                              disabled={isToggling}
                              className={`h-9 px-3.5 rounded-xl font-pixel text-[10px] uppercase transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 font-bold whitespace-nowrap shrink-0 ${
                                isChecked
                                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30"
                                  : "bg-white text-black hover:bg-white/90 shadow-md"
                              }`}
                              title={isChecked ? "Click to undo check-in" : "Click to mark present"}
                            >
                              {isToggling ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : isChecked ? (
                                <CheckCheck className="w-3.5 h-3.5" />
                              ) : (
                                <CheckCircle2 className="w-3.5 h-3.5" />
                              )}
                              <span>{isChecked ? "CHECKED" : "CHECK IN"}</span>
                            </button>

                            <button
                              onClick={() => handleDeleteParticipant(participant.email)}
                              disabled={isDeletingEmail === participant.email}
                              className="p-2 rounded-xl text-white/50 hover:text-red-400 hover:bg-red-500/10 border border-white/10 transition-colors cursor-pointer"
                              title="Delete attendee"
                            >
                              {isDeletingEmail === participant.email ? (
                                <Loader2 className="w-4 h-4 animate-spin text-red-400" />
                              ) : (
                                <Trash2 className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* ── Modal: Add Walk-in Participant ── */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-[120] flex items-end sm:items-center justify-center p-0 sm:p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddModalOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 30 }}
              className="relative w-full sm:max-w-lg bg-[#0b0b0b] border border-white/20 rounded-t-[28px] sm:rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5 max-h-[90dvh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="space-y-1 min-w-0 pr-2">
                  <h3 className="font-pixel text-base text-white uppercase truncate">ADD_WALK_IN_ATTENDEE</h3>
                  <p className="text-[10px] text-white/70 uppercase tracking-widest truncate font-medium">
                    {event.title}
                  </p>
                </div>
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="p-2 rounded-xl text-white/60 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {formError && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs">
                  {formError}
                </div>
              )}

              <form onSubmit={handleSaveParticipant} className="space-y-4 text-xs font-mono">
                <div className="space-y-1.5">
                  <label className="text-[10px] text-white/80 uppercase tracking-wider font-semibold pl-1 block">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Bharath Kumar P"
                    className="w-full px-4 py-3 bg-white/[0.05] border border-white/20 rounded-xl text-white placeholder:text-white/40 text-sm focus:outline-none focus:border-white/60"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] text-white/80 uppercase tracking-wider font-semibold pl-1 block">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="e.g. student@gmail.com"
                    className="w-full px-4 py-3 bg-white/[0.05] border border-white/20 rounded-xl text-white placeholder:text-white/40 text-sm focus:outline-none focus:border-white/60"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-white/80 uppercase tracking-wider font-semibold pl-1 block">Department</label>
                    <input
                      type="text"
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      placeholder="e.g. IT, CSE, ECE..."
                      className="w-full px-4 py-3 bg-white/[0.05] border border-white/20 rounded-xl text-white placeholder:text-white/40 text-sm focus:outline-none focus:border-white/60"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] text-white/80 uppercase tracking-wider font-semibold pl-1 block">Year of Study</label>
                    <select
                      value={formData.year}
                      onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                      className="w-full px-4 py-3 bg-[#111] border border-white/20 rounded-xl text-white text-sm focus:outline-none focus:border-white/60 cursor-pointer font-medium"
                    >
                      <option value="1">1st Year</option>
                      <option value="2">2nd Year</option>
                      <option value="3">3rd Year</option>
                      <option value="4">4th Year</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] text-white/80 uppercase tracking-wider font-semibold pl-1 block">College / Institution</label>
                  <input
                    type="text"
                    value={formData.college}
                    onChange={(e) => setFormData({ ...formData, college: e.target.value })}
                    placeholder="Government College of Engineering, Erode"
                    className="w-full px-4 py-3 bg-white/[0.05] border border-white/20 rounded-xl text-white placeholder:text-white/40 text-sm focus:outline-none focus:border-white/60"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] text-white/80 uppercase tracking-wider font-semibold pl-1 block">Phone / WhatsApp Number</label>
                  <input
                    type="text"
                    value={formData.mobile}
                    onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                    placeholder="e.g. 9876543210"
                    className="w-full px-4 py-3 bg-white/[0.05] border border-white/20 rounded-xl text-white placeholder:text-white/40 text-sm focus:outline-none focus:border-white/60"
                  />
                </div>

                <div className="flex flex-col-reverse sm:flex-row gap-2.5 pt-4 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="w-full sm:w-auto px-6 py-3.5 bg-white/5 border border-white/10 text-white/70 hover:text-white rounded-xl font-pixel text-xs uppercase transition-all"
                  >
                    CANCEL
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingParticipant}
                    className="flex-1 py-3.5 bg-white text-black font-bold rounded-xl font-pixel text-xs uppercase hover:bg-white/90 transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg cursor-pointer"
                  >
                    {isSavingParticipant ? <Loader2 className="w-4 h-4 animate-spin text-black" /> : <CheckCircle2 className="w-4 h-4 text-black" />}
                    <span>{isSavingParticipant ? "SAVING..." : "REGISTER_PARTICIPANT"}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Modal: Broadcast Email ── */}
      <AnimatePresence>
        {isEmailModalOpen && (
          <div className="fixed inset-0 z-[120] flex items-end sm:items-center justify-center p-0 sm:p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsEmailModalOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 30 }}
              className="relative w-full sm:max-w-2xl bg-[#0b0b0b] border border-white/20 rounded-t-[28px] sm:rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5 max-h-[90dvh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="space-y-1 min-w-0 pr-2">
                  <h3 className="font-pixel text-base text-white uppercase truncate">BROADCAST_EMAIL</h3>
                  <p className="text-[10px] text-white/70 uppercase tracking-widest truncate font-medium">
                    Send announcement to all {registrations.length} attendees
                  </p>
                </div>
                <button
                  onClick={() => setIsEmailModalOpen(false)}
                  className="p-2 rounded-xl text-white/60 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {emailStatus && (
                <div className="p-3.5 rounded-xl bg-white/5 border border-white/20 text-white text-xs font-mono">
                  {emailStatus}
                </div>
              )}

              <div className="space-y-4 text-xs font-mono">
                <div className="space-y-1.5">
                  <label className="text-[10px] text-white/80 uppercase tracking-wider font-semibold pl-1 block">Subject *</label>
                  <input
                    type="text"
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                    placeholder="e.g. Schedule & Venue update for tomorrow"
                    className="w-full px-4 py-3 bg-white/[0.05] border border-white/20 rounded-xl text-white placeholder:text-white/40 text-sm focus:outline-none focus:border-white/60"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] text-white/80 uppercase tracking-wider font-semibold pl-1 block">Message Content *</label>
                  <textarea
                    rows={5}
                    value={emailMessage}
                    onChange={(e) => setEmailMessage(e.target.value)}
                    placeholder="Write instructions, venue directions, or reminders..."
                    className="w-full px-4 py-3 bg-white/[0.05] border border-white/20 rounded-xl text-white placeholder:text-white/40 text-sm focus:outline-none focus:border-white/60 resize-y"
                  />
                </div>

                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2.5">
                  <p className="text-[10px] text-white/70 uppercase tracking-wider font-semibold">Send Test Email First</p>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="email"
                      value={testEmail}
                      onChange={(e) => setTestEmail(e.target.value)}
                      placeholder="your.email@example.com"
                      className="flex-1 px-4 py-2.5 bg-black/40 border border-white/20 rounded-xl text-white placeholder:text-white/40 text-xs focus:outline-none focus:border-white/50 font-mono"
                    />
                    <button
                      onClick={handleSendTestEmail}
                      disabled={isTestEmailing || !testEmail.trim()}
                      className="h-10 px-4 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-xl font-pixel text-[10px] uppercase disabled:opacity-40 cursor-pointer font-bold"
                    >
                      {isTestEmailing ? "SENDING..." : "TEST.SYS"}
                    </button>
                  </div>
                </div>

                <div className="flex flex-col-reverse sm:flex-row gap-2.5 pt-3 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setIsEmailModalOpen(false)}
                    className="w-full sm:w-auto px-6 py-3.5 bg-white/5 border border-white/10 text-white/70 hover:text-white rounded-xl font-pixel text-xs uppercase"
                  >
                    CLOSE
                  </button>
                  <button
                    onClick={handleSendEmail}
                    disabled={isEmailing || registrations.length === 0}
                    className="flex-1 py-3.5 bg-white text-black font-bold rounded-xl font-pixel text-xs uppercase hover:bg-white/90 transition-all flex items-center justify-center gap-2 disabled:opacity-40 shadow-lg cursor-pointer"
                  >
                    {isEmailing ? <Loader2 className="w-4 h-4 animate-spin text-black" /> : <Mail className="w-4 h-4 text-black" />}
                    <span>{isEmailing ? "DISPATCHING..." : `SEND_TO_${registrations.length}_ATTENDEES`}</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
