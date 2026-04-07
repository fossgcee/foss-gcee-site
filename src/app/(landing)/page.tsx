import Hero from "@/components/Hero";
import About from "@/components/About";
import WhatWeDo from "@/components/WhatWeDo";
import Community from "@/components/Community";
import JoinUs from "@/components/JoinUs";
import PageLoader from "@/components/PageLoader";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen overflow-x-hidden relative bg-white dark:bg-[#080808] text-black dark:text-[#f0f0f0] pb-24 md:pb-0">
      <PageLoader />
      <main>
        <Hero />
        <About />
        <WhatWeDo />
        <Community />
        <JoinUs />
      </main>

      {/* Sticky Mobile Club Registration Button */}
      <div className="md:hidden fixed bottom-[calc(1rem+env(safe-area-inset-bottom))] left-4 right-4 z-50">
        <Link
          href="/join"
          className="glass-strong px-4 py-3 rounded-[24px] shadow-[0_18px_44px_rgba(0,0,0,0.22)] flex items-center justify-between gap-3 border border-white/15 dark:border-white/10 bg-white/85 dark:bg-[#111]/85 backdrop-blur-xl transition-all active:scale-[0.98] no-underline"
        >
          <div className="flex-1 min-w-0 pl-1">
            <p className="font-pixel text-[6px] text-text uppercase tracking-[0.22em] truncate leading-none">
              FOSS_GCE_ERODE
            </p>
            <p className="font-mono text-[9px] text-muted-2 uppercase mt-1 tracking-[0.18em] leading-none">
              JOIN_COMMUNITY
            </p>
          </div>
          <div className="flex-shrink-0 px-4 py-2.5 bg-text text-bg rounded-full font-pixel text-[9px] uppercase tracking-[0.18em] shadow-[0_10px_24px_rgba(0,0,0,0.18)]">
            REGISTER
          </div>
        </Link>
      </div>
    </div>
  );
}
