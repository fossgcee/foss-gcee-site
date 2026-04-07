"use client";

import { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";


const stats = [
  { value: "100+", label: "Active Members" },
  { value: "0+", label: "Events Hosted" },
  { value: "0+", label: "OSS Contributions" },
  { value: "2026", label: "Founded" },
];

const cards = [
  {
    icon: "heart",
    title: "What is FOSSGCEE?",
    text: "FOSSGCEE is the official Free and Open Source Software club of Government College of Engineering, Erode — a community of passionate students who believe in open collaboration and transparent technology.",
  },
  {
    icon: "🎯",
    title: "Our Mission",
    text: "To promote FOSS culture within campus through hands‑on learning, peer mentorship, and real‑world contributions — building an ecosystem where every student can grow as a developer.",
  },
  {
    icon: "🔭",
    title: "Our Vision",
    text: "To build a sustainable open‑source culture where students contribute back to the global commons, launch meaningful projects, and graduate as engineers who value freedom and transparency.",
  },
];

export default function About() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      // Section heading
      gsap.from(".about-heading", {
        immediateRender: false, scrollTrigger: { trigger: ".about-heading", start: "top 85%" },
        y: 40, opacity: 0, duration: 0.8, ease: "power3.out",
      });

      // Stats count-up feel
      gsap.from(".about-stat", {
        immediateRender: false, scrollTrigger: { trigger: statsRef.current, start: "top 80%" },
        y: 30, opacity: 0, duration: 0.6, stagger: 0.1, ease: "power2.out",
      });

      // Cards
      gsap.from(".about-card", {
        immediateRender: false, scrollTrigger: { trigger: cardsRef.current, start: "top 80%" },
        y: 50, opacity: 0, duration: 0.7, stagger: 0.15, ease: "power3.out",
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section id="about" ref={sectionRef} className="py-28 relative">
      <div className="section-divider" />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">

        {/* Heading */}
        <div className="about-heading text-center mb-16">
          <span className="tag-badge mb-4 inline-block">{"// about"}</span>
          <h2 className="text-3xl sm:text-4xl font-bold mt-3 text-text">
            Who <span className="text-text">We Are</span>
          </h2>
          <p className="mt-4 max-w-xl mx-auto text-sm sm:text-base leading-relaxed text-muted-2">
            A student‑led community at GCE Erode, united by our love for open‑source technology.
          </p>
        </div>

        {/* Stats */}
        <div ref={statsRef} className="mb-16 grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-10">
          {stats.map((s) => (
            <div key={s.label} className="about-stat text-center glass-card px-4 sm:px-8 py-5 sm:py-6 cursor-default">
              <div className="font-pixel text-xl sm:text-2xl mb-1 text-text">{s.value}</div>
              <div className="font-mono text-[9px] sm:text-xs uppercase tracking-widest mt-1 text-muted">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Cards */}
        <div ref={cardsRef} className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {cards.map((c) => (
            <div key={c.title} className="about-card glass-card p-7">
              <div className="text-3xl mb-4">
                {c.icon === "heart" ? (
                  <>
                    <span className="dark:hidden">🖤</span>
                    <span className="hidden dark:inline">🤍</span>
                  </>
                ) : (
                  c.icon
                )}
              </div>
              <h3 className="font-semibold text-base mb-3 text-text">{c.title}</h3>
              <p className="text-sm leading-relaxed text-muted-2">{c.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
