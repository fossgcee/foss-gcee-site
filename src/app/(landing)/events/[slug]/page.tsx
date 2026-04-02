import { notFound } from "next/navigation";
import Link from "next/link";
import dbConnect from "@/lib/db";
import Event from "@/models/Event";
import { ArrowLeft } from "lucide-react";

/* ── Static params for Next.js static generation ─────────── */
export async function generateStaticParams() {
  await dbConnect();
  const events = await Event.find({ status: { $ne: "draft" } }, 'slug').lean();
  return events.map((e: any) => ({ slug: e.slug }));
}

/* ── Metadata ─────────────────────────────────────────────── */
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

/* ── Page ─────────────────────────────────────────────────── */
export default async function EventPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  await dbConnect();
  // We specify lean() to get a plain JS object, compatible with Server Components
  const eventData = await Event.findOne({ slug }).lean();
  if (!eventData) notFound();

  // Typecast to any to avoid strict Mongoose generic typing issues inside the render block
  const event: any = eventData;

  const today = new Date(); 
  today.setHours(0, 0, 0, 0);
  const isPast = new Date(event.endDate) < today || event.status === "completed";

  return (
    <div className="min-h-screen bg-bg text-text pt-24 pb-20">

      {/* Back button */}
      <div className="max-w-4xl mx-auto px-6">
        <Link
          href="/events"
          className="inline-flex items-center gap-2 font-mono text-xs transition-colors duration-200 hover:text-text text-muted uppercase tracking-[0.2em]"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Logs
        </Link>
      </div>

      {/* Hero area */}
      <div className="max-w-4xl mx-auto px-6 pt-10 pb-6">
        <div className="rounded-[32px] overflow-hidden bg-bg-2 border border-border-2 p-1">
          <div className="bg-surface rounded-[31px] flex flex-col">
          {/* Terminal header */}
          <div className="flex flex-wrap items-center gap-2 px-5 py-4 border-b border-border bg-black/10">
            <div className="flex items-center gap-2 shrink-0">
               <span className="w-3 h-3 rounded-full bg-red-400" />
               <span className="w-3 h-3 rounded-full bg-amber-400" />
               <span className="w-3 h-3 rounded-full bg-emerald-400" />
            </div>
            <span className="ml-3 font-mono text-[10px] text-muted-2 uppercase tracking-widest truncate">
              /events/{event.slug}
            </span>
          </div>

          {/* Poster + meta */}
          <div className="flex flex-col md:flex-row gap-8 p-7 md:p-10 items-start">
            {event.poster && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={event.poster}
                alt={`${event.title} poster`}
                className="rounded-2xl object-cover shrink-0 border border-border w-full md:w-[280px] aspect-[4/5] shadow-2xl"
              />
            )}
            <div className="flex-1 space-y-8">
              <div>
                 {/* Type badge */}
                 <div className="flex flex-wrap items-center gap-3 mb-4">
                   <span className="inline-block font-mono text-[10px] px-3 py-1.5 rounded-lg border border-border-2 uppercase tracking-widest text-text bg-surface-2 shadow-sm">
                     {event.category}
                   </span>
                   <span className={`inline-block font-mono text-[10px] px-3 py-1.5 rounded-lg border uppercase tracking-widest ${isPast ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-blue-500/10 border-blue-500/20 text-blue-400'}`}>
                     {isPast ? "Media::Live (Archive)" : "Status::Upcoming"}
                   </span>
                 </div>

                 <h1 className="text-3xl sm:text-5xl font-pixel uppercase mb-6 leading-tight text-text">
                   {event.title}
                 </h1>
              </div>

              {/* Details grid */}
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-8 p-6 rounded-2xl bg-bg-2 border border-border">
                <Detail label="DATE SCOPE" value={`${formatDate(event.startDate)} → ${formatDate(event.endDate)}`} />
                <Detail label="TIME (IST)" value={`${event.startTime} - ${event.endTime}`} />
                <Detail label="VENUE"      value={event.venue} />
                <Detail label="HANDLED BY" value={event.handledBy} />
              </dl>
            </div>
          </div>
          </div>
        </div>
      </div>

      {/* Description */}
      {event.description && (
        <section className="max-w-4xl mx-auto px-6 py-10">
          <h2 className="font-pixel text-sm text-text uppercase tracking-tight mb-6">
            :: MISSION_SCOPE
          </h2>
          <p className="text-base sm:text-lg leading-relaxed text-muted-2 font-mono whitespace-pre-wrap">
            {event.description}
          </p>
        </section>
      )}

      {/* Photo gallery */}
      {event.photos && event.photos.length > 0 && (
        <section className="max-w-4xl mx-auto px-6 py-10">
          <h2 className="font-pixel text-sm text-text uppercase tracking-tight mb-6">
            :: MEDIA_ARCHIVE
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {event.photos.map((src: string, i: number) => (
              <div key={i} className="group overflow-hidden rounded-[24px] border border-border-2 bg-surface p-2">
                 <div className="relative aspect-square rounded-2xl overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={src}
                      alt={`${event.title} photo ${i + 1}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                 </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Footer CTA */}
      <div className="max-w-4xl mx-auto px-6 pt-16 pb-8 flex justify-center">
        <Link
          href="/events"
          className="inline-flex items-center gap-3 px-8 py-4 bg-surface-2 border border-border-2 rounded-[20px] font-pixel text-xs transition-all duration-200 hover:scale-[1.03] active:scale-[0.98] hover:bg-text hover:text-bg text-muted-2 uppercase tracking-tight shadow-xl"
        >
          <ArrowLeft className="w-5 h-5" /> RETURN_TO_LOGS
        </Link>
      </div>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="font-mono text-[9px] text-muted-2 uppercase tracking-[0.2em] mb-2">{label}</dt>
      <dd className="text-sm font-bold font-mono text-text uppercase leading-relaxed">{value}</dd>
    </div>
  );
}
