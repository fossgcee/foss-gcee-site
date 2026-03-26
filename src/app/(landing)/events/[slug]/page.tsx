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
    <div className="min-h-screen" style={{ background: "#080808", color: "#f0f0f0" }}>

      {/* Back button */}
      <div className="max-w-4xl mx-auto px-6 pt-8">
        <Link
          href="/#community"
          className="inline-flex items-center gap-2 font-mono text-xs transition-colors duration-200 hover:text-white"
          style={{ color: "rgba(255,255,255,0.4)" }}
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
          style={{ background: "#0f0f0f", border: "1px solid rgba(255,255,255,0.08)" }}
        >
          {/* Terminal header */}
          <div
            className="flex items-center gap-2 px-5 py-3 border-b"
            style={{ borderColor: "rgba(255,255,255,0.06)", background: "#151515" }}
          >
            <span className="w-3 h-3 rounded-full" style={{ background: "rgba(255,255,255,0.15)" }} />
            <span className="w-3 h-3 rounded-full" style={{ background: "rgba(255,255,255,0.1)" }} />
            <span className="w-3 h-3 rounded-full" style={{ background: "rgba(255,255,255,0.07)" }} />
            <span className="ml-3 font-mono text-[11px]" style={{ color: "rgba(255,255,255,0.3)" }}>
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
                style={{ width: 200, height: 200, border: "1px solid rgba(255,255,255,0.08)" }}
              />
            )}
            <div className="flex-1">
              {/* Type badge */}
              <span
                className="inline-block font-mono text-[10px] px-2.5 py-1 rounded-full mb-3"
                style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.5)", border: "1px solid rgba(255,255,255,0.1)" }}
              >
                {event.type} · {isPast ? "past" : "upcoming"}
              </span>

              <h1 className="text-2xl sm:text-3xl font-bold mb-6 leading-snug" style={{ color: "#ffffff" }}>
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
          <h2 className="font-mono text-[11px] uppercase tracking-widest mb-4" style={{ color: "rgba(255,255,255,0.3)" }}>
            — About this event
          </h2>
          <p className="text-base leading-relaxed" style={{ color: "rgba(255,255,255,0.65)" }}>
            {event.desc}
          </p>
        </section>
      )}

      {/* Photo gallery */}
      {event.photos && event.photos.length > 0 && (
        <section className="max-w-4xl mx-auto px-6 py-8">
          <h2 className="font-mono text-[11px] uppercase tracking-widest mb-6" style={{ color: "rgba(255,255,255,0.3)" }}>
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
                style={{ border: "1px solid rgba(255,255,255,0.07)" }}
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
          style={{ background: "#ffffff", color: "#080808" }}
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
      <dt className="font-mono text-[10px] uppercase tracking-widest mb-1" style={{ color: "rgba(255,255,255,0.3)" }}>{label}</dt>
      <dd className="text-sm font-medium" style={{ color: "rgba(255,255,255,0.8)" }}>{value}</dd>
    </div>
  );
}
