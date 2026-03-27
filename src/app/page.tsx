import Hero from "@/components/Hero";
import About from "@/components/About";
import WhatWeDo from "@/components/WhatWeDo";
import Community from "@/components/Community";
import JoinUs from "@/components/JoinUs";
import PageLoader from "@/components/PageLoader";
import FloatingElements from "@/components/FloatingElements";

export default function Home() {
  return (
    <div className="min-h-screen overflow-x-hidden" style={{ background: "#080808", color: "#f0f0f0" }}>
      <PageLoader />
      <main>
        <FloatingElements />
        <Hero />
        <About />
        <WhatWeDo />
        <Community />
        <JoinUs />
      </main>
    </div>
  );
}
