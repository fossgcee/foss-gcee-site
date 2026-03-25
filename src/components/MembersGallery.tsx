"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";

const mockGallery = [
  { _id: "1", pic: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=500&q=80" },
  { _id: "2", pic: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=500&q=80" },
  { _id: "3", pic: "https://images.unsplash.com/photo-1543269865-cbf427effbad?auto=format&fit=crop&w=500&q=80" },
  { _id: "4", pic: "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=500&q=80" },
  { _id: "5", pic: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=500&q=80" },
];

export default function MembersGallery() {
  const [images, setImages] = useState(mockGallery);
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
    const interval = setInterval(() => {
      scrollRight();
    }, 3500); // Auto-scroll every 3.5 seconds

    return () => clearInterval(interval);
  }, []);

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
    <section ref={sectionRef} className="py-24 px-4 sm:px-6 lg:px-8 bg-[#050505] border-t border-white/5">
      <div className="max-w-6xl mx-auto">


        {/* Gallery Section */}
        <div className="flex justify-between items-end mb-8">
          <h3 className="gallery-header text-3xl font-bold" style={{ color: "#ffffff" }}>
            Members Gallery
          </h3>
          
          {images.length > 3 && (
            <div className="flex gap-2">
              <button 
                onClick={scrollLeft}
                className="p-2 border border-white/20 rounded-full hover:bg-white/10 transition-colors text-white"
                aria-label="Scroll left"
              >
                <ChevronLeftIcon className="w-5 h-5" />
              </button>
              <button 
                onClick={scrollRight}
                className="p-2 border border-white/20 rounded-full hover:bg-white/10 transition-colors text-white"
                aria-label="Scroll right"
              >
                <ChevronRightIcon className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
        
        {images.length > 0 ? (
          <div 
            ref={scrollContainerRef}
            className="gallery-grid flex gap-6 overflow-x-auto snap-x snap-mandatory pb-8 pt-2 scrollbar-hide"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {images.map((image) => (
              <div 
                key={image._id} 
                className="gallery-card group flex-none w-[85vw] sm:w-[45vw] md:w-[30vw] relative rounded-xl overflow-hidden bg-[#0a0a0a] border border-white/5 snap-center"
              >
                <div className="relative w-full aspect-[16/9]">
                  <Image
                    src={image.pic}
                    alt="Gallery item"
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-white/40 border border-dashed border-white/10 rounded-2xl">
            <p className="font-mono text-sm">No images in gallery.</p>
          </div>
        )}

      </div>
    </section>
  );
}
