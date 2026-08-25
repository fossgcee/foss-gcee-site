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
  Sparkles,
  ExternalLink,
  ShieldCheck,
  CircleDot
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

export default function AdminEventRegistrationsPage() {
  const params = useParams();
  const id = params.id as string;

  const [event, setEvent] = useState<EventMetadata | null>(null);
  const [registrations, setRegistrations] = useState<MemberRegistration[]>([]);
  const [checkedInEmails, setCheckedInEmails] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDept, setSelectedDept] = useState("all");
  const [attendanceFilter, setAttendanceFilter] = useState<"all" | "checkedin" | "pending">("all");

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
    department: "CSE",
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
  const fetchRegistrations = async () => {
    try {
      setLoading(true);
      const [regRes, checkinRes] = await Promise.all([
        fetch(`/api/admin/events/registrations?id=${id}`),
        fetch(`/api/events/checkin?id=${id}`),
      ]);

      const regData = await regRes.json();
      const checkinData = await checkinRes.json();

      if (regData.success) {
        setEvent(regData.event);
        setRegistrations(regData.data || []);
        setEmailSubject(`Important Update: ${regData.event?.title || "FOSS GCEE Event"}`);
      }

      if (checkinData.success && checkinData.checkedInEmails) {
        setCheckedInEmails(new Set(checkinData.checkedInEmails.map((e: string) => e.toLowerCase())));
      }
    } catch {
      console.error("Failed to load registrations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchRegistrations();
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

  // Filtered registrations
  const filteredRegistrations = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return registrations.filter((r) => {
      const isCheckedIn = checkedInEmails.has(r.email.toLowerCase());

      const matchSearch =
        !q ||
        r.name.toLowerCase().includes(q) ||
        r.email.toLowerCase().includes(q) ||
        r.department?.toLowerCase().includes(q) ||
        r.college?.toLowerCase().includes(q) ||
        r.mobile?.includes(q);

      const matchDept = selectedDept === "all" || r.department === selectedDept;

      const matchAttendance =
        attendanceFilter === "all" ||
        (attendanceFilter === "checkedin" && isCheckedIn) ||
        (attendanceFilter === "pending" && !isCheckedIn);

      return matchSearch && matchDept && matchAttendance;
    });
  }, [registrations, checkedInEmails, searchQuery, selectedDept, attendanceFilter]);

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
        department: "CSE",
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

  // Toggle Check-in status directly from desk
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
      setCsvImportStatus(`${d.data.inserted} imported, ${d.data.updated} updated, ${d.data.skipped} skipped.`);
    } catch {
      setCsvImportStatus("CSV import failed.");
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
        escapeCell(r.year),
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
    link.download = `${event.slug || "event"}-attendance-list.csv`;
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
      setEmailStatus(`Sent to ${d.data.recipients} registrants in ${d.data.batches} batches.`);
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
      setEmailStatus(`Test email sent successfully to ${tEmail}.`);
    } catch {
      setEmailStatus("Failed to send test email.");
    } finally {
      setIsTestEmailing(false);
    }
  };

  if (loading) {
    return (
      <div className="py-32 flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-10 h-10 text-emerald-400 animate-spin" />
        <p className="font-mono text-xs text-white/30 tracking-[0.3em] uppercase">Loading Registration Logs...</p>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="py-20 max-w-4xl mx-auto text-center space-y-4">
        <p className="font-pixel text-red-400">EVENT_RECORD_NOT_FOUND</p>
        <Link href="/admin/events" className="inline-flex items-center gap-2 text-xs font-mono text-white/50 hover:text-white">
          <ArrowLeft className="w-4 h-4" /> Return to Events
        </Link>
      </div>
    );
  }

  const checkedInCount = checkedInEmails.size;
  const totalCount = registrations.length;
  const checkinPercent = totalCount > 0 ? Math.round((checkedInCount / totalCount) * 100) : 0;

  return (
    <div className="space-y-8 py-8 max-w-7xl mx-auto px-4 sm:px-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-white/10">
        <div className="space-y-3">
          <Link
            href="/admin/events"
            className="inline-flex items-center gap-2 text-[11px] font-mono text-white/40 hover:text-white uppercase tracking-widest transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Return to Events
          </Link>
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-pixel text-white uppercase">{event.title}</h1>
              <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-pixel text-[10px] uppercase font-bold">
                {checkedInCount} / {totalCount} CHECKED IN ({checkinPercent}%)
              </span>
            </div>
            <div className="flex items-center gap-4 text-[10px] font-mono text-white/40 uppercase tracking-widest mt-2 flex-wrap">
              <span>/events/{event.slug}</span>
              {event.startDate && (
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-white/30" /> {event.startDate}
                </span>
              )}
              {event.venue && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-white/30" /> {event.venue}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons Toolbar */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Projector QR Check-in Button */}
          <Link
            href={`/events/${event.slug}/checkin/projector`}
            target="_blank"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-400 text-black font-pixel text-[10px] uppercase font-bold hover:brightness-110 transition-all cursor-pointer shadow-[0_0_25px_rgba(16,185,129,0.3)]"
            title="Launch Projector Fullscreen QR Code"
          >
            <QrCode className="w-4 h-4" /> PROJECTOR_QR
          </Link>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.06] border border-white/15 text-white font-pixel text-[10px] uppercase hover:bg-white/10 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 text-emerald-400" /> ADD_WALK_IN
          </button>

          <label className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white font-pixel text-[10px] uppercase hover:bg-white/[0.08] transition-all cursor-pointer">
            {isImportingCsv ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4 text-emerald-400" />}
            {isImportingCsv ? "IMPORTING..." : "UPLOAD_CSV"}
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
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white font-pixel text-[10px] uppercase hover:bg-white/[0.08] transition-all cursor-pointer disabled:opacity-40"
          >
            <Download className="w-4 h-4 text-blue-400" /> EXPORT_CSV
          </button>

          <button
            onClick={() => setIsEmailModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white font-pixel text-[10px] uppercase hover:bg-white/[0.08] transition-all cursor-pointer"
          >
            <Mail className="w-4 h-4 text-amber-400" /> BROADCAST_EMAIL
          </button>
        </div>
      </div>

      {/* CSV Import Notification Banner */}
      {csvImportStatus && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 font-mono text-xs flex items-center justify-between">
          <span>{csvImportStatus}</span>
          <button onClick={() => setCsvImportStatus(null)} className="text-emerald-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Search & Attendance Filter Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="relative md:col-span-2">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by participant name, email, branch, phone..."
            className="w-full pl-11 pr-4 py-3 bg-white/[0.02] border border-white/10 rounded-xl font-mono text-xs text-white placeholder:text-white/20 focus:outline-none focus:border-emerald-500/50 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Department Filter */}
        <div>
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="w-full px-4 py-3 bg-[#0d0d0d] border border-white/10 rounded-xl font-mono text-xs text-white focus:outline-none focus:border-emerald-500/50 transition-all"
          >
            <option value="all">All Departments ({registrations.length})</option>
            {departments.map((dept) => (
              <option key={dept} value={dept}>
                {dept} ({registrations.filter((r) => r.department === dept).length})
              </option>
            ))}
          </select>
        </div>

        {/* Attendance Status Filter */}
        <div>
          <select
            value={attendanceFilter}
            onChange={(e) => setAttendanceFilter(e.target.value as any)}
            className="w-full px-4 py-3 bg-[#0d0d0d] border border-white/10 rounded-xl font-mono text-xs text-white focus:outline-none focus:border-emerald-500/50 transition-all"
          >
            <option value="all">All Attendees ({totalCount})</option>
            <option value="checkedin">Checked In Only ({checkedInCount})</option>
            <option value="pending">Pending Arrival ({Math.max(0, totalCount - checkedInCount)})</option>
          </select>
        </div>
      </div>

      {/* Participants Counter & Status Bar */}
      <div className="flex items-center justify-between text-xs font-mono text-white/40 uppercase tracking-widest px-1">
        <span>Showing {filteredRegistrations.length} of {registrations.length} participants</span>
        <span className="text-emerald-400">{checkedInCount} Present</span>
      </div>

      {/* Participants Table */}
      {registrations.length === 0 ? (
        <div className="py-24 rounded-3xl border border-dashed border-white/10 bg-white/[0.01] flex flex-col items-center justify-center space-y-4 text-center">
          <Users className="w-12 h-12 text-white/10" />
          <p className="font-pixel text-sm text-white/40 uppercase">NO_REGISTRATIONS_YET</p>
          <p className="font-mono text-xs text-white/30 max-w-sm">
            Add participants manually or upload a CSV export from Google Forms / FOSS United RSVP.
          </p>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-6 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-pixel text-xs uppercase hover:bg-emerald-500/20 transition-all"
          >
            + ADD_FIRST_PARTICIPANT
          </button>
        </div>
      ) : filteredRegistrations.length === 0 ? (
        <div className="py-20 rounded-3xl border border-dashed border-white/10 bg-white/[0.01] flex flex-col items-center justify-center space-y-2 text-center">
          <p className="font-pixel text-xs text-white/40 uppercase">NO_MATCHING_PARTICIPANTS</p>
          <p className="font-mono text-[10px] text-white/20">Try clearing your search query or filters.</p>
        </div>
      ) : (
        <div className="border border-white/10 rounded-2xl overflow-hidden bg-white/[0.01]">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse font-mono text-xs">
              <thead>
                <tr className="border-b border-white/10 bg-white/[0.02] text-[10px] text-white/40 uppercase tracking-widest">
                  <th className="py-4 px-6">#</th>
                  <th className="py-4 px-6">Participant</th>
                  <th className="py-4 px-6">Department</th>
                  <th className="py-4 px-6">Year</th>
                  <th className="py-4 px-6">Attendance</th>
                  <th className="py-4 px-6">Contact</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredRegistrations.map((participant, index) => {
                  const isChecked = checkedInEmails.has(participant.email.toLowerCase());
                  const isToggling = isTogglingEmail === participant.email.toLowerCase();

                  return (
                    <tr key={participant.email} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="py-4 px-6 text-white/30 text-[11px]">{index + 1}</td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg font-pixel text-xs flex items-center justify-center shrink-0 border ${
                            isChecked
                              ? "bg-emerald-500/20 border-emerald-500/30 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.2)]"
                              : "bg-white/5 border-white/10 text-white/40"
                          }`}>
                            {isChecked ? "✓" : participant.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-white uppercase">{participant.name}</p>
                            <a
                              href={`mailto:${participant.email}`}
                              className="text-white/40 hover:text-emerald-400 transition-colors text-[11px]"
                            >
                              {participant.email}
                            </a>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="px-2.5 py-1 rounded-md bg-white/[0.04] border border-white/10 text-white/70 text-[11px]">
                          {participant.department || "—"}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-white/60">
                          {participant.year ? `Year ${participant.year}` : "—"}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        {isChecked ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-wider">
                            <CheckCircle2 className="w-3 h-3" /> PRESENT
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/[0.02] border border-white/10 text-white/30 text-[10px] uppercase tracking-wider">
                            <CircleDot className="w-3 h-3 opacity-40" /> PENDING
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        {participant.mobile ? (
                          <a
                            href={`tel:${participant.mobile}`}
                            className="flex items-center gap-1.5 text-white/60 hover:text-white transition-colors"
                          >
                            <Phone className="w-3 h-3 text-emerald-400" />
                            <span>{participant.mobile}</span>
                          </a>
                        ) : (
                          <span className="text-white/20">—</span>
                        )}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleToggleCheckin(participant.email)}
                            disabled={isToggling}
                            className={`p-2 rounded-lg transition-all cursor-pointer ${
                              isChecked
                                ? "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20"
                                : "bg-white/[0.03] text-white/30 hover:text-white hover:bg-white/[0.08] border border-white/10"
                            }`}
                            title={isChecked ? "Mark as un-checked in" : "Mark as checked in"}
                          >
                            {isToggling ? (
                              <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
                            ) : (
                              <CheckCircle2 className="w-4 h-4" />
                            )}
                          </button>

                          <button
                            onClick={() => handleDeleteParticipant(participant.email)}
                            disabled={isDeletingEmail === participant.email}
                            className="p-2 rounded-lg text-white/20 hover:text-red-400 hover:bg-red-500/10 transition-all disabled:opacity-50 cursor-pointer"
                            title="Remove attendee"
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
      )}

      {/* Modal: Manually Add Participant */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddModalOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-lg bg-[#0b0b0b] border border-white/15 rounded-3xl p-8 shadow-2xl space-y-6"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="space-y-1">
                  <h3 className="font-pixel text-lg text-white uppercase">ADD_WALK_IN_PARTICIPANT</h3>
                  <p className="font-mono text-[9px] text-white/40 uppercase tracking-widest">
                    Manual registration for {event.title}
                  </p>
                </div>
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="p-2 rounded-xl text-white/40 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {formError && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 font-mono text-xs">
                  {formError}
                </div>
              )}

              <form onSubmit={handleSaveParticipant} className="space-y-4 font-mono text-xs">
                <div className="space-y-1">
                  <label className="text-[10px] text-white/40 uppercase tracking-wider pl-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Bharath Kumar P"
                    className="w-full px-4 py-3 bg-white/[0.03] border border-white/10 rounded-xl text-white focus:outline-none focus:border-emerald-500/50"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-white/40 uppercase tracking-wider pl-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="e.g. bharath@gmail.com"
                    className="w-full px-4 py-3 bg-white/[0.03] border border-white/10 rounded-xl text-white focus:outline-none focus:border-emerald-500/50"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] text-white/40 uppercase tracking-wider pl-1">Department</label>
                    <input
                      type="text"
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      placeholder="CSE, IT, ECE..."
                      className="w-full px-4 py-3 bg-white/[0.03] border border-white/10 rounded-xl text-white focus:outline-none focus:border-emerald-500/50"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-white/40 uppercase tracking-wider pl-1">Year of Study</label>
                    <select
                      value={formData.year}
                      onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                      className="w-full px-4 py-3 bg-[#0f0f0f] border border-white/10 rounded-xl text-white focus:outline-none focus:border-emerald-500/50"
                    >
                      <option value="1">1st Year</option>
                      <option value="2">2nd Year</option>
                      <option value="3">3rd Year</option>
                      <option value="4">4th Year</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-white/40 uppercase tracking-wider pl-1">College / Institution</label>
                  <input
                    type="text"
                    value={formData.college}
                    onChange={(e) => setFormData({ ...formData, college: e.target.value })}
                    placeholder="Government College of Engineering, Erode"
                    className="w-full px-4 py-3 bg-white/[0.03] border border-white/10 rounded-xl text-white focus:outline-none focus:border-emerald-500/50"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-white/40 uppercase tracking-wider pl-1">Mobile / Phone Number</label>
                  <input
                    type="text"
                    value={formData.mobile}
                    onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                    placeholder="e.g. 9876543210"
                    className="w-full px-4 py-3 bg-white/[0.03] border border-white/10 rounded-xl text-white focus:outline-none focus:border-emerald-500/50"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="flex-1 py-3 bg-white/[0.04] border border-white/10 text-white/60 hover:text-white rounded-xl font-pixel text-[10px] uppercase transition-all"
                  >
                    CANCEL
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingParticipant}
                    className="flex-[2] py-3 bg-emerald-500 text-black font-bold rounded-xl font-pixel text-[10px] uppercase hover:bg-emerald-400 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                  >
                    {isSavingParticipant ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                    {isSavingParticipant ? "SAVING..." : "CONFIRM_ADD"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal: Broadcast Email */}
      <AnimatePresence>
        {isEmailModalOpen && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsEmailModalOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-2xl bg-[#0b0b0b] border border-white/15 rounded-3xl p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="space-y-1">
                  <h3 className="font-pixel text-lg text-white uppercase">BROADCAST_EMAIL</h3>
                  <p className="font-mono text-[9px] text-white/40 uppercase tracking-widest">
                    Notify {registrations.length} attendees of {event.title}
                  </p>
                </div>
                <button
                  onClick={() => setIsEmailModalOpen(false)}
                  className="p-2 rounded-xl text-white/40 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {emailStatus && (
                <div className="p-3 rounded-xl bg-white/[0.04] border border-white/10 text-emerald-400 font-mono text-xs">
                  {emailStatus}
                </div>
              )}

              <div className="space-y-4 font-mono text-xs">
                <div className="space-y-1">
                  <label className="text-[10px] text-white/40 uppercase tracking-wider pl-1">Email Subject</label>
                  <input
                    type="text"
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                    placeholder="e.g. Schedule & Venue update for tomorrow"
                    className="w-full px-4 py-3 bg-white/[0.03] border border-white/10 rounded-xl text-white focus:outline-none focus:border-white/30"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-white/40 uppercase tracking-wider pl-1">Message Content</label>
                  <textarea
                    rows={6}
                    value={emailMessage}
                    onChange={(e) => setEmailMessage(e.target.value)}
                    placeholder="Write announcement, instructions, or meeting links..."
                    className="w-full px-4 py-3 bg-white/[0.03] border border-white/10 rounded-xl text-white focus:outline-none focus:border-white/30 resize-y"
                  />
                </div>

                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-3">
                  <p className="text-[10px] text-white/40 uppercase tracking-wider">Test Before Sending</p>
                  <div className="flex gap-2">
                    <input
                      type="email"
                      value={testEmail}
                      onChange={(e) => setTestEmail(e.target.value)}
                      placeholder="your.email@example.com"
                      className="flex-1 px-4 py-2 bg-black/40 border border-white/10 rounded-xl text-white focus:outline-none"
                    />
                    <button
                      onClick={handleSendTestEmail}
                      disabled={isTestEmailing || !testEmail.trim()}
                      className="px-4 py-2 bg-white/10 border border-white/20 text-white rounded-xl font-pixel text-[10px] uppercase hover:bg-white/20 disabled:opacity-40"
                    >
                      {isTestEmailing ? "SENDING..." : "TEST.SYS"}
                    </button>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsEmailModalOpen(false)}
                    className="flex-1 py-3 bg-white/[0.04] border border-white/10 text-white/60 hover:text-white rounded-xl font-pixel text-[10px] uppercase"
                  >
                    CLOSE
                  </button>
                  <button
                    onClick={handleSendEmail}
                    disabled={isEmailing || registrations.length === 0}
                    className="flex-[2] py-3 bg-white text-black font-bold rounded-xl font-pixel text-[10px] uppercase hover:bg-white/90 transition-all flex items-center justify-center gap-2 disabled:opacity-40"
                  >
                    {isEmailing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
                    {isEmailing ? "DISPATCHING..." : `SEND_TO_${registrations.length}_ATTENDEES`}
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
