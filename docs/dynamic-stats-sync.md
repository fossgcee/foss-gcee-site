# Dynamic Home Page Stats Synchronization

This document explains how statistics displayed on the homepage **About Section** are dynamically calculated and kept in sync with the database.

---

## 📊 Overview of Homepage Stats

The **About** section on the homepage displays four key statistics:
1. **Active Members:** `100+` (Managed via CMS or community signups)
2. **Events Hosted:** Dynamically calculated from the `events` table (e.g. `3+`)
3. **OSS Contributions:** Dynamically calculated from the `contributions` table (e.g. `3+`)
4. **Founded:** `2026`

---

## ⚙️ How Dynamic Synchronization Works

### 1. API Route (`/api/site-config?section=about`)
When the homepage mounts, `About.tsx` queries the public endpoint `GET /api/site-config?section=about`.

Inside `src/app/api/site-config/route.ts`, the handler dynamically queries Supabase to count the exact number of rows:

```typescript
const [contribRes, eventsRes] = await Promise.all([
  supabase.from("contributions").select("*", { count: "exact", head: true }),
  supabase.from("events").select("*", { count: "exact", head: true }),
]);

const contribVal = contribRes.count ?? 0;
const eventsVal = eventsRes.count ?? 0;
```

It then updates the stats array before returning the JSON payload:
- Any stat label containing `"event"` $\rightarrow$ `${eventsVal}+`
- Any stat label containing `"oss"`, `"contribution"`, or `"project"` $\rightarrow$ `${contribVal}+`

---

## 🗄️ Database Tables Used

| Stat Label | Database Table | Count Method |
| :--- | :--- | :--- |
| **Events Hosted** | `public.events` | `supabase.from("events").select("*", { count: "exact", head: true })` |
| **OSS Contributions** | `public.contributions` | `supabase.from("contributions").select("*", { count: "exact", head: true })` |

---

## 🛡️ Fallback & Offline Handling

If the database is unreachable or during initial server render before the client-side fetch resolves:
- Defaults in `defaultAboutData` (`About.tsx`) are used to prevent displaying `0+`.
- Once the fetch completes, the live count from the database replaces the fallback seamlessly.
