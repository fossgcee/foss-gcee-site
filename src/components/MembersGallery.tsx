"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { membersGallery } from "@/data/membersGallery";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

interface GalleryImage { id: string; src: string; alt?: string; year?: string; }

function getYears(images: GalleryImage[]): string[] {
  return Array.from(new Set(images.map((img) => img.year?.trim() || "")))
    .filter(Boolean)
    .sort((a, b) => b.localeCompare(a));
}

export default function MembersGallery() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isPausedRef = useRef(false);

  const [allImages, setAllImages] = useState<GalleryImage[]>([]);
  const [selectedYear, setSelectedYear] = useState<string>("");
  const [loading, setLoading] = useState(true);

  // ── Fetch from CMS, fall back to static data ─────────────────────
  const fetchCMS = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/site-config?section=gallery");
      const json = await res.json();
      
      let images: GalleryImage[] = [];
      if (json.success && Array.isArray(json.data?.images) && json.data.images.length > 0) {
        images = json.data.images;
      } else {
        images = membersGallery as GalleryImage[];
      }
      
      setAllImages(images);

      const years = getYears(images);
      if (years.length > 0) {
        setSelectedYear(years[0]);
      }
    } catch {
      const images = membersGallery as GalleryImage[];
      setAllImages(images);
      const years = getYears(images);
      if (years.length > 0) setSelectedYear(years[0]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCMS(); }, [fetchCMS]);

  const years = getYears(allImages);
  const filteredImages = allImages.filter((img) => (img.year?.trim() || "") === selectedYear);

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
    if (filteredImages.length < 4) return;
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
    }, 3500);

    return () => {
      clearInterval(interval);
      container.removeEventListener("mouseenter", pause);
      container.removeEventListener("mouseleave", resume);
      container.removeEventListener("touchstart", pause);
      container.removeEventListener("touchend", resume);
    };
  }, [filteredImages.length, scrollRight]);

  // ── GSAP entrance ───────────────────────────────────────────────
  useGSAP(() => {
    gsap.from(".gallery-header", {
      immediateRender: false,
      scrollTrigger: { trigger: ".gallery-header", start: "top 85%" },
      y: 40, opacity: 0, duration: 0.8, ease: "power3.out",
    });
    gsap.from(".gallery-year-select", {
      immediateRender: false,
      scrollTrigger: { trigger: ".gallery-year-select", start: "top 85%" },
      y: 20, opacity: 0, duration: 0.8, delay: 0.2, ease: "power3.out",
    });
  }, { scope: sectionRef });

  useEffect(() => {
    if (!scrollContainerRef.current || filteredImages.length === 0) return;
    gsap.fromTo(
      scrollContainerRef.current.children,
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.5, stagger: 0.1, ease: "power2.out", overwrite: true }
    );
  }, [selectedYear, filteredImages.length]);

  // ── Render ───────────────────────────────────────────────────────
  return (
    <section ref={sectionRef} className="py-24 px-4 sm:px-6 lg:px-8 bg-bg-2 border-t border-border overflow-hidden">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 gap-6">
          <div>
            <h3 className="gallery-header text-3xl font-bold text-text mb-4">
              Members Gallery
            </h3>
            
            {/* Year Dropdown */}
            {!loading && years.length > 0 && (
              <div className="gallery-year-select relative w-48">
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="w-full appearance-none bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-black dark:text-white font-semibold py-2.5 px-4 pr-10 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/20 dark:focus:ring-white/20 transition-colors cursor-pointer"
                  style={{ backgroundImage: "none" }}
                >
                  {years.map((year) => (
                    <option key={year} value={year} className="bg-white dark:bg-[#111]">
                      {year}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-black/40 dark:text-white/40">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                  </svg>
                </div>
              </div>
            )}
          </div>

          {filteredImages.length > 3 && (
            <div className="flex gap-2">
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

        {/* Loading skeleton */}
        {loading && (
          <div className="flex gap-6 overflow-hidden pb-8 pt-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex-none w-[85vw] sm:w-[45vw] md:w-[30vw] rounded-xl overflow-hidden bg-black/5 dark:bg-white/5 animate-pulse aspect-[16/9]"
              />
            ))}
          </div>
        )}

        {/* Gallery grid */}
        {!loading && filteredImages.length > 0 && (
          <div
            ref={scrollContainerRef}
            className="gallery-grid flex gap-6 overflow-x-auto snap-x snap-mandatory pb-8 pt-2"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {filteredImages.map((image) => (
              <div
                key={image.id}
                className="gallery-card group flex-none w-[85vw] sm:w-[45vw] md:w-[30vw] relative rounded-xl overflow-hidden bg-bg-2 border border-border snap-center"
              >
                <div className="relative w-full aspect-[16/9]">
                  <Image
                    src={image.src}
                    alt={image.alt || "Members gallery photo"}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 768px) 85vw, (max-width: 1024px) 50vw, 33vw"
                    unoptimized={image.src.startsWith("https://lh3.googleusercontent.com")}
                  />
                </div>
                {image.alt && (
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-4 py-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="font-mono text-xs text-white/90 truncate">{image.alt}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Empty state — clean, no developer instructions */}
        {!loading && filteredImages.length === 0 && (
          <div className="text-center py-16 border border-dashed border-border-2 rounded-2xl">
            <div className="text-4xl mb-4">📷</div>
            <p className="font-mono text-sm text-muted-2">No photos for {selectedYear || "this year"} yet.</p>
          </div>
        )}

      </div>
    </section>
  );
}
