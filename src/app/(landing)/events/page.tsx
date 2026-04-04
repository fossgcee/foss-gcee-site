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
  galleryLink?: string;
  status: "upcoming" | "completed" | "draft";
  isFeatured?: boolean;
  academicYear: string;
  registrationsCount: number;
}

const formatAcademicYear = (startYear: number) =>
  `${startYear} - ${String(startYear + 1).slice(-2)}`;

const getAcademicYearRange = () => {
  const clubStartYear = 2026;
  const now = new Date();
  const currentStartYear = now.getMonth() >= 5 ? now.getFullYear() : now.getFullYear() - 1;
  const startYear = Math.max(currentStartYear, clubStartYear);
  const years: string[] = [];
  for (let year = startYear; year >= clubStartYear; year -= 1) {
    years.push(formatAcademicYear(year));
  }
  return years;
};

export default function EventsPage() {
  const [events, setEvents] = useState<PublicEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState<string>("");
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

  const todayStr = (() => {
    const now = new Date();
    const ist = new Date(now.getTime() + 5.5 * 60 * 60 * 1000);
    return ist.toISOString().slice(0, 10);
  })();

  const isPastEvent = (e: PublicEvent) => {
    if (e.status === "completed") return true;
    if (e.endDate && e.endDate < todayStr) return true;
    return false;
  };

  const upcomingEvents = events.filter(e => e.status !== "draft" && !isPastEvent(e)).reverse();
  const pastEvents = events.filter(e => e.status !== "draft" && isPastEvent(e));

  // 2. Get unique past years from API direct
  const academicYearOptions = getAcademicYearRange();

  // 3. Set default year once available
  useEffect(() => {
    if (academicYearOptions.length > 0 && !selectedYear) {
      setSelectedYear(academicYearOptions[0]);
    }
  }, [academicYearOptions, selectedYear]);

  // 4. Filter past events by selected year
  const displayedPastEvents = pastEvents
    .filter(e => e.academicYear === selectedYear)
    .reverse();

  useEffect(() => {
    if (loading || events.length === 0) return;
    
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      gsap.from(".event-hero", { opacity: 0, y: 30, duration: 0.8, ease: "power2.out" });
      gsap.from(".event-card", {
        opacity: 0, y: 20, stagger: 0.1, duration: 0.6, ease: "power2.out",
        scrollTrigger: { trigger: ".events-grid", start: "top 80%" }
      });
    }, containerRef);
    return () => ctx.revert();
  }, [loading, events, selectedYear]);

  const handleRegister = (event: PublicEvent) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  // Date formatter: DD/MM/YYYY
  const formatDDMMYYYY = (dateStr: string) => {
    if (!dateStr) return "";
    const [y, m, d] = dateStr.split("-");
    return `${d}/${m}/${y}`;
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
        <div className="event-hero text-center pt-8 mb-16">
           <h1 className="text-4xl sm:text-5xl font-pixel tracking-tight text-text">
             EVENTS
           </h1>
        </div>

        {/* ── Upcoming Events Grid ─────────────────────────────────── */}
        {upcomingEvents.length > 0 && (
          <div className="space-y-8 mb-24">
            <h2 className="text-2xl font-pixel tracking-wide border-b border-border pb-4 text-text uppercase">
              Upcoming Events
            </h2>
            <div className="events-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcomingEvents.map((event) => (
                <Link key={event._id} href={`/events/${event.slug}`} className="event-card block group">
                  <div className="bg-bg border border-border rounded-xl p-4 transition-all duration-300 hover:border-text/30 hover:bg-surface shadow-sm h-full flex flex-col">
                      <div className="flex gap-2 mb-3">
                        <span className="text-[9px] uppercase font-mono bg-text text-bg px-2 py-0.5 rounded border border-text font-bold tracking-widest">{event.category}</span>
                        <span className="text-[9px] uppercase font-mono border border-border text-muted-2 px-2 py-0.5 rounded tracking-widest">{event.status}</span>
                      </div>
                      <div className="w-full aspect-[16/9] rounded-lg overflow-hidden bg-surface mb-4 relative border border-border/50">
                        {event.poster ? (
                            <img src={event.poster} alt={event.title} className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-muted-2 bg-surface-2"><ImageIcon className="w-8 h-8 opacity-20" /></div>
                        )}
                      </div>
                      <h3 className="font-pixel text-sm w-full text-text uppercase mb-3 line-clamp-2 leading-relaxed h-10">{event.title}</h3>
                      <div className="mt-auto space-y-1.5 pt-4 border-t border-border">
                        <p className="text-[10px] font-mono text-muted flex items-center gap-2">
                           <Calendar className="w-3 h-3 text-text opacity-50" />
                           <span className="text-text">DATE:</span> {formatDDMMYYYY(event.startDate)} {event.endDate && event.endDate !== event.startDate ? `- ${formatDDMMYYYY(event.endDate)}` : ""}
                        </p>
                        <p className="text-[10px] font-mono text-muted flex items-center gap-2">
                           <Clock className="w-3 h-3 text-text opacity-50" />
                           <span className="text-text">TIME:</span> {event.startTime} - {event.endTime} <span className="opacity-40 ml-1">(IST/24H)</span>
                        </p>
                      </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* ── Past Academic Years (Archive) ─────────────────────────────────── */}
        <div className="space-y-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 border-b border-border pb-4">
             <h2 className="text-2xl font-pixel tracking-wide text-text uppercase">
               Past Academic Years
             </h2>
             
             {/* Dropdown Filter */}
             <div className="inline-block relative">
                <select 
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="px-6 py-2 bg-surface text-text font-mono text-[11px] rounded border border-border focus:outline-none appearance-none pr-10 hover:bg-surface-2 transition-colors cursor-pointer"
                >
                  <option value="" disabled>Select Year</option>
                  {academicYearOptions.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-text">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
             </div>
          </div>

          <div className="events-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
            {displayedPastEvents.map((event) => (
               <Link key={event._id} href={`/events/${event.slug}`} className="event-card block group">
                 <div className="bg-bg border border-border rounded-xl p-4 transition-all duration-300 hover:border-text/30 hover:bg-surface shadow-sm h-full flex flex-col">
                    <div className="flex gap-2 mb-3">
                      <span className="text-[9px] uppercase font-mono bg-text text-bg px-2 py-0.5 rounded border border-text font-bold tracking-widest">{event.category}</span>
                      <span className="text-[9px] uppercase font-mono border border-border text-muted-2 px-2 py-0.5 rounded tracking-widest text-[#ffeb3b]/80 border-[#ffeb3b]/20 bg-[#ffeb3b]/5">{event.status}</span>
                    </div>
                    <div className="w-full aspect-[16/9] rounded-lg overflow-hidden bg-surface mb-4 relative border border-border/50">
                       {event.poster ? (
                          <img src={event.poster} alt={event.title} className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500 opacity-60 group-hover:opacity-100 grayscale group-hover:grayscale-0" />
                       ) : (
                          <div className="w-full h-full flex items-center justify-center text-muted-2 bg-surface-2"><ImageIcon className="w-8 h-8 opacity-20" /></div>
                       )}
                    </div>
                    <h3 className="font-pixel text-sm w-full text-text uppercase mb-3 line-clamp-2 leading-relaxed h-10 group-hover:text-[#ffeb3b] transition-colors">{event.title}</h3>
                    <div className="mt-auto space-y-1.5 pt-4 border-t border-border">
                      <p className="text-[10px] font-mono text-muted flex items-center gap-2">
                         <Calendar className="w-3 h-3 text-text opacity-50" />
                         <span className="text-text">DATE:</span> {formatDDMMYYYY(event.startDate)} {event.endDate && event.endDate !== event.startDate ? `- ${formatDDMMYYYY(event.endDate)}` : ""}
                      </p>
                      <p className="text-[10px] font-mono text-muted flex items-center gap-2">
                         <Clock className="w-3 h-3 text-text opacity-50" />
                         <span className="text-text">TIME:</span> {event.startTime} - {event.endTime} <span className="opacity-40 ml-1">(IST/24H)</span>
                      </p>
                    </div>
                 </div>
               </Link>
            ))}
            
            {displayedPastEvents.length === 0 && selectedYear && (
               <div className="col-span-full py-24 text-center text-muted-2 font-mono">
                  <p>No past events found for the {selectedYear} academic year.</p>
               </div>
            )}
          </div>
        </div>

        {/* ── Footer Link ──────────────────────────────────── */}
        <div className="pt-24 text-center">
           <Link 
             href="/join"
             className="inline-flex items-center gap-4 px-12 py-6 rounded-[24px] bg-text text-bg font-pixel text-[11px] border border-border hover:scale-[1.05] active:scale-[0.95] transition-all shadow-[0_10px_60px_rgba(255,255,255,0.15)] uppercase tracking-widest"
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
