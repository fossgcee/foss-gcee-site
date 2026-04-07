/* eslint-disable @next/next/no-img-element */
import { notFound } from "next/navigation";
import Link from "next/link";
import dbConnect from "@/lib/db";
import Event from "@/models/Event";
import { ArrowLeft, CheckCircle2, ListChecks, Award, ExternalLink } from "lucide-react";
import EventRegisterButton from "@/components/EventRegisterButton";

type AgendaItem = { time: string; topic: string };

type EventSlug = { slug: string };

type EventMetadata = {
  title: string;
  description?: string;
};

type EventDetails = {
  title: string;
  slug: string;
  description?: string;
  startDate: string;
  endDate?: string;
  startTime: string;
  endTime: string;
  venue: string;
  handledBy: string;
  poster?: string;
  status: "upcoming" | "completed" | "draft";
  agenda?: AgendaItem[];
  outcomes?: string;
  galleryLink?: string;
};

/* ── Static params ─────────────────────────────────────────── */
export async function generateStaticParams() {
  try {
    await dbConnect();
    const events = await Event.find({ status: { $ne: "draft" } }, "slug").lean<EventSlug[]>();
    return events.map((e) => ({ slug: e.slug }));
  } catch {
    console.warn("Could not connect to MongoDB during build. Skipping static generation for events.");
    return [];
  }
}

/* ── Metadata ──────────────────────────────────────────────── */
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  await dbConnect();
  const event = await Event.findOne({ slug }).lean<EventMetadata>();
  if (!event) return { title: "Event Not Found – FOSSGCEE" };
  return {
    title: `${event.title} – FOSSGCEE`,
    description: event.description ?? `FOSSGCEE event: ${event.title}`,
  };
}

const fmt = (d: string) => {
  if (!d) return "N/A";
  const [y, m, day] = d.split("-");
  return `${day}/${m}/${y}`;
};

function todayIST() {
  return new Date(Date.now() + 5.5 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

/* ── Page ──────────────────────────────────────────────────── */
export default async function EventPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  await dbConnect();
  const event = await Event.findOne({ slug }).lean<EventDetails>();
  if (!event) notFound();
  const today = todayIST();
  const isPast = event.status === "completed" || (event.endDate && event.endDate < today);

  const agenda: AgendaItem[] = event.agenda ?? [];
  const galleryLink: string = event.galleryLink ?? "";
  const hasOutcomes = isPast && event.outcomes && event.outcomes.trim().length > 0;
  const hasGalleryLink = isPast && galleryLink.trim().length > 0;
  const hasAgenda   = !isPast && agenda.length > 0;

  return (
    <div className="min-h-screen bg-bg text-text pt-24 pb-32 md:pb-20">

      {/* Back */}
      <div className="max-w-4xl mx-auto px-6 mb-8">
        <Link href="/events" className="inline-flex items-center gap-2 font-mono text-xs transition-colors hover:text-text text-muted uppercase tracking-[0.2em]">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Logs
        </Link>
      </div>

      {/* FOSS CIT Style Hero Layout */}
      <div className="max-w-4xl mx-auto px-6 mb-16 flex flex-col items-center">
         
         <h1 className="text-3xl sm:text-5xl md:text-6xl font-pixel text-center mb-10 px-4 text-text uppercase">
            {event.title}
         </h1>

         {event.poster && (
            <div className="w-full max-w-3xl aspect-video bg-surface rounded-lg overflow-hidden border border-border mb-12 shadow-2xl relative">
              <div className="absolute inset-0 shadow-[inset_0_0_50px_rgba(255,255,255,0.02)] pointer-events-none" />
              <img src={event.poster} alt={event.title} className="w-full h-full object-contain" />
            </div>
         )}

         {/* 2-Column Specs Grid */}
         <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-y-12 gap-x-10 text-left font-mono mt-4">
            
            <div className="space-y-2">
               <h3 className="text-lg sm:text-xl font-bold tracking-wide text-text uppercase">Date:</h3>
               <p className="text-muted-2 text-sm sm:text-base">
                  {fmt(event.startDate)} {event.endDate && event.endDate !== event.startDate ? ` - ${fmt(event.endDate)}` : ''}
               </p>
            </div>
            
            <div className="space-y-2">
               <h3 className="text-lg sm:text-xl font-bold tracking-wide text-text uppercase">Venue:</h3>
               <p className="text-muted-2 text-sm sm:text-base">
                  {event.venue}
               </p>
            </div>
            
            <div className="space-y-2">
               <h3 className="text-lg sm:text-xl font-bold tracking-wide text-text uppercase">Time:</h3>
               <p className="text-muted-2 text-sm sm:text-base">
                  {event.startTime} - {event.endTime}
               </p>
            </div>

            <div className="space-y-2">
               <h3 className="text-lg sm:text-xl font-bold tracking-wide text-text uppercase">Speaker:</h3>
               <p className="text-muted-2 text-sm sm:text-base">
                  {event.handledBy}
               </p>
            </div>

         </div>

         {!isPast && (
           <div className="mt-10">
             <EventRegisterButton eventTitle={event.title} eventSlug={event.slug} />
           </div>
         )}
      </div>

      {/* Description */}
      {event.description && (
        <section className="max-w-4xl mx-auto px-6 py-10">
          <h2 className="font-pixel text-sm text-text uppercase tracking-tight mb-6">:: MISSION_SCOPE</h2>
          <p className="text-base sm:text-lg leading-relaxed text-muted-2 font-mono whitespace-pre-wrap border-l-2 border-border-2 pl-6">
            {event.description}
          </p>
        </section>
      )}

      {/* Agenda — upcoming events only */}
      {hasAgenda && (
        <section className="max-w-4xl mx-auto px-6 py-10">
          <h2 className="font-pixel text-sm text-text uppercase tracking-tight mb-8 flex items-center gap-2">
            <ListChecks className="w-4 h-4" /> :: EVENT_AGENDA
          </h2>
          <div className="relative border-l-2 border-border-2 pl-6 space-y-0">
            {agenda.map((item, i) => (
              <div key={i} className="relative group pb-8 last:pb-0">
                <div className="absolute -left-[29px] top-2 w-4 h-4 rounded-full border-2 border-border-2 bg-bg-2 group-hover:border-text transition-colors flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-text/40 group-hover:bg-text transition-colors" />
                </div>
                <div className="glass-card p-5 group-hover:-translate-x-0.5 transition-transform">
                  <div className="flex items-center gap-4">
                    <span className="font-pixel text-xs text-muted bg-surface-2 border border-border px-3 py-1.5 rounded-lg shrink-0">{item.time}</span>
                    <p className="font-mono text-sm text-text">{item.topic}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Outcomes — past events only */}
      {hasOutcomes && (
        <section className="max-w-4xl mx-auto px-6 py-10">
          <h2 className="font-pixel text-sm text-text uppercase tracking-tight mb-6 flex items-center gap-2">
            <Award className="w-4 h-4" /> :: EVENT_OUTCOMES
          </h2>
          <div className="p-6 rounded-2xl bg-emerald-500/5 border border-emerald-500/20">
            <p className="text-base leading-relaxed text-muted-2 font-mono whitespace-pre-wrap">{event.outcomes}</p>
          </div>
        </section>
      )}

      {/* Gallery Link — past events only */}
      {hasGalleryLink && (
        <section className="max-w-4xl mx-auto px-6 py-10">
          <h2 className="font-pixel text-sm text-text uppercase tracking-tight mb-6 flex items-center gap-2">
            <ExternalLink className="w-4 h-4" /> :: MEDIA_ARCHIVE
          </h2>
          <a
            href={galleryLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-surface-2 border border-border-2 font-pixel text-xs uppercase tracking-tight text-text hover:scale-[1.02] transition-all"
          >
            OPEN_GOOGLE_DRIVE_GALLERY <ExternalLink className="w-4 h-4" />
          </a>
        </section>
      )}

      {/* Empty state for completed events with no content yet */}
      {isPast && !hasOutcomes && !hasGalleryLink && (
        <section className="max-w-4xl mx-auto px-6 py-10">
          <div className="p-8 rounded-2xl border border-dashed border-border-2 text-center">
            <CheckCircle2 className="w-8 h-8 mx-auto mb-3 text-muted-2" />
            <p className="font-pixel text-[10px] text-muted uppercase tracking-widest">Event Completed</p>
            <p className="font-mono text-xs text-muted-2 mt-1">Outcomes and gallery link will be posted soon.</p>
          </div>
        </section>
      )}

      {/* Footer */}
      <div className="max-w-4xl mx-auto px-6 pt-16 pb-8 flex justify-center">
        <Link href="/events" className="inline-flex items-center gap-3 px-8 py-4 bg-surface-2 border border-border-2 rounded-[20px] font-pixel text-xs transition-all hover:scale-[1.03] active:scale-[0.98] hover:bg-text hover:text-bg text-muted-2 uppercase tracking-tight shadow-xl">
          <ArrowLeft className="w-5 h-5" /> RETURN_TO_LOGS
        </Link>
      </div>
    
      {/* Sticky Mobile Register Button */}
      {!isPast && event && (
        <div className="md:hidden fixed bottom-[calc(1rem+env(safe-area-inset-bottom))] left-4 right-4 z-50">
          <EventRegisterButton
            eventTitle={event.title}
            eventSlug={event.slug}
            className="glass-strong w-full px-4 py-3 rounded-[24px] shadow-[0_18px_44px_rgba(0,0,0,0.24)] flex items-center justify-between gap-3 border border-border-2/80 bg-bg/85 backdrop-blur-xl active:scale-[0.98] transition-transform"
          >
            <div className="flex-1 min-w-0 pl-1 text-left">
              <p className="font-pixel text-[6px] text-text uppercase tracking-[0.22em] truncate leading-none">
                {event.title}
              </p>
              <p className="font-mono text-[9px] text-muted-2 uppercase mt-1 tracking-[0.18em] leading-none">
                JOIN_MISSION
              </p>
            </div>
            <span className="flex-shrink-0 px-4 py-2.5 bg-text text-bg rounded-full font-pixel text-[9px] uppercase tracking-[0.18em] shadow-[0_10px_24px_rgba(0,0,0,0.18)] whitespace-nowrap">
              REGISTER
            </span>
          </EventRegisterButton>
        </div>
      )}
    </div>
  );
}
