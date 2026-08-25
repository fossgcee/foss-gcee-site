import { NextRequest, NextResponse } from "next/server";
import { getSiteConfig, updateSiteConfig } from "@/services/siteConfig";
import { supabase } from "@/lib/supabase";
import { requireAdmin } from "@/lib/adminAuth";

// Default content fallbacks matching the static data files
const defaults: Record<string, unknown> = {
  hero: {
    badge: "Free & Open Source Software Club — GCE Erode",
    description:
      "We foster a culture of Linux, open‑source contribution, and real‑world collaboration among students at Government College of Engineering, Erode.",
    ctaPrimaryLabel: "$ register_now",
    ctaPrimaryHref: "/join",
    ctaSecondaryLabel: "$ join_community",
    ctaSecondaryHref: "/#join",
    githubHref: "https://github.com/fossgcee",
    collegeText: "FOSSGCEE",
    logoSubtext: "Govt. College of Engineering, Erode",
  },
  about: {
    stats: [
      { value: "100+", label: "Active Members" },
      { value: "3+", label: "Events Hosted" },
      { value: "3+", label: "OSS Contributions" },
      { value: "2026", label: "Founded" },
    ],
    cards: [
      {
        icon: "heart",
        title: "What is FOSSGCEE?",
        text: "FOSSGCEE is the official Free and Open Source Software club of Government College of Engineering, Erode — a community of passionate students who believe in open collaboration and transparent technology.",
      },
      {
        icon: "🎯",
        title: "Our Mission",
        text: "To promote FOSS culture within campus through hands‑on learning, peer mentorship, and real‑world contributions — building an ecosystem where every student can grow as a developer.",
      },
      {
        icon: "🔭",
        title: "Our Vision",
        text: "To build a sustainable open‑source culture where students contribute back to the global commons, launch meaningful projects, and graduate as engineers who value freedom and transparency.",
      },
    ],
  },
  whatwedo: {
    activities: [
      { icon: ">_", title: "Linux & Git Workshops", desc: "Hands‑on sessions on the Linux terminal, shell scripting, and mastering Git for version control.", tag: "#terminal" },
      { icon: "⎇", title: "OSS Contribution Drives", desc: "Guided drives to help students make their first pull requests to real open‑source projects.", tag: "#contribute" },
      { icon: "⚡", title: "Talks & Hackathons", desc: "Expert talks, lightning talks, and hackathons focused on open‑source tooling and ideas.", tag: "#community" },
      { icon: "</>" , title: "Student‑led Projects", desc: "Launch your own open‑source projects with mentorship from senior members and alumni contributors.", tag: "#build" },
      { icon: "⚙", title: "DevOps & Cloud", desc: "CI/CD, containerisation, self‑hosting, and infrastructure‑as‑code using open‑source stacks.", tag: "#infra" },
      { icon: "◉", title: "Community Meetups", desc: "Informal meetups, reading groups, and demo days to share what you've been building.", tag: "#meetup" },
    ],
  },
  boardmembers: {
    members: [],
  },
  gallery: {
    images: [],
  },
  footer: {
    about: "Free and Open Source Software Club at Government College of Engineering, Erode.",
    email: "fossgcee@gmail.com",
    builtBy: "Prem Kumar P, Bharath Kumar P & Vikash V",
    socials: [
      { platform: "GitHub", href: "https://github.com/fossgcee", active: true },
      { platform: "YouTube", href: "https://www.youtube.com/channel/UCTtzkb23e6iQAMMkgigHQqQ", active: true },
      { platform: "Instagram", href: "https://www.instagram.com/fossgcee/", active: true },
      { platform: "Discord", href: "https://discord.com/invite/d6SUMn4JF", active: true },
      { platform: "LinkedIn", href: "#", active: false },
      { platform: "Email", href: "mailto:fossgcee@gmail.com", active: true },
    ],
    quickLinks: [
      { label: "About", href: "/#about" },
      { label: "What We Do", href: "/#whatwedo" },
      { label: "Events", href: "/#community" },
      { label: "Join Us", href: "/#join" },
    ],
  },
};

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const section = searchParams.get("section");

    if (section) {
      const data = await getSiteConfig(section);
      return NextResponse.json({
        success: true,
        data: data || defaults[section] || {},
        section,
        fromDb: !!data
      });
    }

    // Return all sections
    const { data: configs, error } = await supabase.from("site_configs").select("*");
    if (error) throw error;

    const result: Record<string, unknown> = {};
    for (const key of Object.keys(defaults)) {
      const found = configs?.find((c) => c.section === key);
      result[key] = found ? found.data : defaults[key];
    }
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error("Fetch Admin SiteConfig Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to load site configuration." },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  // Auth guard: only authenticated admins may update site configuration.
  const auth = await requireAdmin(req);
  if (auth) return auth;

  try {
    const body = await req.json();
    const { section, data } = body;

    if (!section || typeof section !== "string" || !data) {
      return NextResponse.json(
        { success: false, error: "section and data are required" },
        { status: 400 }
      );
    }

    // Only allow known sections to prevent arbitrary key injection.
    if (!Object.keys(defaults).includes(section)) {
      return NextResponse.json(
        { success: false, error: "Unknown section." },
        { status: 400 }
      );
    }

    const updated = await updateSiteConfig(section, data);

    return NextResponse.json({ success: true, data: { section, data: updated } });
  } catch (error) {
    console.error("Update SiteConfig Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update site configuration." },
      { status: 500 }
    );
  }
}
