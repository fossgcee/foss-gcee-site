# Technical Specification: Blog Feature
**Project:** FOSS Club GCE Erode Website  
**Date:** July 14, 2026

This document specifies the architecture, data models, and API endpoints for adding a Blog section to the FOSS Club GCE Erode website, matching the existing design patterns.

---

## 1. Database Schema

### 1.1 `BlogCategory` Schema
```typescript
import mongoose from "mongoose";

export interface IBlogCategory extends mongoose.Document {
  name: string;      // Display name, e.g. "Newsletter"
  slug: string;      // Unique slug, e.g. "newsletter"
  createdAt: Date;
}

const BlogCategorySchema = new mongoose.Schema<IBlogCategory>({
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, lowercase: true, trim: true }
}, { timestamps: true });

export default mongoose.models.BlogCategory || mongoose.model<IBlogCategory>("BlogCategory", BlogCategorySchema);
```

### 1.2 `BlogPost` Schema
```typescript
import mongoose from "mongoose";

export interface IBlogPost extends mongoose.Document {
  title: string;
  slug: string;
  content: string;         // Markdown content
  excerpt?: string;        // Quick summary
  coverImage?: string;     // URL to cover image in Vercel Blob
  category: mongoose.Types.ObjectId; // Reference to BlogCategory
  author: string;          // Author name
  status: "draft" | "published";
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const BlogPostSchema = new mongoose.Schema<IBlobPost>({
  title: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
  content: { type: String, required: true },
  excerpt: { type: String, trim: true },
  coverImage: { type: String },
  category: { type: mongoose.Schema.Types.ObjectId, ref: "BlogCategory", required: true },
  author: { type: String, required: true, trim: true },
  status: { type: String, enum: ["draft", "published"], default: "draft" },
  publishedAt: { type: Date }
}, { timestamps: true });

BlogPostSchema.index({ status: 1, publishedAt: -1 });

export default mongoose.models.BlogPost || mongoose.model<IBlobPost>("BlogPost", BlogPostSchema);
```

---

## 2. API Endpoints

### 2.1 Admin API Routes (Authorized via `requireAdmin`)
- **`/api/admin/blogs/categories` (GET, POST)**:
  - `GET`: List all blog categories.
  - `POST`: Create a new blog category.
- **`/api/admin/blogs/categories/[id]` (PUT, DELETE)**:
  - `PUT`: Edit category name/slug.
  - `DELETE`: Delete a category.
- **`/api/admin/blogs` (GET, POST)**:
  - `GET`: Fetch all blog posts (including drafts).
  - `POST`: Create a new blog post.
- **`/api/admin/blogs/[id]` (PUT, DELETE)**:
  - `PUT`: Update a blog post.
  - `DELETE`: Delete a blog post.
- **`/api/admin/blogs/upload` (POST)**:
  - Reuses vercel blob client connection to upload banner images under `blogs/` path.

### 2.2 Public API Routes
- **`/api/blogs` (GET)**:
  - Query parameters: `?category=<slug>`
  - Action: Fetch all published blog posts (and optional category filtering), newest first.
- **`/api/blogs/[slug]` (GET)**:
  - Fetch a single published blog post by its slug.

---

## 3. UI/UX Pages

### 3.1 Public Blog Pages (`src/app/(landing)/blog`)
- **`/blog`**:
  - Retro bento/grid matching the Events page style.
  - Displays category tabs at the top (fetched dynamically from categories API).
  - Shows cards with: Cover image, title, excerpt, publication date, category badge, and "Read Post" arrow link.
- **`/blog/[slug]`**:
  - Renders the post content using a Markdown-to-HTML parser (styled cleanly matching the rest of the site typography).

### 3.2 Admin CMS Pages (`src/app/(admin)/admin`)
- **`/admin/blogs`**:
  - Tab inside Admin panel to write/edit/delete posts and manage categories.
