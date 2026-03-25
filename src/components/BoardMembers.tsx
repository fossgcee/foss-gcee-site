"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Member, membersData, getUniqueYears } from "@/data/members";

export default function BoardMembers() {
  const years = getUniqueYears();
  const [selectedYear, setSelectedYear] = useState<string>(years[0] || "");
  const sectionRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  const filteredMembers = membersData.filter((m) => m.year === selectedYear);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    
    if (sectionRef.current) {
      const ctx = gsap.context(() => {
        gsap.from(".board-header", {
          immediateRender: false,
          scrollTrigger: { trigger: ".board-header", start: "top 85%" },
          y: 40, opacity: 0, duration: 0.8, ease: "power3.out",
        });
        
        gsap.from(".year-select", {
          immediateRender: false,
          scrollTrigger: { trigger: ".year-select", start: "top 85%" },
          y: 20, opacity: 0, duration: 0.8, delay: 0.2, ease: "power3.out",
        });
      }, sectionRef);
      return () => ctx.revert();
    }
  }, []);
  useEffect(() => {
    if (!gridRef.current) return;
    
    // Animate cards on year change
    gsap.fromTo(
      gridRef.current.children,
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.5, stagger: 0.1, ease: "power2.out", overwrite: true }
    );
  }, [selectedYear]);

  return (
    <section ref={sectionRef} id="members" className="min-h-screen pt-32 pb-24 px-4 sm:px-6 lg:px-8 bg-black">
      <div className="max-w-6xl mx-auto flex flex-col items-center">
        
        {/* Title */}
        <h1 
          className="board-header text-4xl md:text-5xl font-bold mb-8 text-center" 
          style={{ color: "#ffffff" }}
        >
          Board Members
        </h1>

        {/* Year Dropdown Container */}
        <div className="year-select mb-12 relative w-48">
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="w-full appearance-none bg-[#A9A9A9] text-black font-semibold py-2.5 px-4 pr-10 rounded shadow focus:outline-none focus:ring-2 focus:ring-[#FFDD00] transition-colors cursor-pointer"
            style={{ backgroundImage: 'none' }}
          >
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
          {/* Custom Dropdown Arrow */}
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-black">
            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
              <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
            </svg>
          </div>
        </div>

        {/* Members Grid */}
        {filteredMembers.length > 0 ? (
          <div 
            ref={gridRef}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 w-full"
          >
            {filteredMembers.map((member) => (
              <div 
                key={member.id}
                className="flex flex-col rounded-xl overflow-hidden relative group transition-transform duration-300 hover:-translate-y-2"
                style={{ 
                  background: "#080808",
                  border: "1px solid rgba(255,255,255,0.05)",
                  boxShadow: "0 10px 30px rgba(0,0,0,0.5)"
                }}
              >
                {/* Image Container - Aspect 4:5 */}
                <div className="relative w-full aspect-[4/5] bg-[#111111] p-0 m-0 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-[#080808] via-transparent to-transparent z-10 opacity-60" />
                  {member.imageUrl ? (
                    <Image
                      src={member.imageUrl}
                      alt={member.name}
                      fill
                      className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white/20">
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                      </svg>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-6 text-center relative z-20 flex-grow flex flex-col justify-end">
                  <h3 
                    className="text-lg font-bold tracking-wide uppercase mb-1"
                    style={{ color: "#ffffff" }}
                  >
                    {member.name}
                  </h3>
                  <p className="text-sm text-gray-300 font-medium">
                    {member.role}
                  </p>

                  {/* LinkedIn Icon - Bottom Right absolute */}
                  {member.linkedInUrl && (
                    <a 
                      href={member.linkedInUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="absolute bottom-4 right-4 text-white/40 hover:text-[#0077b5] transition-colors"
                      aria-label={`LinkedIn profile for ${member.name}`}
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                      </svg>
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-white/40">
            <p>No members found for the selected year.</p>
          </div>
        )}
      </div>
    </section>
  );
}
