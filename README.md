# FOSSGCEE Website

Official website of the **Free and Open Source Software Club** at Government College of Engineering, Erode.

🌐 **Live:** [fossgcee.netlify.app](https://fossgcee.netlify.app) &nbsp;|&nbsp; 📁 **Stack:** Next.js 16 · Tailwind CSS v4 · MongoDB · Nodemailer

---

## Table of Contents

1. [Project Structure](#project-structure)
2. [Running Locally](#running-locally)
3. [Environment Variables](#environment-variables)
4. [Registration & OTP Flow](#registration--otp-flow)
5. [Admin Panel](#admin-panel)
6. [Managing Events](#managing-events)
7. [Updating Website Content](#updating-website-content)
8. [Deploying](#deploying)
9. [Design System](#design-system)
10. [Adding New Pages or Sections](#adding-new-pages-or-sections)
11. [Troubleshooting](#troubleshooting)

---

## Project Structure

```
foss-gcee-site/
├── public/
│   ├── events/              ← Drop event posters & photos here
│   ├── Tux.svg              ← Linux mascot (do not delete)
│   └── foss_gcee_logo.png
│
├── src/
│   ├── middleware.ts         ← Route protection for /admin/*
│   │
│   ├── app/
│   │   ├── (landing)/        ← Public-facing pages (Navbar + Footer)
│   │   │   ├── page.tsx         ← Home page
│   │   │   ├── events/          ← Events listing + [slug] detail pages
│   │   │   ├── members/         ← Board members page
│   │   │   └── join/            ← Member registration portal (/join)
│   │   │
│   │   ├── (admin)/          ← Admin dashboard (no Navbar/Footer)
│   │   │   └── admin/
│   │   │       ├── layout.tsx       ← AdminSidebar layout
│   │   │       ├── page.tsx         ← Dashboard overview with live stats
│   │   │       ├── members/page.tsx ← Registered members table
│   │   │       ├── events/          ← (upcoming)
│   │   │       ├── settings/        ← (upcoming)
│   │   │       └── login/
│   │   │           ├── page.tsx     ← Password login UI
│   │   │           └── actions.ts   ← Server action: login / logout
│   │   │
│   │   ├── api/
│   │   │   ├── register/
│   │   │   │   ├── send-otp/route.ts    ← POST: save form + email OTP
│   │   │   │   └── verify-otp/route.ts  ← POST: validate OTP, mark verified
│   │   │   └── admin/
│   │   │       └── members/route.ts     ← GET (list/search/filter) + DELETE
│   │   │
│   │   ├── layout.tsx        ← Root layout (fonts, global CSS)
│   │   └── globals.css       ← Design tokens, Tailwind config
│   │
│   ├── components/
│   │   ├── Navbar.tsx
│   │   ├── AdminSidebar.tsx  ← Admin navigation sidebar
│   │   ├── Hero.tsx
│   │   ├── About.tsx
│   │   ├── WhatWeDo.tsx
│   │   ├── Community.tsx     ← Events section (reads from data/events.ts)
│   │   ├── JoinUs.tsx
│   │   ├── RegistrationPortal.tsx  ← 2-step join form with OTP verification
│   │   ├── Footer.tsx
│   │   └── PageLoader.tsx    ← GSAP loading animation
│   │
│   ├── models/
│   │   ├── Registration.ts   ← Mongoose schema: join form submissions + OTP fields
│   │   └── Member.ts         ← Mongoose schema: core member records
│   │
│   ├── lib/
│   │   ├── db.ts             ← MongoDB connection (cached Mongoose client)
│   │   ├── mailer.ts         ← Nodemailer transporter + sendOtpEmail()
│   │   └── utils.ts          ← cn() class merge helper
│   │
│   └── data/
│       ├── events.ts         ← ✅ Edit this to add/update events
│       └── members.ts        ← Board member data
│
├── .env.local                ← 🔒 Secret keys (never commit this file)
└── next.config.ts
```

---

## Running Locally

**Requirements:** Node.js 18+

```bash
# 1. Install dependencies
npm install

# 2. Copy and fill environment variables
cp .env.local.example .env.local   # then edit with your real values

# 3. Start the dev server
npm run dev

# 4. Open in browser
http://localhost:3000
```

Changes auto-refresh in the browser — no manual reload needed.

---

## Environment Variables

Create a `.env.local` file in the project root with the following keys:

```bash
# MongoDB Atlas connection string
DATABASE_URL="mongodb+srv://<user>:<password>@<cluster>.mongodb.net/?appName=<app>"
MONGODB_URI="mongodb+srv://<user>:<password>@<cluster>.mongodb.net/?appName=<app>"

# Admin dashboard password (used on /admin/login)
ADMIN_PASSWORD="your_secure_password"

# Nodemailer — Gmail account for sending OTP emails
EMAIL_USER="yourclub@gmail.com"
EMAIL_APP_PASSWORD="xxxx xxxx xxxx xxxx"   # Gmail App Password (not your login password)
```

> **How to create a Gmail App Password:**
> Google Account → Security → 2-Step Verification → App Passwords → Generate

> ⚠️ **Never commit `.env.local` to Git.** It is already in `.gitignore`.

---

## Registration & OTP Flow

The **Join Us** page (`/join`) implements a 2-step registration with email verification:

```
Step 1 — Fill form
  Fields: Full Name · Gmail · LinkedIn URL · Phone · Year · Department

Step 2 — Email OTP
  A 6-digit OTP is emailed via Nodemailer (valid for 10 minutes).
  The user enters the code in individual digit boxes.
  Supports: paste, backspace navigation, resend (60s cooldown).

Step 3 — Success
  Registration is saved to MongoDB with otpVerified: true.
```

**API Routes:**

| Method | Route | Description |
|--------|-------|-------------|
| `POST` | `/api/register/send-otp` | Saves form data, generates + emails OTP |
| `POST` | `/api/register/verify-otp` | Validates OTP, marks registration as verified |

---

## Admin Panel

Access the admin dashboard at **`/admin`**. Unauthenticated users are redirected to `/admin/login` by `src/middleware.ts`.

### Login

Enter the password defined in `ADMIN_PASSWORD` in your `.env.local`.  
A session cookie (`admin_session`) is set for **24 hours**.

### Dashboard (`/admin`)

- **Live stats:** Total registrations, Verified, Pending
- **DB status:** Shows MongoDB connection health

### Members Table (`/admin/members`)

| Feature | Details |
|---------|---------|
| **Live search** | Search by name, email, department, or year (300ms debounce) |
| **Status filter** | Toggle: All / Verified / Pending |
| **Sortable** | Click Name or Year column headers |
| **Expand row** | Click any row to see phone, LinkedIn, and registration timestamp |
| **Delete** | Trash icon removes the record from MongoDB |

### Logout

Click **Logout** in the sidebar to clear the session and return to the homepage.

---

## Managing Events

> **All event management happens in one file: `src/data/events.ts`**

### How Events Work

| `dateISO` vs Today | Where it appears |
|---|---|
| **Future date** | Shown as "Upcoming" — next one shown in the terminal card |
| **Past date** | Automatically moved to "Past Events" timeline |

### Adding a New Event

Open `src/data/events.ts` and copy-paste this template into the `EVENTS` array:

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
  desc:      "Full description...",
  // poster: "/events/your-poster.jpg",   ← uncomment when ready
  // photos: [],                           ← fill after the event
},
```

**Slug rules:** lowercase, hyphens only, unique.  
Good: `"git-workshop-aug-2026"` &nbsp; Bad: `"Git Workshop Aug 2026"`

### Adding a Poster

1. Put the image in `public/events/` (e.g. `ai-tools-poster.jpg`)
2. Uncomment `poster` in `events.ts`:
```ts
poster: "/events/ai-tools-poster.jpg",
```

**Recommended:** 600×600 px, JPG or PNG under 500 KB.

### Adding Event Photos (After the Event)

```ts
photos: [
  "/events/linux-fest-photo1.jpg",
  "/events/linux-fest-photo2.jpg",
],
```

**Recommended:** Under 500 KB per image. Resize with [Squoosh](https://squoosh.app).

### Full Event Lifecycle

```
1. ANNOUNCE  →  Add event to events.ts with future dateISO + poster
2. EVENT DAY →  No changes needed (auto shown in terminal card)
3. AFTER     →  Drop photos in public/events/, add photos[] to events.ts
4. NEXT DAY+ →  Event auto-moves to Past Events timeline ✅
```

---

## Updating Website Content

### Navbar Links

File: `src/components/Navbar.tsx` — edit the `links` array.

### About Section (Stats)

File: `src/components/About.tsx` — update the `stats` array.

### What We Do (Cards)

File: `src/components/WhatWeDo.tsx` — update the `activities` array.

### Join Us (Social Links)

File: `src/components/JoinUs.tsx` — update the `socials` array.

### Footer

File: `src/components/Footer.tsx` — quick links and email at the top.

### Site Metadata (SEO)

File: `src/app/layout.tsx` — edit the `metadata` export.

---

## Deploying

The site is deployed on **Netlify** from the `main` branch automatically.

```bash
# Manual build check before pushing
npm run build

# If build passes:
git add .
git commit -m "your message"
git push
```

Netlify auto-deploys within ~1–2 minutes.

> ⚠️ **Set environment variables in Netlify** (Site → Settings → Environment Variables) matching your `.env.local`. Without them, MongoDB and email will not work in production.

> ⚠️ **Always run `npm run build` locally before pushing.** If it fails locally, it will fail on Netlify too.

---

## Design System

The site uses a **black and white monochromatic glassmorphism** design.

### Color Palette

| Token | Value | Usage |
|---|---|---|
| Background | `#080808` | Page base |
| Surface | `#0f0f0f` | Cards, admin sidebar |
| Glass | `rgba(255,255,255,0.04)` | Card backgrounds |
| Text primary | `#f0f0f0` | Headings |
| Text secondary | `rgba(255,255,255,0.5)` | Body text |
| Accent / CTA | `#ffffff` | Buttons, highlights |
| Emerald | `#10b981` | Verified badges, DB status |
| Amber | `#f59e0b` | Pending badges |
| Red | `#ef4444` | Error states, delete actions |

### Fonts

- **Body:** Inter (Google Fonts)
- **Mono / Terminal:** JetBrains Mono
- **Pixel / Logo:** Press Start 2P

### Key CSS Classes (`globals.css`)

| Class | What it does |
|---|---|
| `.glass` | Subtle glassmorphism background |
| `.glass-card` | Card with border, blur, and hover lift |
| `.font-pixel` | Press Start 2P (retro pixel font) |
| `.font-mono` | JetBrains Mono |
| `.tag-badge` | Small section label e.g. `// about` |
| `.animate-blink` | Blinking cursor animation |

---

## Adding New Pages or Sections

### New Section on Homepage

1. Create `src/components/YourSection.tsx`
2. Add `id="yoursection"` to the root element
3. Import and render it in `src/app/(landing)/page.tsx`
4. Optionally add a Navbar link

### New Public Page

Create `src/app/(landing)/your-page/page.tsx` → accessible at `/your-page`.  
It will automatically inherit the Navbar and Footer from the `(landing)` layout.

### New Admin Page

Create `src/app/(admin)/admin/your-page/page.tsx` → accessible at `/admin/your-page`.  
It will be protected by the middleware and use the AdminSidebar layout.

For dynamic routes: `src/app/(landing)/blog/[slug]/page.tsx` → `/blog/anything`

---

## Troubleshooting

### Page content not showing / invisible sections

GSAP ScrollTrigger may not have fired. Restart the dev server:
```bash
# Ctrl+C to stop, then:
npm run dev
```

### MongoDB connection errors

- Confirm `DATABASE_URL` is set correctly in `.env.local`
- Whitelist your IP in **MongoDB Atlas → Network Access**
- In production (Netlify), add `0.0.0.0/0` to allow all IPs, or Netlify's IP ranges

### OTP emails not sending

- Confirm `EMAIL_USER` and `EMAIL_APP_PASSWORD` are set in `.env.local`
- The password must be a **Gmail App Password**, not your account password
- Ensure 2-Step Verification is enabled on the Gmail account

### Admin login not working

- Confirm `ADMIN_PASSWORD` matches what you're typing
- Clear browser cookies and try again
- The session cookie is `admin_session` with a 24-hour lifetime

### Build fails

```bash
npm run build 2>&1 | grep -i error
```

Common causes:
- TypeScript error in `events.ts` (missing field, wrong type)
- Broken image path in `poster` or `photos`
- Missing environment variable accessed at build time

### Logo not updating after replacing the file

```bash
rm -rf .next/cache/images
npm run dev
```
Then hard-refresh: `Ctrl+Shift+R`

### Hydration warnings in browser console

Usually harmless in development. Confirm with a production build:
```bash
npm run build && npm start
```

---

## Contact

Questions about the website? Reach out on the FOSSGCEE Telegram group or email **fossgcee@gmail.com**.

---

*Built with ♥ by the FOSSGCEE team — Government College of Engineering, Erode*
