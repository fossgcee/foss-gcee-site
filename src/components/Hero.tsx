"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { gsap } from "gsap";
import { useTheme } from "next-themes";

/* ── Phrases that cycle in the typewriter ─────────────────── */
const PHRASES = [
  "FOSSGCEE",
  "GCEE",
  "Free and Open\nSource\u00a0Software",
  "FOSSGCEE",
];



export default function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const leftRef = useRef<HTMLDivElement>(null);
  const tuxRef = useRef<HTMLDivElement>(null);
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted ? resolvedTheme !== "light" : true; 

  /* ── Typewriter state ─────────────────────────────────── */
  const [displayText, setDisplayText] = useState("");
  const [phraseIdx, setPhraseIdx] = useState(0);
  const [typing, setTyping] = useState(true);

  useEffect(() => {
    const currentPhrase = PHRASES[phraseIdx];
    let timer: ReturnType<typeof setTimeout> | undefined;

    if (typing) {
      if (displayText.length < currentPhrase.length) {
        timer = setTimeout(() => setDisplayText(currentPhrase.slice(0, displayText.length + 1)), 100);
      } else {
        timer = setTimeout(() => setTyping(false), 1800);
      }
    } else {
      if (displayText.length > 0) {
        timer = setTimeout(() => setDisplayText(displayText.slice(0, -1)), 55);
      } else {
        timer = setTimeout(() => {
          setPhraseIdx((i) => (i + 1) % PHRASES.length);
          setTyping(true);
        }, 0);
      }
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [displayText, typing, phraseIdx]);

  /* ── GSAP entrance animations ─────────────────────────── */
  useEffect(() => {
    if (!containerRef.current) return;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.from(leftRef.current, { x: -60, opacity: 0, duration: 1, delay: 0.2 })
        .from(tuxRef.current, { x: 60, opacity: 0, duration: 1.1, ease: "power2.out" }, "-=0.7");

      // Tux gentle float
      gsap.to(tuxRef.current, {
        y: -16,
        duration: 3.5,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={containerRef}
      className="relative min-h-[100dvh] flex items-center overflow-hidden bg-bg"
    >
      {/* Background radial glow — right side (behind Tux) */}
      <div
        className="absolute right-0 top-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at center, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.03) 40%, transparent 70%)",
        }}
      />
      {/* Subtle top-left glow */}
      <div
        className="absolute left-0 top-0 w-96 h-96 rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(255,255,255,0.03) 0%, transparent 70%)" }}
      />

      {/* Grid overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)",
          backgroundSize: "72px 72px",
        }}
      />

      {/* ── Two-column layout ────────────────────────────── */}
      <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-10 lg:px-16 w-full py-16 lg:py-24 grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12 items-center">

        {/* ── LEFT: Text content ──────────────────────────── */}
        <div ref={leftRef} className="flex flex-col items-start gap-4 sm:gap-6 pt-2 lg:pt-0">

          {/* Terminal badge */}
          <div
            className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-full font-mono text-[9px] sm:text-[11px] glass text-text/50 border-border max-w-full"
          >
            <span className="w-1.5 h-1.5 shrink-0 rounded-full animate-pulse bg-text" />
            <span className="truncate">Free &amp; Open Source Software Club — GCE Erode</span>
          </div>

          {/* Typewriter heading */}
          <h1
            className="font-pixel leading-relaxed text-text whitespace-pre-wrap break-words"
            style={{ fontSize: "clamp(1rem, 5vw, 2.4rem)", minHeight: "2.8em" }}
          >
            {displayText}
            <span className="animate-blink text-text">_</span>
          </h1>

          {/* Description */}
          <p
            className="text-base md:text-lg lg:text-lg leading-relaxed max-w-lg font-mono text-muted-2"
          >
            We foster a culture of{" "}
            <span className="text-text">Linux</span>,{" "}
            <span className="text-text/85">open‑source contribution</span>, and
            real‑world collaboration among students at Government College of Engineering, Erode.
          </p>

          {/* CTAs */}
          {mounted && (
            <div className="flex flex-row flex-wrap gap-2 sm:gap-3 mt-1 w-full">
              <Link
                href="/join"
                className="inline-flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3.5 rounded-xl font-mono text-xs sm:text-sm font-semibold transition-all duration-200 hover:scale-105 bg-text text-bg shadow-[0_0_24px_var(--color-accent-glow)] transform"
              >
                $ register_now
                <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
                  <path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
              <Link
                href="/#join"
                className="inline-flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3.5 rounded-xl font-mono text-xs sm:text-sm font-semibold transition-all duration-200 hover:scale-105 glass border border-text/20 dark:border-white/20 hover:border-text/40 dark:hover:border-white/40 text-text/80"
              >
                $ join_community
              </Link>
              <a
                href="https://github.com/fossgcee"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3.5 rounded-xl font-mono text-xs sm:text-sm font-semibold transition-all duration-200 hover:scale-105 glass border border-text/20 dark:border-white/20 hover:border-text/40 dark:hover:border-white/40 text-text/80"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.44 9.8 8.21 11.39.6.11.82-.26.82-.58v-2.03c-3.34.73-4.04-1.61-4.04-1.61-.55-1.39-1.34-1.76-1.34-1.76-1.09-.75.08-.73.08-.73 1.2.08 1.84 1.24 1.84 1.24 1.07 1.83 2.81 1.3 3.5.99.11-.78.42-1.3.76-1.6-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.12-.3-.54-1.52.12-3.18 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 3-.4c1.02 0 2.04.14 3 .4 2.29-1.55 3.3-1.23 3.3-1.23.66 1.66.24 2.88.12 3.18.77.84 1.24 1.91 1.24 3.22 0 4.61-2.81 5.63-5.49 5.92.43.37.82 1.1.82 2.22v3.29c0 .32.21.7.83.58C20.57 21.8 24 17.3 24 12c0-6.63-5.37-12-12-12z" />
                </svg>
                GitHub
              </a>
            </div>
          )}

          {/* Club logo + college name */}
          <div className="flex items-center gap-2.5 mt-2 pt-4 border-t border-border w-full">
            <Image src="/foss_gcee_logo.png" alt="FOSSGCEE Logo" width={36} height={36} className="rounded-full object-contain filter dark:invert-0 light:invert shrink-0" />
            <div>
              <p className="font-pixel text-[7px] sm:text-[8px] leading-relaxed text-text">FOSSGCEE</p>
              <p className="font-mono text-[8px] sm:text-[9px] text-muted-2 truncate">Govt. College of Engineering, Erode</p>
            </div>
          </div>
        </div>

        {/* ── RIGHT: Tux illustration ─────────────────────── */}
        <div ref={tuxRef} className="flex items-center justify-center relative order-first lg:order-last mb-4 lg:mb-0">
          {/* Glow / aura circle behind Tux — white in dark mode, black in light mode */}
          <div
            className="absolute rounded-full"
            style={{
              width: "min(380px, 70vw)",
              height: "min(380px, 70vw)",
              background: isDark
                ? "radial-gradient(ellipse at center, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.03) 45%, transparent 70%)"
                : "radial-gradient(ellipse at center, rgba(0,0,0,0.10) 0%, rgba(0,0,0,0.05) 45%, transparent 70%)",
            }}
          />
          <div
            className="relative z-1 flex items-center justify-center"
            style={{
              width: "min(280px, 55vw)",
              height: "min(340px, 65vw)",
              filter: isDark
                ? "drop-shadow(0 0 48px rgba(255,255,255,0.08))"
                : "drop-shadow(0 0 32px rgba(0,0,0,0.35)) drop-shadow(0 0 12px rgba(0,0,0,0.20))",
            }}
          >
            <Image
              src="/Tux.svg"
              alt="Linux Tux"
              fill
              className="object-contain"
              sizes="(max-width: 768px) 55vw, (max-width: 1024px) 50vw, 33vw"
              priority
            />
          </div>
        </div>
      </div>

      {/* Bottom fade */}
      <div
        className="absolute bottom-0 inset-x-0 h-24 pointer-events-none"
        style={{ backgroundImage: "linear-gradient(to top, var(--color-bg), transparent)" }}
      />
    </section>
  );
}
