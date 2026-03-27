"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import Link from "next/link";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { EVENTS, type FossEvent } from "@/data/events";

/* ── Auto-split events by date ────────────────────────────── */
const today = new Date();
today.setHours(0, 0, 0, 0);

const sorted   = [...EVENTS].sort((a, b) => a.dateISO.localeCompare(b.dateISO));
const past     = sorted.filter(e => new Date(e.dateISO) < today);
const upcoming = sorted.filter(e => new Date(e.dateISO) >= today);
const current  = upcoming[0] ?? null; // next upcoming = terminal card

/* ── Type badge colors ────────────────────────────────────── */
const typeBadge: Record<string, string> = {
  workshop:  "workshop",
  talk:      "talk",
  hackathon: "hackathon",
  meetup:    "meetup",
  other:     "other",
};

export default function Community() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      gsap.from(".comm-heading", {
        immediateRender: false, scrollTrigger: { trigger: ".comm-heading", start: "top 85%" },
        y: 40, opacity: 0, duration: 0.8, ease: "power3.out",
      });
      gsap.from(".terminal-card", {
        immediateRender: false, scrollTrigger: { trigger: ".terminal-card", start: "top 80%" },
        y: 40, opacity: 0, duration: 0.9, ease: "power3.out",
      });
      gsap.from(".past-item", {
        immediateRender: false, scrollTrigger: { trigger: ".past-list", start: "top 80%" },
        x: -30, opacity: 0, duration: 0.6, stagger: 0.12, ease: "power2.out",
      });
      gsap.from(".upcoming-card", {
        immediateRender: false, scrollTrigger: { trigger: ".upcoming-list", start: "top 80%" },
        x: 30, opacity: 0, duration: 0.6, stagger: 0.12, ease: "power2.out",
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section
      id="community"
      ref={sectionRef}
      className="py-24 px-4 sm:px-6 lg:px-8 relative bg-transparent"
    >
      <div className="max-w-6xl mx-auto">

        {/* ── Section heading ───────────────────────────────── */}
        <div className="comm-heading text-center mb-16">
          <span className="tag-badge mb-4 inline-block">// community</span>
          <h2 className="text-3xl sm:text-4xl font-bold mt-3" style={{ color: "#f0f0f0" }}>
            Events &amp; <span style={{ color: "#ffffff" }}>Activities</span>
          </h2>
          <p className="mt-4 max-w-xl mx-auto text-sm sm:text-base" style={{ color: "rgba(255,255,255,0.45)" }}>
            From installations to hackathons — here&apos;s what we&apos;ve been up to and what&apos;s coming.
          </p>
        </div>

        {/* ── Terminal current-event card ────────────────────── */}
        {current && <TerminalCard event={current} />}

        {/* ── Grid: Past | Upcoming ─────────────────────────── */}
        <div className="mt-16 grid grid-cols-1 lg:grid-cols-2 gap-10">

          {/* Past events timeline */}
          <div>
            <h3 className="font-mono text-[11px] uppercase tracking-widest mb-6" style={{ color: "rgba(255,255,255,0.3)" }}>
              ─ Past Events
            </h3>
            {past.length === 0 ? (
              <p className="font-mono text-xs" style={{ color: "rgba(255,255,255,0.25)" }}>No past events yet.</p>
            ) : (
              <div className="past-list relative pl-6 border-l" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
                {past.map(ev => (
                  <div key={ev.title + ev.dateISO} className="past-item relative group mb-5 last:mb-0">
                    <div
                      className="absolute -left-[22px] top-3 w-3 h-3 rounded-full border-2 transition-colors duration-200"
                      style={{ borderColor: "rgba(255,255,255,0.3)", background: "rgba(255,255,255,0.06)" }}
                    />
                    <div className="glass-card p-5 group-hover:-translate-x-0.5">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-[10px]" style={{ color: "#ffffff" }}>{ev.date}</span>
                        <span className="font-mono text-[9px] px-2 py-0.5 rounded-full"
                          style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.4)", border: "1px solid rgba(255,255,255,0.08)" }}>
                          {ev.type}
                        </span>
                      </div>
                      <p className="font-semibold text-sm" style={{ color: "#f0f0f0" }}>{ev.title}</p>
                      {ev.desc && <p className="mt-1 text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.4)" }}>{ev.desc}</p>}
                      {/* Photo thumbnails */}
                      {ev.photos && ev.photos.length > 0 && (
                        <div className="mt-3 grid grid-cols-3 gap-2">
                          {ev.photos.map((src, i) => (
                            <div key={i} className="relative aspect-video rounded-lg overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.06)" }}>
                              <Image 
                                src={src} 
                                alt={`photo ${i+1}`}
                                fill
                                className="object-cover"
                              />
                            </div>
                          ))}
                        </div>
                      )}
                      <Link
                        href={`/events/${ev.slug}`}
                        className="inline-flex items-center gap-1.5 mt-3 font-mono text-[11px] transition-colors duration-200 hover:text-white"
                        style={{ color: "rgba(255,255,255,0.35)" }}
                      >
                        View details →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Upcoming events (excluding the one in terminal card) */}
          <div>
            <h3 className="font-mono text-[11px] uppercase tracking-widest mb-6" style={{ color: "rgba(255,255,255,0.3)" }}>
              ─ Upcoming Events
            </h3>
            {upcoming.length <= 1 ? (
              <p className="font-mono text-xs" style={{ color: "rgba(255,255,255,0.25)" }}>
                {upcoming.length === 1 ? "Only the featured event above is scheduled." : "No upcoming events yet — check back soon."}
              </p>
            ) : (
              <div className="upcoming-list flex flex-col gap-4">
                {upcoming.slice(1).map(ev => (
                  <div key={ev.title + ev.dateISO} className="upcoming-card glass-card p-5 flex items-start justify-between gap-4">
                    <div>
                      <p className="font-semibold text-sm mb-1" style={{ color: "#f0f0f0" }}>{ev.title}</p>
                      <p className="font-mono text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
                        {ev.date} · {ev.venue} · {ev.time}
                      </p>
                    </div>
                    <span className="shrink-0 font-mono text-[9px] px-2.5 py-1 rounded-full"
                      style={{ background: "rgba(255,255,255,0.06)", color: "#ffffff", border: "1px solid rgba(255,255,255,0.14)" }}>
                      ⚡ soon
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── Terminal card component ──────────────────────────────── */
function TerminalCard({ event }: { event: FossEvent }) {
  return (
    <div
      className="terminal-card rounded-2xl overflow-hidden w-full max-w-4xl mx-auto"
      style={{
        background: "rgba(10, 10, 10, 0.7)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        border: "1px solid rgba(255,255,255,0.1)",
        boxShadow: "0 0 60px rgba(0,0,0,0.8)",
      }}
    >
      {/* Window chrome */}
      <div className="flex items-center gap-2 px-4 py-3 border-b" style={{ borderColor: "rgba(255,255,255,0.06)", background: "#151515" }}>
        <span className="w-3 h-3 rounded-full" style={{ background: "rgba(255,255,255,0.15)" }} />
        <span className="w-3 h-3 rounded-full" style={{ background: "rgba(255,255,255,0.1)" }} />
        <span className="w-3 h-3 rounded-full" style={{ background: "rgba(255,255,255,0.07)" }} />
        <span className="ml-3 font-mono text-[11px]" style={{ color: "rgba(255,255,255,0.3)" }}>terminal</span>
      </div>

      {/* Terminal body */}
      <div className="p-6 sm:p-8 font-mono text-sm">
        {/* Prompt line */}
        <p className="mb-1" style={{ color: "rgba(255,255,255,0.9)" }}>
          <span style={{ color: "rgba(255,255,255,0.4)" }}>FOSSGCEE</span>
          <span style={{ color: "rgba(255,255,255,0.2)" }}>:~$ </span>
          <span style={{ color: "#ffffff" }}>embrace-the-penguin</span>
        </p>
        <p className="mb-6" style={{ color: "rgba(255,255,255,0.5)" }}>$ cat Current-Event.txt</p>

        {/* Two-column: poster + details */}
        <div className="flex flex-col sm:flex-row gap-8 items-start">
          {/* Poster (optional) */}
          {event.poster && (
            <div className="shrink-0 relative w-[180px] h-[180px] rounded-xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.08)" }}>
              <Image
                src={event.poster}
                alt={`${event.title} poster`}
                fill
                className="object-cover"
              />
            </div>
          )}

          {/* Event details grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-5 flex-1">
            <InfoRow label="TITLE" value={event.title} highlight />
            <InfoRow label="DATE" value={event.date} />
            <InfoRow label="VENUE" value={event.venue} />
            <InfoRow label="TIME" value={event.time} />
            <InfoRow label="HANDLED BY" value={event.handledBy} />
          </div>
        </div>

        {/* Closing prompt + link */}
        <div className="mt-8 flex items-center justify-between">
          <p style={{ color: "rgba(255,255,255,0.35)" }}>
            FOSSGCEE:~$
            <span className="inline-block w-2 h-4 ml-1 align-middle animate-blink" style={{ background: "rgba(255,255,255,0.6)" }} />
          </p>
          <Link
            href={`/events/${event.slug}`}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl font-mono text-xs font-semibold transition-all duration-200 hover:scale-105"
            style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.7)" }}
          >
            $ ./view_more.sh →
          </Link>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-widest mb-1" style={{ color: "rgba(255,255,255,0.3)" }}>{label}:</p>
      <p className={highlight ? "text-base font-semibold" : "text-sm"} style={{ color: highlight ? "#ffffff" : "rgba(255,255,255,0.7)" }}>
        {value}
      </p>
    </div>
  );
}
