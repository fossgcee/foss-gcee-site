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
                className="contrib-card group relative p-6 sm:p-8 rounded-3xl bg-surface border border-border hover:border-text/30 transition-all duration-300 shadow-sm hover:shadow-xl flex flex-col h-full"
              >
                {/* Image Section (if available) */}
                {c.imageUrl && (
                  <div className="w-full aspect-video rounded-2xl overflow-hidden mb-6 border border-border">
                    <img src={c.imageUrl} alt={c.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  </div>
                )}
                
                <div className="flex flex-col flex-1">
                  {/* Title & Link */}
                  <div className="flex items-start gap-4 mb-4">
                    <div className="mt-1 p-2 bg-black/5 dark:bg-white/5 rounded-xl text-text border border-border shrink-0">
                      <GitCommit className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-xl text-text leading-tight group-hover:text-text/80 transition-colors">
                        {c.title}
                      </h3>
                      {c.url && (
                        <a
                          href={c.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 mt-2 font-mono text-[11px] text-blue-500 hover:text-blue-400 transition-colors break-all"
                        >
                          <Link2 className="w-3 h-3 shrink-0" />
                          {c.url.replace(/^https?:\/\//, "").replace(/\/$/, "")}
                        </a>
                      )}
                    </div>
                  </div>
                  
                  {/* Description */}
                  <p className="text-sm text-muted-2 leading-relaxed mb-6 flex-1">
                    {c.description}
                  </p>

                  {/* Author Info */}
                  <div className="flex items-center justify-between gap-3 pt-5 border-t border-border mt-auto">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-black/10 dark:bg-white/10 flex items-center justify-center shrink-0">
                        <User className="w-3.5 h-3.5 text-text/60" />
                      </div>
                      <p className="font-mono text-xs font-semibold text-text truncate max-w-[150px]">{c.memberId?.name || "Unknown Member"}</p>
                    </div>
                    <p className="font-mono text-[10px] text-muted-2 shrink-0">
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
