"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import Image from "next/image";

export default function PageLoader() {
  const loaderRef  = useRef<HTMLDivElement>(null);
  const logoRef    = useRef<HTMLDivElement>(null);
  const barRef     = useRef<HTMLDivElement>(null);
  const textRef    = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (!loaderRef.current) return;

    const tl = gsap.timeline();

    // Initial state
    gsap.set(loaderRef.current, { opacity: 1 });
    gsap.set(logoRef.current,   { opacity: 0, scale: 0.6, y: 20 });
    gsap.set(barRef.current,    { scaleX: 0, transformOrigin: "left center" });
    gsap.set(textRef.current,   { opacity: 0, y: 10 });

    // Animate in
    tl.to(logoRef.current, { opacity: 1, scale: 1, y: 0, duration: 0.7, ease: "back.out(1.5)" })
      .to(textRef.current,  { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" }, "-=0.3")
      .to(barRef.current,   { scaleX: 1, duration: 0.9, ease: "power2.inOut" }, "-=0.2")

      // Hold briefly then exit — curtain wipe upward
      .to({}, { duration: 0.3 })
      .to(textRef.current,  { opacity: 0, y: -10, duration: 0.25, ease: "power2.in" })
      .to(logoRef.current,  { opacity: 0, scale: 1.05, duration: 0.3, ease: "power2.in" }, "-=0.15")
      .to(loaderRef.current, {
        yPercent: -100,
        duration: 0.8,
        ease: "power4.inOut",
        onComplete: () => {
          if (loaderRef.current) loaderRef.current.style.display = "none";
        },
      });

    return () => { tl.kill(); };
  }, []);

  return (
    <div
      ref={loaderRef}
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center gap-8"
      style={{ backgroundColor: "var(--color-bg)", opacity: 0 }}
    >
      {/* Logo mark */}
      <div ref={logoRef} className="flex flex-col items-center gap-4">
        <div
          className="p-5 rounded-3xl"
          style={{
            background: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            boxShadow: "0 0 60px var(--color-accent-dim)",
          }}
        >
          <Image
            src="/foss_gcee_logo.png"
            alt="FOSSGCEE"
            width={96}
            height={96}
            className="rounded-full object-contain invert dark:invert-0"
            priority
          />
        </div>
        <p className="font-pixel text-[10px] tracking-widest text-text">
          FOSSGCEE
        </p>
      </div>

      {/* Loading bar */}
      <div
        className="w-48 h-px relative overflow-hidden"
        style={{ background: "var(--color-border)" }}
      >
        <div
          ref={barRef}
          className="absolute inset-0"
          style={{ background: "linear-gradient(90deg, transparent, var(--color-text), transparent)" }}
        />
      </div>

      {/* Tagline */}
      <p
        ref={textRef}
        className="font-mono text-[10px] tracking-[0.25em] uppercase text-text/40"
      >
        Free &amp; Open Source
      </p>
    </div>
  );
}
