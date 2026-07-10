"use client";

import { useEffect, useState, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { Link2, GitCommit, User } from "lucide-react";

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
  createdAt: string;
}

export default function Contributions() {
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [loading, setLoading] = useState(true);
  const sectionRef = useRef<HTMLElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let active = true;
    async function fetchContributions() {
      try {
        const res = await fetch("/api/contributions");
        const json = await res.json();
        if (active && json.success && json.data) {
          setContributions(json.data);
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

  useGSAP(() => {
    if (loading) return;
    
    gsap.from(".contrib-heading", {
      immediateRender: false, scrollTrigger: { trigger: ".contrib-heading", start: "top 85%" },
      y: 40, opacity: 0, duration: 0.8, ease: "power3.out",
    });
    
    if (contributions.length > 0) {
      gsap.from(".contrib-card", {
        immediateRender: false, scrollTrigger: { trigger: listRef.current, start: "top 85%" },
        y: 30, opacity: 0, duration: 0.6, stagger: 0.1, ease: "power2.out"
      });
    }
  }, { scope: sectionRef, dependencies: [loading, contributions.length] });

  return (
    <section id="contributions" ref={sectionRef} className="py-16 sm:py-28 relative">
      <div className="section-divider" />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        
        {/* Heading */}
        <div className="contrib-heading text-center mb-10 sm:mb-16">
          <span className="tag-badge mb-4 inline-block">{"// showcase"}</span>
          <h2 className="text-3xl sm:text-4xl font-bold mt-3 text-muted">
            Open Source <span className="text-text">Projects</span>
          </h2>
          <p className="mt-4 max-w-xl mx-auto text-sm sm:text-base leading-relaxed text-muted-2">
            Tools, libraries, and contributions built by the members of FOSSGCEE.
          </p>
        </div>

        {/* Loading state */}
        {loading && (
          <div className="w-full max-w-4xl mx-auto space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="w-full h-32 rounded-xl bg-black/5 dark:bg-white/5 animate-pulse" />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && contributions.length === 0 && (
          <div className="contrib-heading max-w-4xl mx-auto w-full text-center py-20 border border-dashed border-border-2 rounded-2xl">
            <GitCommit className="w-12 h-12 mx-auto mb-4 text-muted-2 opacity-50" />
            <p className="font-mono text-sm text-muted-2">No projects showcased yet.</p>
          </div>
        )}

        {/* Contributions List */}
        {!loading && contributions.length > 0 && (
          <div ref={listRef} className="w-full max-w-4xl mx-auto grid gap-4">
            {contributions.map((c) => (
              <div
                key={c._id}
                className="contrib-card group relative p-6 rounded-2xl bg-surface border border-border hover:border-text/20 transition-all duration-300"
              >
                <div className="flex flex-col sm:flex-row gap-4 sm:items-start justify-between">
                  <div className="space-y-3">
                    {/* Title & Link */}
                    <div className="flex items-start gap-3">
                      <div className="mt-1 p-2 bg-black/5 dark:bg-white/5 rounded-lg text-text">
                        <GitCommit className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg text-text leading-tight group-hover:text-text/80 transition-colors">
                          {c.title}
                        </h3>
                        {c.url && (
                          <a
                            href={c.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 mt-1.5 font-mono text-[11px] text-blue-500 hover:text-blue-400 transition-colors"
                          >
                            <Link2 className="w-3 h-3" />
                            {c.url.replace(/^https?:\/\//, "").replace(/\/$/, "")}
                          </a>
                        )}
                      </div>
                    </div>
                    
                    {/* Description */}
                    <p className="text-sm text-muted-2 leading-relaxed ml-11">
                      {c.description}
                    </p>
                  </div>

                  {/* Author Info */}
                  <div className="flex sm:flex-col items-center sm:items-end gap-3 sm:gap-1 mt-4 sm:mt-0 shrink-0 border-t sm:border-t-0 pt-4 sm:pt-0 border-border">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-black/10 dark:bg-white/10 flex items-center justify-center">
                        <User className="w-3 h-3 text-text/60" />
                      </div>
                      <p className="font-mono text-xs text-text">{c.memberId?.name || "Unknown Member"}</p>
                    </div>
                    <p className="font-mono text-[10px] text-muted-2 ml-8 sm:ml-0">
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
