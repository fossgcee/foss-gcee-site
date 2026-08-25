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
3. It opens the dedicated full-screen projector view:
   `https://fossgcee.org/events/[slug]/checkin/projector`
4. Connect your laptop to the **Projector / TV** in the seminar hall and click the **Maximize (Fullscreen)** icon.
5. The screen displays:
   - Event Title & Venue details.
   - High-contrast glowing **QR code** for mobile phone cameras.
   - Live counter: **`42 / 83 CHECKED IN (51%)`** with animated progress bar.
   - Real-time animated attendee feed as students scan and check in.

---

## 📱 2. Attendee Mobile Experience

When students point their phone camera at the projector screen, it opens:
`https://fossgcee.org/events/[slug]/checkin`

They have two quick options:

### Tab A: "Registered" (Pre-registered students)
- Enter their registered email address.
- Tap **`CONFIRM_CHECK_IN`**.
- Instantly verifies their registration, marks attendance, and displays their **Digital Event Pass / Badge**.

### Tab B: "Spot / New" (Walk-ins & Last-minute arrivals)
- If a student walked in without registering in advance:
  - Enters Full Name, Email, Department, Year, Mobile.
  - Taps **`REGISTER_AND_CHECK_IN`**.
  - Adds them to the database and marks attendance in a single click.

---

## 🎛️ 3. Admin Registrations Desk Controls

Organizers sitting at the registration desk can:
- View live attendance stats (**`Checked In Only`** vs **`Pending Arrival`**).
- Toggle check-in status manually with a single click on the checkmark button if an attendee doesn't have a smartphone.
- Click **`+ ADD_WALK_IN`** to register anyone by hand.
- Click **`EXPORT_CSV`** to download the final attendance sheet with the `Attendance` column (`CHECKED_IN` / `PENDING`).
