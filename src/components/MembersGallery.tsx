"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { membersGallery } from "@/data/membersGallery";

export default function MembersGallery() {
  const images = membersGallery;
  const sectionRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -400, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      // If we've reached the end, loop back to the start smoothly
      if (scrollLeft + clientWidth >= scrollWidth - 10) {
        scrollContainerRef.current.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        scrollContainerRef.current.scrollBy({ left: 400, behavior: "smooth" });
      }
    }
  };

  // Auto-scroll effect
  useEffect(() => {
    if (images.length < 4) return;

    const interval = setInterval(() => {
      scrollRight();
    }, 3500); // Auto-scroll every 3.5 seconds

    return () => clearInterval(interval);
  }, [images.length]);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    
    if (sectionRef.current) {
      const ctx = gsap.context(() => {
        gsap.from(".gallery-header", {
          immediateRender: false,
          scrollTrigger: { trigger: ".gallery-header", start: "top 85%" },
          y: 40, opacity: 0, duration: 0.8, ease: "power3.out",
        });
        
        gsap.from(".gallery-card", {
          immediateRender: false,
          scrollTrigger: { trigger: ".gallery-grid", start: "top 80%" },
          y: 30, opacity: 0, duration: 0.6, stagger: 0.1, ease: "power2.out",
        });
      }, sectionRef);
      return () => ctx.revert();
    }
  }, []);

  return (
    <section ref={sectionRef} className="py-24 px-4 sm:px-6 lg:px-8 bg-bg-2 border-t border-border">
      <div className="max-w-6xl mx-auto">


        {/* Gallery Section */}
        <div className="flex justify-between items-end mb-8">
          <h3 className="gallery-header text-3xl font-bold text-text">
            Members Gallery
          </h3>
          
          {images.length > 3 && (
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
        
        <div className="mb-8 rounded-2xl border border-dashed border-border-2 bg-surface-2/40 p-5">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-2">How To Upload</p>
          <div className="mt-3 grid gap-2 text-sm text-muted-2">
            <p>1. Add images to <span className="font-mono">public/members-gallery/</span></p>
            <p>2. Register them in <span className="font-mono">src/data/membersGallery.ts</span></p>
          </div>
        </div>

        {images.length > 0 ? (
          <div 
            ref={scrollContainerRef}
            className="gallery-grid flex gap-6 overflow-x-auto snap-x snap-mandatory pb-8 pt-2 scrollbar-hide"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {images.map((image) => (
              <div 
                key={image.id} 
                className="gallery-card group flex-none w-[85vw] sm:w-[45vw] md:w-[30vw] relative rounded-xl overflow-hidden bg-bg-2 border border-border snap-center"
              >
                <div className="relative w-full aspect-[16/9]">
                  <Image
                    src={image.src}
                    alt={image.alt || "Members gallery item"}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 768px) 85vw, (max-width: 1024px) 50vw, 33vw"
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-muted-2 border border-dashed border-border-2 rounded-2xl">
            <p className="font-mono text-sm">No images in gallery yet. Add photos using the steps above.</p>
          </div>
        )}

      </div>
    </section>
  );
}
