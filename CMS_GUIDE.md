# FOSS GCEE - Site Maintenance & CMS Guide

Welcome to the **FOSS GCEE** website maintenance guide! This document is meant for juniors and future maintainers to understand how the site works, how to manage content without touching the code, and how to maintain the codebase itself.

---

## 1. The Admin Dashboard (CMS)

The core of site management happens in the Admin Dashboard.
You can access it by navigating to `/admin` on the live site and logging in with the authorized admin credentials.

The dashboard has a sidebar with several sections:
- **Events:** Manage all club events (Upcoming & Past).
- **Forms & Registrations:** View users who registered for your events.
- **Site CMS:** The master content editor for the Landing Page and Members Page.
- **Admin Access:** Manage who has access to this `/admin` panel.

---

## 2. Managing Events

Events are the heart of the club's activity. You can create new events from the **Events** tab.

### Event Statuses
- **Draft:** The event is hidden from the public. Use this while you are still deciding on dates, posters, and details.
- **Upcoming:** The event is live on the public site! Users can see it on the Home page and Events page, and they can click "Register".
- **Completed:** The event is moved to the "Past Academic Years" archive on the public Events page. 

### Event Lifecycle (What to do when an event finishes)
1. When an event is done, change its status from `Upcoming` to `Completed`.
2. This stops registrations automatically.
3. You should then fill in the **Outcomes / Report** field to summarize how it went.
4. **Photo Gallery:** You can paste an **Ente.io Album Link** in the "Gallery Link" field. We use Ente.io for event albums because they handle large batches of photos cleanly without cluttering our database.

---

## 3. Site CMS (Editing Pages)

The **Site CMS** tab allows you to change text and images across the website dynamically. 

### Available Sections
- **HERO:** The big text at the top of the home page.
- **ABOUT & WHAT WE DO:** The text blocks explaining the club.
- **BOARD MEMBERS:** You can add/remove board members here. 
  - *Note:* Members are categorized by Academic Year. You can select the year from the dropdown to edit past/current batches.
- **MEMBERS GALLERY:** The slider of photos showing club memories.
- **FOOTER:** Basic contact info and social media links. (Note: The "Built By" credits are permanently hardcoded in the source code).

---

## 4. The Golden Rule of Images (Google Drive Magic ✨)

Hosting images directly in a repository or database is bad practice because it slows down the site. 

To solve this, our CMS is equipped with a **Google Drive Link Converter**.
Whenever the CMS asks you for an image (like a Board Member's Profile Picture, a Gallery Photo, or an Event Poster), you **do not** need to upload a file!

**How to use it:**
1. Upload your photo to a public Google Drive folder.
2. Right-click the photo in Google Drive and click **"Share" -> "Copy Link"**. (Make sure general access is set to *Anyone with the link*).
3. Paste that exact link directly into the CMS image field.
4. **Magic:** The CMS will automatically intercept your link and convert it into a *Direct Image URL* behind the scenes (`lh3.googleusercontent.com/...`). 
5. The site will render it perfectly!

*For large event photo dumps containing hundreds of photos, we use Ente.io links instead of Google Drive, which you can paste into the Event's "Gallery Link" field.*

---

## 5. Codebase Architecture (For Developers)

If you need to edit the actual code, here is a quick overview of how the repository is structured:

### Tech Stack
- **Framework:** Next.js 15 (App Router)
- **Styling:** TailwindCSS
- **Animations:** GSAP (GreenSock)
- **Database:** MongoDB (via Mongoose)

### Folder Structure
- `src/app/(landing)/`: Contains all the public-facing pages (`/`, `/events`, `/members`, etc.).
- `src/app/(admin)/`: Contains the entire Admin Dashboard. It is protected by authentication wrappers.
- `src/app/api/`: Our backend endpoints. This is where Next.js talks to MongoDB.
- `src/components/`: Reusable UI pieces (Navbar, Footer, Event Cards, etc.).
- `src/models/`: MongoDB Schemas (Event, SiteData, AdminUser).

### Important Developer Notes
- **Image Optimization:** Because we use external Google Drive links (`lh3.googleusercontent.com`), Next.js's built-in image optimization can sometimes throw errors. To bypass this, we use the `unoptimized={image.src.startsWith("http")}` prop on our `<Image>` tags. If you add new images in the future, remember this!
- **Hydration Errors:** If you edit JSX text, avoid mixing HTML entities (like `&gt;`) with JSX text nodes. Keep it as single Javascript string literals (e.g. `{">_ Text"}`) to prevent server-client hydration mismatches.
- **Theme Script:** The site uses `next-themes`. In development mode, you might see a console warning about an injected `<script>` tag. This is completely harmless and prevents the site from flashing white on load. It will not break production.

---

Maintain the club's legacy well. Happy coding! 🚀
