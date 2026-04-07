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
      <div className="md:hidden fixed bottom-6 left-6 right-6 z-50">
        <Link
          href="/join"
          className="glass-strong p-4 rounded-[28px] shadow-2xl flex items-center justify-between gap-4 border border-white/20 dark:border-white/10 transition-all active:scale-95 no-underline"
        >
          <div className="flex-1 min-w-0 pl-2">
            <p className="font-pixel text-[7px] text-text uppercase tracking-tighter truncate">
              FOSS_GCE_ERODE
            </p>
            <p className="font-mono text-[9px] text-muted-2 uppercase mt-1 tracking-widest">
              JOIN_COMMUNITY
            </p>
          </div>
          <div className="flex-shrink-0 px-6 py-3 bg-white dark:bg-white text-black rounded-2xl font-pixel text-[10px] uppercase tracking-widest shadow-[0_0_20px_rgba(255,255,255,0.3)] transform transition-transform">
            REGISTER_NOW
          </div>
        </Link>
      </div>
    </div>
  );
}
