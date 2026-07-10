import mongoose from "mongoose";

// ─── Hero Section ───────────────────────────────────────────────
export interface HeroConfig {
  badge: string;
  description: string;
  ctaPrimaryLabel: string;
  ctaPrimaryHref: string;
  ctaSecondaryLabel: string;
  ctaSecondaryHref: string;
  githubHref: string;
  collegeText: string;
  logoSubtext: string;
}

// ─── About Section ──────────────────────────────────────────────
export interface AboutStat {
  value: string;
  label: string;
}

export interface AboutCard {
  icon: string;
  title: string;
  text: string;
}

export interface AboutConfig {
  stats: AboutStat[];
  cards: AboutCard[];
}

// ─── WhatWeDo Section ───────────────────────────────────────────
export interface Activity {
  icon: string;
  title: string;
  desc: string;
  tag: string;
}

export interface WhatWeDoConfig {
  activities: Activity[];
}

// ─── Board Member ────────────────────────────────────────────────
export interface BoardMember {
  id: string;
  name: string;
  role: string;
  year: string;
  imageUrl: string;
  linkedInUrl?: string;
}

// ─── Gallery Image ───────────────────────────────────────────────
export interface GalleryImage {
  id: string;
  src: string;
  alt?: string;
  year: string;
}

// ─── Social Link ─────────────────────────────────────────────────
export interface SocialLink {
  platform: string;
  href: string;
  active: boolean;
}

// ─── Footer Section ──────────────────────────────────────────────
export interface FooterConfig {
  about: string;
  email: string;
  builtBy: string;
  socials: SocialLink[];
  quickLinks: { label: string; href: string }[];
}

// ─── Site Config Document ────────────────────────────────────────
export interface ISiteConfig extends mongoose.Document {
  section: string;  // "hero" | "about" | "whatwedo" | "boardmembers" | "gallery" | "footer"
  data: Record<string, unknown>;
  updatedAt: Date;
}

const SiteConfigSchema = new mongoose.Schema<ISiteConfig>(
  {
    section: {
      type: String,
      required: true,
      unique: true,
      enum: ["hero", "about", "whatwedo", "boardmembers", "gallery", "footer"],
    },
    data: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.models.SiteConfig ||
  mongoose.model<ISiteConfig>("SiteConfig", SiteConfigSchema);
