"use client";

import { useState, useEffect } from "react";
import { 
  Calendar as CalendarIcon, 
  Plus, 
  Search, 
  Filter, 
  Edit3, 
  Trash2, 
  Eye, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  ExternalLink,
  MapPin,
  Clock3,
  X,
  Upload,
  Loader2,
  Trash,
  ChevronRight,
  Users,
  Download,
  Mail,
  Phone
} from "lucide-react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";

interface EventData {
  _id?: string;
  title: string;
  slug: string;
  description: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  venue: string;
  category: "workshop" | "talk" | "hackathon" | "meetup" | "other";
  handledBy: string;
  organizers: string[];
  poster?: string;
  photos?: string[];
  status: "upcoming" | "completed" | "draft";
  registrationsCount: number;
}

interface MemberRegistration {
  _id: string;
  name: string;
  regNo: string;
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
  
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  
  // Form state
  const [editingEvent, setEditingEvent] = useState<EventData | null>(null);
  const [formData, setFormData] = useState<EventData>({
    title: "",
    slug: "",
    description: "",
    startDate: "",
    endDate: "",
    startTime: "09:00",
    endTime: "17:00",
    venue: "",
    category: "workshop",
    handledBy: "",
    organizers: [],
    status: "upcoming",
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

  const handleCreateNew = () => {
    setEditingEvent(null);
    setFormData({
      title: "", slug: "", description: "", startDate: "", endDate: "", 
      startTime: "09:00", endTime: "17:00", venue: "", category: "workshop", 
      handledBy: "", organizers: [], status: "upcoming", registrationsCount: 0
    });
    setIsModalOpen(true);
  };

  const handleEdit = (event: EventData) => {
    setEditingEvent(event);
    setFormData(event);
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

  const handleUploadPoster = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const res = await fetch(`/api/admin/events/upload?filename=${encodeURIComponent(file.name)}`, {
        method: "POST", body: file,
      });
      const d = await res.json();
      if (d.url) setFormData(prev => ({ ...prev, poster: d.url }));
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const url = editingEvent ? `/api/admin/events?id=${editingEvent._id}` : "/api/admin/events";
      const method = editingEvent ? "PUT" : "POST";
      
      const res = await fetch(url, {
        method, headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const d = await res.json();
      if (d.success) {
        setIsModalOpen(false);
        fetchEvents();
      }
    } finally {
      setLoading(false);
    }
  };

  const statusColors: Record<string, string> = {
    upcoming: "border-blue-500/20 bg-blue-500/10 text-blue-400",
    completed: "border-emerald-500/20 bg-emerald-500/10 text-emerald-400",
    draft: "border-amber-500/20 bg-amber-500/10 text-amber-400",
  };

  const statusIcons: Record<string, any> = {
    upcoming: Clock, completed: CheckCircle2, draft: AlertCircle,
  };

  const filteredEvents = events.filter(e => {
    const matchesSearch = e.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          e.slug.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === "all" || e.status === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-8 py-10">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-pixel text-white">EVENTS_MANAGER</h1>
          <p className="font-mono text-xs text-white/40 italic">Manage scheduled activities and historical records</p>
        </div>

        <button 
          onClick={handleCreateNew}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-white text-black rounded-xl font-pixel text-[11px] hover:bg-white/90 transition-all active:scale-95 shrink-0 group shadow-[0_4px_20px_rgba(255,255,255,0.1)]"
        >
          <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" />
          CREATE_NEW_RECORD
        </button>
      </div>

      {/* Control Bar */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
          <input 
            type="text" 
            placeholder="Search events by title or slug..." 
            className="w-full pl-12 pr-4 py-3 bg-white/[0.02] border border-white/5 rounded-2xl font-mono text-xs text-white focus:outline-none focus:border-white/20 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-2">
          <div className="p-1 bg-white/[0.02] border border-white/5 rounded-2xl flex items-center">
            {["all", "upcoming", "completed", "draft"].map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`px-4 py-2 rounded-xl text-[10px] font-pixel transition-all ${filter === tab ? "bg-white/10 text-white" : "text-white/30 hover:text-white/60"}`}
              >
                {tab.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Events List */}
      <div className="grid grid-cols-1 gap-4">
        {loading && events.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-4">
            <Loader2 className="w-8 h-8 text-white/20 animate-spin" />
            <p className="font-mono text-xs text-white/20 italic tracking-widest uppercase">Fetching logs...</p>
          </div>
        ) : filteredEvents.map((event) => {
          const StatusIcon = statusIcons[event.status];
          return (
            <div key={event._id} className="group relative p-1 rounded-3xl border border-white/5 bg-white/[0.01] hover:bg-white/[0.03] transition-all">
              <div className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-start gap-5">
                  <div className={`p-4 rounded-2xl border ${statusColors[event.status]} shrink-0 flex items-center justify-center`}>
                    <CalendarIcon className="w-6 h-6" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-lg border text-[9px] font-mono flex items-center gap-1.5 ${statusColors[event.status]}`}>
                        <StatusIcon className="w-3 h-3" /> {event.status.toUpperCase()}
                      </span>
                      <span className="px-2 py-0.5 rounded-lg border border-white/5 bg-white/5 text-[9px] font-mono text-white/50">{event.category.toUpperCase()}</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-pixel text-white mb-1 uppercase tracking-tight">{event.title}</h3>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-[10px] text-white/40">
                        <span className="flex items-center gap-1.5"><MapPin className="w-3 h-3 opacity-50" /> {event.venue}</span>
                        <span className="flex items-center gap-1.5 font-bold text-white/60 lowercase italic">{event.startDate} → {event.endDate}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between md:justify-end gap-x-8 gap-y-4 pt-4 md:pt-0 border-t md:border-t-0 border-white/5">
                  <button 
                    onClick={() => fetchRegistrations(event)}
                    className="flex items-center gap-4 group/reg"
                  >
                    <div className="space-y-1 text-right shrink-0">
                      <p className="text-[10px] font-mono text-white/30 uppercase tracking-[0.2em]">REGISTERED</p>
                      <p className="text-xl font-pixel text-white">{event.registrationsCount}</p>
                    </div>
                    <div className="p-2.5 rounded-xl border border-white/5 bg-white/[0.02] text-white/40 group-hover/reg:text-emerald-400 group-hover/reg:border-emerald-500/30 transition-all">
                      <Users className="w-4 h-4" />
                    </div>
                  </button>
                  <div className="flex items-center gap-2">
                    <Link href={`/events/${event.slug}`} target="_blank" className="p-2.5 rounded-xl border border-white/5 bg-white/[0.02] text-white/40 hover:text-white transition-all"><ExternalLink className="w-4 h-4" /></Link>
                    <button onClick={() => handleEdit(event)} className="p-2.5 rounded-xl border border-white/5 bg-white/[0.02] text-white/40 hover:text-white transition-all"><Edit3 className="w-4 h-4" /></button>
                    <button 
                      onClick={() => handleDelete(event._id!)} 
                      disabled={isDeleting === event._id}
                      className="p-2.5 rounded-xl border border-white/5 bg-white/[0.02] text-red-400/40 hover:text-red-400 transition-all disabled:opacity-50"
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
                <div className="p-8 border-b border-white/5 flex items-center justify-between">
                   <div className="space-y-1">
                      <h4 className="font-pixel text-white">REGISTRATION_LOGS</h4>
                      <p className="font-mono text-[10px] text-white/40 uppercase tracking-widest">{selectedEventReg?.title}</p>
                   </div>
                   <button onClick={() => setIsRegModalOpen(false)} className="p-2 rounded-xl text-white/40 hover:text-white transition-all"><X className="w-6 h-6" /></button>
                </div>

                <div className="flex-1 overflow-y-auto p-8">
                   {regLoading ? (
                     <div className="h-full flex flex-col items-center justify-center space-y-4">
                        <Loader2 className="w-10 h-10 text-white/20 animate-spin" />
                        <p className="font-mono text-[10px] text-white/20 uppercase tracking-[0.3em]">Querying Database...</p>
                     </div>
                   ) : registrations.length === 0 ? (
                     <div className="h-full flex flex-col items-center justify-center space-y-4 text-white/20">
                        <Users className="w-16 h-16 opacity-10" />
                        <p className="font-pixel text-[10px] uppercase">No Registrations Yet</p>
                     </div>
                   ) : (
                     <div className="space-y-6">
                        {/* Search in registrations */}
                        <div className="relative group">
                          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/20" />
                          <input 
                            type="text" 
                            placeholder="Find participant by name or reg no..." 
                            className="w-full pl-10 pr-4 py-2.5 bg-white/[0.03] border border-white/10 rounded-xl font-mono text-[10px] text-white focus:outline-none focus:border-white/20 transition-all"
                            onChange={(e) => {
                              const val = e.target.value.toLowerCase();
                              const items = document.querySelectorAll('.reg-item');
                              items.forEach((item: any) => {
                                const text = item.innerText.toLowerCase();
                                item.style.display = text.includes(val) ? 'flex' : 'none';
                              });
                            }}
                          />
                        </div>

                        <div className="space-y-4">
                           {registrations.map((reg, idx) => (
                              <div key={reg._id || idx} className="reg-item p-5 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                                 <div className="space-y-3">
                                    <div>
                                       <div className="flex items-center gap-2 mb-1">
                                          <h5 className="font-pixel text-sm text-white uppercase">{reg.name}</h5>
                                          <span className="px-1.5 py-0.5 rounded bg-white/5 text-[8px] font-mono text-white/30">{new Date(reg.registeredAt).toLocaleDateString()}</span>
                                       </div>
                                       <p className="font-mono text-[10px] text-white/30 uppercase">{reg.regNo} · YEAR {reg.year}</p>
                                    </div>
                                    <p className="font-mono text-[9px] text-white/40 italic uppercase">{reg.college}</p>
                                 </div>
                                 <div className="flex flex-col gap-2">
                                    <a href={`mailto:${reg.email}`} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/5 text-[9px] font-mono text-white/60 hover:text-white hover:bg-white/10 transition-all">
                                       <Mail className="w-3 h-3" /> {reg.email}
                                    </a>
                                    <a href={`https://wa.me/${reg.mobile}`} target="_blank" className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/5 border border-emerald-500/10 text-[9px] font-mono text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 transition-all">
                                       <Phone className="w-3 h-3" /> {reg.mobile}
                                    </a>
                                 </div>
                              </div>
                           ))}
                        </div>
                     </div>
                   )}
                </div>
                
                <div className="p-8 border-t border-white/5 bg-white/[0.01]">
                   <button 
                     onClick={() => alert("Feature coming soon: Excel Export")}
                     hidden={registrations.length === 0}
                     className="w-full py-4 rounded-2xl bg-white/5 border border-white/10 text-white font-pixel text-[10px] hover:bg-white/10 transition-all flex items-center justify-center gap-3 uppercase"
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
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-black/90 backdrop-blur-md" />
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-[#0a0a0a] border border-white/10 rounded-[32px] shadow-2xl">
              <div className="p-8 border-b border-white/5 flex items-center justify-between sticky top-0 bg-[#0a0a0a] z-10">
                <div className="space-y-1">
                   <h3 className="text-xl font-pixel text-white uppercase">{editingEvent ? "EDIT_RECORD" : "NEW_RECORD"}</h3>
                   <p className="font-mono text-[9px] text-white/30 uppercase tracking-[0.2em] italic">Database Sector: ./events_log</p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="p-2 rounded-xl text-white/40 hover:text-white"><X className="w-5 h-5" /></button>
              </div>

              <form onSubmit={handleSave} className="p-8 space-y-10">
                {/* Visual Header / Poster Preview */}
                <div className="space-y-4">
                   <label className="text-[10px] font-mono text-white/20 uppercase pl-1 tracking-[0.2em]">Media Asset :: Poster</label>
                   <div className="relative group aspect-video md:aspect-[21/9] rounded-[24px] bg-white/[0.02] border border-dashed border-white/10 overflow-hidden flex items-center justify-center">
                      {formData.poster ? (
                        <>
                           <img src={formData.poster} className="w-full h-full object-cover opacity-60" />
                           <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                           <button type="button" onClick={() => setFormData(prev => ({ ...prev, poster: "" }))} className="absolute top-4 right-4 p-3 rounded-full bg-red-500/80 text-white backdrop-blur shadow-lg hover:scale-110 transition-transform"><Trash className="w-4 h-4" /></button>
                        </>
                      ) : (
                        <label className="flex flex-col items-center justify-center gap-3 cursor-pointer p-10 text-center hover:bg-white/5 transition-colors w-full h-full group">
                           <div className="p-5 rounded-3xl bg-white/5 border border-white/10 group-hover:scale-110 transition-transform">
                              {isUploading ? <Loader2 className="w-10 h-10 animate-spin text-white/40" /> : <Upload className="w-10 h-10 text-white/20" />}
                           </div>
                           <div className="space-y-1">
                              <span className="font-pixel text-[10px] text-white/40 uppercase tracking-widest block">CHOOSE_POSTER_FILE</span>
                              <span className="font-mono text-[9px] text-white/20 uppercase">Vercel Blob Storage Integration</span>
                           </div>
                           <input type="file" className="hidden" accept="image/*" onChange={handleUploadPoster} disabled={isUploading} />
                        </label>
                      )}
                   </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                  {/* General Details */}
                  <div className="space-y-8">
                    <div className="space-y-2">
                       <label className="text-[10px] font-mono text-white/40 uppercase pl-1 tracking-widest">Event Title</label>
                       <input required type="text" placeholder="e.g. Building AI Tools" className="w-full px-5 py-4 bg-white/[0.03] border border-white/10 rounded-2xl font-mono text-xs text-white focus:outline-none focus:border-white/30 transition-all font-bold placeholder:text-white/10 uppercase" value={formData.title} onChange={e => {
                         const title = e.target.value;
                         setFormData(prev => ({ ...prev, title, slug: title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") }));
                       }} />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-mono text-white/40 uppercase pl-1 tracking-widest">Category</label>
                        <select className="w-full px-5 py-4 bg-white/[0.03] border border-white/10 rounded-2xl font-mono text-xs text-black focus:outline-none focus:border-white/30 transition-all appearance-none bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAiIGhlaWdodD0iNiIgdmlld0JveD0iMCAwIDEwIDYiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTEgMUw1IDVMOSAxIiBzdHJva2U9IndoaXRlIiBzdHJva2Utb3BhY2l0eT0iMC4zIiBzdHJva2Utd2lkdGg9IjEuNSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+PC9zdmc+')] bg-no-repeat bg-[right_1.25rem_center]" value={formData.category} onChange={e => setFormData(prev => ({ ...prev, category: e.target.value as any }))}>
                          <option value="workshop">Workshop</option>
                          <option value="talk">Talk</option>
                          <option value="hackathon">Hackathon</option>
                          <option value="meetup">Meetup</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-mono text-white/40 uppercase pl-1 tracking-widest">Status</label>
                        <select className="w-full px-5 py-4 bg-white/[0.03] border border-white/10 rounded-2xl font-mono text-xs text-black focus:outline-none focus:border-white/30 transition-all appearance-none bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAiIGhlaWdodD0iNiIgdmlld0JveD0iMCAwIDEwIDYiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTEgMUw1IDVMOSAxIiBzdHJva2U9IndoaXRlIiBzdHJva2Utb3BhY2l0eT0iMC4zIiBzdHJva2Utd2lkdGg9IjEuNSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+PC9zdmc+')] bg-no-repeat bg-[right_1.25rem_center]" value={formData.status} onChange={e => setFormData(prev => ({ ...prev, status: e.target.value as any }))}>
                          <option value="upcoming">Upcoming</option>
                          <option value="completed">Completed</option>
                          <option value="draft">Draft</option>
                        </select>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                       <label className="text-[10px] font-mono text-white/40 uppercase pl-1 tracking-widest">Description</label>
                       <textarea required rows={6} className="w-full px-5 py-4 bg-white/[0.03] border border-white/10 rounded-2xl font-mono text-xs text-white focus:outline-none focus:border-white/30 transition-all resize-none placeholder:text-white/10" placeholder="Describe the mission scope..." value={formData.description} onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))} />
                    </div>
                  </div>

                  {/* Scheduling & Logic */}
                  <div className="space-y-8">
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-mono text-white/40 uppercase pl-1 tracking-widest">Start Date</label>
                        <div className="relative">
                          <input required type="date" className="w-full px-5 py-4 bg-white/[0.03] border border-white/10 rounded-2xl font-mono text-xs text-white focus:outline-none focus:border-white/30 [color-scheme:dark]" value={formData.startDate} onChange={e => setFormData(prev => ({ ...prev, startDate: e.target.value }))} />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-mono text-white/40 uppercase pl-1 tracking-widest">End Date</label>
                        <div className="relative">
                          <input required type="date" className="w-full px-5 py-4 bg-white/[0.03] border border-white/10 rounded-2xl font-mono text-xs text-white focus:outline-none focus:border-white/30 [color-scheme:dark]" value={formData.endDate} onChange={e => setFormData(prev => ({ ...prev, endDate: e.target.value }))} />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-mono text-white/40 uppercase pl-1 tracking-widest">Start Time (IST/24h)</label>
                        <input required type="time" className="w-full px-5 py-4 bg-white/[0.03] border border-white/10 rounded-2xl font-mono text-xs text-white focus:outline-none focus:border-white/30 [color-scheme:dark]" value={formData.startTime} onChange={e => setFormData(prev => ({ ...prev, startTime: e.target.value }))} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-mono text-white/40 uppercase pl-1 tracking-widest">End Time (IST/24h)</label>
                        <input required type="time" className="w-full px-5 py-4 bg-white/[0.03] border border-white/10 rounded-2xl font-mono text-xs text-white focus:outline-none focus:border-white/30 [color-scheme:dark]" value={formData.endTime} onChange={e => setFormData(prev => ({ ...prev, endTime: e.target.value }))} />
                      </div>
                    </div>

                    <div className="space-y-2">
                       <label className="text-[10px] font-mono text-white/40 uppercase pl-1 tracking-widest">Venue / Sector</label>
                       <input required type="text" placeholder="e.g. LAB_03 · GMEET" className="w-full px-5 py-4 bg-white/[0.03] border border-white/10 rounded-2xl font-mono text-xs text-white focus:outline-none focus:border-white/30 uppercase" value={formData.venue} onChange={e => setFormData(prev => ({ ...prev, venue: e.target.value }))} />
                    </div>

                    <div className="space-y-2">
                       <label className="text-[10px] font-mono text-white/40 uppercase pl-1 tracking-widest">Handled By / Lead</label>
                       <div className="relative">
                          <input required type="text" placeholder="e.g. BHARATH · IT · 3RD" className="w-full px-5 py-4 bg-white/[0.03] border border-white/10 rounded-2xl font-mono text-xs text-white focus:outline-none focus:border-white/30 uppercase" value={formData.handledBy} onChange={e => setFormData(prev => ({ ...prev, handledBy: e.target.value }))} />
                       </div>
                    </div>
                    
                    <div className="space-y-2 opacity-30 select-none pointer-events-none">
                       <label className="text-[10px] font-mono text-white/40 uppercase pl-1 tracking-widest">Slug Pointer</label>
                       <div className="px-5 py-4 bg-white/[0.01] border border-white/5 rounded-2xl font-mono text-[10px] text-white/40">
                          {formData.slug || "auto-generated-from-title"}
                       </div>
                    </div>
                  </div>
                </div>

                <div className="pt-10 border-t border-white/10 flex flex-col sm:flex-row gap-6">
                  <button type="submit" disabled={loading || isUploading} className="flex-1 py-5 bg-white text-black rounded-[24px] font-pixel text-xs hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 transition-all flex items-center justify-center gap-3 shadow-[0_0_30px_rgba(255,255,255,0.1)]">
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>EXECUTE::<span className="opacity-40">{editingEvent ? "UPDATE" : "CREATE"}</span></>}
                  </button>
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-12 py-5 bg-white/5 text-white/40 rounded-[24px] font-pixel text-xs hover:bg-white/10 hover:text-white transition-all uppercase">CANCEL</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
