"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2, ArrowLeft, Save, Upload, Trash, Image as ImageIcon, FileText } from "lucide-react";
import Link from "next/link";

interface EventContent {
  _id: string;
  title: string;
  agenda?: string;
  outcomes?: string;
  photos?: string[];
  slug: string;
}

export default function AdminEventContentPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [event, setEvent] = useState<EventContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

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
          photos: event.photos,
        }),
      });
      alert("Content saved successfully");
    } catch (err) {
      alert("Failed to save content");
    } finally {
      setSaving(false);
    }
  };

  const handleUploadPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !event) return;

    setUploadingPhoto(true);
    try {
      const res = await fetch(`/api/admin/events/upload?filename=${encodeURIComponent(file.name)}`, {
        method: "POST", body: file,
      });
      const d = await res.json();
      if (d.url) {
        setEvent(prev => prev ? ({
          ...prev,
          photos: [...(prev.photos || []), d.url]
        }) : prev);
      }
    } finally {
      setUploadingPhoto(false);
    }
  };

  const removePhoto = (indexToRemove: number) => {
    if (!event) return;
    setEvent(prev => prev ? ({
      ...prev,
      photos: (prev.photos || []).filter((_, i) => i !== indexToRemove)
    }) : prev);
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
            <h1 className="text-2xl font-pixel text-white uppercase">{event.title}</h1>
            <p className="font-mono text-[9px] text-white/30 uppercase tracking-[0.2em] italic mt-1">/events/{event.slug} :: CONTENT_MANAGER</p>
          </div>
        </div>

        <button 
          onClick={handleSave}
          disabled={saving || uploadingPhoto}
          className="flex items-center justify-center gap-2 px-8 py-3 bg-white text-black rounded-xl font-pixel text-[11px] hover:bg-white/90 disabled:opacity-50 transition-all active:scale-95 shadow-[0_4px_20px_rgba(255,255,255,0.1)]"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          SAVE_CHANGES
        </button>
      </div>

      <div className="space-y-12">
        {/* Editor: Agenda */}
        <div className="space-y-4">
           <div className="flex items-center gap-3 border-b border-white/5 pb-2">
             <FileText className="w-4 h-4 text-white/40" />
             <h2 className="font-mono text-xs uppercase tracking-widest text-white/80">Event Agenda Timeline</h2>
           </div>
           <p className="text-[10px] font-mono text-white/30 leading-relaxed uppercase">Markdown is supported. Outline the speakers, timings, and activities.</p>
           
           <textarea 
             value={event.agenda || ""}
             onChange={e => setEvent({ ...event, agenda: e.target.value })}
             rows={8}
             placeholder="- 09:00 AM: Inauguration\n- 10:00 AM: Core Concepts"
             className="w-full px-5 py-4 bg-white/[0.02] border border-white/10 rounded-2xl font-mono text-xs text-white focus:outline-none focus:border-white/30 transition-all resize-y placeholder:text-white/10"
           />
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

        {/* Photo Gallery Manager */}
        <div className="space-y-6">
           <div className="flex items-center gap-3 border-b border-white/5 pb-2">
             <ImageIcon className="w-4 h-4 text-white/40" />
             <h2 className="font-mono text-xs uppercase tracking-widest text-white/80">Media Archive / Photo Gallery</h2>
           </div>
           <p className="text-[10px] font-mono text-white/30 leading-relaxed uppercase">Upload photos from the event. These will automatically appear in the public specs page gallery.</p>
           
           <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {/* Existing Photos */}
              {(event.photos || []).map((photoUrl, idx) => (
                <div key={idx} className="relative group aspect-square rounded-[24px] bg-white/[0.02] border border-white/10 overflow-hidden">
                   {/* eslint-disable-next-line @next/next/no-img-element */}
                   <img src={photoUrl} alt="Event upload" className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-all" />
                   <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex justify-end">
                      <button 
                        onClick={() => removePhoto(idx)}
                        className="p-2 rounded-xl bg-red-500/80 text-white backdrop-blur shadow-lg hover:scale-110 transition-transform"
                      >
                         <Trash className="w-3.5 h-3.5" />
                      </button>
                   </div>
                </div>
              ))}

              {/* Uploader Box */}
              <label className="aspect-square flex flex-col items-center justify-center gap-3 cursor-pointer p-6 text-center hover:bg-white/[0.04] transition-colors rounded-[24px] bg-white/[0.01] border border-dashed border-white/10 group">
                 {uploadingPhoto ? (
                    <Loader2 className="w-6 h-6 animate-spin text-white/30" />
                 ) : (
                    <Upload className="w-6 h-6 text-white/20 group-hover:scale-110 transition-transform group-hover:text-white/60" />
                 )}
                 <span className="font-mono text-[9px] text-white/30 uppercase tracking-widest block">UPLOAD_IMAGE</span>
                 <input type="file" className="hidden" accept="image/*" onChange={handleUploadPhoto} disabled={uploadingPhoto} />
              </label>
           </div>
        </div>

      </div>
    </div>
  );
}
