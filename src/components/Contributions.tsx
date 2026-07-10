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

export default function Contributions() {
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
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

  useEffect(() => {
    if (contributions.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % contributions.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [contributions.length]);

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
          <div ref={listRef} className="w-full max-w-4xl mx-auto">
            <div
              key={contributions[currentIndex]._id}
              className="contrib-card group relative p-6 sm:p-8 rounded-[24px] bg-surface border border-border hover:border-text/30 transition-all duration-300 shadow-2xl"
            >
              <div className="flex flex-col md:flex-row gap-8 items-start">
                
                {/* Image Section */}
                {contributions[currentIndex].imageUrl && (
                  <div className="w-full md:w-1/3 aspect-video md:aspect-square rounded-xl overflow-hidden shrink-0 border border-border relative">
                    <img src={contributions[currentIndex].imageUrl} alt="Project" className="w-full h-full object-cover" />
                  </div>
                )}
                
                {/* Content Section */}
                <div className="flex-1 space-y-4">
                  {/* Title & Link */}
                  <div className="flex items-start gap-4">
                    <div className="mt-1 p-2.5 bg-black/5 dark:bg-white/5 rounded-xl text-text border border-border">
                      <GitCommit className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-xl sm:text-2xl text-text leading-tight group-hover:text-text/80 transition-colors">
                        {contributions[currentIndex].title}
                      </h3>
                      {contributions[currentIndex].url && (
                        <a
                          href={contributions[currentIndex].url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 mt-2 font-mono text-[12px] text-blue-500 hover:text-blue-400 transition-colors"
                        >
                          <Link2 className="w-3.5 h-3.5" />
                          {contributions[currentIndex].url.replace(/^https?:\/\//, "").replace(/\/$/, "")}
                        </a>
                      )}
                    </div>
                  </div>
                  
                  {/* Description */}
                  <p className="text-base text-muted-2 leading-relaxed pt-2">
                    {contributions[currentIndex].description}
                  </p>

                  {/* Author Info */}
                  <div className="flex items-center gap-3 pt-6 border-t border-border mt-4">
                    <div className="w-8 h-8 rounded-full bg-black/10 dark:bg-white/10 flex items-center justify-center">
                      <User className="w-4 h-4 text-text/60" />
                    </div>
                    <div>
                      <p className="font-mono text-xs font-semibold text-text">{contributions[currentIndex].memberId?.name || "Unknown Member"}</p>
                      <p className="font-mono text-[10px] text-muted-2 mt-0.5">
                        {new Date(contributions[currentIndex].createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric"
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Dots indicator for multiple items */}
              {contributions.length > 1 && (
                <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {contributions.map((_, idx) => (
                    <div key={idx} className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${idx === currentIndex ? 'bg-text scale-125' : 'bg-border-2'}`} />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
