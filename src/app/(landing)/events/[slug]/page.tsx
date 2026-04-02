import { notFound } from "next/navigation";
import Link from "next/link";
import dbConnect from "@/lib/db";
import Event from "@/models/Event";
import { ArrowLeft, Calendar, Clock, MapPin, Users, CheckCircle2, ListChecks, ImageIcon, Award } from "lucide-react";

/* ── Static params ─────────────────────────────────────────── */
export async function generateStaticParams() {
  await dbConnect();
  const events = await Event.find({ status: { $ne: "draft" } }, "slug").lean();
  return events.map((e: any) => ({ slug: e.slug }));
}

/* ── Metadata ──────────────────────────────────────────────── */
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  await dbConnect();
  const event = await Event.findOne({ slug }).lean();
  if (!event) return { title: "Event Not Found – FOSSGCEE" };
  return {
    title: `${event.title} – FOSSGCEE`,
    description: event.description ?? `FOSSGCEE event: ${event.title}`,
  };
}

const fmt = (d: string) => {
  if (!d) return "N/A";
  const [y, m, day] = d.split("-");
  return new Date(+y, +m - 1, +day).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
};

function todayIST() {
  return new Date(Date.now() + 5.5 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

/* ── Page ──────────────────────────────────────────────────── */
export default async function EventPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  await dbConnect();
  const eventData = await Event.findOne({ slug }).lean();
  if (!eventData) notFound();

  const event: any = eventData;
  const today = todayIST();
  const isPast = event.status === "completed" || (event.endDate && event.endDate < today);

  const agenda: { time: string; topic: string }[] = event.agenda ?? [];
  const photos: string[] = event.photos ?? [];
  const hasOutcomes = isPast && event.outcomes && event.outcomes.trim().length > 0;
  const hasPhotos   = isPast && photos.length > 0;
  const hasAgenda   = !isPast && agenda.length > 0;

  return (
    <div className="min-h-screen bg-bg text-text pt-24 pb-20">

      {/* Back */}
      <div className="max-w-4xl mx-auto px-6 mb-8">
        <Link href="/events" className="inline-flex items-center gap-2 font-mono text-xs transition-colors hover:text-text text-muted uppercase tracking-[0.2em]">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Logs
        </Link>
      </div>

      {/* Hero terminal card */}
      <div className="max-w-4xl mx-auto px-6">
        <div className="rounded-[32px] overflow-hidden bg-bg-2 border border-border-2 p-1">
          <div className="bg-surface rounded-[31px] flex flex-col">

            <div className="flex flex-wrap items-center gap-2 px-5 py-4 border-b border-border bg-black/10">
              <div className="flex items-center gap-2 shrink-0">
                <span className="w-3 h-3 rounded-full bg-red-400" />
                <span className="w-3 h-3 rounded-full bg-amber-400" />
                <span className="w-3 h-3 rounded-full bg-emerald-400" />
              </div>
              <span className="ml-3 font-mono text-[10px] text-muted-2 uppercase tracking-widest truncate">/events/{event.slug}</span>
              <span className={`ml-auto font-mono text-[10px] px-3 py-1 rounded-lg border ${isPast ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-blue-500/10 border-blue-500/20 text-blue-400"}`}>
                {isPast ? "Completed" : "Upcoming"}
              </span>
            </div>

            <div className="flex flex-col md:flex-row gap-8 p-7 md:p-10 items-start">
              {event.poster && (
                <img src={event.poster} alt={`${event.title} poster`} className="rounded-2xl object-cover shrink-0 border border-border w-full md:w-[260px] aspect-[4/5] shadow-2xl" />
              )}
              <div className="flex-1 space-y-6">
                <div>
                  <div className="flex flex-wrap items-center gap-3 mb-4">
                    <span className="font-mono text-[10px] px-3 py-1.5 rounded-lg border border-border-2 uppercase tracking-widest text-text bg-surface-2">{event.category}</span>
                    {event.registrationsCount > 0 && (
                      <span className="font-mono text-[10px] px-3 py-1.5 rounded-lg border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 flex items-center gap-1.5">
                        <Users className="w-3 h-3" /> {event.registrationsCount} Registered
                      </span>
                    )}
                  </div>
                  <h1 className="text-3xl sm:text-5xl font-pixel uppercase mb-6 leading-tight text-text">{event.title}</h1>
                </div>

                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-6 p-6 rounded-2xl bg-bg-2 border border-border">
                  <div>
                    <dt className="font-mono text-[9px] text-muted-2 uppercase tracking-[0.2em] mb-1 flex items-center gap-1.5"><Calendar className="w-3 h-3" /> Date</dt>
                    <dd className="text-sm font-bold font-mono text-text uppercase">{fmt(event.startDate)} — {fmt(event.endDate)}</dd>
                  </div>
                  <div>
                    <dt className="font-mono text-[9px] text-muted-2 uppercase tracking-[0.2em] mb-1 flex items-center gap-1.5"><Clock className="w-3 h-3" /> Time (IST)</dt>
                    <dd className="text-sm font-bold font-mono text-text uppercase">{event.startTime} – {event.endTime}</dd>
                  </div>
                  <div>
                    <dt className="font-mono text-[9px] text-muted-2 uppercase tracking-[0.2em] mb-1 flex items-center gap-1.5"><MapPin className="w-3 h-3" /> Venue</dt>
                    <dd className="text-sm font-bold font-mono text-text uppercase">{event.venue}</dd>
                  </div>
                  <div>
                    <dt className="font-mono text-[9px] text-muted-2 uppercase tracking-[0.2em] mb-1">Handled By</dt>
                    <dd className="text-sm font-bold font-mono text-text uppercase">{event.handledBy}</dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        </div>
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

      {/* Photos — past events only */}
      {hasPhotos && (
        <section className="max-w-4xl mx-auto px-6 py-10">
          <h2 className="font-pixel text-sm text-text uppercase tracking-tight mb-6 flex items-center gap-2">
            <ImageIcon className="w-4 h-4" /> :: MEDIA_ARCHIVE
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {photos.map((src: string, i: number) => (
              <a key={i} href={src} target="_blank" rel="noopener noreferrer" className="group overflow-hidden rounded-[24px] border border-border-2 bg-surface p-2 block">
                <div className="relative aspect-square rounded-2xl overflow-hidden">
                  <img src={src} alt={`${event.title} photo ${i + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                    <span className="font-mono text-[10px] text-white opacity-0 group-hover:opacity-100 transition-opacity uppercase tracking-widest bg-black/60 px-3 py-1.5 rounded-lg">View Full</span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </section>
      )}

      {/* Empty state for completed events with no content yet */}
      {isPast && !hasOutcomes && !hasPhotos && (
        <section className="max-w-4xl mx-auto px-6 py-10">
          <div className="p-8 rounded-2xl border border-dashed border-border-2 text-center">
            <CheckCircle2 className="w-8 h-8 mx-auto mb-3 text-muted-2" />
            <p className="font-pixel text-[10px] text-muted uppercase tracking-widest">Event Completed</p>
            <p className="font-mono text-xs text-muted-2 mt-1">Outcomes and photos will be posted soon.</p>
          </div>
        </section>
      )}

      {/* Footer */}
      <div className="max-w-4xl mx-auto px-6 pt-16 pb-8 flex justify-center">
        <Link href="/events" className="inline-flex items-center gap-3 px-8 py-4 bg-surface-2 border border-border-2 rounded-[20px] font-pixel text-xs transition-all hover:scale-[1.03] active:scale-[0.98] hover:bg-text hover:text-bg text-muted-2 uppercase tracking-tight shadow-xl">
          <ArrowLeft className="w-5 h-5" /> RETURN_TO_LOGS
        </Link>
      </div>
    </div>
  );
}