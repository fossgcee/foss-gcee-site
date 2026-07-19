# MongoDB to Supabase Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate the application database and authentication session persistence from MongoDB to Supabase Postgres, including user records, site configuration sections, blog categories/posts, contributions, events, and feedback.

**Architecture:** Create Postgres tables matching existing MongoDB models in Supabase. Update the Next.js API routes and server actions to use `@supabase/supabase-js` to perform queries instead of Mongoose. Create a data migration script to copy all existing records.

**Tech Stack:** Next.js (App Router), `@supabase/supabase-js`, PostgreSQL, TypeScript, Mongoose.

---

## 1. File Structure Changes

We will create the following files:
- `src/lib/supabase.ts`: Central client initializer.
- `src/scripts/migrate-data.ts`: CLI script to pull data from MongoDB and upload to Supabase.
- `src/services/siteConfig.ts`: Functions for reading/writing site configuration.
- `src/services/member.ts`: Functions for member query operations.
- `src/services/otp.ts`: Functions for managing signup OTP codes.
- `src/services/contribution.ts`: Functions for student projects/contributions.
- `src/services/blog.ts`: Functions for blogs and categories.
- `src/services/event.ts`: Functions for event details and registration listing.
- `src/services/feedback.ts`: Functions for submitting/getting event feedback.

---

### Task 1: Supabase CLI / Schema Migration

**Files:**
- Create: `supabase/migrations/20260717000000_init.sql`

- [ ] **Step 1: Write SQL Migration File**
  Create the migration file containing table declarations, update triggers, and the event registration synchronization trigger.

  ```sql
  -- supabase/migrations/20260717000000_init.sql
  CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

  CREATE OR REPLACE FUNCTION public.update_updated_at_column()
  RETURNS TRIGGER AS $$
  BEGIN
      NEW.updated_at = now();
      RETURN NEW;
  END;
  $$ LANGUAGE plpgsql;

  CREATE TABLE public.site_configs (
      section TEXT PRIMARY KEY CHECK (section IN ('hero', 'about', 'whatwedo', 'boardmembers', 'gallery', 'footer')),
      data JSONB NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
  );

  CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.site_configs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

  CREATE TABLE public.registrations (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      linkedin TEXT NOT NULL,
      phone TEXT NOT NULL,
      year TEXT NOT NULL,
      department TEXT NOT NULL,
      otp_verified BOOLEAN DEFAULT false NOT NULL,
      approved BOOLEAN DEFAULT false NOT NULL,
      role TEXT DEFAULT 'Member'::text NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
  );

  CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.registrations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

  CREATE TABLE public.otp_sessions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT,
      email TEXT NOT NULL UNIQUE,
      linkedin TEXT,
      phone TEXT,
      year TEXT,
      department TEXT,
      otp TEXT NOT NULL,
      otp_expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
      otp_attempts INTEGER DEFAULT 0 NOT NULL,
      otp_locked_until TIMESTAMP WITH TIME ZONE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
  );

  CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.otp_sessions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

  CREATE TABLE public.contributions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      member_id UUID NOT NULL REFERENCES public.registrations(id) ON DELETE CASCADE,
      title VARCHAR(100) NOT NULL,
      description TEXT NOT NULL,
      url TEXT,
      links JSONB DEFAULT '[]'::jsonb NOT NULL,
      image_url TEXT,
      is_featured BOOLEAN DEFAULT false NOT NULL,
      "order" INTEGER DEFAULT 0 NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
  );

  CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.contributions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

  CREATE TABLE public.blog_categories (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
  );

  CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.blog_categories FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

  CREATE TABLE public.blog_posts (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      title TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      content TEXT NOT NULL,
      excerpt TEXT,
      cover_image TEXT,
      category_id UUID NOT NULL REFERENCES public.blog_categories(id) ON DELETE RESTRICT,
      author TEXT NOT NULL,
      status TEXT DEFAULT 'draft'::text NOT NULL CHECK (status IN ('draft', 'published')),
      published_at TIMESTAMP WITH TIME ZONE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
  );

  CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.blog_posts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

  CREATE TABLE public.events (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      title TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      description TEXT NOT NULL,
      agenda JSONB DEFAULT '[]'::jsonb NOT NULL,
      outcomes TEXT DEFAULT ''::text NOT NULL,
      academic_year TEXT NOT NULL,
      start_date TEXT NOT NULL,
      end_date TEXT NOT NULL,
      start_time TEXT NOT NULL,
      end_time TEXT NOT NULL,
      venue TEXT NOT NULL,
      category TEXT NOT NULL CHECK (category IN ('workshop', 'talk', 'hackathon', 'meetup', 'other')),
      handled_by TEXT NOT NULL,
      organizers TEXT[] DEFAULT '{}'::text[] NOT NULL,
      poster TEXT,
      photos TEXT[] DEFAULT '{}'::text[] NOT NULL,
      gallery_link TEXT DEFAULT ''::text NOT NULL,
      status TEXT DEFAULT 'upcoming'::text NOT NULL CHECK (status IN ('upcoming', 'completed', 'draft')),
      manual_status BOOLEAN DEFAULT false NOT NULL,
      is_featured BOOLEAN DEFAULT false NOT NULL,
      registrations_count INTEGER DEFAULT 0 NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
  );

  CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.events FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

  CREATE TABLE public.event_registrations (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      department TEXT NOT NULL,
      college TEXT NOT NULL,
      year INTEGER NOT NULL,
      mobile TEXT NOT NULL,
      email TEXT NOT NULL,
      registered_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
      UNIQUE (event_id, email)
  );

  CREATE TABLE public.feedbacks (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT,
      email TEXT,
      year INTEGER NOT NULL,
      department TEXT NOT NULL,
      event_name TEXT NOT NULL,
      rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
      comments TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
  );

  CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.feedbacks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

  CREATE OR REPLACE FUNCTION public.sync_event_registrations_count()
  RETURNS TRIGGER AS $$
  BEGIN
      IF (TG_OP = 'INSERT') THEN
          UPDATE public.events 
          SET registrations_count = registrations_count + 1 
          WHERE id = NEW.event_id;
      ELSIF (TG_OP = 'DELETE') THEN
          UPDATE public.events 
          SET registrations_count = GREATEST(0, registrations_count - 1) 
          WHERE id = OLD.event_id;
      END IF;
      RETURN NULL;
  END;
  $$ LANGUAGE plpgsql;

  CREATE TRIGGER trg_sync_event_registrations_count
  AFTER INSERT OR DELETE ON public.event_registrations
  FOR EACH ROW EXECUTE FUNCTION public.sync_event_registrations_count();
  ```

- [ ] **Step 2: Apply Migration to Development Database**
  Run the SQL migration on the Supabase instance using MCP or terminal command.
  Expected: Tables successfully deployed.

- [ ] **Step 3: Commit**
  ```bash
  git add supabase/migrations/20260717000000_init.sql
  git commit -m "db: initialize supabase tables schema"
  ```

---

### Task 2: Supabase Client SDK setup

**Files:**
- Create: `src/lib/supabase.ts`
- Modify: `package.json`
- Modify: `.env.local`

- [ ] **Step 1: Install `@supabase/supabase-js`**
  Run: `npm install @supabase/supabase-js`

- [ ] **Step 2: Create Supabase client file**
  Create `src/lib/supabase.ts` with server-side service role client.

  ```typescript
  import { createClient } from "@supabase/supabase-js";

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error("Missing Supabase environment configurations.");
  }

  export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      persistSession: false,
    },
  });
  ```

- [ ] **Step 3: Set Environment Variables**
  Update `.env.local` to define:
  ```env
  NEXT_PUBLIC_SUPABASE_URL="https://lcztqoqleygtgtpmmetw.supabase.co"
  SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
  ```

- [ ] **Step 4: Commit**
  ```bash
  git add package.json src/lib/supabase.ts
  git commit -m "feat: install supabase js client and configure initialization helper"
  ```

---

### Task 3: Data Access Services Integration

We create service utility files in `src/services/` to abstract the query translations from Next.js endpoints.

**Files:**
- Create: `src/services/siteConfig.ts`
- Create: `src/services/member.ts`
- Create: `src/services/otp.ts`
- Create: `src/services/contribution.ts`
- Create: `src/services/blog.ts`
- Create: `src/services/event.ts`
- Create: `src/services/feedback.ts`

- [ ] **Step 1: Write `src/services/siteConfig.ts`**
  ```typescript
  import { supabase } from "@/lib/supabase";

  export async function getSiteConfig(section: string) {
    const { data, error } = await supabase
      .from("site_configs")
      .select("data")
      .eq("section", section)
      .single();
    if (error) return null;
    return data.data;
  }

  export async function updateSiteConfig(section: string, configData: any) {
    const { data, error } = await supabase
      .from("site_configs")
      .upsert({ section, data: configData, updated_at: new Date().toISOString() })
      .select()
      .single();
    if (error) throw error;
    return data.data;
  }
  ```

- [ ] **Step 2: Write `src/services/member.ts`**
  ```typescript
  import { supabase } from "@/lib/supabase";

  export async function getMembers(filters: { search?: string; verified?: boolean; approved?: boolean }) {
    let query = supabase.from("registrations").select("*");
    
    if (filters.search) {
      const s = `%${filters.search}%`;
      query = query.or(`name.ilike.${s},email.ilike.${s},department.ilike.${s},year.ilike.${s}`);
    }
    if (filters.verified !== undefined) {
      query = query.eq("otp_verified", filters.verified);
    }
    if (filters.approved !== undefined) {
      query = query.eq("approved", filters.approved);
    }
    
    const { data, error } = await query.order("created_at", { ascending: false });
    if (error) throw error;
    return data;
  }

  export async function updateMember(id: string, updates: any) {
    const mapped: any = {};
    if (updates.name !== undefined) mapped.name = updates.name;
    if (updates.email !== undefined) mapped.email = updates.email;
    if (updates.phone !== undefined) mapped.phone = updates.phone;
    if (updates.linkedin !== undefined) mapped.linkedin = updates.linkedin;
    if (updates.year !== undefined) mapped.year = updates.year;
    if (updates.department !== undefined) mapped.department = updates.department;
    if (updates.otpVerified !== undefined) mapped.otp_verified = updates.otpVerified;
    if (updates.approved !== undefined) mapped.approved = updates.approved;
    if (updates.role !== undefined) mapped.role = updates.role;

    const { data, error } = await supabase
      .from("registrations")
      .update(mapped)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  export async function deleteMember(id: string) {
    const { error } = await supabase.from("registrations").delete().eq("id", id);
    if (error) throw error;
  }
  ```

- [ ] **Step 3: Write `src/services/otp.ts`**
  ```typescript
  import { supabase } from "@/lib/supabase";

  export async function getOtpSession(email: string) {
    await supabase.from("otp_sessions").delete().lt("otp_expires_at", new Date().toISOString());

    const { data, error } = await supabase
      .from("otp_sessions")
      .select("*")
      .eq("email", email.toLowerCase().trim())
      .maybeSingle();
    if (error) throw error;
    return data;
  }

  export async function upsertOtpSession(session: any) {
    const { data, error } = await supabase
      .from("otp_sessions")
      .upsert({
        name: session.name,
        email: session.email.toLowerCase().trim(),
        linkedin: session.linkedin,
        phone: session.phone,
        year: session.year,
        department: session.department,
        otp: session.otp,
        otp_expires_at: session.otpExpiresAt,
        otp_attempts: session.otpAttempts ?? 0,
        otp_locked_until: session.otpLockedUntil,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  export async function deleteOtpSession(email: string) {
    const { error } = await supabase.from("otp_sessions").delete().eq("email", email.toLowerCase().trim());
    if (error) throw error;
  }
  ```

- [ ] **Step 4: Write `src/services/contribution.ts`**
  ```typescript
  import { supabase } from "@/lib/supabase";

  export async function getContributions() {
    const { data, error } = await supabase
      .from("contributions")
      .select("*, member:registrations(name, department, year)")
      .order("order", { ascending: true })
      .order("created_at", { ascending: false });
    if (error) throw error;

    return data.map(item => ({
      _id: item.id,
      memberId: item.member_id,
      title: item.title,
      description: item.description,
      url: item.url,
      links: item.links,
      imageUrl: item.image_url,
      isFeatured: item.is_featured,
      order: item.order,
      createdAt: item.created_at,
      updatedAt: item.updated_at,
      // Map joined member fields to populate interface
      memberIdPopulated: item.member
    }));
  }

  export async function addContribution(contrib: any) {
    const { data, error } = await supabase
      .from("contributions")
      .insert({
        member_id: contrib.memberId,
        title: contrib.title,
        description: contrib.description,
        url: contrib.url,
        links: contrib.links || [],
        image_url: contrib.imageUrl,
        is_featured: contrib.isFeatured || false,
        order: contrib.order || 0
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  export async function updateContribution(id: string, updates: any) {
    const mapped: any = {};
    if (updates.title !== undefined) mapped.title = updates.title;
    if (updates.description !== undefined) mapped.description = updates.description;
    if (updates.url !== undefined) mapped.url = updates.url;
    if (updates.links !== undefined) mapped.links = updates.links;
    if (updates.imageUrl !== undefined) mapped.image_url = updates.imageUrl;
    if (updates.isFeatured !== undefined) mapped.is_featured = updates.isFeatured;
    if (updates.order !== undefined) mapped.order = updates.order;
    if (updates.memberId !== undefined) mapped.member_id = updates.memberId;

    const { data, error } = await supabase
      .from("contributions")
      .update(mapped)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  export async function deleteContribution(id: string) {
    const { error } = await supabase.from("contributions").delete().eq("id", id);
    if (error) throw error;
  }
  ```

- [ ] **Step 5: Write `src/services/blog.ts`**
  ```typescript
  import { supabase } from "@/lib/supabase";

  export async function getBlogCategories() {
    const { data, error } = await supabase.from("blog_categories").select("*").order("name", { ascending: true });
    if (error) throw error;
    return data;
  }

  export async function addBlogCategory(name: string, slug: string) {
    const { data, error } = await supabase
      .from("blog_categories")
      .insert({ name, slug })
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  export async function updateBlogCategory(id: string, name: string, slug: string) {
    const { data, error } = await supabase
      .from("blog_categories")
      .update({ name, slug })
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  export async function deleteBlogCategory(id: string) {
    const { error } = await supabase.from("blog_categories").delete().eq("id", id);
    if (error) throw error;
  }

  export async function getBlogPosts(filters?: { status?: string }) {
    let q = supabase.from("blog_posts").select("*, category:blog_categories(name, slug)");
    if (filters?.status) {
      q = q.eq("status", filters.status);
    }
    const { data, error } = await q.order("published_at", { ascending: false });
    if (error) throw error;
    return data;
  }

  export async function getBlogPostBySlug(slug: string) {
    const { data, error } = await supabase
      .from("blog_posts")
      .select("*, category:blog_categories(name, slug)")
      .eq("slug", slug.toLowerCase().trim())
      .maybeSingle();
    if (error) throw error;
    return data;
  }

  export async function addBlogPost(post: any) {
    const { data, error } = await supabase
      .from("blog_posts")
      .insert({
        title: post.title,
        slug: post.slug.toLowerCase().trim(),
        content: post.content,
        excerpt: post.excerpt,
        cover_image: post.coverImage,
        category_id: post.category,
        author: post.author,
        status: post.status || "draft",
        published_at: post.publishedAt
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  export async function updateBlogPost(id: string, post: any) {
    const mapped: any = {};
    if (post.title !== undefined) mapped.title = post.title;
    if (post.slug !== undefined) mapped.slug = post.slug.toLowerCase().trim();
    if (post.content !== undefined) mapped.content = post.content;
    if (post.excerpt !== undefined) mapped.excerpt = post.excerpt;
    if (post.coverImage !== undefined) mapped.cover_image = post.coverImage;
    if (post.category !== undefined) mapped.category_id = post.category;
    if (post.author !== undefined) mapped.author = post.author;
    if (post.status !== undefined) mapped.status = post.status;
    if (post.publishedAt !== undefined) mapped.published_at = post.publishedAt;

    const { data, error } = await supabase
      .from("blog_posts")
      .update(mapped)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  export async function deleteBlogPost(id: string) {
    const { error } = await supabase.from("blog_posts").delete().eq("id", id);
    if (error) throw error;
  }
  ```

- [ ] **Step 6: Write `src/services/event.ts`**
  ```typescript
  import { supabase } from "@/lib/supabase";

  export async function getEvents(filters?: { status?: string; isFeatured?: boolean }) {
    let q = supabase.from("events").select("*");
    if (filters?.status) q = q.eq("status", filters.status);
    if (filters?.isFeatured !== undefined) q = q.eq("is_featured", filters.isFeatured);
    
    const { data, error } = await q.order("start_date", { ascending: false });
    if (error) throw error;
    return data;
  }

  export async function getEventBySlug(slug: string) {
    const { data, error } = await supabase.from("events").select("*").eq("slug", slug.toLowerCase().trim()).maybeSingle();
    if (error) throw error;
    return data;
  }

  export async function addEvent(ev: any) {
    const { data, error } = await supabase
      .from("events")
      .insert({
        title: ev.title,
        slug: ev.slug.toLowerCase().trim(),
        description: ev.description,
        agenda: ev.agenda || [],
        outcomes: ev.outcomes || "",
        academic_year: ev.academicYear,
        start_date: ev.startDate,
        end_date: ev.endDate,
        start_time: ev.startTime,
        end_time: ev.endTime,
        venue: ev.venue,
        category: ev.category,
        handled_by: ev.handledBy,
        organizers: ev.organizers || [],
        poster: ev.poster,
        photos: ev.photos || [],
        gallery_link: ev.galleryLink || "",
        status: ev.status || "upcoming",
        manual_status: ev.manualStatus || false,
        is_featured: ev.isFeatured || false
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  export async function updateEvent(id: string, ev: any) {
    const mapped: any = {};
    if (ev.title !== undefined) mapped.title = ev.title;
    if (ev.slug !== undefined) mapped.slug = ev.slug.toLowerCase().trim();
    if (ev.description !== undefined) mapped.description = ev.description;
    if (ev.agenda !== undefined) mapped.agenda = ev.agenda;
    if (ev.outcomes !== undefined) mapped.outcomes = ev.outcomes;
    if (ev.academicYear !== undefined) mapped.academic_year = ev.academicYear;
    if (ev.startDate !== undefined) mapped.start_date = ev.startDate;
    if (ev.endDate !== undefined) mapped.end_date = ev.endDate;
    if (ev.startTime !== undefined) mapped.start_time = ev.startTime;
    if (ev.endTime !== undefined) mapped.end_time = ev.endTime;
    if (ev.venue !== undefined) mapped.venue = ev.venue;
    if (ev.category !== undefined) mapped.category = ev.category;
    if (ev.handledBy !== undefined) mapped.handled_by = ev.handledBy;
    if (ev.organizers !== undefined) mapped.organizers = ev.organizers;
    if (ev.poster !== undefined) mapped.poster = ev.poster;
    if (ev.photos !== undefined) mapped.photos = ev.photos;
    if (ev.galleryLink !== undefined) mapped.gallery_link = ev.galleryLink;
    if (ev.status !== undefined) mapped.status = ev.status;
    if (ev.manualStatus !== undefined) mapped.manual_status = ev.manualStatus;
    if (ev.isFeatured !== undefined) mapped.is_featured = ev.isFeatured;

    const { data, error } = await supabase
      .from("events")
      .update(mapped)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  export async function deleteEvent(id: string) {
    const { error } = await supabase.from("events").delete().eq("id", id);
    if (error) throw error;
  }

  export async function addEventRegistration(eventId: string, reg: any) {
    const { data, error } = await supabase
      .from("event_registrations")
      .insert({
        event_id: eventId,
        name: reg.name,
        department: reg.department,
        college: reg.college,
        year: Number(reg.year),
        mobile: reg.mobile,
        email: reg.email.toLowerCase().trim()
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  export async function getEventRegistrations(eventId: string) {
    const { data, error } = await supabase
      .from("event_registrations")
      .select("*")
      .eq("event_id", eventId)
      .order("registered_at", { ascending: false });
    if (error) throw error;
    return data;
  }
  ```

- [ ] **Step 7: Write `src/services/feedback.ts`**
  ```typescript
  import { supabase } from "@/lib/supabase";

  export async function addFeedback(fb: any) {
    const { data, error } = await supabase
      .from("feedbacks")
      .insert({
        name: fb.name,
        email: fb.email,
        year: Number(fb.year),
        department: fb.department,
        event_name: fb.eventName,
        rating: Number(fb.rating),
        comments: fb.comments
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  export async function getFeedbacks() {
    const { data, error } = await supabase.from("feedbacks").select("*").order("created_at", { ascending: false });
    if (error) throw error;
    return data;
  }
  ```

- [ ] **Step 8: Commit**
  ```bash
  git add src/services/
  git commit -m "feat: implement data-access services for site configuration, members, otp, events, and blogs"
  ```

---

### Task 4: API Endpoint Adaptations

Update the Next.js API endpoints to call our new Services wrappers.

**Files:**
- Modify: `src/app/api/site-config/route.ts`
- Modify: `src/app/api/admin/site-config/route.ts`
- Modify: `src/app/api/contributions/route.ts`
- Modify: `src/app/api/admin/contributions/route.ts`
- Modify: `src/app/api/admin/contributions/[id]/route.ts`
- Modify: `src/app/api/admin/members/route.ts`
- Modify: `src/app/api/feedback/route.ts`
- Modify: `src/app/api/admin/feedback/route.ts`

- [ ] **Step 1: Replace Mongoose logic in `src/app/api/site-config/route.ts`**
  Ensure we import `getSiteConfig` and call it instead of `SiteConfig.findOne({ section })`. Count contributions using `supabase.from("contributions").count()`.
  
- [ ] **Step 2: Replace Mongoose logic in `src/app/api/admin/site-config/route.ts`**
  Use `updateSiteConfig` function.

- [ ] **Step 3: Replace Mongoose logic in `src/app/api/contributions/route.ts`**
  Call `getContributions` service.

- [ ] **Step 4: Replace Mongoose logic in `src/app/api/admin/contributions/route.ts`**
  Call `addContribution` service.

- [ ] **Step 5: Replace Mongoose logic in `src/app/api/admin/contributions/[id]/route.ts`**
  Call `updateContribution` / `deleteContribution` service.

- [ ] **Step 6: Replace Mongoose logic in `src/app/api/admin/members/route.ts`**
  Call `getMembers` / `updateMember` / `deleteMember` service.

- [ ] **Step 7: Replace Mongoose logic in `src/app/api/feedback/route.ts` and `src/app/api/admin/feedback/route.ts`**
  Call `addFeedback` / `getFeedbacks` service.

- [ ] **Step 8: Commit**
  ```bash
  git add src/app/api/
  git commit -m "refactor: transition public and admin api routes for site-config, contributions, members, and feedback"
  ```

---

### Task 5: Blogs, Categories & Event Routes

Update the API endpoints for blogs and events.

**Files:**
- Modify: `src/app/api/blogs/route.ts`
- Modify: `src/app/api/blogs/[slug]/route.ts`
- Modify: `src/app/api/admin/blogs/route.ts`
- Modify: `src/app/api/admin/blogs/[id]/route.ts`
- Modify: `src/app/api/admin/blogs/categories/route.ts`
- Modify: `src/app/api/admin/blogs/categories/[id]/route.ts`
- Modify: `src/app/api/events/route.ts`
- Modify: `src/app/api/admin/events/route.ts`
- Modify: `src/app/api/admin/events/[id]/route.ts`
- Modify: `src/app/api/events/register/route.ts`
- Modify: `src/app/api/admin/events/registrations/route.ts`

- [ ] **Step 1: Update public and admin Blog routes**
  Replace Mongoose imports/queries with `getBlogPosts`, `getBlogPostBySlug`, `addBlogPost`, `updateBlogPost`, and `deleteBlogPost`.

- [ ] **Step 2: Update Blog Category routes**
  Replace with `getBlogCategories`, `addBlogCategory`, `updateBlogCategory`, and `deleteBlogCategory`.

- [ ] **Step 3: Update public Events query and registration routes**
  Replace with `getEvents`, `getEventBySlug`, `addEventRegistration`.

- [ ] **Step 4: Update admin Events management routes**
  Replace with `addEvent`, `updateEvent`, `deleteEvent`, `getEventRegistrations`.

- [ ] **Step 5: Commit**
  ```bash
  git add src/app/api/
  git commit -m "refactor: update blogs, blog categories, events, and event registration api endpoints"
  ```

---

### Task 6: OTP signup route replacements

**Files:**
- Modify: `src/app/api/register/send-otp/route.ts`
- Modify: `src/app/api/register/verify-otp/route.ts`

- [ ] **Step 1: Replace Mongoose in `send-otp/route.ts`**
  Use `getOtpSession` / `upsertOtpSession` from `src/services/otp.ts` to manage OTP codes.

- [ ] **Step 2: Replace Mongoose in `verify-otp/route.ts`**
  Verify the token using `getOtpSession`. Then insert a new registration row inside the `registrations` table using the `supabase` client.

- [ ] **Step 3: Commit**
  ```bash
  git add src/app/api/register/
  git commit -m "refactor: rewrite send-otp and verify-otp registration routes using supabase client"
  ```

---

### Task 7: Data Migration CLI Script

**Files:**
- Create: `src/scripts/migrate-data.ts`
- Modify: `package.json`

- [ ] **Step 1: Write Migration CLI Script**
  Use Mongoose to connect to `process.env.MONGODB_URI` and Supabase Service role client.
  Dynamically map MongoDB Hex String IDs to UUIDv5s so references between schemas are preserved.

  ```typescript
  // src/scripts/migrate-data.ts
  import { MongoClient } from "mongodb";
  import { createClient } from "@supabase/supabase-js";
  import { v5 as uuidv5 } from "uuid";
  import * as dotenv from "dotenv";

  dotenv.config({ path: ".env.local" });

  const NAMESPACE = "6ba7b810-9dad-11d1-80b4-00c04fd430c8"; // Default DNS UUID Namespace

  function toUuid(mongoId: any): string {
    if (!mongoId) return "";
    return uuidv5(mongoId.toString(), NAMESPACE);
  }

  async function migrate() {
    const mongoUri = process.env.MONGODB_URI;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!mongoUri || !supabaseUrl || !supabaseKey) {
      console.error("Missing config in .env.local");
      process.exit(1);
    }

    const mClient = new MongoClient(mongoUri);
    await mClient.connect();
    const mDb = mClient.db();

    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log("--- Starting Migration ---");

    // 1. SiteConfigs
    const siteConfigs = await mDb.collection("siteconfigs").find({}).toArray();
    for (const config of siteConfigs) {
      await supabase.from("site_configs").upsert({
        section: config.section,
        data: config.data,
        created_at: config.createdAt || new Date().toISOString(),
        updated_at: config.updatedAt || new Date().toISOString()
      });
    }
    console.log("Migrated siteconfigs");

    // 2. Registrations (Members)
    const registrations = await mDb.collection("registrations").find({}).toArray();
    for (const reg of registrations) {
      await supabase.from("registrations").upsert({
        id: toUuid(reg._id),
        name: reg.name,
        email: reg.email,
        linkedin: reg.linkedin,
        phone: reg.phone,
        year: reg.year,
        department: reg.department,
        otp_verified: reg.otpVerified || false,
        approved: reg.approved || false,
        role: reg.role || "Member",
        created_at: reg.createdAt || new Date().toISOString(),
        updated_at: reg.updatedAt || new Date().toISOString()
      });
    }
    console.log("Migrated registrations");

    // 3. Contributions
    const contributions = await mDb.collection("contributions").find({}).toArray();
    for (const contr of contributions) {
      await supabase.from("contributions").upsert({
        id: toUuid(contr._id),
        member_id: toUuid(contr.memberId),
        title: contr.title,
        description: contr.description,
        url: contr.url,
        links: contr.links || [],
        image_url: contr.imageUrl,
        is_featured: contr.isFeatured || false,
        order: contr.order || 0,
        created_at: contr.createdAt || new Date().toISOString(),
        updated_at: contr.updatedAt || new Date().toISOString()
      });
    }
    console.log("Migrated contributions");

    // 4. BlogCategories
    const categories = await mDb.collection("blogcategories").find({}).toArray();
    for (const cat of categories) {
      await supabase.from("blog_categories").upsert({
        id: toUuid(cat._id),
        name: cat.name,
        slug: cat.slug,
        created_at: cat.createdAt || new Date().toISOString(),
        updated_at: cat.updatedAt || new Date().toISOString()
      });
    }
    console.log("Migrated blog categories");

    // 5. BlogPosts
    const posts = await mDb.collection("blogposts").find({}).toArray();
    for (const post of posts) {
      await supabase.from("blog_posts").upsert({
        id: toUuid(post._id),
        title: post.title,
        slug: post.slug,
        content: post.content,
        excerpt: post.excerpt,
        cover_image: post.coverImage,
        category_id: toUuid(post.category),
        author: post.author,
        status: post.status || "draft",
        published_at: post.publishedAt,
        created_at: post.createdAt || new Date().toISOString(),
        updated_at: post.updatedAt || new Date().toISOString()
      });
    }
    console.log("Migrated blog posts");

    // 6. Events & Registrations
    const events = await mDb.collection("events").find({}).toArray();
    for (const ev of events) {
      const eventId = toUuid(ev._id);
      await supabase.from("events").upsert({
        id: eventId,
        title: ev.title,
        slug: ev.slug,
        description: ev.description,
        agenda: ev.agenda || [],
        outcomes: ev.outcomes || "",
        academic_year: ev.academicYear,
        start_date: ev.startDate,
        end_date: ev.endDate,
        start_time: ev.startTime,
        end_time: ev.endTime,
        venue: ev.venue,
        category: ev.category,
        handled_by: ev.handledBy,
        organizers: ev.organizers || [],
        poster: ev.poster,
        photos: ev.photos || [],
        gallery_link: ev.galleryLink || "",
        status: ev.status || "upcoming",
        manual_status: ev.manualStatus || false,
        is_featured: ev.isFeatured || false,
        registrations_count: 0, -- trigger will calculate this dynamically
        created_at: ev.createdAt || new Date().toISOString(),
        updated_at: ev.updatedAt || new Date().toISOString()
      });

      if (Array.isArray(ev.registrations)) {
        for (const reg of ev.registrations) {
          await supabase.from("event_registrations").upsert({
            event_id: eventId,
            name: reg.name,
            department: reg.department,
            college: reg.college,
            year: Number(reg.year),
            mobile: reg.mobile,
            email: reg.email,
            registered_at: reg.registeredAt || new Date().toISOString()
          });
        }
      }
    }
    console.log("Migrated events & event registrations");

    // 7. Feedbacks
    const feedbacks = await mDb.collection("feedbacks").find({}).toArray();
    for (const fb of feedbacks) {
      await supabase.from("feedbacks").upsert({
        id: toUuid(fb._id),
        name: fb.name,
        email: fb.email,
        year: Number(fb.year),
        department: fb.department,
        event_name: fb.eventName,
        rating: Number(fb.rating),
        comments: fb.comments,
        created_at: fb.createdAt || new Date().toISOString(),
        updated_at: fb.updatedAt || new Date().toISOString()
      });
    }
    console.log("Migrated feedbacks");

    await mClient.close();
    console.log("--- Migration Completed Successfully ---");
  }

  migrate().catch(console.error);
  ```

- [ ] **Step 2: Add migration script to package.json scripts**
  Add `"migrate-data": "ts-node src/scripts/migrate-data.ts"` (or using node dynamically with build loader).

- [ ] **Step 3: Run migration**
  Run: `npm run migrate-data`
  Verify: Check count in Supabase and ensure output logs print "Migration Completed Successfully".

- [ ] **Step 4: Commit**
  ```bash
  git add src/scripts/migrate-data.ts package.json
  git commit -m "feat: add CLI data migration script to port MongoDB documents to Postgres"
  ```

---

### Task 8: Cleanup and Validation

**Files:**
- Modify: `src/lib/db.ts`
- Modify: delete `src/models/` (delete schemas to clean up code)

- [ ] **Step 1: Remove Mongoose schemas**
  Delete all `.ts` files under `src/models/`.

- [ ] **Step 2: Update `src/lib/db.ts`**
  Nullify `src/lib/db.ts` or make it a dummy export to prevent build breakages if imported, or remove its usage.

- [ ] **Step 3: Build & Start application locally**
  Run: `npm run build`
  Expected: Successful production compile with zero syntax/type errors.

- [ ] **Step 4: Commit**
  ```bash
  git rm -r src/models/
  git add src/lib/db.ts
  git commit -m "cleanup: remove mongoose connection manager and deprecated mongoose schemas"
  ```
