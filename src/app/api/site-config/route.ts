import { NextRequest, NextResponse } from "next/server";
import { getSiteConfig } from "@/services/siteConfig";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

// Public read-only endpoint for site config sections.
// Only allows reading specific public sections — never admin-only data.
const PUBLIC_SECTIONS = ["boardmembers", "gallery", "hero", "about", "whatwedo", "footer"] as const;
type PublicSection = typeof PUBLIC_SECTIONS[number];

const defaults: Record<PublicSection, unknown> = {
  boardmembers: { members: [], staffAdvisors: [] },
  gallery: { images: [] },
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
      { icon: "heart", title: "What is FOSSGCEE?", text: "FOSSGCEE is the official Free and Open Source Software club of Government College of Engineering, Erode." },
      { icon: "🎯", title: "Our Mission", text: "To promote FOSS culture within campus through hands‑on learning, peer mentorship, and real‑world contributions." },
      { icon: "🔭", title: "Our Vision", text: "To build a sustainable open‑source culture where students contribute back to the global commons." },
    ],
  },
  whatwedo: {
    activities: [
      { icon: ">_", title: "Linux & Git Workshops", desc: "Hands‑on sessions on the Linux terminal, shell scripting, and mastering Git for version control.", tag: "#terminal" },
      { icon: "⎇", title: "OSS Contribution Drives", desc: "Guided drives to help students make their first pull requests to real open‑source projects.", tag: "#contribute" },
      { icon: "⚡", title: "Talks & Hackathons", desc: "Expert talks, lightning talks, and hackathons focused on open‑source tooling and ideas.", tag: "#community" },
      { icon: "</>", title: "Student‑led Projects", desc: "Launch your own open‑source projects with mentorship from senior members and alumni contributors.", tag: "#build" },
      { icon: "⚙", title: "DevOps & Cloud", desc: "CI/CD, containerisation, self‑hosting, and infrastructure‑as‑code using open‑source stacks.", tag: "#infra" },
      { icon: "◉", title: "Community Meetups", desc: "Informal meetups, reading groups, and demo days to share what you've been building.", tag: "#meetup" },
    ],
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
      { label: "Projects", href: "/#contributions" },
      { label: "Events", href: "/#community" },
      { label: "Join Us", href: "/#join" },
    ],
  },
};

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const section = searchParams.get("section") as PublicSection | null;

    if (!section || !PUBLIC_SECTIONS.includes(section)) {
      return NextResponse.json(
        { success: false, error: "Invalid or missing section parameter." },
        { status: 400 }
      );
    }

    const configData = await getSiteConfig(section);
    let data = configData ? configData : defaults[section] ?? {};

    // Dynamically inject real database counts for the "about" section
    if (section === "about" && data.stats) {
      try {
        const [contribRes, eventsRes] = await Promise.all([
          supabase.from("contributions").select("*", { count: "exact", head: true }),
          supabase.from("events").select("*", { count: "exact", head: true }),
        ]);

        const contribVal = contribRes.count ?? 0;
        const eventsVal = eventsRes.count ?? 0;

        // Ensure data is deep cloned if it came from defaults so we don't mutate defaults
        data = JSON.parse(JSON.stringify(data));

        data.stats = data.stats.map((stat: { label: string; value: string }) => {
          const lower = stat.label.toLowerCase();
          if (lower.includes("event")) {
            return { ...stat, value: `${eventsVal}+` };
          }
          if (lower.includes("oss") || lower.includes("contribution") || lower.includes("project")) {
            return { ...stat, value: `${contribVal}+` };
          }
          return stat;
        });
      } catch {
        // Ignore error and use default/saved value
      }
    }

    return NextResponse.json({
      success: true,
      data,
      section,
      fromDb: !!configData,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
