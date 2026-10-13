# Event QR Check-In & Projector Display System

This document outlines the **Live QR Check-In** and **Projector Display System** designed for FOSS GCEE events.

---

## 🎯 How It Works

```
                     ┌────────────────────────────────┐
                     │   Projector in Seminar Hall    │
                     │  Displays Giant Live QR Code   │
                     │   & Real-Time Attendee Ticker  │
                     └───────────────┬────────────────┘
                                     │
                             Attendees Scan QR
                                     │
                                     ▼
                     ┌────────────────────────────────┐
                     │ Attendee Phone (/events/checkin)│
                     │  - Enters Email OR Spot Reg   │
                     │  - Taps "CONFIRM_CHECK_IN"     │
                     └───────────────┬────────────────┘
                                     │
                               Instant Sync
                                     │
                                     ▼
                     ┌────────────────────────────────┐
                     │   Live Counter Increments &    │
                     │  Admin Dashboard Marks Present │
                     └────────────────────────────────┘
```

---

## 👨‍🏫 1. Organizer Workflow (Projecting on the Screen)

1. Go to **Admin Dashboard** $\rightarrow$ **Events** $\rightarrow$ Click **RSVPS** for the event (e.g. `Linux Installation Fest`).
2. In the top action bar, click **`PROJECTOR_QR`**.
3. It opens the dedicated full-screen presentation view:
   `https://fossgcee.org/events/[slug]/checkin/projector`
4. Connect your laptop to the **Projector / TV** in the seminar hall and click the **Maximize (Fullscreen)** icon (or press **F**).
5. The presentation display features:
   - **Enlarged High-Definition Event Poster**: Spans up to `84vh` and fills the available stage column cleanly with full aspect-ratio fidelity and subtle ambient backlighting.
   - **Stage Themes Engine**: Real-time atmospheric background with 60fps canvas particles:
     - 🌸 **Cherry Blossom (Sakura)** (Default): Gentle falling pink sakura petals with soft rose ambient glow.
     - ⚡ **Cyber Matrix**: Neon emerald digital grid and high-tech terminal particles.
     - 🌌 **Celestial Aurora**: Ethereal northern lights with cosmic stardust particles.
     - 🌅 **Sunset Synth**: Warm retrowave dusk and amber horizon particles.
     - 🪨 **Minimal Noir**: Deep pitch-black contrast for minimal keynotes.
     - *Cycle themes quickly by pressing **T** or using the top header dropdown (persists in localStorage).*
   - **Streamlined Minimal Header**: Uncluttered, low-profile header without clumsy oversized duplicate titles, letting the poster and QR code command full stage focus.
   - **High-Contrast Scannable QR Code**: Crisp, high-contrast QR code with corner reticles, 3-step scanning guide, and direct browser URL pill.
   - **No Public Attendance Tickers**: Audience view remains cinematic and clean.
   - **Organizer Attendee Desk**: Press **A** or tap **Check-in Desk** in the header to open a private slide-over drawer showing live verified attendees, timestamps, search, and direct portal link.
   - **Key Shortcuts**: <kbd>T</kbd> for Theme, <kbd>F</kbd> for Fullscreen, <kbd>A</kbd> for Attendee Desk, <kbd>Esc</kbd> to close overlays.

---

## 📱 2. Attendee Mobile Experience

When students point their phone camera at the projector screen, it opens:
`https://fossgcee.org/events/[slug]/checkin`

They have two quick options:

### Tab A: "Registered" (Pre-registered students)
- Enter their registered email address.
- Tap **`CONFIRM_CHECK_IN`**.
- Instantly verifies their registration, marks attendance, and displays their **Digital Event Pass / Badge**.

### Tab B: "Spot / Walk-in" (Walk-ins & Last-minute arrivals)
- If a student walked in without registering in advance:
  - Enters Full Name, Email, Department, Year, Mobile.
  - Taps **`REGISTER_AND_CHECK_IN`**.
  - Adds them to the database and marks attendance in a single click.

---

## 🎛️ 3. Admin Registrations & Attendance Desk

Organizers sitting at the registration desk or viewing on mobile at `/admin/events/[id]/registrations`:
- **Real-Time Live Auto-Sync**: The dashboard silently syncs check-in status every 3.5 seconds as participants scan the projector screen.
- **1-Click Attendance Filter Tabs**: Switch instantly between **`ALL`**, **`CHECKED IN`** (with green indicator), and **`PENDING`** (with amber indicator).
- **Search & Filter**: Search by name, email, department, or phone number.
- **1-Click Toggle**: Mark attendees present or un-checked in manually if they don't have a phone.
- **Walk-in Registration**: Click **`+ ADD_WALK_IN`** to manually register walk-in attendees.
- **CSV Export**: Click **`EXPORT_CSV`** to download the complete attendance sheet with verified check-in status (`CHECKED_IN` / `PENDING`).
