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
  isFeatured: boolean;
  imageUrl?: string;
  createdAt: string;
}

export default function AllProjects() {
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
          // Show all projects here, not just featured
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
    <section id="all-projects" ref={sectionRef} className="py-24 sm:py-32 relative min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Heading */}
        <div className="contrib-heading text-center mb-16 sm:mb-24">
          <span className="tag-badge mb-4 inline-block">{"// all-projects"}</span>
          <h1 className="text-4xl sm:text-5xl font-bold mt-3 text-text">
            Open Source Projects
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-base sm:text-lg leading-relaxed text-muted-2">
            A complete archive of the tools, libraries, and contributions built by the amazing members of FOSSGCEE.
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

        {/* Contributions Grid/List */}
        {!loading && contributions.length > 0 && (
          <div ref={listRef} className="w-full max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">
            {contributions.map((c) => (
              <div
                key={c._id}
                className="contrib-card group relative p-6 sm:p-8 rounded-3xl bg-surface border border-border hover:border-text/30 transition-all duration-300 shadow-sm hover:shadow-xl flex flex-col justify-between overflow-hidden min-h-[300px]"
              >
                {/* Background Image with Gradient Fade */}
                {c.imageUrl && (
                  <div className="absolute inset-0 z-0 pointer-events-none">
                    <img 
                      src={c.imageUrl} 
                      alt="" 
                      className="absolute inset-0 w-full h-full object-cover object-right sm:object-center opacity-60 transition-transform duration-700 group-hover:scale-105" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-surface via-surface/80 sm:via-surface/70 to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/60 sm:via-surface/30 to-transparent" />
                  </div>
                )}
                
                <div className="relative z-10 flex flex-col h-full justify-between">
                  {/* Content Section */}
                  <div className="space-y-4 min-w-0 md:w-4/5">
                    <div className="flex items-start gap-4">
                      <div className="mt-1 p-2.5 bg-black/20 dark:bg-white/10 backdrop-blur-sm rounded-xl text-text border border-border shrink-0 shadow-lg">
                        <GitCommit className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-semibold text-xl text-text leading-tight group-hover:text-text/80 transition-colors break-words drop-shadow-sm">
                          {c.title}
                        </h3>
                        {c.url && (
                          <a
                            href={c.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 mt-2 font-mono text-[11px] text-blue-400 hover:text-blue-300 transition-colors truncate max-w-full"
                          >
                            <Link2 className="w-3.5 h-3.5 shrink-0" />
                            <span className="truncate">{c.url.replace(/^https?:\/\//, "").replace(/\/$/, "")}</span>
                          </a>
                        )}
                      </div>
                    </div>
                    
                    <p className="text-sm text-muted-2 leading-relaxed pt-2 line-clamp-4 drop-shadow-sm">
                      {c.description}
                    </p>
                  </div>

                  {/* Author Info */}
                  <div className="flex items-center justify-between gap-3 pt-5 border-t border-border/50 mt-8">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-black/20 dark:bg-white/10 backdrop-blur-sm flex items-center justify-center shrink-0 border border-border/50">
                        <User className="w-4 h-4 text-text/80" />
                      </div>
                      <p className="font-mono text-xs font-semibold text-text truncate max-w-[150px] drop-shadow-sm">{c.memberId?.name || "Unknown Member"}</p>
                    </div>
                    <p className="font-mono text-[10px] text-muted-2 shrink-0 drop-shadow-sm">
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
