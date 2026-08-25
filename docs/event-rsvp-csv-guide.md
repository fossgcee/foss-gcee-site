# Event RSVP CSV Import & Export Guide

This guide covers everything you need to know about importing participant RSVPs via CSV (`IMPORT_RSVP_CSV` / `UPLOAD_CSV`) and exporting attendee lists (`EXPORT_LIST.CSV`) in the **FOSS GCEE Admin Dashboard**.

---

## 🚀 Quick Start: Zero-Cleanup Upload

You can download CSV exports directly from **Google Forms**, **FOSS United RSVP**, **Luma**, or **Typeform** and upload them straight to the admin dashboard.

1. Navigate to **Admin Dashboard** $\rightarrow$ **Events** (`/admin/events`).
2. Click the **Attendee Icon** (envelope/users) next to the event you want to manage.
3. In the right-hand **REGISTRATION_LOGS** drawer, locate the **`IMPORT_RSVP_CSV`** box.
4. Click **`UPLOAD_CSV`** and select your `.csv` file.
5. The system will automatically map the columns, import new attendees, update existing ones, and sync the count.

---

## 📋 Column Specifications & Auto-Mapping

The system automatically resolves common column header variations (case-insensitive and whitespace-tolerant).

| Field | Required? | Accepted Column Names / Headers | Default Value if Missing |
| :--- | :--- | :--- | :--- |
| **Full Name** | **Yes** | `Name`, `Name1`, `Full Name`, `Fullname`, `Participant Name`, `Attendee Name`, `Student Name`, `Your Name` | *Row skipped if missing* |
| **Email Address** | **Yes** | `Email`, `Email Address`, `E-mail`, `Mail`, `Email ID`, `College Email`, `Participant Email` | *Row skipped if invalid* |
| **Department** | No | `Department`, `Dept`, `Branch`, `Course`, `Stream`, `Major` | `"External RSVP"` |
| **College** | No | `College`, `Institution`, `Organization`, `Organisation`, `Company`, `University` | `"Government College of Engineering, Erode"` |
| **Year of Study** | No | `Year`, `Year of study`, `Study year`, `Current year`, `Graduation year`, `Class` | `0` (or inferred from roll number) |
| **Mobile Number** | No | `Mobile`, `Phone`, `Phone Number`, `Contact`, `Contact Number`, `WhatsApp`, `WhatsApp Number` | `""` (empty) |

> **Note:** If a form has separate `First Name` and `Last Name` columns, they are automatically merged into a single `Name`.

---

## 📄 Example CSV Formats

### 1. Minimal CSV (Only Required Fields)
```csv
Name,Email
Bharath Kumar P,bharathjp02@gmail.com
Harish R,nrharish123@gmail.com
```

### 2. Full Standard CSV
```csv
Name,Email,Department,College,Year,Mobile
Bharath Kumar P,bharathjp02@gmail.com,IT,Government College of Engineering, Erode,4,9876543210
Harish R,nrharish123@gmail.com,ECE,Government College of Engineering, Erode,3,9123456789
```

### 3. Raw FOSS United / Google Form Export (Supported Directly)
```csv
Confirm attendance,Name1,Email,Department,Roll Number,Year of study,What OS is currently on your laptop?
1,Bharath Kumar P,bharathjp02@gmail.com,IT,23IMT09,4th,Already using Linux
1,Harish R,nrharish123@gmail.com,ECE,25ECE61L,3rd,Windows
```

---

## 📥 Exporting Registrations (`EXPORT_LIST.CSV`)

To download the complete participant list for any event:

1. Open the event's **REGISTRATION_LOGS** modal in `/admin/events`.
2. Scroll to the bottom of the drawer.
3. Click **`EXPORT_LIST.CSV`**.
4. A clean `.csv` file named `<event-slug>-registrations.csv` will be instantly generated and downloaded to your device with columns:
   - `Name`
   - `Email`
   - `Department`
   - `College`
   - `Year`
   - `Mobile`
   - `Registered At`

---

## 💡 Important Rules & Behavior

1. **Automatic Deduplication:** If the same email appears multiple times in the CSV, only the first occurrence is processed.
2. **Upsert Behavior:** If a registrant with that email already exists in the database for the event, their details (`department`, `year`, `mobile`, etc.) are updated rather than throwing a duplicate key error.
3. **Triggered Count Sync:** The event's `registrations_count` in the database is automatically updated in real-time.
