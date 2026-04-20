import Hero from "@/components/Hero";
import About from "@/components/About";
import WhatWeDo from "@/components/WhatWeDo";
import Community from "@/components/Community";
import JoinUs from "@/components/JoinUs";
import PageLoader from "@/components/PageLoader";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen overflow-x-hidden relative bg-white dark:bg-[#080808] text-black dark:text-[#f0f0f0] pb-20 md:pb-0">
      <PageLoader />
      <main>
        <Hero />
        <About />
        <WhatWeDo />
        <Community />
        <JoinUs />
      </main>

      {/* Sticky Mobile Club Registration Button */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 px-3" style={{ paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom))" }}>
        <Link
          href="/join"
          className="px-4 py-2.5 rounded-2xl shadow-[0_-2px_24px_rgba(0,0,0,0.12)] flex items-center justify-between gap-3 border border-black/10 dark:border-white/10 bg-white/90 dark:bg-[#111]/90 backdrop-blur-xl transition-all active:scale-[0.98] no-underline"
        >
          <div className="flex-1 min-w-0 pl-1">
            <p className="font-pixel text-[8px] text-text uppercase tracking-[0.2em] truncate leading-none">
              FOSSGCEE
            </p>
            <p className="font-mono text-[9px] text-muted-2 uppercase mt-1 tracking-[0.12em] leading-none truncate">
              Free &amp; Open Source Club
            </p>
          </div>
          <div className="flex-shrink-0 px-4 py-2 bg-text text-bg rounded-full font-pixel text-[8px] uppercase tracking-[0.15em] shadow-[0_4px_12px_rgba(0,0,0,0.2)] dark:shadow-[0_4px_12px_rgba(255,255,255,0.1)]">
            REGISTER
          </div>
        </Link>
      </div>
    </div>
  );
}
