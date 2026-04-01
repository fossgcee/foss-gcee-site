"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { 
  Calendar, 
  MapPin, 
  Clock, 
  Terminal, 
  ArrowRight, 
  Image as ImageIcon,
  History,
  Sparkles,
  Users,
  ExternalLink,
  Plus,
  Loader2,
  ArrowRightCircle
} from "lucide-react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import RegistrationModal from "@/components/RegistrationModal";

// Local interface to match the response from the DB
interface PublicEvent {
  _id: string;
  title: string;
  slug: string;
  description: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  venue: string;
  category: string;
  handledBy: string;
  organizers: string[];
  poster?: string;
  photos?: string[];
  status: "upcoming" | "completed" | "draft";
  registrationsCount: number;
}

export default function EventsPage() {
  const [events, setEvents] = useState<PublicEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"upcoming" | "past">("upcoming");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<PublicEvent | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await fetch("/api/events");
        const d = await res.json();
        if (d.success) setEvents(d.data);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  // ── Status processing ──────────────────────────────────────────────
  const upcomingEvents = events.filter(e => e.status === "upcoming").reverse();
  const pastEvents = events.filter(e => e.status === "completed");
  const featuredEvent = upcomingEvents[0] || (pastEvents[0] || null);

  useEffect(() => {
    if (loading || events.length === 0) return;
    
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      gsap.from(".event-hero", {
        opacity: 0,
        y: 30,
        duration: 0.8,
        ease: "power2.out"
      });
      
      gsap.from(".event-card", {
        opacity: 0,
        y: 20,
        stagger: 0.1,
        duration: 0.6,
        ease: "power2.out",
        scrollTrigger: {
          trigger: ".events-grid",
          start: "top 80%"
        }
      });
    }, containerRef);
    return () => ctx.revert();
  }, [loading, events, activeTab]);

  const handleRegister = (event: PublicEvent) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  // Date formatter: "26 Jun 2026"
  const formatDate = (dateStr: string) => {
    if (!dateStr) return "N/A";
    const [y, m, d] = dateStr.split("-");
    const date = new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-bg flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-10 h-10 text-text animate-spin" />
        <p className="font-pixel text-[10px] text-muted-2 tracking-[0.2em]">INITIALIZING_EVENT_DATABASE...</p>
      </div>
    );
  }

  return (
    <main ref={containerRef} className="min-h-screen bg-bg text-text pt-24 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-20">
        
        {/* ── Section Header ───────────────────────────────── */}
        <div className="event-hero space-y-6 text-center lg:text-left">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
            <div className="space-y-4">
              <div className="flex items-center justify-center lg:justify-start gap-3">
                <span className="px-3 py-1 rounded bg-surface-2 border border-border-2 text-[10px] font-mono text-muted-2 uppercase tracking-[0.2em]">
                  FOSS CLUB GCE ERODE
                </span>
                <div className="h-px w-12 bg-surface-2 hidden sm:block" />
              </div>
              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-pixel leading-tight">
                EVENTS_AND_ <br /><span className="text-text">ACTIVITIES</span>
              </h1>
              <p className="max-w-2xl text-muted-2 font-mono text-sm sm:text-base leading-relaxed">
                From monthly meetups to overnight hackathons — we're building a vibrant open source community at GCE Erode.
              </p>
            </div>
            
            <div className="flex items-center justify-center lg:justify-end gap-2 p-1.5 bg-surface border border-border rounded-2xl w-fit mx-auto lg:mx-0">
              <button 
                onClick={() => setActiveTab("upcoming")}
                className={`flex items-center gap-2 px-6 py-3 rounded-[14px] text-xs font-pixel transition-all ${
                  activeTab === "upcoming" 
                    ? "bg-text text-bg shadow-[0_0_20px_rgba(255,255,255,0.1)] scale-[1.02]" 
                    : "text-muted-2 hover:text-muted"
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" /> UPCOMING
              </button>
              <button 
                onClick={() => setActiveTab("past")}
                className={`flex items-center gap-2 px-6 py-3 rounded-[14px] text-xs font-pixel transition-all ${
                  activeTab === "past" 
                    ? "bg-text text-bg shadow-[0_0_20px_rgba(255,255,255,0.1)] scale-[1.02]" 
                    : "text-muted-2 hover:text-muted"
                }`}
              >
                <History className="w-3.5 h-3.5" /> ARCHIVE
              </button>
            </div>
          </div>
        </div>

        {/* ── Featured Section (Only for Upcoming) ───────────────── */}
        {activeTab === "upcoming" && featuredEvent && (
          <div className="event-hero relative">
             <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-transparent blur-[120px] -z-10" />
             
             <div className="group relative overflow-hidden rounded-[32px] border border-border-2 bg-surface p-8 md:p-12">
               <div className="flex flex-col lg:flex-row gap-12 items-center">
                 {/* Visual Side */}
                 <div className="w-full lg:w-2/5 aspect-[4/5] relative rounded-2xl overflow-hidden shadow-2xl bg-bg-2 border border-border">
                    <div className="absolute inset-0 flex items-center justify-center opacity-10">
                       <Terminal className="w-32 h-32" />
                    </div>
                    {featuredEvent.poster && (
                      <img 
                        src={featuredEvent.poster} 
                        alt={featuredEvent.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000 relative z-10"
                      />
                    )}
                 </div>

                 {/* Content Side */}
                 <div className="w-full lg:w-3/5 space-y-8">
                   <div className="space-y-4">
                     <div className="flex items-center gap-3">
                       <span className="px-3 py-1 bg-text text-bg text-[10px] font-pixel rounded-full">
                         FEATURED_EVENT
                       </span>
                       <span className="flex items-center gap-1.5 font-mono text-[10px] text-muted-2 uppercase tracking-widest leading-none">
                         <MapPin className="w-3.5 h-3.5" /> {featuredEvent.venue}
                       </span>
                       {featuredEvent.registrationsCount !== undefined && (
                         <span className="flex items-center gap-1.5 font-mono text-[10px] text-emerald-400 capitalize bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                           <Users className="w-3.5 h-3.5" /> {featuredEvent.registrationsCount} Registered
                         </span>
                       )}
                     </div>
                     <h2 className="text-3xl md:text-5xl font-pixel text-text leading-tight uppercase tracking-tight">
                        {featuredEvent.title}
                     </h2>
                   </div>

                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 ring-1 ring-border-2 p-6 rounded-[24px] bg-bg-2 backdrop-blur-xl">
                     <div className="flex items-start gap-4">
                        <div className="p-3 bg-surface-2 rounded-xl border border-border-2 shrink-0">
                           <Calendar className="w-5 h-5 text-text/80" />
                        </div>
                        <div className="space-y-1">
                           <p className="text-[10px] font-mono text-muted uppercase tracking-[0.2em] mb-1">Date Scope</p>
                           <p className="text-xs font-pixel text-text leading-tight">
                             {formatDate(featuredEvent.startDate)} <br />
                             <span className="text-muted text-[9px] uppercase tracking-widest inline-flex items-center gap-2 mt-1 italic">
                               <ArrowRightCircle className="w-3 h-3" /> TO {formatDate(featuredEvent.endDate)}
                             </span>
                           </p>
                        </div>
                     </div>
                     <div className="flex items-start gap-4 border-l border-border pl-6 hidden sm:flex">
                        <div className="p-3 bg-surface-2 rounded-xl border border-border-2 shrink-0">
                           <Clock className="w-5 h-5 text-text/80" />
                        </div>
                        <div className="space-y-1">
                           <p className="text-[10px] font-mono text-muted uppercase tracking-[0.2em] mb-1">Time (IST)</p>
                           <p className="text-sm font-pixel text-text">
                             {featuredEvent.startTime} <span className="text-[10px] text-muted tracking-widest mx-1.5 italic">→</span> {featuredEvent.endTime}
                             <br />
                             <span className="text-[9px] font-mono text-muted-2 uppercase tracking-[0.2em]">24HR System Format</span>
                           </p>
                        </div>
                     </div>
                   </div>

                   <p className="text-muted-2 font-mono text-sm leading-relaxed max-w-2xl border-l border-border-2 pl-6 py-1 italic">
                     {featuredEvent.description}
                   </p>

                   <div className="flex flex-col sm:flex-row gap-4 pt-4">
                     <button 
                       onClick={() => handleRegister(featuredEvent)}
                       className="px-10 py-5 bg-text text-bg rounded-2xl font-pixel text-xs hover:bg-white/90 transition-all flex items-center justify-center gap-3 group/btn shadow-[0_10px_40px_rgba(255,255,255,0.1)] active:scale-95"
                     >
                        $ ./register_now.sh <Plus className="w-4 h-4 group-hover/btn:rotate-90 transition-transform" />
                     </button>
                     <Link 
                       href={`/events/${featuredEvent.slug}`}
                       className="px-10 py-5 bg-surface-2 border border-border-2 text-text rounded-2xl font-pixel text-xs hover:bg-surface-2 transition-all active:scale-95 flex items-center justify-center gap-3 uppercase"
                     >
                        EVENT_SPECS <ExternalLink className="w-4 h-4" />
                     </Link>
                   </div>
                 </div>
               </div>
             </div>
          </div>
        )}

        {/* ── Events Grid ─────────────────────────────────── */}
        <div className="space-y-10">
          <div className="flex items-center justify-between border-b border-border pb-6">
            <h3 className="font-pixel text-xl tracking-tight uppercase">
              {activeTab === "upcoming" ? "SECTOR::UPCOMING" : "ARCHIVE::HISTORY"}
            </h3>
            <div className="font-mono text-[9px] text-muted-2 uppercase tracking-[0.3em] font-bold">
              {activeTab === "upcoming" ? upcomingEvents.length : pastEvents.length} Item(s) in database
            </div>
          </div>

          <div className="events-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {(activeTab === "upcoming" ? upcomingEvents.slice(1) : pastEvents).map((event) => (
              <div key={event._id} className="event-card group relative">
                 <div className="h-full p-px rounded-[32px] bg-gradient-to-b from-white/10 to-transparent group-hover:from-white/20 transition-all duration-700">
                    <div className="h-full bg-bg-2 rounded-[31px] overflow-hidden p-6 space-y-6 flex flex-col relative">
                       
                       {/* Background decoration */}
                       <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none -mr-4 -mt-4">
                          <Terminal className="w-24 h-24" />
                       </div>

                       <div className="flex items-center justify-between gap-4 relative z-10">
                          <span className="px-2.5 py-1 rounded-lg border border-border bg-surface-2 text-[9px] font-mono text-muted uppercase tracking-widest">
                             {event.category}
                          </span>
                          {event.status === "completed" ? (
                            <span className="text-emerald-400 font-mono text-[9px] flex items-center gap-1.5 uppercase font-bold tracking-widest">
                               <Sparkles className="w-3 h-3" /> media::live
                            </span>
                          ) : (
                            <span className="text-muted-2 font-mono text-[9px] flex items-center gap-1.5 uppercase tracking-widest">
                               <Users className="w-3 h-3" /> {event.registrationsCount}
                            </span>
                          )}
                       </div>

                       <div className="space-y-4 flex-1 relative z-10">
                          <h4 className="text-lg font-pixel text-text leading-snug group-hover:text-text transition-colors line-clamp-2 uppercase">
                             {event.title}
                          </h4>
                          <div className="space-y-2.5">
                             <div className="flex items-center gap-3 font-mono text-[10px] text-muted-2 uppercase tracking-tighter">
                                <Calendar className="w-3.5 h-3.5 text-muted-2" /> 
                                {formatDate(event.startDate)} <span className="opacity-20 italic">→</span> {formatDate(event.endDate)}
                             </div>
                             <div className="flex items-center gap-3 font-mono text-[10px] text-muted-2 uppercase tracking-tighter">
                                <Clock className="w-3.5 h-3.5 text-muted-2" /> 
                                {event.startTime} <span className="opacity-20 italic">·</span> {event.endTime} <span className="text-muted-2 font-bold ml-1">IST</span>
                             </div>
                             <div className="flex items-center gap-3 font-mono text-[10px] text-muted-2 uppercase tracking-tighter">
                                <MapPin className="w-3.5 h-3.5 text-muted-2" /> {event.venue}
                             </div>
                          </div>
                       </div>

                       <div className="pt-6 border-t border-border flex items-center justify-between group-hover:border-border-2 transition-colors relative z-10">
                          <div className="flex flex-col">
                            <span className="text-[9px] font-mono text-muted-2 uppercase tracking-widest italic">
                               ./node_ptr::{event.slug.substring(0, 10)}
                            </span>
                          </div>
                          
                          {activeTab === "upcoming" ? (
                            <button 
                              onClick={() => handleRegister(event)}
                              className="px-5 py-2.5 rounded-2xl bg-surface-2 border border-border-2 text-muted group-hover:bg-text group-hover:text-bg font-pixel text-[9px] transition-all hover:scale-105 active:scale-95 flex items-center gap-2 shadow-lg"
                            >
                              REGISTER <Plus className="w-3 h-3" />
                            </button>
                          ) : (
                            <Link 
                              href={`/events/${event.slug}`}
                              className="w-12 h-12 rounded-full bg-surface-2 border border-border-2 flex items-center justify-center text-muted-2 group-hover:bg-text group-hover:text-bg transition-all group-hover:scale-110 shadow-lg"
                            >
                               <ArrowRight className="w-5 h-5" />
                            </Link>
                          )}
                       </div>
                    </div>
                 </div>
              </div>
            ))}
            
            {((activeTab === "upcoming" && upcomingEvents.length === 0) || (activeTab === "past" && pastEvents.length === 0)) && (
              <div className="col-span-full py-24 flex flex-col items-center justify-center text-center space-y-5 border border-dashed border-border-2 rounded-[40px] bg-bg-2">
                <div className="w-16 h-16 rounded-[24px] bg-surface-2 border border-border-2 flex items-center justify-center text-muted-2">
                  <Terminal className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <p className="font-pixel text-[10px] text-muted uppercase tracking-[0.3em] italic">No event logs recorded</p>
                  <p className="font-mono text-[9px] text-muted-2 uppercase italic">Check connection to database sector</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Footer Link ──────────────────────────────────── */}
        <div className="pt-24 text-center">
           <Link 
             href="/join"
             className="inline-flex items-center gap-4 px-12 py-6 rounded-[24px] bg-text text-bg font-pixel text-[11px] hover:scale-[1.05] active:scale-[0.95] transition-all shadow-[0_10px_60px_rgba(255,255,255,0.15)] uppercase tracking-widest"
           >
              INITIATE_JOIN_SEQUENCE <ArrowRight className="w-4 h-4" />
           </Link>
        </div>

      </div>

      {/* Registration Modal */}
      <RegistrationModal 
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedEvent(null);
        }}
        eventTitle={selectedEvent?.title || ""}
        eventSlug={selectedEvent?.slug || ""}
      />
    </main>
  );
}
