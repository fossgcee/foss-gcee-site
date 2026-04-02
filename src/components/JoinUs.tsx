"use client";

import { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { GitHubIcon, YouTubeIcon, InstagramIcon, DiscordIcon, LinkedInIcon, EmailIcon } from "@/components/icons/SocialIcons";

const steps = [
  { n: "01", title: "Join Our Discord",   desc: "Hop into our community server to say hi and see what we're working on." },
  { n: "02", title: "Attend an Event",    desc: "Come to a workshop, talk, or contribution drive to meet the community." },
  { n: "03", title: "Contribute & Build", desc: "Pick an open‑source project, make your first contribution, or launch your own." },
];

const socials = [
  { Icon: GitHubIcon,    label: "GitHub",    sub: "github.com/fossgcee",  href: "https://github.com/fossgcee",                               active: true },
  { Icon: YouTubeIcon,   label: "YouTube",   sub: "FOSSGCEE Channel",      href: "https://www.youtube.com/channel/UCTtzkb23e6iQAMMkgigHQqQ",  active: true },
  { Icon: InstagramIcon, label: "Instagram", sub: "@fossgcee",             href: "https://www.instagram.com/fossgcee/",                        active: true },
  { Icon: DiscordIcon,   label: "Discord",   sub: "Join our server",       href: "https://discord.com/invite/d6SUMn4JF",                       active: true },
  { Icon: LinkedInIcon,  label: "LinkedIn",  sub: "Coming soon",           href: "#",                                                          active: false },
  { Icon: EmailIcon,     label: "Email",     sub: "fossgcee@gmail.com",   href: "mailto:fossgcee@gmail.com",                                 active: true },
];

export default function JoinUs() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      gsap.from(".join-heading", {
        immediateRender: false, scrollTrigger: { trigger: ".join-heading", start: "top 85%" },
        y: 40, opacity: 0, duration: 0.8, ease: "power3.out",
      });
      gsap.from(".join-step", {
        immediateRender: false, scrollTrigger: { trigger: ".join-steps", start: "top 80%" },
        y: 30, opacity: 0, duration: 0.6, stagger: 0.12, ease: "power2.out",
      });
      gsap.from(".join-social", {
        immediateRender: false, scrollTrigger: { trigger: ".join-socials", start: "top 80%" },
        y: 30, opacity: 0, duration: 0.6, stagger: 0.1, ease: "power2.out",
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section id="join" ref={sectionRef} className="py-28 relative bg-bg-2">
      <div className="section-divider" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="join-heading text-center mb-16">
          <span className="tag-badge mb-4 inline-block">// join us</span>
          <h2 className="text-3xl sm:text-4xl font-bold mt-3 text-text">
            Become Part of the <span className="text-text">Community</span>
          </h2>
          <p className="mt-4 max-w-xl mx-auto text-sm sm:text-base text-muted-2">
            No experience required — just curiosity, enthusiasm, and a love for learning.
          </p>
        </div>

        <div className="max-w-3xl mx-auto items-start">

          {/* Steps + Socials Centered */}
          <div className="space-y-12">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-widest mb-6 text-center text-muted">
                ─ How to Join
              </p>
              <div className="join-steps max-w-xl mx-auto space-y-4">
                {steps.map((s) => (
                  <div key={s.n} className="join-step flex gap-4 items-start p-5 glass-card group">
                    <div
                      className="shrink-0 w-11 h-11 rounded-xl flex items-center justify-center font-pixel text-[9px] bg-surface text-text border border-border-2"
                    >
                      {s.n}
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm mb-1 text-text">{s.title}</h4>
                      <p className="text-xs leading-relaxed text-muted-2">{s.desc}</p>
                    </div>
                  </div>
                ))}
                
                {/* Registration CTA */}
                <div className="join-step pt-4 flex justify-center sm:justify-start">
                  <a
                    href="/join"
                    className="inline-flex items-center justify-center gap-2.5 px-6 py-3 rounded-xl font-mono text-[13px] font-semibold transition-all duration-200 hover:scale-105 bg-text text-bg shadow-[0_0_15px_rgba(0,0,0,0.15)] dark:shadow-[0_0_15px_rgba(255,255,255,0.2)]"
                  >
                    $ Register Now
                    <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
                      <path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>

            <div>
              <p className="font-mono text-[10px] uppercase tracking-widest mb-6 text-center text-muted">
                ─ Find Us Online
              </p>
              <div className="join-socials grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {socials.map((s) => (
                  <a
                    key={s.label}
                    href={s.active ? s.href : undefined}
                    target={s.active ? "_blank" : undefined}
                    rel="noopener noreferrer"
                    className={`join-social flex items-center gap-3 p-3 glass-card group${!s.active ? " opacity-40 pointer-events-none" : ""}`}
                    style={{ textDecoration: "none" }}
                  >
                    <div
                      className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-transform duration-200 group-hover:scale-110 bg-surface border border-border text-text/80"
                    >
                      <s.Icon />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-xs text-text">
                        {s.label}{!s.active && <span className="ml-1 font-mono text-[8px] text-muted">soon</span>}
                      </p>
                      <p className="font-mono text-[10px] truncate text-muted">{s.sub}</p>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
