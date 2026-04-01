import Hero from "@/components/Hero";
import About from "@/components/About";
import WhatWeDo from "@/components/WhatWeDo";
import Community from "@/components/Community";
import JoinUs from "@/components/JoinUs";
import PageLoader from "@/components/PageLoader";

export default function Home() {
  return (
    <div className="min-h-screen overflow-x-hidden relative bg-white dark:bg-[#080808] text-black dark:text-[#f0f0f0]">
      <PageLoader />
      <main>
        <Hero />
        <About />
        <WhatWeDo />
        <Community />
        <JoinUs />
      </main>
    </div>
  );
}
