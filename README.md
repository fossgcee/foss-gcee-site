# FOSSGCEE Website

Official website of the **Free and Open Source Software Club** at Government College of Engineering, Erode.

🌐 **Live:** [fossgcee.netlify.app](https://fossgcee.netlify.app) &nbsp;|&nbsp; 📁 **Stack:** Next.js 16 · Tailwind CSS v4 · GSAP

---

## Table of Contents

1. [Project Structure](#project-structure)
2. [Running Locally](#running-locally)
3. [Managing Events](#managing-events) ← **Start here for most updates**
4. [Updating Website Content](#updating-website-content)
5. [Deploying](#deploying)
6. [Design System](#design-system)
7. [Adding New Pages or Sections](#adding-new-pages-or-sections)
8. [Troubleshooting](#troubleshooting)

---

## Project Structure

```
FOSS_GCEE/
├── public/
│   ├── events/          ← Drop event posters & photos here
│   ├── Tux.svg          ← Linux mascot (do not delete)
│   └── foss_gcee_logo.png
│
├── src/
│   ├── app/
│   │   ├── events/[slug]/page.tsx   ← Individual event pages (auto-generated)
│   │   ├── layout.tsx               ← Fonts, metadata, page wrapper
│   │   ├── page.tsx                 ← Home page assembly
│   │   └── globals.css              ← Design tokens, Tailwind config
│   │
│   ├── components/
│   │   ├── Navbar.tsx
│   │   ├── Hero.tsx
│   │   ├── About.tsx
│   │   ├── WhatWeDo.tsx
│   │   ├── Community.tsx   ← Events section (reads from data/events.ts)
│   │   ├── JoinUs.tsx
│   │   ├── Footer.tsx
│   │   └── PageLoader.tsx  ← GSAP loading animation
│   │
│   └── data/
│       └── events.ts   ← ✅ THE ONLY FILE YOU NEED TO EDIT FOR EVENTS
```

---

## Running Locally

**Requirements:** Node.js 18+

```bash
# 1. Install dependencies (only needed once)
npm install

# 2. Start the dev server
npm run dev

# 3. Open in browser
http://localhost:3000
```

Changes auto-refresh in the browser — no manual reload needed.

---

## Managing Events

> **All event management happens in one file: `src/data/events.ts`**
> You do not need to touch any other file for adding, editing, or archiving events.

### How Events Work

| `dateISO` vs Today | Where it appears |
|---|---|
| **Future date** | Shown as "Upcoming" — next one shown in the terminal card |
| **Past date** | Automatically moved to "Past Events" timeline |

The page handles this automatically. You only manage the data.

---

### Adding a New Event

Open `src/data/events.ts` and **copy-paste this template** into the `EVENTS` array:

```ts
{
  slug:      "event-title-yyyy",      // URL: /events/event-title-yyyy
  date:      "DD-MM-YYYY",            // Displayed date e.g. "15-08-2026"
  dateISO:   "YYYY-MM-DD",            // ISO format for logic e.g. "2026-08-15"
  title:     "Your Event Title",
  venue:     "Lab 3 / GCE Erode / Gmeet",
  time:      "6:00 – 7:30 IST",
  handledBy: "Speaker Name (Dept – Year)",
  type:      "workshop",              // workshop | talk | hackathon | meetup | other
  desc:      "Full description of the event, what attendees will learn, etc.",
  // poster: "/events/your-poster.jpg",  ← uncomment when ready
  // photos: [],                          ← fill after the event
},
```

**Slug rules:**
- Lowercase letters, numbers, and hyphens only
- No spaces, no special characters
- Must be **unique** across all events
- Good: `"git-workshop-aug-2026"` Bad: `"Git Workshop Aug 2026"`

---

### Adding a Poster (Before the Event)

1. Put the poster image in `public/events/` — name it clearly e.g. `ai-tools-poster.jpg`
2. In `events.ts`, uncomment and update the `poster` field:

```ts
poster: "/events/ai-tools-poster.jpg",
```

The poster appears in:
- The terminal card on the homepage
- The event detail page (`/events/your-slug`)

**Recommended image size:** 600×600 px, JPG or PNG under 500 KB.

---

### Archiving an Event (After it Finishes)

The event **automatically** moves to "Past Events" once `dateISO` is in the past. No manual action needed.

If you want to **keep the event page but update the date** (e.g., the event was postponed):
```ts
dateISO: "2026-09-15",  // ← just change this
date:    "15-09-2026",  // ← update the display date too
```

---

### Adding Event Photos (After the Event)

1. Drop the photos in `public/events/` — use descriptive names:
   ```
   public/events/linux-fest-photo1.jpg
   public/events/linux-fest-photo2.jpg
   public/events/linux-fest-photo3.jpg
   ```

2. Update the event in `events.ts`:
   ```ts
   photos: [
     "/events/linux-fest-photo1.jpg",
     "/events/linux-fest-photo2.jpg",
     "/events/linux-fest-photo3.jpg",
   ],
   ```

Photos appear as a gallery on the event detail page and as thumbnails in the Past Events timeline.

**Recommended photo size:** Under 500 KB per image. Resize using [Squoosh](https://squoosh.app) (free, browser-based).

---

### Full Event Lifecycle Example

```
1. ANNOUNCE  →  Add event to events.ts with future dateISO + poster
2. EVENT DAY →  No changes needed (event shows in terminal card automatically)
3. AFTER     →  Drop photos in public/events/, add photos[] to events.ts
4. NEXT DAY+ →  Event auto-moves to Past Events timeline ✅
```

---

## Updating Website Content

### Navbar Links

File: `src/components/Navbar.tsx`

```ts
const links = [
  { label: "About",      href: "#about" },
  { label: "What We Do", href: "#whatwedo" },
  { label: "Events",     href: "#community" },
  { label: "Join Us",    href: "#join" },
];
```

Add or rename items here. The `href` should match the `id` of the section.

---

### About Section (Stats, Mission, Vision)

File: `src/components/About.tsx`

Update the stats:
```ts
const stats = [
  { value: "100+", label: "Active Members" },
  { value: "5+",   label: "Events Hosted" },
  { value: "10+",  label: "OSS Contributions" },
  { value: "2026", label: "Founded" },
];
```

---

### What We Do (Activity Cards)

File: `src/components/WhatWeDo.tsx`

Update the `activities` array to change the 6 activity cards.

---

### Join Us (Steps + Social Links)

File: `src/components/JoinUs.tsx`

Update social links:
```ts
const socials = [
  { icon: "⎇", label: "GitHub",   href: "https://github.com/fossgcee" },
  { icon: "✈", label: "Telegram", href: "https://t.me/fossgcee" },
  { icon: "✉", label: "Email",    href: "mailto:fossgcee@gmail.com" },
];
```

---

### Footer

File: `src/components/Footer.tsx`

Quick links and email are defined at the top of the file.

---

### Site Metadata (Title, Description, SEO)

File: `src/app/layout.tsx`

```ts
export const metadata: Metadata = {
  title: "FOSSGCEE – FOSS Club GCE Erode",
  description: "...",
  keywords: ["FOSS", "open source", "Linux", "GCE Erode", ...],
};
```

---

## Deploying

The site is deployed on **Netlify** from the `main` branch automatically.

```bash
# Manual build check before pushing
npm run build

# If build passes, commit and push
git add .
git commit -m "your message"
git push
```

Netlify will auto-deploy within ~1–2 minutes of the push.

> ⚠️ **Always run `npm run build` locally before pushing.** If it fails locally, it will fail on Netlify too.

---

## Design System

The entire site uses a **black and white monochromatic glassmorphism** design.

### Color Palette

| Variable | Value | Usage |
|---|---|---|
| Background | `#080808` | Page base |
| Surface | `#0f0f0f` | Terminal cards |
| Glass | `rgba(255,255,255,0.04)` | Card backgrounds |
| Text primary | `#f0f0f0` | Headings |
| Text secondary | `rgba(255,255,255,0.5)` | Body text |
| Accent / CTA | `#ffffff` | Buttons, highlights |

### CSS Classes (globals.css)

| Class | What it does |
|---|---|
| `.glass` | Subtle glassmorphism background |
| `.glass-card` | Card with border, blur, and hover lift |
| `.glass-strong` | Heavier glass effect |
| `.font-pixel` | Press Start 2P (retro pixel font) |
| `.font-mono` | JetBrains Mono |
| `.tag-badge` | Small section label e.g. `// about` |
| `.animate-blink` | Blinking cursor animation |

### Fonts

- **Body:** Inter (Google Fonts)
- **Mono / Terminal:** JetBrains Mono
- **Pixel / Logo:** Press Start 2P

---

## Adding New Pages or Sections

### New Section on Homepage

1. Create `src/components/YourSection.tsx`
2. Add `id="yoursection"` to the root element
3. Import and render it in `src/app/page.tsx`
4. Optionally add a Navbar link

### New Page

Create a file at `src/app/your-page/page.tsx`. It will be accessible at `/your-page`.

For dynamic routes (like event pages): `src/app/blog/[slug]/page.tsx` → `/blog/anything`.

---

## Troubleshooting

### Page content not showing / invisible sections

GSAP ScrollTrigger may not have fired. Restart the dev server:
```bash
# Ctrl+C to stop, then:
npm run dev
```

### Build fails

```bash
npm run build 2>&1 | grep -i error
```

Common causes:
- TypeScript error in `events.ts` (missing required field, wrong type)
- Broken image path in `poster` or `photos`
- Syntax error (missing comma, bracket)

### Logo not updating after replacing the file

Clear Next.js image cache:
```bash
rm -rf .next/cache/images
npm run dev
```
Then hard-refresh the browser: `Ctrl+Shift+R`

### Hydration warnings in browser console

These are usually harmless in development. Run a production build to confirm:
```bash
npm run build && npm start
```

---

## Contact

Questions about the website? Reach out on the FOSSGCEE Telegram group or email **fossgcee@gmail.com**.

---

*Built with ♥ by the FOSSGCEE team — Government College of Engineering, Erode*
