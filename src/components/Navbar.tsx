"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { gsap } from "gsap";
import { ThemeToggle } from "@/components/ThemeToggle";

const links = [
  { label: "About", href: "/#about" },
  { label: "What We Do", href: "/#whatwedo" },
  { label: "Members", href: "/members" },
  { label: "Events", href: "/events" },
  { label: "Join Us", href: "/#join" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    const onResize = () => { if (window.innerWidth >= 768) setMenuOpen(false); };
    window.addEventListener("scroll", onScroll);
    window.addEventListener("resize", onResize);
    return () => { window.removeEventListener("scroll", onScroll); window.removeEventListener("resize", onResize); };
  }, []);

  // GSAP entrance
  useEffect(() => {
    if (!navRef.current) return;
    gsap.from(navRef.current, { y: -80, opacity: 0, duration: 0.9, ease: "power3.out", delay: 0.1 });
  }, []);

  return (
    <header className="fixed top-0 inset-x-0 z-50 flex justify-center pt-4 px-4">
      {/* Floating pill container */}
      <div
        ref={navRef}
        className={`w-full max-w-5xl transition-all duration-500 rounded-full border ${scrolled ? "bg-bg-2/85 backdrop-blur-3xl shadow-2xl border-border-2" : "glass border-border/50"}`}
      >
        <nav className="px-5 h-[52px] flex items-center justify-between gap-4">

          {/* Logo + name */}
          <a href="#" className="flex items-center gap-2 shrink-0 group">
            <Image
              src="/foss_gcee_logo.png"
              alt="FOSSGCEE"
              width={42}
              height={42}
              className="rounded-full object-contain group-hover:scale-110 transition-transform duration-200"
            />
            <span
              className="font-pixel text-[8px] hidden sm:block tracking-wider text-text"
            >
              FOSSGCEE
            </span>
          </a>

          {/* Desktop links — centered */}
          <ul className="hidden md:flex items-center gap-7 mx-auto">
            {links.map(({ label, href }) => (
              <li key={label}>
                <Link
                  href={href}
                  className="font-mono text-xs tracking-wide transition-colors duration-200 text-muted-2 hover:text-text"
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>

          {/* CTA */}
          <div className="hidden md:flex items-center gap-4 shrink-0">
            <ThemeToggle />
            <Link
              href="/join"
              className="inline-flex shrink-0 items-center gap-1.5 px-4 py-1.5 rounded-full font-mono text-[11px] font-semibold transition-transform hover:scale-105 bg-text text-bg"
            >
              $ Register
            </Link>
          </div>

          {/* Hamburger */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden flex items-center justify-center p-1.5 rounded-full transition-colors duration-200 bg-surface text-muted-2 hover:text-text hover:bg-surface-2"
            aria-label="Toggle menu"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              {menuOpen
                ? <path d="M4 4l10 10M14 4L4 14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                : <path d="M3 5h12M3 9h12M3 13h12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              }
            </svg>
          </button>
        </nav>

        {/* Mobile dropdown — inside the pill */}
        {menuOpen && (
          <div
            className="md:hidden px-5 pb-4 border-t border-border-2 bg-bg-2/85 backdrop-blur-3xl"
          >
            <ul className="flex flex-col gap-2 pt-3">
            {links.map(({ label, href }) => (
              <li key={label}>
                <Link
                  href={href}
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 font-mono text-xs py-1.5 transition-colors duration-200 text-muted-2 hover:text-text"
                >
                  <span className="text-text">›</span> {label}
                </Link>
              </li>
            ))}
              <li>
                <Link
                  href="/#join"
                  onClick={() => setMenuOpen(false)}
                  className="inline-flex items-center px-4 py-1.5 rounded-full font-mono text-xs font-semibold mt-2 bg-text text-bg hover:scale-105 transition-transform"
                >
                  $ join_community
                </Link>
              </li>
            </ul>
          </div>
        )}
      </div>
    </header>
  );
}
