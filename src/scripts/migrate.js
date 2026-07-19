const mongoose = require("mongoose");
const { Client } = require("pg");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

// Load local environment variables
if (fs.existsSync(".env.local")) {
  console.log("Loading .env.local variables...");
  const envFile = fs.readFileSync(".env.local", "utf8");
  envFile.split("\n").forEach(line => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      const key = match[1];
      let value = match[2] || "";
      if (value.startsWith('"') && value.endsWith('"')) {
        value = value.substring(1, value.length - 1);
      } else if (value.startsWith("'") && value.endsWith("'")) {
        value = value.substring(1, value.length - 1);
      }
      process.env[key] = value;
    }
  });
}

// Configuration
const mongoUri = process.env.MONGODB_URI || "mongodb+srv://fossgcee_db_user:Bofje83N8eVxQqDz@foss-website.rjwmdp2.mongodb.net/?appName=foss-website";
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error("Error: DATABASE_URL environment variable is not defined.");
  process.exit(1);
}

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
  const mongoDb = mongoose.connection.db;
  console.log("Connected to MongoDB.");

  console.log("Connecting to Postgres...");
  const pgClient = new Client({ connectionString: databaseUrl });
  await pgClient.connect();
  console.log("Connected to Postgres.");

  // Clear existing tables in correct order of dependency
  console.log("Clearing existing Postgres data...");
  await pgClient.query("DELETE FROM feedbacks");
  await pgClient.query("DELETE FROM event_registrations");
  await pgClient.query("DELETE FROM events");
  await pgClient.query("DELETE FROM contributions");
  await pgClient.query("DELETE FROM blog_posts");
  await pgClient.query("DELETE FROM blog_categories");
  await pgClient.query("DELETE FROM registrations");
  await pgClient.query("DELETE FROM site_configs");
  await pgClient.query("DELETE FROM otp_sessions");
  console.log("Postgres tables cleared.");

  // 1. Migrate Site Configs
  console.log("Migrating site configs...");
  const siteConfigs = await mongoDb.collection("siteconfigs").find({}).toArray();
  for (const sc of siteConfigs) {
    await pgClient.query(
      `INSERT INTO site_configs (section, data, created_at, updated_at) 
       VALUES ($1, $2, $3, $4)`,
      [
        sc.section,
        JSON.stringify(sc.data),
        sc.createdAt || new Date().toISOString(),
        sc.updatedAt || new Date().toISOString()
      ]
    );
  }
  console.log(`Migrated ${siteConfigs.length} site configs.`);

  // 2. Migrate Registrations (Members / Accounts)
  console.log("Migrating registrations...");
  const registrations = await mongoDb.collection("registrations").find({}).toArray();
  const regIds = new Set(registrations.map(r => r._id.toString()));

  // Ensure contributions memberIds exist in registrations
  const contributions = await mongoDb.collection("contributions").find({}).toArray();
  for (const c of contributions) {
    if (!c.memberId) continue;
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

  for (const r of registrations) {
    await pgClient.query(
      `INSERT INTO registrations (id, name, email, linkedin, phone, year, department, otp_verified, approved, role, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
      [
        toUUID(r._id),
        r.name,
        r.email,
        r.linkedin,
        r.phone,
        r.year,
        r.department,
        r.otpVerified || false,
        r.approved || false,
        r.role || "Member",
        r.createdAt || new Date().toISOString(),
        r.updatedAt || new Date().toISOString()
      ]
    );
  }
  console.log(`Migrated ${registrations.length} registrations.`);

  // 3. Migrate Blog Categories
  console.log("Migrating blog categories...");
  const blogcategories = await mongoDb.collection("blogcategories").find({}).toArray();
  for (const c of blogcategories) {
    await pgClient.query(
      `INSERT INTO blog_categories (id, name, slug, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5)`,
      [
        toUUID(c._id),
        c.name,
        c.slug,
        c.createdAt || new Date().toISOString(),
        c.updatedAt || new Date().toISOString()
      ]
    );
  }
  console.log(`Migrated ${blogcategories.length} blog categories.`);

  // 4. Migrate Blog Posts
  console.log("Migrating blog posts...");
  const blogposts = await mongoDb.collection("blogposts").find({}).toArray();
  for (const p of blogposts) {
    await pgClient.query(
      `INSERT INTO blog_posts (id, title, slug, content, excerpt, cover_image, category_id, author, status, published_at, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
      [
        toUUID(p._id),
        p.title,
        p.slug,
        p.content,
        p.excerpt || null,
        p.coverImage || null,
        toUUID(p.category),
        p.author,
        p.status || "draft",
        p.publishedAt || null,
        p.createdAt || new Date().toISOString(),
        p.updatedAt || new Date().toISOString()
      ]
    );
  }
  console.log(`Migrated ${blogposts.length} blog posts.`);

  // 5. Migrate Contributions
  console.log("Migrating contributions...");
  for (const c of contributions) {
    await pgClient.query(
      `INSERT INTO contributions (id, member_id, title, description, url, links, image_url, is_featured, "order", created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
      [
        toUUID(c._id),
        toUUID(c.memberId),
        c.title,
        c.description,
        c.url || null,
        JSON.stringify(c.links || []),
        c.imageUrl || null,
        c.isFeatured || false,
        c.order || 0,
        c.createdAt || new Date().toISOString(),
        c.updatedAt || new Date().toISOString()
      ]
    );
  }
  console.log(`Migrated ${contributions.length} contributions.`);

  // 6. Migrate Feedbacks
  console.log("Migrating feedbacks...");
  const feedbacks = await mongoDb.collection("feedbacks").find({}).toArray();
  for (const f of feedbacks) {
    await pgClient.query(
      `INSERT INTO feedbacks (id, name, email, year, department, event_name, rating, comments, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [
        toUUID(f._id),
        f.name || null,
        f.email || null,
        f.year,
        f.department,
        f.eventName,
        f.rating,
        f.comments || null,
        f.createdAt || new Date().toISOString(),
        f.updatedAt || new Date().toISOString()
      ]
    );
  }
  console.log(`Migrated ${feedbacks.length} feedbacks.`);

  // 7. Migrate Events and Event Registrations
  console.log("Migrating events and event registrations...");
  const events = await mongoDb.collection("events").find({}).toArray();
  for (const ev of events) {
    const evId = toUUID(ev._id);
    await pgClient.query(
      `INSERT INTO events (id, title, slug, description, agenda, outcomes, academic_year, start_date, end_date, start_time, end_time, venue, category, handled_by, organizers, poster, photos, gallery_link, status, manual_status, is_featured, registrations_count, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24)`,
      [
        evId,
        ev.title,
        ev.slug,
        ev.description,
        JSON.stringify(ev.agenda || []),
        ev.outcomes || "",
        ev.academicYear,
        ev.startDate,
        ev.endDate,
        ev.startTime,
        ev.endTime,
        ev.venue,
        ev.category,
        ev.handledBy,
        ev.organizers || [],
        ev.poster || null,
        ev.photos || [],
        ev.galleryLink || "",
        ev.status || "upcoming",
        ev.manualStatus || false,
        ev.isFeatured || false,
        ev.registrationsCount || 0,
        ev.createdAt || new Date().toISOString(),
        ev.updatedAt || new Date().toISOString()
      ]
    );

    if (ev.registrations && ev.registrations.length > 0) {
      for (const reg of ev.registrations) {
        await pgClient.query(
          `INSERT INTO event_registrations (id, event_id, name, department, college, year, mobile, email, registered_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
           ON CONFLICT (event_id, email) DO NOTHING`,
          [
            toUUID(reg._id),
            evId,
            reg.name,
            reg.department,
            reg.college,
            Number(reg.year),
            reg.mobile || "Unknown",
            reg.email.toLowerCase().trim(),
            reg.registeredAt || new Date().toISOString()
          ]
        );
      }
    }
  }
  console.log(`Migrated ${events.length} events and their registrations.`);

  console.log("Migration complete!");
  await pgClient.end();
}

migrate()
  .catch(async (err) => {
    console.error("Migration failed:", err);
    process.exit(1);
  })
  .finally(() => mongoose.disconnect());
