"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Loader2, ArrowLeft, Save, FileText, Link as LinkIcon, Trash } from "lucide-react";
import Link from "next/link";

interface EventContent {
  _id: string;
  title: string;
  agenda?: { time: string; title?: string; topic?: string; description?: string }[];
  outcomes?: string;
  photos?: string[];
  galleryLink?: string;
  slug: string;
}

export default function AdminEventContentPage() {
  const params = useParams();
  const id = params.id as string;

  const [event, setEvent] = useState<EventContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch(`/api/admin/events?id=${id}`)
      .then(res => res.json())
      .then(d => {
        if (d.success) setEvent(d.data);
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleSave = async () => {
    if (!event) return;
    setSaving(true);
    try {
      await fetch(`/api/admin/events?id=${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agenda: event.agenda,
          outcomes: event.outcomes,
          galleryLink: event.galleryLink,
        }),
      });
      alert("Content saved successfully");
    } catch {
      alert("Failed to save content");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-8 h-8 text-white/20 animate-spin" />
        <p className="font-mono text-xs text-white/20 italic uppercase">Initializing database Sector...</p>
      </div>
    );
  }

  if (!event) {
    return <div className="text-white p-10 font-pixel">RECORD_NOT_FOUND</div>;
  }

  return (
    <div className="space-y-8 py-10 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-white/10">
        <div className="space-y-4">
          <Link href="/admin/events" className="inline-flex items-center gap-2 text-[10px] font-mono text-white/40 hover:text-white uppercase tracking-widest transition-colors">
             <ArrowLeft className="w-3.5 h-3.5" /> Return to Events
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-pixel text-white uppercase break-words leading-snug">{event.title}</h1>
            <p className="font-mono text-[9px] text-white/30 uppercase tracking-[0.2em] italic mt-1 break-all">/events/{event.slug} :: CONTENT_MANAGER</p>
          </div>
        </div>

        <button 
          onClick={handleSave}
          disabled={saving}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 bg-white text-black rounded-xl font-pixel text-[11px] hover:bg-white/90 disabled:opacity-50 transition-all active:scale-95 shadow-[0_4px_20px_rgba(255,255,255,0.1)]"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin text-black" /> : <Save className="w-4 h-4 text-black" />}
          SAVE_CHANGES
        </button>
      </div>

      <div className="space-y-12">
        {/* Editor: Agenda / Timeline */}
        <div className="space-y-4">
           <div className="flex justify-between items-center border-b border-white/5 pb-2">
             <div className="flex items-center gap-3">
               <FileText className="w-4 h-4 text-white/40" />
               <h2 className="font-mono text-xs uppercase tracking-widest text-white/80">Event Agenda Timeline</h2>
             </div>
             <button 
               onClick={() => setEvent(prev => prev ? { ...prev, agenda: [...(prev.agenda || []), { time: "12:10 PM - 12:30 PM", title: "New Agenda Item", description: "" }] } : prev)}
               className="font-pixel text-[10px] text-emerald-400 uppercase bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors"
             >
               + ADD_ENTRY
             </button>
           </div>
           
           <div className="space-y-3">
             {!(event.agenda && event.agenda.length > 0) && (
               <p className="font-mono text-[10px] text-white/20 italic p-4 text-center border border-dashed border-white/10 rounded-2xl">No timeline entries. Add one above.</p>
             )}
             {(event.agenda || []).map((item, idx) => (
                <div key={idx} className="p-4 bg-white/[0.02] border border-white/10 rounded-2xl space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-[180px_1fr_auto] gap-3">
                  <div className="space-y-1 w-full shrink-0">
                    <label className="text-[9px] font-mono text-white/40 uppercase tracking-widest pl-1">TIME RANGE</label>
                    <input 
                      type="text" 
                      value={item.time} 
                      onChange={e => {
                        const newAgenda = [...(event.agenda || [])];
                        newAgenda[idx].time = e.target.value;
                        setEvent({ ...event, agenda: newAgenda });
                      }}
                      placeholder="12:10 PM - 12:30 PM"
                      className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl font-mono text-xs text-white focus:outline-none focus:border-white/30 placeholder:text-white/10"
                    />
                  </div>
                  <div className="space-y-1 flex-1 w-full">
                    <label className="text-[9px] font-mono text-white/40 uppercase tracking-widest pl-1">TITLE</label>
                    <input 
                      type="text" 
                      value={item.title || item.topic || ""} 
                      onChange={e => {
                        const newAgenda = [...(event.agenda || [])];
                        newAgenda[idx] = { ...newAgenda[idx], title: e.target.value, topic: undefined };
                        setEvent({ ...event, agenda: newAgenda });
                      }}
                      placeholder="Linux Basics Walkthrough"
                      className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl font-mono text-xs text-white focus:outline-none focus:border-white/30 placeholder:text-white/10"
                    />
                  </div>
                  <button 
                    onClick={() => {
                      const newAgenda = (event.agenda || []).filter((_, i) => i !== idx);
                      setEvent({ ...event, agenda: newAgenda });
                    }}
                    className="self-end p-3 bg-red-500/10 text-red-400 rounded-xl hover:bg-red-500/20 transition-colors"
                  >
                    <Trash className="w-4 h-4" />
                  </button>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-mono text-white/40 uppercase tracking-widest pl-1">DESCRIPTION</label>
                    <textarea
                      value={item.description || ""}
                      onChange={e => {
                        const newAgenda = [...(event.agenda || [])];
                        newAgenda[idx] = { ...newAgenda[idx], description: e.target.value };
                        setEvent({ ...event, agenda: newAgenda });
                      }}
                      rows={2}
                      placeholder="Quick intro to navigating Linux - terminal basics, file system, and everyday usage tips."
                      className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl font-mono text-xs text-white focus:outline-none focus:border-white/30 resize-none placeholder:text-white/10"
                    />
                  </div>
                </div>
             ))}
           </div>
        </div>

        {/* Editor: Outcomes */}
        <div className="space-y-4">
           <div className="flex items-center gap-3 border-b border-white/5 pb-2">
             <FileText className="w-4 h-4 text-white/40" />
             <h2 className="font-mono text-xs uppercase tracking-widest text-white/80">Post-Event Outcomes</h2>
           </div>
           <p className="text-[10px] font-mono text-white/30 leading-relaxed uppercase">Summarize what was achieved during this event, resources shared, etc.</p>
           
           <textarea 
             value={event.outcomes || ""}
             onChange={e => setEvent({ ...event, outcomes: e.target.value })}
             rows={6}
             placeholder="We successfully built 4 modules..."
             className="w-full px-5 py-4 bg-white/[0.02] border border-white/10 rounded-2xl font-mono text-xs text-white focus:outline-none focus:border-white/30 transition-all resize-y placeholder:text-white/10"
           />
        </div>

        {/* Ente Gallery Link */}
        <div className="mt-12 bg-surface-2 p-6 rounded-2xl border border-border-2">
          <div className="mb-4">
             <h2 className="font-mono text-xs uppercase tracking-widest text-white/80">Event Photos (Ente Album)</h2>
             <div className="w-8 h-1 bg-[#1FA463] mt-2 mb-4" />
           <p className="text-[10px] font-mono text-white/30 leading-relaxed uppercase">Paste the Ente album link below. The public page will show a button to open the gallery.</p>
          </div>
          <input
             type="url"
             value={event.galleryLink || ""}
             onChange={e => setEvent({ ...event, galleryLink: e.target.value })}
             placeholder="https://ente.io/..."
             className="w-full px-5 py-4 bg-white/[0.02] border border-white/10 rounded-2xl font-mono text-xs text-white focus:outline-none focus:border-white/30 transition-all placeholder:text-white/10"
           />
        </div>

      </div>
    </div>
  );
}
