const mongoose = require("mongoose");
const { createClient } = require("@supabase/supabase-js");
const crypto = require("crypto");

// Configuration
const mongoUri = process.env.MONGODB_URI || "mongodb+srv://fossgcee_db_user:Bofje83N8eVxQqDz@foss-website.rjwmdp2.mongodb.net/?appName=foss-website";
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://lcztqoqleygtgtpmmetw.supabase.co";
// Since RLS is disabled, anon key works for inserts, but we can also use service role key
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxjenRxb3FsZXlndGd0cG1tZXR3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQyOTA1OTYsImV4cCI6MjA5OTg2NjU5Nn0.6mUz9lseEJICmBfvWr91MdOZ_6oBySdsKXtZzcqo7Gw";

const supabase = createClient(supabaseUrl, supabaseKey);

function toUUID(mongoId) {
  if (!mongoId) return null;
  const idStr = mongoId.toString();
  const hash = crypto.createHash("sha1").update(idStr).digest("hex");
  const part1 = hash.substring(0, 8);
  const part2 = hash.substring(8, 12);
  const part3 = "5" + hash.substring(13, 16);
  const variantChar = ["8", "9", "a", "b"][parseInt(hash.substring(16, 17), 16) % 4];
  const part4 = variantChar + hash.substring(17, 20);
  const part5 = hash.substring(20, 32);
  return `${part1}-${part2}-${part3}-${part4}-${part5}`;
}

async function migrate() {
  console.log("Connecting to MongoDB...");
  await mongoose.connect(mongoUri);
  const db = mongoose.connection.db;
  console.log("Connected to MongoDB database.");

  // Clear existing Supabase tables (optional but useful for a clean migration)
  console.log("Clearing existing Supabase data...");
  await supabase.from("feedbacks").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  await supabase.from("event_registrations").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  await supabase.from("events").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  await supabase.from("contributions").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  await supabase.from("blog_posts").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  await supabase.from("blog_categories").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  await supabase.from("registrations").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  await supabase.from("site_configs").delete().neq("section", "dummy");
  console.log("Supabase tables cleared.");

  // 1. Migrate Site Configs
  console.log("Migrating site configs...");
  const siteConfigs = await db.collection("siteconfigs").find({}).toArray();
  for (const sc of siteConfigs) {
    const { error } = await supabase.from("site_configs").insert({
      section: sc.section,
      data: sc.data,
      created_at: sc.createdAt || new Date().toISOString(),
      updated_at: sc.updatedAt || new Date().toISOString()
    });
    if (error) console.error("Error migrating site config:", error);
  }
  console.log(`Migrated ${siteConfigs.length} site configs.`);

  // 2. Migrate Registrations (Members / Accounts)
  console.log("Migrating registrations...");
  const registrations = await db.collection("registrations").find({}).toArray();
  const regIds = new Set(registrations.map(r => r._id.toString()));

  // Ensure contributions memberIds exist in registrations
  const contributions = await db.collection("contributions").find({}).toArray();
  for (const c of contributions) {
    const mIdStr = c.memberId.toString();
    if (!regIds.has(mIdStr)) {
      console.log(`Found missing memberId in contributions: ${mIdStr}. Creating placeholder registration...`);
      registrations.push({
        _id: c.memberId,
        name: "Abesh (Abez-B)",
        email: "abesh.placeholder@gcee.ac.in",
        linkedin: "https://github.com/Abez-B",
        phone: "+910000000000",
        year: "Alumni",
        department: "Information Technology",
        otpVerified: true,
        approved: true,
        role: "Member",
        createdAt: c.createdAt,
        updatedAt: c.updatedAt
      });
      regIds.add(mIdStr);
    }
  }

  const regPayloads = registrations.map(r => ({
    id: toUUID(r._id),
    name: r.name,
    email: r.email,
    linkedin: r.linkedin,
    phone: r.phone,
    year: r.year,
    department: r.department,
    otp_verified: r.otpVerified || false,
    approved: r.approved || false,
    role: r.role || "Member",
    created_at: r.createdAt || new Date().toISOString(),
    updated_at: r.updatedAt || new Date().toISOString()
  }));
  if (regPayloads.length > 0) {
    const { error } = await supabase.from("registrations").insert(regPayloads);
    if (error) {
      console.error("Error migrating registrations:", error);
      // Try migrating one by one to print which row failed
      for (const payload of regPayloads) {
        const { error: singleErr } = await supabase.from("registrations").insert(payload);
        if (singleErr) console.error("Failed payload:", payload, "Error:", singleErr);
      }
    }
  }
  console.log(`Migrated ${registrations.length} registrations.`);

  // 3. Migrate Blog Categories
  console.log("Migrating blog categories...");
  const blogcategories = await db.collection("blogcategories").find({}).toArray();
  const catPayloads = blogcategories.map(c => ({
    id: toUUID(c._id),
    name: c.name,
    slug: c.slug,
    created_at: c.createdAt || new Date().toISOString(),
    updated_at: c.updatedAt || new Date().toISOString()
  }));
  if (catPayloads.length > 0) {
    const { error } = await supabase.from("blog_categories").insert(catPayloads);
    if (error) console.error("Error migrating blog categories:", error);
  }
  console.log(`Migrated ${blogcategories.length} blog categories.`);

  // 4. Migrate Blog Posts
  console.log("Migrating blog posts...");
  const blogposts = await db.collection("blogposts").find({}).toArray();
  const postPayloads = blogposts.map(p => ({
    id: toUUID(p._id),
    title: p.title,
    slug: p.slug,
    content: p.content,
    excerpt: p.excerpt || null,
    cover_image: p.coverImage || null,
    category_id: toUUID(p.category),
    author: p.author,
    status: p.status || "draft",
    published_at: p.publishedAt || null,
    created_at: p.createdAt || new Date().toISOString(),
    updated_at: p.updatedAt || new Date().toISOString()
  }));
  if (postPayloads.length > 0) {
    const { error } = await supabase.from("blog_posts").insert(postPayloads);
    if (error) console.error("Error migrating blog posts:", error);
  }
  console.log(`Migrated ${blogposts.length} blog posts.`);

  // 5. Migrate Contributions
  console.log("Migrating contributions...");
  const contributionsList = await db.collection("contributions").find({}).toArray();
  const contribPayloads = contributionsList.map(c => ({
    id: toUUID(c._id),
    member_id: toUUID(c.memberId),
    title: c.title,
    description: c.description,
    url: c.url || null,
    links: c.links || [],
    image_url: c.imageUrl || null,
    is_featured: c.isFeatured || false,
    order: c.order || 0,
    created_at: c.createdAt || new Date().toISOString(),
    updated_at: c.updatedAt || new Date().toISOString()
  }));
  if (contribPayloads.length > 0) {
    const { error } = await supabase.from("contributions").insert(contribPayloads);
    if (error) console.error("Error migrating contributions:", error);
  }
  console.log(`Migrated ${contributions.length} contributions.`);

  // 6. Migrate Feedbacks
  console.log("Migrating feedbacks...");
  const feedbacks = await db.collection("feedbacks").find({}).toArray();
  const feedPayloads = feedbacks.map(f => ({
    id: toUUID(f._id),
    name: f.name || null,
    email: f.email || null,
    year: f.year,
    department: f.department,
    event_name: f.eventName,
    rating: f.rating,
    comments: f.comments || null,
    created_at: f.createdAt || new Date().toISOString(),
    updated_at: f.updatedAt || new Date().toISOString()
  }));
  if (feedPayloads.length > 0) {
    const { error } = await supabase.from("feedbacks").insert(feedPayloads);
    if (error) console.error("Error migrating feedbacks:", error);
  }
  console.log(`Migrated ${feedbacks.length} feedbacks.`);

  // 7. Migrate Events and Event Registrations
  console.log("Migrating events and event registrations...");
  const events = await db.collection("events").find({}).toArray();
  for (const ev of events) {
    const evId = toUUID(ev._id);
    const { error: evError } = await supabase.from("events").insert({
      id: evId,
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
      poster: ev.poster || null,
      photos: ev.photos || [],
      gallery_link: ev.galleryLink || "",
      status: ev.status || "upcoming",
      manual_status: ev.manualStatus || false,
      is_featured: ev.isFeatured || false,
      registrations_count: ev.registrationsCount || 0,
      created_at: ev.createdAt || new Date().toISOString(),
      updated_at: ev.updatedAt || new Date().toISOString()
    });
    if (evError) {
      console.error("Error migrating event:", ev.title, evError);
      continue;
    }

    if (ev.registrations && ev.registrations.length > 0) {
      const regPayloads = ev.registrations.map(reg => ({
        id: toUUID(reg._id),
        event_id: evId,
        name: reg.name,
        department: reg.department,
        college: reg.college,
        year: Number(reg.year),
        mobile: reg.mobile || "Unknown",
        email: reg.email.toLowerCase().trim(),
        registered_at: reg.registeredAt || new Date().toISOString()
      }));

      const { error: regError } = await supabase.from("event_registrations").insert(regPayloads);
      if (regError) {
        console.error(`Error migrating event registrations for ${ev.title}:`, regError);
        for (const payload of regPayloads) {
          const { error: singleRegErr } = await supabase.from("event_registrations").insert(payload);
          if (singleRegErr) console.error("Failed event registration payload:", payload, "Error:", singleRegErr);
        }
      }
    }
  }
  console.log(`Migrated ${events.length} events and their registrations.`);

  console.log("Migration complete!");
}

migrate()
  .catch(console.error)
  .finally(() => mongoose.disconnect());
