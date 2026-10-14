/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useEffect } from "react";
import {
  Calendar as CalendarIcon, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  ExternalLink,
  MapPin,
  X,
  Upload,
  Loader2,
  Trash,
  Users,
  Download,
  Mail,
  MailOpen,
  Phone,
  Image as ImageIcon,
  Send,
  MessageSquare,
  Star
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";

interface AgendaItem {
  time: string;
  title: string;
  topic?: string;
  description: string;
}

interface EventData {
  _id?: string;
  title: string;
  slug: string;
  description: string;
  academicYear: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  venue: string;
  category: "workshop" | "talk" | "hackathon" | "meetup" | "other";
  handledBy: string;
  speaker?: string;
  organizers: string[];
  poster?: string;
  photos?: string[];
  galleryLink?: string;
  registrationMode?: "internal" | "external";
  externalRsvpUrl?: string;
  agenda?: AgendaItem[];
  outcomes?: string;
  status: "upcoming" | "completed" | "draft";
  isFeatured?: boolean;
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

export default function AdminEventsManager() {
  const [events, setEvents] = useState<EventData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all");
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRegModalOpen, setIsRegModalOpen] = useState(false);
  const [regLoading, setRegLoading] = useState(false);
  const [registrations, setRegistrations] = useState<MemberRegistration[]>([]);
  const [selectedEventReg, setSelectedEventReg] = useState<EventData | null>(null);
  const [isImportingCsv, setIsImportingCsv] = useState(false);
  const [csvImportStatus, setCsvImportStatus] = useState<string | null>(null);
  const [emailSubject, setEmailSubject] = useState("");
  const [emailMessage, setEmailMessage] = useState("");
  const [emailStatus, setEmailStatus] = useState<string | null>(null);
  const [isEmailing, setIsEmailing] = useState(false);
  const [testEmail, setTestEmail] = useState("");
  const [isTestEmailing, setIsTestEmailing] = useState(false);

  // Mail Attendees modal state
  const [isMailAttendeesOpen, setIsMailAttendeesOpen] = useState(false);
  const [mailAttendeesEvent, setMailAttendeesEvent] = useState<EventData | null>(null);
  const [mailGalleryLink, setMailGalleryLink] = useState("");
  const [mailCustomMessage, setMailCustomMessage] = useState("");
  const [mailAttendeesStatus, setMailAttendeesStatus] = useState<string | null>(null);
  const [isMailingSending, setIsMailingSending] = useState(false);
  
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isDeletingReg, setIsDeletingReg] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [posterUploadError, setPosterUploadError] = useState<string | null>(null);
  
  // Form state
  const [editingEvent, setEditingEvent] = useState<EventData | null>(null);
  const [formData, setFormData] = useState<EventData>({
    title: "",
    slug: "",
    description: "",
    academicYear: "",
    startDate: "",
    endDate: "",
    startTime: "09:00",
    endTime: "17:00",
    venue: "",
    category: "workshop",
    handledBy: "",
    speaker: "",
    organizers: [],
    photos: [],
    galleryLink: "",
    registrationMode: "internal",
    externalRsvpUrl: "",
    agenda: [],
    outcomes: "",
    status: "upcoming",
    isFeatured: false,
    registrationsCount: 0
  });

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/events");
      const d = await res.json();
      if (d.success) setEvents(d.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchEvents(); }, []);

  const fetchRegistrations = async (event: EventData) => {
    setSelectedEventReg(event);
    setEmailSubject(`Upcoming Event: ${event.title}`);
    setEmailMessage("");
    setEmailStatus(null);
    setCsvImportStatus(null);
    setIsRegModalOpen(true);
    setRegLoading(true);
    try {
      const res = await fetch(`/api/admin/events/registrations?eventSlug=${event.slug}`);
      const d = await res.json();
      if (d.success) setRegistrations(d.data);
    } finally {
      setRegLoading(false);
    }
  };

  const handleImportRegistrations = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedEventReg) return;

    const body = new FormData();
    body.append("eventSlug", selectedEventReg.slug);
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
      setEvents(prev => prev.map(event => (
        event._id === selectedEventReg._id
          ? { ...event, registrationsCount: d.data.count }
          : event
      )));
      setSelectedEventReg(prev => prev ? { ...prev, registrationsCount: d.data.count } : prev);
      setCsvImportStatus(`${d.data.inserted} imported, ${d.data.updated} updated, ${d.data.skipped} skipped.`);
    } catch {
      setCsvImportStatus("CSV import failed.");
    } finally {
      setIsImportingCsv(false);
      e.target.value = "";
    }
  };

  const handleExportCsv = () => {
    if (!selectedEventReg || registrations.length === 0) return;

    const escapeCell = (val: string | number | undefined | null) => {
      const str = String(val ?? "");
      if (str.includes(",") || str.includes('"') || str.includes("\n")) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const headers = ["Name", "Email", "Department", "College", "Year", "Mobile", "Registered At"];
    const rows = registrations.map((r) => [
      escapeCell(r.name),
      escapeCell(r.email),
      escapeCell(r.department),
      escapeCell(r.college),
      escapeCell(r.year),
      escapeCell(r.mobile),
      escapeCell(r.registeredAt ? new Date(r.registeredAt).toLocaleString() : ""),
    ]);

    const csvContent = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${selectedEventReg.slug || "event"}-registrations.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleSendEmail = async () => {
    if (!selectedEventReg) return;
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
          eventSlug: selectedEventReg.slug,
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

  const handleSendTestEmail = async () => {
    if (!selectedEventReg) return;
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
          eventSlug: selectedEventReg.slug,
          subject,
          message,
          testEmail: tEmail
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

  const handleCreateNew = () => {
    setEditingEvent(null);
    setFormData({
      title: "", slug: "", description: "", academicYear: "", startDate: "", endDate: "",
      startTime: "09:00", endTime: "17:00", venue: "", category: "workshop",
      handledBy: "", speaker: "", organizers: [], photos: [], agenda: [], outcomes: "",
      registrationMode: "internal", externalRsvpUrl: "",
      status: "upcoming", isFeatured: false, registrationsCount: 0,
      galleryLink: ""
    });
    setIsModalOpen(true);
  };

  const handleEdit = (event: EventData) => {
    setEditingEvent(event);
    setFormData({
      ...event,
      registrationMode: event.registrationMode || "internal",
      externalRsvpUrl: event.externalRsvpUrl || "",
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this event? This action cannot be undone.")) return;
    setIsDeleting(id);
    try {
      const res = await fetch(`/api/admin/events?id=${id}`, { method: "DELETE" });
      const d = await res.json();
      if (d.success) fetchEvents();
    } finally {
      setIsDeleting(null);
    }
  };

  const handleDeleteRegistration = async (email: string) => {
    if (!selectedEventReg || !confirm(`Remove ${email} from this event?`)) return;
    setIsDeletingReg(email);
    try {
      const params = new URLSearchParams({
        eventSlug: selectedEventReg.slug,
        email: email
      });
      const res = await fetch(`/api/admin/events/registrations?${params}`, { method: "DELETE" });
      const d = await res.json();
      if (d.success) {
        setRegistrations(prev => prev.filter(r => r.email !== email));
        setEvents(prev => prev.map(e => e._id === selectedEventReg._id ? { ...e, registrationsCount: Math.max(0, e.registrationsCount - 1) } : e));
      } else {
        alert(d.error || "Failed to remove participant");
      }
    } finally {
      setIsDeletingReg(null);
    }
  };

  const handleToggleFeatured = async (event: EventData) => {
    const nextFeatured = !event.isFeatured;
    // Optimistic local state update
    setEvents(prev => prev.map(e => e._id === event._id ? { ...e, isFeatured: nextFeatured } : e));
    try {
      const res = await fetch(`/api/admin/events?id=${event._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isFeatured: nextFeatured }),
      });
      const d = await res.json();
      if (!d.success) {
        // Revert on error
        setEvents(prev => prev.map(e => e._id === event._id ? { ...e, isFeatured: event.isFeatured } : e));
        alert(d.error || "Failed to update featured status");
      }
    } catch {
      setEvents(prev => prev.map(e => e._id === event._id ? { ...e, isFeatured: event.isFeatured } : e));
      alert("Failed to update featured status");
    }
  };

  const buildBlobPath = (file: File, kind: "poster") => {
    const slugRaw = (formData.slug || "draft").toLowerCase();
    const safeSlug = slugRaw.replace(/[^a-z0-9-]+/g, "-").replace(/(^-|-$)/g, "") || "draft";
    const name = file.name || "image";
    const ext = name.includes(".") ? name.split(".").pop()!.toLowerCase() : "";
    const base = name.replace(/\.[^/.]+$/, "").toLowerCase();
    const safeBase = base.replace(/[^a-z0-9-]+/g, "-").replace(/(^-|-$)/g, "") || "image";
    const stamp = new Date().toISOString().replace(/[:.]/g, "-");
    const filename = `${stamp}-${safeBase}${ext ? `.${ext}` : ""}`;
    return `events/${safeSlug}/${kind}/${filename}`;
  };

  const handleUploadPoster = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setPosterUploadError(null);
    try {
      const path = buildBlobPath(file, "poster");
      const res = await fetch(`/api/admin/events/upload?filename=${encodeURIComponent(path)}`, {
        method: "POST", body: file,
      });
      const d = await res.json();
      if (d.url) setFormData(prev => ({ ...prev, poster: d.url }));
      else setPosterUploadError("Poster upload failed. Please try again.");
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(editingEvent ? `/api/admin/events?id=${editingEvent._id}` : "/api/admin/events", {
        method: editingEvent ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      const d = await res.json();
      if (d.success) {
        setIsModalOpen(false);
        fetchEvents();
      } else {
        alert(d.error || "Failed to save event");
      }
    } finally {
      setLoading(false);
    }
  };

  const statusColors: Record<string, string> = {
    upcoming: "border-blue-500/20 bg-blue-500/10 text-blue-400",
    completed: "border-red-500/20 bg-red-500/10 text-red-500",
    draft: "border-amber-500/20 bg-amber-500/10 text-amber-400",
  };

  const statusIcons: Record<string, LucideIcon> = {
    upcoming: Clock, completed: CheckCircle2, draft: AlertCircle,
  };

  const filteredEvents = events.filter(e => {
    const matchesSearch = e.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          e.slug.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter =
      filter === "all"
        ? true
        : filter === "featured"
        ? Boolean(e.isFeatured)
        : e.status === filter;
    return matchesSearch && matchesFilter;
  });

  const formatAcademicYear = (startYear: number) =>
    `${startYear} - ${String(startYear + 1).slice(-2)}`;

  const parseAcademicYearStart = (value: string) => {
    const match = value.match(/\d{4}/);
    return match ? Number.parseInt(match[0], 10) : 0;
  };

  const academicYearOptions = (() => {
    const clubStartYear = 2026;
    const now = new Date();
    const currentStartYear = now.getMonth() >= 5 ? now.getFullYear() : now.getFullYear() - 1;
    const startYear = Math.max(currentStartYear, clubStartYear);
    const baseYears: string[] = [];
    for (let year = startYear; year >= clubStartYear; year -= 1) {
      baseYears.push(formatAcademicYear(year));
    }
    const dynamicYears = events.map(e => e.academicYear).filter(Boolean);
    const currentYear = formData.academicYear ? [formData.academicYear] : [];
    const unique = Array.from(new Set([...baseYears, ...dynamicYears, ...currentYear].map(y => y.trim()).filter(Boolean)));
    const filtered = unique.filter((value) => {
      const year = parseAcademicYearStart(value);
      return year >= clubStartYear && year <= startYear;
    });
    filtered.sort((a, b) => {
      const diff = parseAcademicYearStart(b) - parseAcademicYearStart(a);
      return diff !== 0 ? diff : a.localeCompare(b);
    });
    return filtered;
  })();

  return (
    <div className="space-y-8 py-10">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <h1 className="font-pixel text-white whitespace-nowrap text-[clamp(1.1rem,4vw,1.875rem)]">EVENTS_MANAGER</h1>
          <p className="font-mono text-xs text-white/70 italic">Manage scheduled activities and historical records</p>
        </div>

        <button 
          onClick={handleCreateNew}
          className="flex items-center justify-center gap-2 px-6 py-3.5 bg-white text-black rounded-xl font-pixel text-[11px] hover:bg-white/90 transition-all active:scale-95 shrink-0 group shadow-[0_4px_20px_rgba(255,255,255,0.1)] cursor-pointer w-full sm:w-auto min-h-[44px]"
        >
          <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" />
          CREATE_NEW_RECORD
        </button>
      </div>

      {/* Control Bar */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
          <input 
            type="text" 
            placeholder="Search events by title or slug..." 
            className="w-full pl-12 pr-4 py-3 bg-white/[0.04] border border-white/15 rounded-2xl font-mono text-xs text-white placeholder:text-white/40 focus:outline-none focus:border-white/50 transition-all min-h-[44px]"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="overflow-x-auto no-scrollbar py-1 max-w-full -mx-1 px-1">
          <div className="p-1 bg-white/[0.04] border border-white/15 rounded-2xl flex items-center gap-1 min-w-max">
            {["all", "upcoming", "completed", "featured", "draft"].map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl text-[10px] font-pixel transition-all cursor-pointer whitespace-nowrap shrink-0 min-h-[38px] ${filter === tab ? "bg-white/20 text-white font-bold border border-white/30" : "text-white/70 hover:text-white hover:bg-white/5"}`}
              >
                {tab === "featured" ? "★ FEATURED" : tab.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Events List */}
      <div className="grid grid-cols-1 gap-4">
        {loading && events.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-4">
            <Loader2 className="w-8 h-8 text-white/60 animate-spin" />
            <p className="font-mono text-xs text-white/60 italic tracking-widest uppercase">Fetching logs...</p>
          </div>
        ) : filteredEvents.map((event) => {
          const StatusIcon = statusIcons[event.status];
          return (
            <div key={event._id} className="group relative p-1 rounded-3xl border border-white/15 bg-white/[0.03] hover:border-white/30 transition-all">
              <div className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-5 sm:gap-6">
                <div className="flex items-start gap-3.5 sm:gap-5 min-w-0 flex-1">
                  <div className={`p-3 sm:p-4 rounded-2xl border ${statusColors[event.status]} shrink-0 flex items-center justify-center`}>
                    <CalendarIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <div className="space-y-2 min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-lg border text-[9px] font-mono flex items-center gap-1.5 ${statusColors[event.status]}`}>
                        <StatusIcon className="w-3 h-3" /> {event.status.toUpperCase()}
                      </span>
                      <span className="px-2 py-0.5 rounded-lg border border-white/15 bg-white/10 text-[9px] font-mono text-white/80">{event.category.toUpperCase()}</span>
                      {event.isFeatured && (
                        <span className="px-2 py-0.5 rounded-lg border border-amber-500/30 bg-amber-500/10 text-amber-300 text-[9px] font-mono flex items-center gap-1 font-semibold">
                          <Star className="w-3 h-3 fill-amber-300" /> FEATURED ON HOME
                        </span>
                      )}
                    </div>
                    <div>
                      <h3 className="text-base sm:text-lg font-pixel text-white mb-1 uppercase tracking-tight break-words">{event.title}</h3>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-[10px] text-white/70">
                        <span className="flex items-center gap-1.5"><MapPin className="w-3 h-3 text-white/50" /> {event.venue}</span>
                        <span className="flex items-center gap-1.5 font-bold text-white/80 lowercase italic">{event.startDate} → {event.endDate}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between md:justify-end gap-3 sm:gap-4 pt-3 sm:pt-4 md:pt-0 border-t md:border-t-0 border-white/10 shrink-0 w-full md:w-auto">
                  <Link 
                    href={`/admin/events/${event._id}/registrations`}
                    className="flex items-center justify-between sm:justify-start gap-3 sm:gap-4 group/reg p-2.5 sm:p-0 rounded-xl bg-white/[0.03] sm:bg-transparent border sm:border-0 border-white/10"
                    title="Manage Attendees & RSVP Logs"
                  >
                    <div className="space-y-0.5 text-left sm:text-right shrink-0">
                      <p className="text-[9px] font-mono text-white/70 uppercase tracking-[0.2em] font-semibold">REGISTERED</p>
                      <p className="text-base sm:text-xl font-pixel text-white">{event.registrationsCount}</p>
                    </div>
                    <div className="p-2 sm:p-2.5 rounded-xl border border-white/20 bg-white/10 text-white group-hover/reg:bg-white/20 transition-all">
                      <Users className="w-4 h-4" />
                    </div>
                  </Link>
                  <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 w-full sm:w-auto">
                    <button
                      onClick={() => handleToggleFeatured(event)}
                      className={`flex items-center gap-1.5 px-3 py-2 sm:py-2.5 rounded-xl border text-[9px] sm:text-[10px] font-pixel transition-all cursor-pointer min-h-[38px] ${
                        event.isFeatured
                          ? "border-amber-500/40 bg-amber-500/20 text-amber-300 hover:bg-amber-500/30"
                          : "border-white/15 bg-white/5 text-white/70 hover:text-white hover:bg-white/15"
                      }`}
                      title={event.isFeatured ? "Unpin from home page terminal" : "Feature on home page terminal"}
                    >
                      <Star className={`w-3.5 h-3.5 ${event.isFeatured ? "fill-amber-300 text-amber-300" : ""}`} />
                      {event.isFeatured ? "FEATURED" : "FEATURE"}
                    </button>
                    <Link href={`/events/${event.slug}`} target="_blank" className="p-2 sm:p-2.5 rounded-xl border border-white/15 bg-white/5 text-white/70 hover:text-white transition-all min-h-[38px] min-w-[38px] flex items-center justify-center" title="View Public Page"><ExternalLink className="w-4 h-4" /></Link>
                    <Link href={`/admin/events/${event._id}/registrations`} className="flex items-center gap-1.5 px-3 py-2 sm:py-2.5 rounded-xl border border-white/20 bg-white/10 text-white hover:bg-white/20 transition-all text-[9px] sm:text-[10px] font-pixel min-h-[38px]"><Users className="w-3.5 h-3.5" /> RSVPS</Link>
                    <Link href={`/admin/events/${event._id}`} className="flex items-center gap-1.5 px-3 py-2 sm:py-2.5 rounded-xl border border-white/15 bg-white/5 text-white/70 hover:text-white hover:bg-white/15 transition-all text-[9px] sm:text-[10px] font-pixel min-h-[38px]"><ImageIcon className="w-3.5 h-3.5" /> CONTENT</Link>
                    <button onClick={() => handleEdit(event)} className="p-2 sm:p-2.5 rounded-xl border border-white/15 bg-white/5 text-white/70 hover:text-white transition-all cursor-pointer min-h-[38px] min-w-[38px] flex items-center justify-center" title="Edit Event"><Edit3 className="w-4 h-4" /></button>
                    {event.status === "completed" && (
                      <button
                        onClick={() => {
                          setMailAttendeesEvent(event);
                          setMailGalleryLink(event.galleryLink || "");
                          setMailCustomMessage("");
                          setMailAttendeesStatus(null);
                          setIsMailAttendeesOpen(true);
                        }}
                        className="p-2 sm:p-2.5 rounded-xl border border-white/15 bg-white/5 text-white/60 hover:text-white transition-all min-h-[38px] min-w-[38px] flex items-center justify-center"
                        title="Mail Attendees"
                      >
                        <MailOpen className="w-4 h-4" />
                      </button>
                    )}
                    <button 
                      onClick={() => handleDelete(event._id!)} 
                      disabled={isDeleting === event._id}
                      className="p-2 sm:p-2.5 rounded-xl border border-white/5 bg-white/[0.02] text-red-400/50 hover:text-red-400 transition-all disabled:opacity-50 min-h-[38px] min-w-[38px] flex items-center justify-center"
                      title="Delete Event"
                    >
                      {isDeleting === event._id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Registration List Modal */}
      <AnimatePresence>
        {isRegModalOpen && (
          <div className="fixed inset-0 z-[101] flex items-center justify-end">
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsRegModalOpen(false)} className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
             <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 200 }} className="relative h-full w-full max-w-2xl bg-[#080808] border-l border-white/10 shadow-2xl flex flex-col">
                <div className="p-5 sm:p-8 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
                   <div className="space-y-1">
                      <h4 className="font-pixel text-white text-base sm:text-lg">REGISTRATION_LOGS</h4>
                      <p className="font-mono text-[10px] text-white/60 uppercase tracking-widest">{selectedEventReg?.title}</p>
                   </div>
                   <button onClick={() => setIsRegModalOpen(false)} className="p-2.5 rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition-all"><X className="w-5 h-5 sm:w-6 sm:h-6" /></button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 sm:p-8">
                   <div className="mb-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.04] p-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="space-y-1">
                          <p className="font-pixel text-[10px] text-white uppercase font-bold">IMPORT_RSVP_CSV</p>
                          <p className="font-mono text-[9px] text-white/60 uppercase tracking-widest">FOSS United or external RSVP export</p>
                        </div>
                        <label className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 font-pixel text-[10px] uppercase cursor-pointer hover:bg-emerald-500/20 transition-all min-h-[40px]">
                          {isImportingCsv ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                          {isImportingCsv ? "IMPORTING" : "UPLOAD_CSV"}
                          <input
                            type="file"
                            accept=".csv,text/csv"
                            className="hidden"
                            onChange={handleImportRegistrations}
                            disabled={isImportingCsv || regLoading}
                          />
                        </label>
                      </div>
                      {csvImportStatus && (
                        <p className="mt-3 font-mono text-[9px] text-white/70 uppercase tracking-widest">{csvImportStatus}</p>
                      )}
                   </div>

                   {regLoading ? (
                     <div className="h-full flex flex-col items-center justify-center space-y-4">
                        <Loader2 className="w-10 h-10 text-white/40 animate-spin" />
                        <p className="font-mono text-[10px] text-white/40 uppercase tracking-[0.3em]">Querying Database...</p>
                     </div>
                   ) : registrations.length === 0 ? (
                     <div className="h-full flex flex-col items-center justify-center space-y-4 text-white/40">
                        <Users className="w-16 h-16 opacity-30" />
                        <p className="font-pixel text-[10px] uppercase">No Registrations Yet</p>
                     </div>
                   ) : (
                     <div className="space-y-6">
                        {/* Search in registrations */}
                        <div className="relative group">
                          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/40" />
                          <input 
                            type="text" 
                            placeholder="Find participant by name or reg no..." 
                            className="w-full pl-10 pr-4 py-3 bg-white/[0.04] border border-white/15 rounded-xl font-mono text-xs text-white placeholder:text-white/40 focus:outline-none focus:border-white/30 transition-all min-h-[44px]"
                            onChange={(e) => {
                              const val = e.target.value.toLowerCase();
                              const items = document.querySelectorAll<HTMLElement>(".reg-item");
                              items.forEach((item) => {
                                const text = item.innerText.toLowerCase();
                                item.style.display = text.includes(val) ? "flex" : "none";
                              });
                            }}
                          />
                        </div>

                        <div className="space-y-3 sm:space-y-4">
                           {registrations.map((reg, idx) => (
                              <div key={reg._id || idx} className="reg-item p-4 sm:p-5 rounded-2xl bg-white/[0.02] border border-white/10 hover:border-white/20 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6">
                                 <div className="space-y-2">
                                    <div>
                                       <div className="flex items-center gap-2 mb-1">
                                          <h5 className="font-pixel text-xs sm:text-sm text-white uppercase">{reg.name}</h5>
                                          <span className="px-1.5 py-0.5 rounded bg-white/10 text-[8px] font-mono text-white/60">{new Date(reg.registeredAt).toLocaleDateString()}</span>
                                       </div>
                                       <p className="font-mono text-[10px] text-white/60 uppercase">{reg.department} · YEAR {reg.year}</p>
                                    </div>
                                    <p className="font-mono text-[9px] text-white/50 italic uppercase">{reg.college}</p>
                                 </div>
                                 <div className="flex flex-col gap-2 shrink-0">
                                    <a href={`mailto:${reg.email}`} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-[10px] font-mono text-white/80 hover:text-white hover:bg-white/10 transition-all min-h-[36px]">
                                       <Mail className="w-3.5 h-3.5" /> {reg.email}
                                    </a>
                                    <div className="flex items-center gap-2">
                                      <a href={`https://wa.me/${reg.mobile}`} target="_blank" className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-mono text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/20 transition-all min-h-[36px]">
                                         <Phone className="w-3.5 h-3.5" /> {reg.mobile}
                                      </a>
                                      <button 
                                        onClick={() => handleDeleteRegistration(reg.email)}
                                        disabled={isDeletingReg === reg.email}
                                        className="p-2 rounded-lg border border-red-500/20 bg-red-500/5 text-red-400 hover:text-red-300 hover:bg-red-500/15 transition-all disabled:opacity-50 flex items-center justify-center min-h-[36px] min-w-[36px]"
                                        title="Remove participant"
                                      >
                                        {isDeletingReg === reg.email ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                                      </button>
                                    </div>
                                 </div>
                              </div>
                           ))}
                        </div>
                     </div>
                   )}
                </div>
                
                <div className="p-4 sm:p-8 border-t border-white/10 bg-white/[0.01] space-y-4">
                   <div className="rounded-2xl border border-white/15 bg-white/[0.02] p-4 space-y-3">
                      <div className="flex items-center justify-between">
                         <p className="font-pixel text-[10px] text-white uppercase font-bold">EMAIL_REGISTRANTS</p>
                         <p className="font-mono text-[9px] text-white/60 uppercase tracking-widest">{registrations.length} recipients</p>
                      </div>
                      <input
                        value={emailSubject}
                        onChange={(e) => setEmailSubject(e.target.value)}
                        placeholder="Subject"
                        className="w-full px-4 py-2.5 bg-white/[0.03] border border-white/10 rounded-xl font-mono text-[10px] text-white focus:outline-none focus:border-white/20 transition-all placeholder:text-white/20"
                      />
                      <textarea
                        value={emailMessage}
                        onChange={(e) => setEmailMessage(e.target.value)}
                        placeholder="Message for registered members..."
                        rows={4}
                        className="w-full px-4 py-3 bg-white/[0.03] border border-white/10 rounded-xl font-mono text-[10px] text-white focus:outline-none focus:border-white/20 transition-all placeholder:text-white/20 resize-none"
                      />
                      <input
                        value={testEmail}
                        onChange={(e) => setTestEmail(e.target.value)}
                        placeholder="Test email address (optional)"
                        className="w-full px-4 py-2.5 bg-white/[0.03] border border-white/10 rounded-xl font-mono text-[10px] text-white focus:outline-none focus:border-white/20 transition-all placeholder:text-white/20"
                      />
                      {emailStatus && (
                        <p className="font-mono text-[9px] text-white/40 uppercase tracking-widest">{emailStatus}</p>
                      )}
                      <div className="flex gap-3">
                        <button
                          onClick={handleSendTestEmail}
                          disabled={isTestEmailing || !testEmail.trim() || regLoading}
                          className="flex-1 py-3 rounded-2xl bg-white/5 border border-white/10 text-white font-pixel text-[10px] hover:bg-white/10 transition-all flex items-center justify-center gap-2 uppercase disabled:opacity-50"
                        >
                          <Mail className="w-4 h-4" />
                          {isTestEmailing ? "..." : "TEST.SYS"}
                        </button>
                        <button
                          onClick={handleSendEmail}
                          disabled={isEmailing || registrations.length === 0 || regLoading}
                          className="flex-[2] py-3 rounded-2xl bg-white/10 border border-white/20 text-white font-pixel text-[10px] hover:bg-white/20 transition-all flex items-center justify-center gap-3 uppercase disabled:opacity-50"
                        >
                          <Mail className="w-4 h-4" />
                          {isEmailing ? "SENDING..." : "SEND_ALL.SYS"}
                        </button>
                      </div>
                   </div>

                    <button 
                      onClick={handleExportCsv}
                      hidden={registrations.length === 0}
                      className="w-full py-4 rounded-2xl bg-white/5 border border-white/10 text-white font-pixel text-[10px] hover:bg-white/10 transition-all flex items-center justify-center gap-3 uppercase cursor-pointer"
                    >
                      <Download className="w-4 h-4" /> EXPORT_LIST.CSV
                    </button>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Editor Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-black/90 backdrop-blur-md" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-4xl max-h-[92vh] overflow-y-auto bg-[#0a0a0a] border border-white/15 rounded-2xl sm:rounded-[32px] shadow-2xl">
              <div className="p-5 sm:p-8 border-b border-white/10 flex items-center justify-between sticky top-0 bg-[#0a0a0a] z-10 backdrop-blur-md">
                <div className="space-y-1">
                   <h3 className="text-lg sm:text-xl font-pixel text-white uppercase">{editingEvent ? "EDIT_RECORD" : "NEW_RECORD"}</h3>
                   <p className="font-mono text-[9px] text-white/50 uppercase tracking-[0.2em] italic">Database Sector: ./events_log</p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="p-2.5 rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition-colors"><X className="w-5 h-5" /></button>
              </div>

              <form onSubmit={handleSave} className="p-5 sm:p-8 space-y-6 sm:space-y-10">
                {/* Visual Header / Poster Preview */}
                <div className="space-y-3 sm:space-y-4">
                   <label className="text-[10px] font-mono text-white/70 font-semibold uppercase pl-1 tracking-[0.2em]">Media Asset :: Poster</label>
                   <div className="relative group aspect-video md:aspect-[21/9] rounded-2xl sm:rounded-[24px] bg-white/[0.02] border border-dashed border-white/20 overflow-hidden flex items-center justify-center">
                      {formData.poster ? (
                        <>
                           <img src={formData.poster} alt={formData.title ? `${formData.title} poster` : "Event poster"} className="w-full h-full object-cover opacity-60" />
                           <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                           <button type="button" onClick={() => setFormData(prev => ({ ...prev, poster: "" }))} className="absolute top-4 right-4 p-3 rounded-full bg-red-500/80 text-white backdrop-blur shadow-lg hover:scale-110 transition-transform"><Trash className="w-4 h-4" /></button>
                        </>
                      ) : (
                        <label className="flex flex-col items-center justify-center gap-3 cursor-pointer p-6 sm:p-10 text-center hover:bg-white/5 transition-colors w-full h-full group">
                           <div className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-white/5 border border-white/10 group-hover:scale-110 transition-transform">
                              {isUploading ? <Loader2 className="w-8 sm:w-10 h-8 sm:h-10 animate-spin text-white/40" /> : <Upload className="w-8 sm:w-10 h-8 sm:h-10 text-white/40" />}
                           </div>
                           <div className="space-y-1">
                              <span className="font-pixel text-[10px] text-white/60 uppercase tracking-widest block">CHOOSE_POSTER_FILE</span>
                              <span className="font-mono text-[9px] text-white/40 uppercase">Uploads to Vercel Blob</span>
                           </div>
                           <input type="file" className="hidden" accept="image/*" onChange={handleUploadPoster} disabled={isUploading} />
                        </label>
                      )}
                   </div>
                   {posterUploadError && (
                     <p className="font-mono text-[9px] text-red-400 pl-1">{posterUploadError}</p>
                   )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 lg:gap-x-12 gap-y-6 sm:gap-y-10">
                  {/* General Details */}
                  <div className="space-y-6 sm:space-y-8">
                    <div className="space-y-2">
                       <label className="text-[10px] font-mono text-white/85 font-semibold uppercase pl-1 tracking-widest">Event Title</label>
                       <input required type="text" placeholder="e.g. Building AI Tools" className="w-full px-4 sm:px-5 py-3.5 sm:py-4 bg-white/[0.05] border border-white/20 rounded-2xl font-mono text-xs text-white focus:outline-none focus:border-white/60 transition-all font-bold placeholder:text-white/40 uppercase min-h-[44px]" value={formData.title} onChange={e => {
                         const title = e.target.value;
                         setFormData(prev => ({ ...prev, title, slug: title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") }));
                       }} />
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-mono text-white/85 font-semibold uppercase pl-1 tracking-widest">Academic Year</label>
                        <select
                          required
                          className="w-full px-4 sm:px-5 py-3.5 sm:py-4 bg-[#141414] border border-white/20 rounded-2xl font-mono text-[11px] text-white focus:outline-none focus:border-white/60 transition-all appearance-none bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAiIGhlaWdodD0iNiIgdmlld0JveD0iMCAwIDEwIDYiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTEgMUw1IDVMOSAxIiBzdHJva2U9IndoaXRlIiBzdHJva2Utb3BhY2l0eT0iMC42IiBzdHJva2Utd2lkdGg9IjEuNSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+PC9zdmc+')] bg-no-repeat bg-[right_1.25rem_center] min-h-[44px]"
                          value={formData.academicYear}
                          onChange={e => setFormData(prev => ({ ...prev, academicYear: e.target.value }))}
                        >
                          <option value="" disabled className="text-white bg-black">Select Academic Year</option>
                          {academicYearOptions.map((year) => (
                            <option key={year} value={year} className="text-white bg-black">{year}</option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-mono text-white/85 font-semibold uppercase pl-1 tracking-widest">Category</label>
                        <select className="w-full px-4 sm:px-5 py-3.5 sm:py-4 bg-[#141414] border border-white/20 rounded-2xl font-mono text-xs text-white focus:outline-none focus:border-white/60 transition-all appearance-none bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAiIGhlaWdodD0iNiIgdmlld0JveD0iMCAwIDEwIDYiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTEgMUw1IDVMOSAxIiBzdHJva2U9IndoaXRlIiBzdHJva2Utb3BhY2l0eT0iMC42IiBzdHJva2Utd2lkdGg9IjEuNSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+PC9zdmc+')] bg-no-repeat bg-[right_1.25rem_center] min-h-[44px]" value={formData.category} onChange={e => setFormData(prev => ({ ...prev, category: e.target.value as EventData["category"] }))}>
                          <option value="workshop" className="text-white bg-black">Workshop</option>
                          <option value="talk" className="text-white bg-black">Talk</option>
                          <option value="hackathon" className="text-white bg-black">Hackathon</option>
                          <option value="meetup" className="text-white bg-black">Meetup</option>
                          <option value="other" className="text-white bg-black">Other</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-mono text-white/85 font-semibold uppercase pl-1 tracking-widest">Status</label>
                        <select className="w-full px-4 sm:px-5 py-3.5 sm:py-4 bg-[#141414] border border-white/20 rounded-2xl font-mono text-xs text-white focus:outline-none focus:border-white/60 transition-all appearance-none bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAiIGhlaWdodD0iNiIgdmlld0JveD0iMCAwIDEwIDYiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTEgMUw1IDVMOSAxIiBzdHJva2U9IndoaXRlIiBzdHJva2Utb3BhY2l0eT0iMC42IiBzdHJva2Utd2lkdGg9IjEuNSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+PC9zdmc+')] bg-no-repeat bg-[right_1.25rem_center] min-h-[44px]" value={formData.status} onChange={e => setFormData(prev => ({ ...prev, status: e.target.value as EventData["status"] }))}>
                          <option value="upcoming" className="text-white bg-black">Upcoming</option>
                          <option value="completed" className="text-white bg-black">Completed</option>
                          <option value="draft" className="text-white bg-black">Draft</option>
                        </select>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 bg-white/[0.04] border border-white/15 rounded-2xl">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                          <label className="text-[10px] font-mono text-white uppercase tracking-widest font-bold">Featured on Home Terminal</label>
                        </div>
                        <p className="text-[10px] font-mono text-white/70 leading-snug">Showcase this event in the home page terminal carousel and prioritize it at the top of the events list.</p>
                      </div>
                      <button type="button" onClick={() => setFormData(p => ({ ...p, isFeatured: !p.isFeatured }))} className={`relative flex items-center shrink-0 w-12 h-6 rounded-full transition-colors ${formData.isFeatured ? 'bg-amber-500' : 'bg-white/20 border border-white/20'}`}>
                        <span className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform mx-1 ${formData.isFeatured ? 'translate-x-6' : 'translate-x-0'}`} />
                      </button>
                    </div>

                    <div className="space-y-2">
                       <label className="text-[10px] font-mono text-white/85 font-semibold uppercase pl-1 tracking-widest">Description</label>
                       <textarea required rows={5} className="w-full px-4 sm:px-5 py-3.5 sm:py-4 bg-white/[0.04] border border-white/20 rounded-2xl font-mono text-xs text-white focus:outline-none focus:border-white/60 transition-all resize-none placeholder:text-white/40" placeholder="Describe the mission scope..." value={formData.description} onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))} />
                    </div>

                    <div className="space-y-3 rounded-2xl border border-white/15 bg-white/[0.03] p-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-mono text-white/90 uppercase tracking-widest font-bold">Registration Source</label>
                        <p className="text-[10px] font-mono text-white/60 uppercase leading-relaxed">Choose one source for this event. Public pages will show only that registration action.</p>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { value: "internal", label: "Club Website" },
                          { value: "external", label: "External RSVP" },
                        ].map((option) => (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, registrationMode: option.value as EventData["registrationMode"] }))}
                            className={`px-3 py-3 rounded-xl border font-pixel text-[9px] uppercase transition-all min-h-[44px] ${
                              formData.registrationMode === option.value
                                ? "bg-white text-black border-white font-bold"
                                : "bg-white/[0.04] text-white/70 border-white/15 hover:text-white hover:bg-white/10"
                            }`}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                      {formData.registrationMode === "external" && (
                        <input
                          required
                          type="url"
                          value={formData.externalRsvpUrl || ""}
                          placeholder="https://fossunited.org/c/.../rsvp"
                          onChange={e => setFormData(prev => ({ ...prev, externalRsvpUrl: e.target.value }))}
                          className="w-full px-4 py-3 bg-white/[0.04] border border-white/20 rounded-xl font-mono text-[11px] text-white focus:outline-none focus:border-white/60 placeholder:text-white/40 min-h-[44px]"
                        />
                      )}
                    </div>

                    {/* Agenda builder */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] font-mono text-white/85 font-semibold uppercase pl-1 tracking-widest">Event Agenda</label>
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, agenda: [...(prev.agenda || []), { time: "", title: "", description: "" }] }))}
                          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/10 border border-white/20 text-[9px] font-mono text-white hover:bg-white/20 transition-all font-semibold min-h-[36px]"
                        >
                          <Plus className="w-3 h-3" /> Add Item
                        </button>
                      </div>
                      {(formData.agenda || []).length === 0 ? (
                        <p className="font-mono text-[10px] text-white/50 italic pl-1">No agenda items yet. Click &quot;Add Item&quot; to define the schedule.</p>
                      ) : (
                        <div className="space-y-3">
                          {(formData.agenda || []).map((item, i) => (
                            <div key={i} className="rounded-2xl border border-white/15 bg-white/[0.03] p-4 space-y-3">
                              <div className="grid grid-cols-1 sm:grid-cols-[180px_1fr_auto] gap-3">
                                <div className="space-y-1">
                                  <label className="text-[9px] font-mono text-white/60 uppercase tracking-widest font-semibold">Time</label>
                                  <input
                                    type="text"
                                    value={item.time}
                                    placeholder="12:10 PM - 12:30 PM"
                                    onChange={e => {
                                      const updated = [...(formData.agenda || [])];
                                      updated[i] = { ...updated[i], time: e.target.value };
                                      setFormData(prev => ({ ...prev, agenda: updated }));
                                    }}
                                    className="w-full px-3 py-2.5 bg-white/[0.04] border border-white/20 rounded-xl font-mono text-[11px] text-white focus:outline-none focus:border-white/60 placeholder:text-white/40"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <label className="text-[9px] font-mono text-white/60 uppercase tracking-widest font-semibold">Title</label>
                                  <input
                                    type="text"
                                    value={item.title || item.topic || ""}
                                    placeholder="Linux Basics Walkthrough"
                                    onChange={e => {
                                      const updated = [...(formData.agenda || [])];
                                      updated[i] = { ...updated[i], title: e.target.value, topic: undefined };
                                      setFormData(prev => ({ ...prev, agenda: updated }));
                                    }}
                                    className="w-full px-4 py-2.5 bg-white/[0.04] border border-white/20 rounded-xl font-mono text-[11px] text-white focus:outline-none focus:border-white/60 placeholder:text-white/40"
                                  />
                                </div>
                              <button
                                type="button"
                                onClick={() => {
                                  const updated = (formData.agenda || []).filter((_, j) => j !== i);
                                  setFormData(prev => ({ ...prev, agenda: updated }));
                                }}
                                className="self-end p-2.5 rounded-xl border border-red-500/30 bg-red-500/10 text-red-300 hover:text-red-200 hover:bg-red-500/20 transition-all shrink-0 cursor-pointer min-h-[38px] min-w-[38px] flex items-center justify-center"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                              </div>
                              <div className="space-y-1">
                                <label className="text-[9px] font-mono text-white/60 uppercase tracking-widest font-semibold">Description</label>
                                <textarea
                                  rows={2}
                                  value={item.description || ""}
                                  placeholder="Quick intro to navigating Linux - terminal basics, file system, and everyday usage tips."
                                  onChange={e => {
                                    const updated = [...(formData.agenda || [])];
                                    updated[i] = { ...updated[i], description: e.target.value };
                                    setFormData(prev => ({ ...prev, agenda: updated }));
                                  }}
                                  className="w-full px-4 py-2.5 bg-white/[0.04] border border-white/20 rounded-xl font-mono text-[11px] text-white focus:outline-none focus:border-white/60 placeholder:text-white/40 resize-none"
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Outcomes — shown when status is completed */}
                    {formData.status === "completed" && (
                      <div className="space-y-2">
                        <label className="text-[10px] font-mono text-white/85 font-semibold uppercase pl-1 tracking-widest">Event Outcomes / Takeaways</label>
                        <textarea rows={4} className="w-full px-4 sm:px-5 py-3.5 sm:py-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl font-mono text-xs text-white focus:outline-none focus:border-emerald-500/50 transition-all resize-none placeholder:text-white/40" placeholder="Summarise what was achieved, key learnings, attendance numbers, highlights..." value={formData.outcomes || ""} onChange={e => setFormData(prev => ({ ...prev, outcomes: e.target.value }))} />
                      </div>
                    )}

                    {/* Gallery Link — shown when status is completed */}
                    {formData.status === "completed" && (
                      <div className="flex flex-col gap-2 p-4 sm:p-5 rounded-2xl bg-white/[0.03] border border-white/15">
                        <label className="text-[10px] font-mono text-white/85 font-semibold uppercase pl-1 tracking-widest">Event Photos (Ente Album Link)</label>
                        <p className="text-[9px] font-mono text-white/50 pl-1 -mt-1 uppercase">
                          Paste the Ente album link below. The public page will show a button to open the gallery.
                        </p>
                        <input
                          type="url"
                          value={formData.galleryLink || ""}
                          placeholder="https://albums.ente.com/..."
                          onChange={e => setFormData(prev => ({ ...prev, galleryLink: e.target.value }))}
                          className="w-full px-4 py-3 bg-white/[0.04] border border-white/20 rounded-xl font-mono text-[11px] text-white focus:outline-none focus:border-white/60 placeholder:text-white/40 min-h-[44px]"
                        />
                      </div>
                    )}
                  </div>

                  {/* Scheduling & Logic */}
                  <div className="space-y-6 sm:space-y-8">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-mono text-white/85 font-semibold uppercase pl-1 tracking-widest">Start Date</label>
                        <div className="relative">
                          <input required type="date" className="w-full px-4 sm:px-5 py-3.5 sm:py-4 bg-white/[0.04] border border-white/20 rounded-2xl font-mono text-xs text-white focus:outline-none focus:border-white/60 [color-scheme:dark] min-h-[44px]" value={formData.startDate} onChange={e => setFormData(prev => ({ ...prev, startDate: e.target.value }))} />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-mono text-white/85 font-semibold uppercase pl-1 tracking-widest">End Date</label>
                        <div className="relative">
                          <input required type="date" className="w-full px-4 sm:px-5 py-3.5 sm:py-4 bg-white/[0.04] border border-white/20 rounded-2xl font-mono text-xs text-white focus:outline-none focus:border-white/60 [color-scheme:dark] min-h-[44px]" value={formData.endDate} onChange={e => setFormData(prev => ({ ...prev, endDate: e.target.value }))} />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-mono text-white/85 font-semibold uppercase pl-1 tracking-widest">Start Time (IST/24h)</label>
                        <input required type="time" className="w-full px-4 sm:px-5 py-3.5 sm:py-4 bg-white/[0.04] border border-white/20 rounded-2xl font-mono text-xs text-white focus:outline-none focus:border-white/60 [color-scheme:dark] min-h-[44px]" value={formData.startTime} onChange={e => setFormData(prev => ({ ...prev, startTime: e.target.value }))} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-mono text-white/85 font-semibold uppercase pl-1 tracking-widest">End Time (IST/24h)</label>
                        <input required type="time" className="w-full px-4 sm:px-5 py-3.5 sm:py-4 bg-white/[0.04] border border-white/20 rounded-2xl font-mono text-xs text-white focus:outline-none focus:border-white/60 [color-scheme:dark] min-h-[44px]" value={formData.endTime} onChange={e => setFormData(prev => ({ ...prev, endTime: e.target.value }))} />
                      </div>
                    </div>

                    <div className="space-y-2">
                       <label className="text-[10px] font-mono text-white/85 font-semibold uppercase pl-1 tracking-widest">Venue / Sector</label>
                       <input required type="text" placeholder="e.g. LAB_03 · GMEET" className="w-full px-4 sm:px-5 py-3.5 sm:py-4 bg-white/[0.04] border border-white/20 rounded-2xl font-mono text-xs text-white placeholder:text-white/40 focus:outline-none focus:border-white/60 uppercase min-h-[44px]" value={formData.venue} onChange={e => setFormData(prev => ({ ...prev, venue: e.target.value }))} />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                      <div className="space-y-2">
                         <label className="text-[10px] font-mono text-white/85 font-semibold uppercase pl-1 tracking-widest">Handled By / Lead</label>
                         <div className="relative">
                            <input required type="text" placeholder="e.g. BHARATH · IT · 3RD" className="w-full px-4 sm:px-5 py-3.5 sm:py-4 bg-white/[0.04] border border-white/20 rounded-2xl font-mono text-xs text-white placeholder:text-white/40 focus:outline-none focus:border-white/60 uppercase min-h-[44px]" value={formData.handledBy} onChange={e => setFormData(prev => ({ ...prev, handledBy: e.target.value }))} />
                         </div>
                      </div>

                      <div className="space-y-2">
                         <label className="text-[10px] font-mono text-white/85 font-semibold uppercase pl-1 tracking-widest">Speaker(s) / Guest(s)</label>
                         <div className="relative">
                            <input type="text" placeholder="e.g. DR. SUNDAR, PROF. ANITA" className="w-full px-4 sm:px-5 py-3.5 sm:py-4 bg-white/[0.04] border border-white/20 rounded-2xl font-mono text-xs text-white placeholder:text-white/40 focus:outline-none focus:border-white/60 uppercase min-h-[44px]" value={formData.speaker || ""} onChange={e => setFormData(prev => ({ ...prev, speaker: e.target.value }))} />
                         </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2 opacity-40 select-none pointer-events-none">
                       <label className="text-[10px] font-mono text-white/60 uppercase pl-1 tracking-widest">Slug Pointer</label>
                       <div className="px-4 sm:px-5 py-3 bg-white/[0.01] border border-white/10 rounded-2xl font-mono text-[10px] text-white/60">
                          {formData.slug || "auto-generated-from-title"}
                       </div>
                    </div>
                  </div>
                </div>

                <div className="pt-6 sm:pt-10 border-t border-white/10 flex flex-col sm:flex-row gap-3 sm:gap-6">
                  <button type="submit" disabled={loading || isUploading} className="flex-1 py-4 sm:py-5 min-h-[48px] bg-white text-black rounded-xl sm:rounded-[24px] font-pixel text-xs hover:scale-[1.01] active:scale-[0.98] disabled:opacity-50 transition-all flex items-center justify-center gap-3 shadow-[0_0_30px_rgba(255,255,255,0.1)]">
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>EXECUTE::<span className="opacity-40">{editingEvent ? "UPDATE" : "CREATE"}</span></>}
                  </button>
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-8 sm:px-12 py-4 sm:py-5 min-h-[48px] bg-white/5 text-white/70 rounded-xl sm:rounded-[24px] font-pixel text-xs hover:bg-white/10 hover:text-white transition-all uppercase">CANCEL</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Mail Attendees Modal ─────────────────────────────── */}
      <AnimatePresence>
        {isMailAttendeesOpen && mailAttendeesEvent && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsMailAttendeesOpen(false)}
              className="absolute inset-0 bg-black/85 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-[#0f0f0f] border border-amber-500/30 rounded-2xl sm:rounded-[28px] shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
            >
              {/* Header */}
              <div className="p-5 sm:p-6 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                    <MailOpen className="w-5 h-5 text-amber-400" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-pixel text-sm text-white">MAIL ATTENDEES</h3>
                    <p className="font-mono text-[10px] text-white/60 mt-0.5 truncate max-w-[200px] sm:max-w-[280px]">{mailAttendeesEvent.title}</p>
                  </div>
                </div>
                <button onClick={() => setIsMailAttendeesOpen(false)} className="p-2 rounded-xl hover:bg-white/10 text-white/60 hover:text-white transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-5 sm:p-6 space-y-4 sm:space-y-5 overflow-y-auto">
                <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/25 font-mono text-[11px] text-amber-300 flex items-start gap-2.5">
                  <MessageSquare className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
                  <span>This will send a thank-you email with your feedback link and photo album to all <strong>{mailAttendeesEvent.registrationsCount}</strong> registered attendees.</span>
                </div>

                <div className="space-y-1.5">
                  <label className="font-mono text-[10px] text-white/70 uppercase tracking-widest font-semibold">Gallery / Photo Album Link</label>
                  <input
                    type="url"
                    placeholder="https://photos.google.com/... (optional)"
                    value={mailGalleryLink}
                    onChange={(e) => setMailGalleryLink(e.target.value)}
                    className="w-full px-4 py-3 bg-white/[0.04] border border-white/15 rounded-xl font-mono text-xs text-white placeholder:text-white/40 focus:outline-none focus:border-white/30 transition-all min-h-[44px]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-mono text-[10px] text-white/70 uppercase tracking-widest font-semibold">Custom Message (Optional)</label>
                  <textarea
                    rows={3}
                    placeholder="e.g. It was wonderful having you with us! Thank you for your active participation..."
                    value={mailCustomMessage}
                    onChange={(e) => setMailCustomMessage(e.target.value)}
                    className="w-full px-4 py-3 bg-white/[0.04] border border-white/15 rounded-xl font-mono text-xs text-white placeholder:text-white/40 focus:outline-none focus:border-white/30 transition-all resize-none"
                  />
                </div>

                {mailAttendeesStatus && (
                  <div className={`p-3 rounded-xl font-mono text-xs ${mailAttendeesStatus.startsWith("✓") ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400" : "bg-red-500/10 border border-red-500/20 text-red-400"}`}>
                    {mailAttendeesStatus}
                  </div>
                )}

                <div className="flex flex-col-reverse sm:flex-row gap-2.5 sm:gap-3 pt-2">
                  <button onClick={() => setIsMailAttendeesOpen(false)} className="px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-white/70 font-pixel text-[11px] hover:bg-white/10 hover:text-white transition-all text-center min-h-[44px]">
                    CANCEL
                  </button>
                  <button
                    disabled={isMailingSending || mailAttendeesEvent.registrationsCount === 0}
                    onClick={async () => {
                      setIsMailingSending(true);
                      setMailAttendeesStatus(null);
                      try {
                        const res = await fetch("/api/admin/events/mail-attendees", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            eventId: mailAttendeesEvent._id,
                            galleryLink: mailGalleryLink,
                            customMessage: mailCustomMessage,
                          }),
                        });
                        const data = await res.json();
                        if (data.success) {
                          setMailAttendeesStatus(`✓ ${data.message}`);
                        } else {
                          setMailAttendeesStatus(`✗ ${data.error}`);
                        }
                      } catch {
                        setMailAttendeesStatus("✗ Failed to send emails. Check your network.");
                      } finally {
                        setIsMailingSending(false);
                      }
                    }}
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-amber-500 text-black font-pixel text-[11px] font-bold hover:bg-amber-400 disabled:opacity-40 disabled:cursor-not-allowed transition-all min-h-[44px]"
                  >
                    {isMailingSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    {isMailingSending ? "SENDING..." : "SEND EMAILS"}
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
