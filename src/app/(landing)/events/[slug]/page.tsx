import { notFound } from "next/navigation";
import Link from "next/link";
import { EVENTS } from "@/data/events";

/* ── Static params for Next.js static generation ─────────── */
export function generateStaticParams() {
  return EVENTS.map(e => ({ slug: e.slug }));
}

/* ── Metadata ─────────────────────────────────────────────── */
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const event = EVENTS.find(e => e.slug === slug);
  if (!event) return { title: "Event Not Found – FOSSGCEE" };
  return {
    title: `${event.title} – FOSSGCEE`,
    description: event.desc ?? `FOSSGCEE event: ${event.title}`,
  };
}

/* ── Page ─────────────────────────────────────────────────── */
export default async function EventPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const event = EVENTS.find(e => e.slug === slug);
  if (!event) notFound();

  const today = new Date(); today.setHours(0, 0, 0, 0);
  const isPast = new Date(event.dateISO) < today;

  return (
    <div className="min-h-screen bg-bg text-text">

      {/* Back button */}
      <div className="max-w-4xl mx-auto px-6 pt-8">
        <Link
          href="/#community"
          className="inline-flex items-center gap-2 font-mono text-xs transition-colors duration-200 hover:text-text"
          className="text-muted"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M12 7H2M6 3L2 7l4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Back to Events
        </Link>
      </div>

      {/* Hero area */}
      <div className="max-w-4xl mx-auto px-6 pt-10 pb-6">
        <div
          className="rounded-2xl overflow-hidden"
          className="bg-bg-2 border border-border-2"
        >
          {/* Terminal header */}
          <div
            className="flex items-center gap-2 px-5 py-3 border-b"
            className="border-border bg-surface"
          >
            <span className="w-3 h-3 rounded-full" className="bg-muted" />
            <span className="w-3 h-3 rounded-full" className="bg-muted-2" />
            <span className="w-3 h-3 rounded-full" className="bg-surface-2" />
            <span className="ml-3 font-mono text-[11px]" className="text-muted">
              /events/{event.slug}
            </span>
          </div>

          {/* Poster + meta */}
          <div className="flex flex-col sm:flex-row gap-8 p-7 items-start">
            {event.poster && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={event.poster}
                alt={`${event.title} poster`}
                className="rounded-xl object-cover shrink-0"
                className="border border-border w-[200px] h-[200px]"
              />
            )}
            <div className="flex-1">
              {/* Type badge */}
              <span
                className="inline-block font-mono text-[10px] px-2.5 py-1 rounded-full mb-3"
                className="bg-surface text-muted-2 border border-border-2"
              >
                {event.type} · {isPast ? "past" : "upcoming"}
              </span>

              <h1 className="text-2xl sm:text-3xl font-bold mb-6 leading-snug" className="text-text">
                {event.title}
              </h1>

              {/* Details grid */}
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-5">
                <Detail label="DATE"       value={event.date} />
                <Detail label="VENUE"      value={event.venue} />
                <Detail label="TIME"       value={event.time} />
                <Detail label="HANDLED BY" value={event.handledBy} />
              </dl>
            </div>
          </div>
        </div>
      </div>

      {/* Description */}
      {event.desc && (
        <section className="max-w-4xl mx-auto px-6 py-6">
          <h2 className="font-mono text-[11px] uppercase tracking-widest mb-4" className="text-muted">
            — About this event
          </h2>
          <p className="text-base leading-relaxed" className="text-muted-2">
            {event.desc}
          </p>
        </section>
      )}

      {/* Photo gallery */}
      {event.photos && event.photos.length > 0 && (
        <section className="max-w-4xl mx-auto px-6 py-8">
          <h2 className="font-mono text-[11px] uppercase tracking-widest mb-6" className="text-muted">
            — Event Photos
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {event.photos.map((src, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={i}
                src={src}
                alt={`${event.title} photo ${i + 1}`}
                className="rounded-xl object-cover w-full aspect-video"
                className="border border-border"
              />
            ))}
          </div>
        </section>
      )}

      {/* Footer CTA */}
      <div className="max-w-4xl mx-auto px-6 py-10 flex justify-center">
        <Link
          href="/#community"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-mono text-sm font-semibold transition-all duration-200 hover:scale-105"
          className="bg-text text-bg"
        >
          ← All Events
        </Link>
      </div>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="font-mono text-[10px] uppercase tracking-widest mb-1" className="text-muted">{label}</dt>
      <dd className="text-sm font-medium" className="text-text/80">{value}</dd>
    </div>
  );
}
