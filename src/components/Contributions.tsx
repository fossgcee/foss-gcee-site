"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { Link2, GitCommit, User } from "lucide-react";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

interface Member {
  _id: string;
  name: string;
  department: string;
  year: string;
}

interface Contribution {
  _id: string;
  memberId: Member;
  title: string;
  description: string;
  url: string;
  isFeatured: boolean;
  imageUrl?: string;
  createdAt: string;
}

export default function Contributions() {
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [loading, setLoading] = useState(true);
  
  const sectionRef = useRef<HTMLElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isPausedRef = useRef(false);

  useEffect(() => {
    let active = true;
    async function fetchContributions() {
      try {
        const res = await fetch("/api/contributions");
        const json = await res.json();
        if (active && json.success && json.data) {
          // Filter to only show featured contributions on the home page
          const featured = json.data.filter((c: Contribution) => c.isFeatured);
          setContributions(featured);
        }
      } catch {
        // Silently fail
      } finally {
        if (active) setLoading(false);
      }
    }
    fetchContributions();
    return () => { active = false; };
  }, []);

  // ── Scroll helpers ───────────────────────────────────────────────
  const scrollLeft = () => {
    scrollContainerRef.current?.scrollBy({ left: -400, behavior: "smooth" });
  };

  const scrollRight = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    if (el.scrollLeft + el.clientWidth >= el.scrollWidth - 10) {
      el.scrollTo({ left: 0, behavior: "smooth" });
    } else {
      el.scrollBy({ left: 400, behavior: "smooth" });
    }
  }, []);

  // ── Auto-scroll ──────────────────────────────────────────────────
  useEffect(() => {
    if (contributions.length <= 1) return;
    const container = scrollContainerRef.current;
    if (!container) return;

    const pause = () => { isPausedRef.current = true; };
    const resume = () => { isPausedRef.current = false; };

    container.addEventListener("mouseenter", pause);
    container.addEventListener("mouseleave", resume);
    container.addEventListener("touchstart", pause, { passive: true });
    container.addEventListener("touchend", resume);

    const interval = setInterval(() => {
      if (!isPausedRef.current) scrollRight();
    }, 4000);

    return () => {
      clearInterval(interval);
      container.removeEventListener("mouseenter", pause);
      container.removeEventListener("mouseleave", resume);
      container.removeEventListener("touchstart", pause);
      container.removeEventListener("touchend", resume);
    };
  }, [contributions.length, scrollRight]);

  // ── GSAP entrance ───────────────────────────────────────────────
  useGSAP(() => {
    if (loading) return;
    
    gsap.from(".contrib-heading", {
      immediateRender: false, scrollTrigger: { trigger: ".contrib-heading", start: "top 85%" },
      y: 40, opacity: 0, duration: 0.8, ease: "power3.out",
    });
    
    if (contributions.length > 0) {
      gsap.from(".contrib-card", {
        immediateRender: false, scrollTrigger: { trigger: scrollContainerRef.current, start: "top 85%" },
        y: 30, opacity: 0, duration: 0.6, stagger: 0.1, ease: "power2.out"
      });
    }
  }, { scope: sectionRef, dependencies: [loading, contributions.length] });

  return (
    <section id="contributions" ref={sectionRef} className="py-16 sm:py-28 relative">
      <div className="section-divider" />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        
        {/* Heading & Navigation */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 sm:mb-16 gap-6">
          <div className="contrib-heading">
            <span className="tag-badge mb-4 inline-block">{"// showcase"}</span>
            <h2 className="text-3xl sm:text-4xl font-bold mt-3 text-muted">
              Open Source <span className="text-text">Projects</span>
            </h2>
            <p className="mt-4 max-w-xl text-sm sm:text-base leading-relaxed text-muted-2">
              Tools, libraries, and contributions built by the members of FOSSGCEE.
            </p>
          </div>

          {!loading && contributions.length > 1 && (
            <div className="contrib-heading flex gap-2 shrink-0">
              <button
                onClick={scrollLeft}
                className="p-2 border border-border-2 rounded-full hover:bg-surface-2 transition-colors text-text"
                aria-label="Scroll left"
              >
                <ChevronLeftIcon className="w-5 h-5" />
              </button>
              <button
                onClick={scrollRight}
                className="p-2 border border-border-2 rounded-full hover:bg-surface-2 transition-colors text-text"
                aria-label="Scroll right"
              >
                <ChevronRightIcon className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>

        {/* Loading state */}
        {loading && (
          <div className="flex gap-6 overflow-hidden">
            {[1, 2].map((i) => (
              <div key={i} className="flex-none w-[85vw] md:w-[600px] h-64 rounded-[24px] bg-black/5 dark:bg-white/5 animate-pulse" />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && contributions.length === 0 && (
          <div className="contrib-heading w-full text-center py-20 border border-dashed border-border-2 rounded-2xl">
            <GitCommit className="w-12 h-12 mx-auto mb-4 text-muted-2 opacity-50" />
            <p className="font-mono text-sm text-muted-2">No projects showcased yet.</p>
          </div>
        )}

        {/* Slider List */}
        {!loading && contributions.length > 0 && (
          <div
            ref={scrollContainerRef}
            className="flex gap-6 overflow-x-auto snap-x snap-mandatory pb-8 pt-2"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {contributions.map((c) => (
              <div
                key={c._id}
                className="contrib-card group flex-none w-[85vw] md:w-[600px] lg:w-[700px] relative p-6 sm:p-8 rounded-[24px] bg-surface border border-border hover:border-text/30 transition-all duration-300 shadow-xl snap-center flex flex-col justify-between"
              >
                <div className="flex flex-col md:flex-row gap-8 items-start mb-6">
                  {/* Image Section */}
                  {c.imageUrl && (
                    <div className="w-full md:w-2/5 aspect-video md:aspect-square rounded-xl overflow-hidden shrink-0 border border-border relative">
                      <img src={c.imageUrl} alt="Project" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    </div>
                  )}
                  
                  {/* Content Section */}
                  <div className="flex-1 space-y-4 min-w-0">
                    <div className="flex items-start gap-4">
                      <div className="mt-1 p-2.5 bg-black/5 dark:bg-white/5 rounded-xl text-text border border-border shrink-0">
                        <GitCommit className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-semibold text-xl sm:text-2xl text-text leading-tight group-hover:text-text/80 transition-colors truncate">
                          {c.title}
                        </h3>
                        {c.url && (
                          <a
                            href={c.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 mt-2 font-mono text-[11px] sm:text-xs text-blue-500 hover:text-blue-400 transition-colors truncate max-w-full"
                          >
                            <Link2 className="w-3.5 h-3.5 shrink-0" />
                            <span className="truncate">{c.url.replace(/^https?:\/\//, "").replace(/\/$/, "")}</span>
                          </a>
                        )}
                      </div>
                    </div>
                    
                    <p className="text-sm sm:text-base text-muted-2 leading-relaxed pt-2 line-clamp-4">
                      {c.description}
                    </p>
                  </div>
                </div>

                {/* Author Info */}
                <div className="flex items-center gap-3 pt-5 border-t border-border mt-auto">
                  <div className="w-8 h-8 rounded-full bg-black/10 dark:bg-white/10 flex items-center justify-center shrink-0">
                    <User className="w-4 h-4 text-text/60" />
                  </div>
                  <div>
                    <p className="font-mono text-xs font-semibold text-text">{c.memberId?.name || "Unknown Member"}</p>
                    <p className="font-mono text-[10px] text-muted-2 mt-0.5">
                      {new Date(c.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric"
                      })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
