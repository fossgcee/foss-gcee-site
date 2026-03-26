// ─────────────────────────────────────────────────────────────────────
//  FOSSGCEE Events Data — Single source of truth for all club events
//
//  HOW TO ADD AN EVENT:
//  1. Copy the template below and fill in the details
//  2. Set dateISO to a FUTURE date → it shows as "Upcoming" / terminal card
//  3. Once the event date passes, it auto-moves to "Past Events"
//  4. Add photos after the event (see README.md for full guide)
//
//  SLUG RULES:
//  - Lowercase, hyphens only, no spaces
//  - Must be unique across all events
//  - Becomes the URL: /events/your-slug
// ─────────────────────────────────────────────────────────────────────

export interface FossEvent {
  /** URL-friendly unique ID → /events/[slug] */
  slug: string;
  /** Displayed date e.g. "28-06-2026" or "Jun 2026" */
  date: string;
  /** ISO date for past/upcoming logic: "YYYY-MM-DD" */
  dateISO: string;
  title: string;
  venue: string;
  time: string;
  /** Speaker / organiser name and designation */
  handledBy: string;
  /** "workshop" | "talk" | "hackathon" | "meetup" | "other" */
  type: string;
  /** Full description shown on the event detail page */
  desc?: string;
  /** Registration count display */
  registrationsCount?: number;
  /**
   * POSTER  — Add before the event.
   * 1. Drop image into public/events/
   * 2. Set: poster: "/events/your-poster.jpg"
   */
  poster?: string;
  /**
   * PHOTOS  — Add after the event is over.
   * 1. Drop photos into public/events/
   * 2. Set: photos: ["/events/photo1.jpg", "/events/photo2.jpg"]
   */
  photos?: string[];
}

// ─── TEMPLATE (copy & fill in) ────────────────────────────────────────
// {
//   slug:      "event-title-yyyy",          // e.g. "git-workshop-2026"
//   date:      "DD-MM-YYYY",                // e.g. "15-08-2026"
//   dateISO:   "YYYY-MM-DD",               // e.g. "2026-08-15"
//   title:     "Your Event Title",
//   venue:     "Lab 3 / Gmeet / ...",
//   time:      "6:00 – 7:00 IST",
//   handledBy: "Name (Dept – Year)",
//   type:      "workshop",
//   desc:      "What this event is about.",
//   registrationsCount: 0,
//   poster:    "/events/your-poster.jpg",   // optional — add when ready
//   photos:    [],                           // fill after event
// },

export const EVENTS: FossEvent[] = [
  // ─── Add new events here ──────────────────────────────────────────
  {
    slug: "ai-tools-automation-2026",
    date: "26-06-2026",
    dateISO: "2026-06-26",
    title: "Building Powerful AI Tools and Automation",
    venue: "Gmeet",
    time: "6:30 – 7:30 IST",
    handledBy: "BHARATH (3rd Year IT)",
    type: "talk",
    desc: "A session on building AI-powered automation workflows and tools using open-source libraries. We'll explore LangChain, Ollama, and automation pipelines you can build entirely with free and open-source tools.",
    registrationsCount: 45
  },
  {
    slug: "git-github-workshop-2025",
    date: "15-12-2025",
    dateISO: "2025-12-15",
    title: "Introduction to Git & GitHub",
    venue: "Lab 3",
    time: "4:00 – 5:30 IST",
    handledBy: "CLUB LEAD (4th Year CSE)",
    type: "workshop",
    desc: "Master the basics of version control with Git and collaboration via GitHub. Essential for every developer.",
    photos: ["/events/git-1.jpg", "/events/git-2.jpg"],
    registrationsCount: 82
  },
  {
    slug: "open-source-summit-2026",
    date: "10-08-2026",
    dateISO: "2026-08-10",
    title: "GCE Erode Open Source Summit",
    venue: "Main Auditorium",
    time: "9:00 – 4:00 IST",
    handledBy: "FOSS GCE ERODE",
    type: "hackathon",
    desc: "Our flagship event featuring guest speakers, hands-on workshops, and a code sprint focused on community projects.",
    registrationsCount: 12
  }
];
