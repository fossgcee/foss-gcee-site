"use client";

import { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";


const activities = [
  { icon: ">_",   title: "Linux & Git Workshops",       desc: "Hands‑on sessions on the Linux terminal, shell scripting, and mastering Git for version control.",    tag: "#terminal" },
  { icon: "⎇",   title: "OSS Contribution Drives",     desc: "Guided drives to help students make their first pull requests to real open‑source projects.",          tag: "#contribute" },
  { icon: "⚡",  title: "Talks & Hackathons",           desc: "Expert talks, lightning talks, and hackathons focused on open‑source tooling and ideas.",              tag: "#community" },
  { icon: "</>",  title: "Student‑led Projects",        desc: "Launch your own open‑source projects with mentorship from senior members and alumni contributors.",    tag: "#build" },
  { icon: "⚙",  title: "DevOps & Cloud",               desc: "CI/CD, containerisation, self‑hosting, and infrastructure‑as‑code using open‑source stacks.",         tag: "#infra" },
  { icon: "◉",   title: "Community Meetups",            desc: "Informal meetups, reading groups, and demo days to share what you've been building.",                  tag: "#meetup" },
];

export default function WhatWeDo() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      gsap.from(".wwd-heading", {
        immediateRender: false, scrollTrigger: { trigger: ".wwd-heading", start: "top 85%" },
        y: 40, opacity: 0, duration: 0.8, ease: "power3.out",
      });
      gsap.from(".wwd-card", {
        immediateRender: false, scrollTrigger: { trigger: ".wwd-grid", start: "top 80%" },
        y: 50, opacity: 0, duration: 0.6, stagger: 0.1, ease: "power3.out",
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section id="whatwedo" ref={sectionRef} className="py-28 relative bg-bg-2">
      <div className="section-divider" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="wwd-heading text-center mb-16">
          <span className="tag-badge mb-4 inline-block">{"// what we do"}</span>
          <h2 className="text-3xl sm:text-4xl font-bold mt-3 text-text">
            What We <span className="text-text">Do</span>
          </h2>
          <p className="mt-4 max-w-xl mx-auto text-sm sm:text-base text-muted-2">
            From workshops to hackathons — everything we do serves open‑source learning and community building.
          </p>
        </div>

        <div className="wwd-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {activities.map((a) => (
            <div key={a.title} className="wwd-card glass-card p-7 cursor-default group">
              <div
                className="font-mono text-xl font-bold mb-4 transition-colors duration-200 text-muted"
              >
                <span className="group-hover:text-text transition-colors duration-300">{a.icon}</span>
              </div>
              <span
                className="inline-block font-mono text-[10px] px-2 py-0.5 rounded-full mb-3 bg-surface text-text border border-border-2"
              >
                {a.tag}
              </span>
              <h3 className="font-semibold text-sm mb-2 text-text">{a.title}</h3>
              <p className="text-sm leading-relaxed text-muted-2">{a.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
