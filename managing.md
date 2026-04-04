# Managing FOSS-CIT Content

This guide explains how to add, update, and manage the dynamic content on the FOSS-CIT website, including Board Members, the Members Gallery, and Events. The site is built with Next.js and uses centralized TypeScript data files to make updating content as simple as editing an array.

---

## 1. Adding Members for Next Year

The Board Members page automatically groups members by their `year` and generates a dropdown filter. You do not need to edit the UI components to add a new year—the dropdown will detect it automatically!

### How to update:
1. Open `src/data/members.ts`.
2. Locate the `membersData` array.
3. Add a new object to the array with the new year (e.g., `"2026 - 27"`). 

**Example:**
```typescript
{
  id: "unique-id-here", // e.g., "john-doe-2026"
  name: "John Doe",
  role: "President",
  year: "2026 - 27", // The new year will automatically appear in the dropdown!
  imageUrl: "/members/john.jpg", // Add their photo to the public/members/ folder
  linkedInUrl: "https://linkedin.com/in/johndoe",
}
```
*Note: The website sorts the dropdown so the most recent year appears first.*

---

## 2. Managing the Members Gallery

Currently, the Members Gallery `/members` is statically built as a placeholder pending backend integration.

### Phase 1: Static Management (Current)
If you want to change the display photos manually before the backend is finished:
1. Drop images into `public/members-gallery/`.
2. Open `src/data/membersGallery.ts`.
3. Add entries to the `membersGallery` array using paths like `/members-gallery/pic1.jpg`.

### Phase 2: Backend Integration (Future)
Your backend team will integrate the React/Redux upload form. Once the backend API and Cloudinary are wired up:
1. The backend team will restore the file `<form>` block and `handleUploadClick` / `handleDelete` functions.
2. Only authorized users (e.g., `userInfo` token authenticated) will be able to see the "Admin: Upload Picture" and "Delete" buttons.
3. This will allow the club admins to upload images directly from the live website without altering code.

---

## 3. Creating and Managing Events

Events are managed identically to Members: through a central data file. The homepage `Community` section and the dedicated `Event Details` pages are dynamically generated from this one file.

### How to update:
1. Open `src/data/events.ts`.
2. Locate the `events` array.
3. Add a new event object. The website will automatically create a route for it (e.g., `/events/your-event-slug`) and add a card to the homepage.

**Example:**
```typescript
{
  id: "3",
  title: "Hacktoberfest 2026",
  slug: "hacktoberfest-2026", // This becomes the URL: /events/hacktoberfest-2026
  date: "October 1-31, 2026",
  time: "All Month",
  location: "Online / CIT Campus",
  description: "Join us for a month of Open Source contributions! Get your PRs merged and win swag.",
  image: "/events/hacktoberfest.jpg", // Place image in public/events/ folder
  tags: ["Open Source", "Hackathon", "Global"],
}
```

By keeping all changes localized to `src/data/events.ts` and `src/data/members.ts`, you can safely onboard junior developers to manage content without risking breaking the Next.js visual components!
