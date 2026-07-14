# Blog Feature Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create a Blog section for the FOSS GCE Erode website with dynamic categories and blog posts manageable from the existing `/admin` section.

**Architecture:** Creates BlogPost and BlogCategory Mongoose schemas, Next.js admin API routes protected by adminAuth, public listing APIs, an admin management page mirroring the Events manager UI style, and public list/detail views matching the site design tokens.

**Tech Stack:** Next.js, React, Mongoose/MongoDB, lucide-react, marked, Tailwind CSS.

---

### Task 1: Package Dependencies Setup

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install marked for markdown rendering**

Run:
```bash
npm install marked
```
Expected output: Added marked package to dependencies.

- [ ] **Step 2: Install type definitions for marked**

Run:
```bash
npm install --save-dev @types/marked
```
Expected output: Added @types/marked package to devDependencies.

- [ ] **Step 3: Verify build compiles cleanly**

Run:
```bash
npm run build
```
Expected output: Exit code 0 (successful compile).

- [ ] **Step 4: Commit**

Run:
```bash
git add package.json package-lock.json
git commit -m "chore: add marked dependencies for markdown rendering"
```

---

### Task 2: Database Schemas Creation

**Files:**
- Create: `src/models/BlogCategory.ts`
- Create: `src/models/BlogPost.ts`

- [ ] **Step 1: Create the BlogCategory model**

Create `src/models/BlogCategory.ts` with the following content:
```typescript
import mongoose from "mongoose";

export interface IBlogCategory {
  name: string;
  slug: string;
  createdAt: Date;
  updatedAt: Date;
}

const BlogCategorySchema = new mongoose.Schema<IBlogCategory>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
  },
  { timestamps: true }
);

export default mongoose.models.BlogCategory ||
  mongoose.model<IBlogCategory>("BlogCategory", BlogCategorySchema);
```

- [ ] **Step 2: Create the BlogPost model**

Create `src/models/BlogPost.ts` with the following content:
```typescript
import mongoose from "mongoose";

export interface IBlogPost {
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  coverImage?: string;
  category: mongoose.Types.ObjectId;
  author: string;
  status: "draft" | "published";
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const BlogPostSchema = new mongoose.Schema<IBlobPost>(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    content: { type: String, required: true },
    excerpt: { type: String, trim: true },
    coverImage: { type: String },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BlogCategory",
      required: true,
    },
    author: { type: String, required: true, trim: true },
    status: { type: String, enum: ["draft", "published"], default: "draft" },
    publishedAt: { type: Date },
  },
  { timestamps: true }
);

BlogPostSchema.index({ status: 1, publishedAt: -1 });

// Temporary workaround for typescript generic type mismatch (IBlobPost vs IBlogPost typecast)
type BlogPostModelType = mongoose.Model<any>;
export default (mongoose.models.BlogPost ||
  mongoose.model("BlogPost", BlogPostSchema)) as BlogPostModelType;
```

- [ ] **Step 3: Verify schemas compilation**

Run:
```bash
npm run build
```
Expected: Compile succeeds with no schema-related compile errors.

- [ ] **Step 4: Commit**

Run:
```bash
git add src/models/BlogCategory.ts src/models/BlogPost.ts
git commit -m "feat(db): add BlogCategory and BlogPost models"
```

---

### Task 3: Admin API Categories CRUD Endpoints

**Files:**
- Create: `src/app/api/admin/blogs/categories/route.ts`
- Create: `src/app/api/admin/blogs/categories/[id]/route.ts`

- [ ] **Step 1: Create Categories GET/POST route**

Create `src/app/api/admin/blogs/categories/route.ts` with:
```typescript
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import BlogCategory from "@/models/BlogCategory";
import { requireAdmin } from "@/lib/adminAuth";

export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (auth) return auth;

  try {
    await dbConnect();
    const categories = await BlogCategory.find({}).sort({ name: 1 });
    return NextResponse.json({ success: true, data: categories });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (auth) return auth;

  try {
    await dbConnect();
    const body = await req.json();
    const { name } = body;
    if (!name) {
      return NextResponse.json({ success: false, error: "Name is required" }, { status: 400 });
    }
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    const category = await BlogCategory.create({ name, slug });
    return NextResponse.json({ success: true, data: category });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
```

- [ ] **Step 2: Create Category PUT/DELETE route**

Create `src/app/api/admin/blogs/categories/[id]/route.ts` with:
```typescript
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import BlogCategory from "@/models/BlogCategory";
import { requireAdmin } from "@/lib/adminAuth";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin(req);
  if (auth) return auth;

  try {
    await dbConnect();
    const { id } = await params;
    const body = await req.json();
    const { name } = body;
    if (!name) {
      return NextResponse.json({ success: false, error: "Name is required" }, { status: 400 });
    }
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    const updated = await BlogCategory.findByIdAndUpdate(
      id,
      { name, slug },
      { new: true }
    );
    if (!updated) {
      return NextResponse.json({ success: false, error: "Category not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: updated });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin(req);
  if (auth) return auth;

  try {
    await dbConnect();
    const { id } = await params;
    const deleted = await BlogCategory.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json({ success: false, error: "Category not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: deleted });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
```

- [ ] **Step 3: Verify compile correctness**

Run:
```bash
npm run build
```
Expected: Output successfully built without errors.

- [ ] **Step 4: Commit**

Run:
```bash
git add src/app/api/admin/blogs/categories
git commit -m "feat(api): add admin blog categories CRUD endpoints"
```

---

### Task 4: Admin API Blog Posts Endpoints & Image Upload

**Files:**
- Create: `src/app/api/admin/blogs/route.ts`
- Create: `src/app/api/admin/blogs/[id]/route.ts`
- Create: `src/app/api/admin/blogs/upload/route.ts`

- [ ] **Step 1: Create Admin Blogs GET/POST route**

Create `src/app/api/admin/blogs/route.ts` with:
```typescript
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import BlogPost from "@/models/BlogPost";
import { requireAdmin } from "@/lib/adminAuth";

export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (auth) return auth;

  try {
    await dbConnect();
    const posts = await BlogPost.find({})
      .populate("category")
      .sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: posts });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (auth) return auth;

  try {
    await dbConnect();
    const body = await req.json();
    const { title, content, excerpt, coverImage, category, author, status } = body;
    if (!title || !content || !category || !author) {
      return NextResponse.json(
        { success: false, error: "Missing required fields (title, content, category, author)" },
        { status: 400 }
      );
    }
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    const post = await BlogPost.create({
      title,
      slug,
      content,
      excerpt,
      coverImage,
      category,
      author,
      status: status || "draft",
      publishedAt: status === "published" ? new Date() : undefined,
    });
    return NextResponse.json({ success: true, data: post });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
```

- [ ] **Step 2: Create Admin Blog PUT/DELETE route**

Create `src/app/api/admin/blogs/[id]/route.ts` with:
```typescript
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import BlogPost from "@/models/BlogPost";
import { requireAdmin } from "@/lib/adminAuth";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin(req);
  if (auth) return auth;

  try {
    await dbConnect();
    const { id } = await params;
    const body = await req.json();
    const { title, content, excerpt, coverImage, category, author, status } = body;
    if (!title || !content || !category || !author) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    const updateObj: any = {
      title,
      slug,
      content,
      excerpt,
      coverImage,
      category,
      author,
      status,
    };

    const oldPost = await BlogPost.findById(id);
    if (!oldPost) {
      return NextResponse.json({ success: false, error: "Post not found" }, { status: 404 });
    }

    if (status === "published" && oldPost.status !== "published") {
      updateObj.publishedAt = new Date();
    } else if (status === "draft") {
      updateObj.publishedAt = null;
    }

    const updated = await BlogPost.findByIdAndUpdate(id, updateObj, { new: true });
    return NextResponse.json({ success: true, data: updated });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin(req);
  if (auth) return auth;

  try {
    await dbConnect();
    const { id } = await params;
    const deleted = await BlogPost.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json({ success: false, error: "Post not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: deleted });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
```

- [ ] **Step 3: Create Admin Blog Image Upload route**

Create `src/app/api/admin/blogs/upload/route.ts` with:
```typescript
import { put } from "@vercel/blob";
import { NextResponse, NextRequest } from "next/server";
import { requireAdmin } from "@/lib/adminAuth";

export async function POST(request: NextRequest): Promise<NextResponse> {
  const auth = await requireAdmin(request);
  if (auth) return auth;

  const { searchParams } = new URL(request.url);
  const filename = searchParams.get("filename");

  if (!filename) {
    return NextResponse.json({ error: "Missing filename" }, { status: 400 });
  }

  try {
    const blob = await put(filename, request.body!, {
      access: "public",
    });
    return NextResponse.json(blob);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
```

- [ ] **Step 4: Verify build works**

Run:
```bash
npm run build
```
Expected: Successful compile.

- [ ] **Step 5: Commit**

Run:
```bash
git add src/app/api/admin/blogs
git commit -m "feat(api): add admin blog posts CRUD and image upload routes"
```

---

### Task 5: Public API Blogs & Categories Endpoints

**Files:**
- Create: `src/app/api/blogs/route.ts`
- Create: `src/app/api/blogs/[slug]/route.ts`
- Create: `src/app/api/blogs/categories/route.ts`

- [ ] **Step 1: Create Public Categories GET route**

Create `src/app/api/blogs/categories/route.ts` with:
```typescript
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import BlogCategory from "@/models/BlogCategory";

export async function GET() {
  try {
    await dbConnect();
    const categories = await BlogCategory.find({}).sort({ name: 1 });
    return NextResponse.json({ success: true, data: categories });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
```

- [ ] **Step 2: Create Public Blogs List route**

Create `src/app/api/blogs/route.ts` with:
```typescript
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import BlogPost from "@/models/BlogPost";
import BlogCategory from "@/models/BlogCategory";

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const categorySlug = searchParams.get("category");

    let query: any = { status: "published" };

    if (categorySlug) {
      const category = await BlogCategory.findOne({ slug: categorySlug });
      if (category) {
        query.category = category._id;
      } else {
        return NextResponse.json({ success: true, data: [] });
      }
    }

    const posts = await BlogPost.find(query)
      .populate("category")
      .sort({ publishedAt: -1 });

    return NextResponse.json({ success: true, data: posts });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
```

- [ ] **Step 3: Create Public Blog Post Detail by Slug route**

Create `src/app/api/blogs/[slug]/route.ts` with:
```typescript
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import BlogPost from "@/models/BlogPost";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    await dbConnect();
    const { slug } = await params;
    const post = await BlogPost.findOne({ slug, status: "published" })
      .populate("category");

    if (!post) {
      return NextResponse.json({ success: false, error: "Post not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: post });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
```

- [ ] **Step 4: Verify build works**

Run:
```bash
npm run build
```
Expected: Successful compile.

- [ ] **Step 5: Commit**

Run:
```bash
git add src/app/api/blogs
git commit -m "feat(api): add public API routes for blogs and categories"
```

---

### Task 6: Admin Blog Editor UI Page

**Files:**
- Create: `src/app/(admin)/admin/blogs/page.tsx`
- Modify: `src/components/AdminSidebar.tsx`
- Modify: `src/app/(admin)/admin/page.tsx`

- [ ] **Step 1: Implement Admin Blogs UI Page**

Create `src/app/(admin)/admin/blogs/page.tsx` with:
```typescript
/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useEffect } from "react";
import {
  BookOpen,
  Plus,
  Search,
  Edit3,
  Trash2,
  X,
  Upload,
  Loader2,
  Trash,
  ExternalLink,
  FolderPlus,
  FileText
} from "lucide-react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";

interface Category {
  _id: string;
  name: string;
  slug: string;
}

interface PostData {
  _id?: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  coverImage?: string;
  category: string; // ID string
  author: string;
  status: "draft" | "published";
  publishedAt?: string;
}

export default function AdminBlogsManager() {
  const [posts, setPosts] = useState<any[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Modals
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);

  // States
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [coverUploadError, setCoverUploadError] = useState<string | null>(null);

  // Category Editor State
  const [newCatName, setNewCatName] = useState("");
  const [isSavingCat, setIsSavingCat] = useState(false);

  // Post Editor State
  const [editingPost, setEditingPost] = useState<PostData | null>(null);
  const [formData, setFormData] = useState<PostData>({
    title: "",
    slug: "",
    content: "",
    excerpt: "",
    category: "",
    author: "",
    status: "draft"
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [pRes, cRes] = await Promise.all([
        fetch("/api/admin/blogs"),
        fetch("/api/admin/blogs/categories")
      ]);
      const pData = await pRes.json();
      const cData = await cRes.json();
      if (pData.success) setPosts(pData.data);
      if (cData.success) {
        setCategories(cData.data);
        if (cData.data.length > 0 && !formData.category) {
          setFormData(prev => ({ ...prev, category: cData.data[0]._id }));
        }
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateNew = () => {
    setEditingPost(null);
    setFormData({
      title: "",
      slug: "",
      content: "",
      excerpt: "",
      category: categories[0]?._id || "",
      author: "FOSS GCEE Core Team",
      status: "draft"
    });
    setIsPostModalOpen(true);
  };

  const handleEdit = (post: any) => {
    setEditingPost(post);
    setFormData({
      title: post.title,
      slug: post.slug,
      content: post.content,
      excerpt: post.excerpt || "",
      coverImage: post.coverImage || "",
      category: post.category?._id || post.category || "",
      author: post.author,
      status: post.status
    });
    setIsPostModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this post?")) return;
    setIsDeleting(id);
    try {
      const res = await fetch(`/api/admin/blogs/${id}`, { method: "DELETE" });
      const d = await res.json();
      if (d.success) fetchData();
    } finally {
      setIsDeleting(null);
    }
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    setIsSavingCat(true);
    try {
      const res = await fetch("/api/admin/blogs/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newCatName.trim() })
      });
      const d = await res.json();
      if (d.success) {
        setNewCatName("");
        const cRes = await fetch("/api/admin/blogs/categories");
        const cData = await cRes.json();
        if (cData.success) setCategories(cData.data);
      } else {
        alert(d.error || "Failed to create category");
      }
    } finally {
      setIsSavingCat(false);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm("Delete category? Posts using it will show undefined category.")) return;
    try {
      const res = await fetch(`/api/admin/blogs/categories/${id}`, { method: "DELETE" });
      const d = await res.json();
      if (d.success) {
        const cRes = await fetch("/api/admin/blogs/categories");
        const cData = await cRes.json();
        if (cData.success) setCategories(cData.data);
      }
    } catch {
      alert("Error deleting category");
    }
  };

  const handleUploadCover = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    setCoverUploadError(null);
    try {
      const stamp = new Date().toISOString().replace(/[:.]/g, "-");
      const cleanName = file.name.replace(/[^a-zA-Z0-9.]/g, "-");
      const path = `blogs/covers/${stamp}-${cleanName}`;
      const res = await fetch(`/api/admin/blogs/upload?filename=${encodeURIComponent(path)}`, {
        method: "POST",
        body: file
      });
      const d = await res.json();
      if (d.url) setFormData(prev => ({ ...prev, coverImage: d.url }));
      else setCoverUploadError("Cover upload failed.");
    } catch {
      setCoverUploadError("Cover upload failed.");
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  };

  const handleSavePost = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(
        editingPost ? `/api/admin/blogs/${editingPost._id}` : "/api/admin/blogs",
        {
          method: editingPost ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData)
        }
      );
      const d = await res.json();
      if (d.success) {
        setIsPostModalOpen(false);
        fetchData();
      } else {
        alert(d.error || "Failed to save post");
      }
    } finally {
      setLoading(false);
    }
  };

  const filteredPosts = posts.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "all" || p.category?._id === categoryFilter;
    const matchesStatus = statusFilter === "all" || p.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="space-y-8 py-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-pixel text-white">BLOGS_MANAGER</h1>
          <p className="font-mono text-xs text-white/40 italic">Compose, publish, and categorise blog articles</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsCatModalOpen(true)}
            className="flex items-center justify-center gap-2 px-5 py-3 bg-white/5 border border-white/10 text-white rounded-xl font-pixel text-[10px] hover:bg-white/10 transition-all active:scale-95 shrink-0"
          >
            <FolderPlus className="w-4 h-4" />
            CATEGORIES
          </button>
          <button
            onClick={handleCreateNew}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-white text-black rounded-xl font-pixel text-[10px] hover:bg-white/90 transition-all active:scale-95 shrink-0 shadow-[0_4px_20px_rgba(255,255,255,0.1)]"
          >
            <Plus className="w-4 h-4" />
            NEW_POST
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
          <input
            type="text"
            placeholder="Search by title..."
            className="w-full pl-12 pr-4 py-3 bg-white/[0.02] border border-white/5 rounded-2xl font-mono text-xs text-white focus:outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select
            className="px-4 py-2.5 bg-white/[0.02] border border-white/5 rounded-xl font-mono text-xs text-white"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="all" className="text-black">All Categories</option>
            {categories.map(c => (
              <option key={c._id} value={c._id} className="text-black">{c.name}</option>
            ))}
          </select>
          <select
            className="px-4 py-2.5 bg-white/[0.02] border border-white/5 rounded-xl font-mono text-xs text-white"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all" className="text-black">All Statuses</option>
            <option value="draft" className="text-black">Draft</option>
            <option value="published" className="text-black">Published</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {loading && posts.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-4">
            <Loader2 className="w-8 h-8 text-white/20 animate-spin" />
            <p className="font-mono text-xs text-white/20 italic tracking-widest uppercase">Fetching logs...</p>
          </div>
        ) : filteredPosts.map((post) => (
          <div key={post._id} className="p-5 rounded-3xl border border-white/5 bg-white/[0.01] hover:bg-white/[0.03] transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className={`p-4 rounded-2xl border shrink-0 flex items-center justify-center ${post.status === "published" ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400" : "border-amber-500/20 bg-amber-500/10 text-amber-400"}`}>
                <FileText className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`px-2 py-0.5 rounded-lg border text-[8px] font-mono ${post.status === "published" ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400" : "border-amber-500/20 bg-amber-500/10 text-amber-400"}`}>{post.status.toUpperCase()}</span>
                  <span className="px-2 py-0.5 rounded-lg border border-white/5 bg-white/5 text-[8px] font-mono text-white/50">{post.category?.name || "Uncategorized"}</span>
                </div>
                <h3 className="text-md font-pixel text-white uppercase">{post.title}</h3>
                <p className="font-mono text-[10px] text-white/30">By {post.author} · {new Date(post.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 self-end sm:self-center">
              <Link href={`/blog/${post.slug}`} target="_blank" className="p-2.5 rounded-xl border border-white/5 bg-white/[0.02] text-white/40 hover:text-white transition-all"><ExternalLink className="w-4 h-4" /></Link>
              <button onClick={() => handleEdit(post)} className="p-2.5 rounded-xl border border-white/5 bg-white/[0.02] text-white/40 hover:text-white transition-all"><Edit3 className="w-4 h-4" /></button>
              <button
                onClick={() => handleDelete(post._id!)}
                disabled={isDeleting === post._id}
                className="p-2.5 rounded-xl border border-white/5 bg-white/[0.02] text-red-400/40 hover:text-red-400 transition-all disabled:opacity-50"
              >
                {isDeleting === post._id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Category Manager Modal */}
      <AnimatePresence>
        {isCatModalOpen && (
          <div className="fixed inset-0 z-[101] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsCatModalOpen(false)} className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-md bg-[#0a0a0a] border border-white/10 rounded-[28px] p-6 shadow-2xl space-y-6">
              <div className="flex justify-between items-center border-b border-white/5 pb-4">
                <h3 className="font-pixel text-xs text-white">MANAGE_CATEGORIES</h3>
                <button onClick={() => setIsCatModalOpen(false)} className="text-white/40 hover:text-white"><X className="w-5 h-5" /></button>
              </div>

              <form onSubmit={handleCreateCategory} className="flex gap-2">
                <input
                  required
                  type="text"
                  placeholder="New Category Name..."
                  className="flex-1 px-4 py-2.5 bg-white/[0.03] border border-white/10 rounded-xl font-mono text-xs text-white focus:outline-none"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                />
                <button
                  type="submit"
                  disabled={isSavingCat}
                  className="px-4 py-2.5 bg-white text-black font-mono text-xs font-bold rounded-xl disabled:opacity-50"
                >
                  {isSavingCat ? "..." : "ADD"}
                </button>
              </form>

              <div className="max-h-60 overflow-y-auto space-y-2">
                {categories.map(c => (
                  <div key={c._id} className="flex justify-between items-center p-3 bg-white/[0.02] border border-white/5 rounded-xl">
                    <span className="font-mono text-xs text-white">{c.name}</span>
                    <button type="button" onClick={() => handleDeleteCategory(c._id)} className="text-red-400/60 hover:text-red-400 p-1"><Trash className="w-4 h-4" /></button>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Editor Modal */}
      <AnimatePresence>
        {isPostModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsPostModalOpen(false)} className="absolute inset-0 bg-black/90 backdrop-blur-md" />
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-[#0a0a0a] border border-white/10 rounded-[32px] shadow-2xl">
              <div className="p-8 border-b border-white/5 flex items-center justify-between sticky top-0 bg-[#0a0a0a] z-10">
                <div className="space-y-1">
                  <h3 className="text-xl font-pixel text-white uppercase">{editingPost ? "EDIT_POST" : "NEW_POST"}</h3>
                  <p className="font-mono text-[9px] text-white/30 uppercase tracking-[0.2em]">sector: ./blogs_manager</p>
                </div>
                <button onClick={() => setIsPostModalOpen(false)} className="p-2 rounded-xl text-white/40 hover:text-white"><X className="w-5 h-5" /></button>
              </div>

              <form onSubmit={handleSavePost} className="p-8 space-y-8">
                {/* Poster Preview */}
                <div className="space-y-2">
                  <label className="text-[10px] font-mono text-white/20 uppercase pl-1 tracking-[0.2em]">Cover Image</label>
                  <div className="relative group aspect-video md:aspect-[21/9] rounded-[24px] bg-white/[0.02] border border-dashed border-white/10 overflow-hidden flex items-center justify-center">
                    {formData.coverImage ? (
                      <>
                        <img src={formData.coverImage} alt="Cover image" className="w-full h-full object-cover opacity-60" />
                        <button type="button" onClick={() => setFormData(prev => ({ ...prev, coverImage: "" }))} className="absolute top-4 right-4 p-3 rounded-full bg-red-500/80 text-white"><Trash className="w-4 h-4" /></button>
                      </>
                    ) : (
                      <label className="flex flex-col items-center justify-center gap-3 cursor-pointer p-10 text-center hover:bg-white/5 transition-colors w-full h-full">
                        <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                          {isUploading ? <Loader2 className="w-8 h-8 animate-spin text-white/40" /> : <Upload className="w-8 h-8 text-white/20" />}
                        </div>
                        <span className="font-pixel text-[10px] text-white/40 uppercase">UPLOAD_COVER_IMAGE</span>
                        <input type="file" className="hidden" accept="image/*" onChange={handleUploadCover} disabled={isUploading} />
                      </label>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2 col-span-full">
                    <label className="text-[10px] font-mono text-white/40 uppercase pl-1">Blog Title</label>
                    <input required type="text" className="w-full px-5 py-4 bg-white/[0.03] border border-white/10 rounded-2xl font-mono text-xs text-white" value={formData.title} onChange={e => {
                      const t = e.target.value;
                      setFormData(prev => ({ ...prev, title: t, slug: t.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") }));
                    }} />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-mono text-white/40 uppercase pl-1">Category</label>
                    <select required className="w-full px-5 py-4 bg-white/[0.03] border border-white/10 rounded-2xl font-mono text-xs text-white" value={formData.category} onChange={e => setFormData(prev => ({ ...prev, category: e.target.value }))}>
                      {categories.map(c => (
                        <option key={c._id} value={c._id} className="text-black">{c.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-mono text-white/40 uppercase pl-1">Author</label>
                    <input required type="text" className="w-full px-5 py-4 bg-white/[0.03] border border-white/10 rounded-2xl font-mono text-xs text-white" value={formData.author} onChange={e => setFormData(prev => ({ ...prev, author: e.target.value }))} />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-mono text-white/40 uppercase pl-1">Status</label>
                    <select className="w-full px-5 py-4 bg-white/[0.03] border border-white/10 rounded-2xl font-mono text-xs text-white" value={formData.status} onChange={e => setFormData(prev => ({ ...prev, status: e.target.value as any }))}>
                      <option value="draft" className="text-black">Draft</option>
                      <option value="published" className="text-black">Published</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-mono text-white/40 uppercase pl-1">Excerpt / Summary</label>
                    <input type="text" placeholder="Short description..." className="w-full px-5 py-4 bg-white/[0.03] border border-white/10 rounded-2xl font-mono text-xs text-white" value={formData.excerpt || ""} onChange={e => setFormData(prev => ({ ...prev, excerpt: e.target.value }))} />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-mono text-white/40 uppercase pl-1">Content (Markdown supported)</label>
                  <textarea required rows={10} className="w-full px-5 py-4 bg-white/[0.03] border border-white/10 rounded-2xl font-mono text-xs text-white resize-none" value={formData.content} onChange={e => setFormData(prev => ({ ...prev, content: e.target.value }))} />
                </div>

                <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row gap-4">
                  <button type="submit" disabled={loading} className="flex-1 py-5 bg-white text-black rounded-[24px] font-pixel text-xs hover:scale-[1.01] transition-all flex items-center justify-center gap-3">
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>EXECUTE::<span className="opacity-40">{editingPost ? "UPDATE" : "CREATE"}</span></>}
                  </button>
                  <button type="button" onClick={() => setIsPostModalOpen(false)} className="px-12 py-5 bg-white/5 text-white/40 rounded-[24px] font-pixel text-xs">CANCEL</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
```

- [ ] **Step 2: Add sidebar link to Blog page**

Modify `src/components/AdminSidebar.tsx` to add `BookOpen` icon import and add "Blogs" to `menuItems` array:
```typescript
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  Settings, 
  LogOut,
  ShieldCheck,
  Menu,
  X,
  GitCommit,
  PanelTop,
  BookOpen
} from "lucide-react";

// Add under menuItems:
const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/admin" },
  { icon: PanelTop, label: "Site CMS", href: "/admin/site-cms", highlight: true },
  { icon: Users, label: "Members", href: "/admin/members" },
  { icon: Calendar, label: "Events", href: "/admin/events" },
  { icon: GitCommit, label: "Contributions", href: "/admin/contributions" },
  { icon: BookOpen, label: "Blogs", href: "/admin/blogs" },
];
```

- [ ] **Step 3: Modify Dashboard Stats and Quicklinks**

Modify `src/app/(admin)/admin/page.tsx` to import `BookOpen` from `lucide-react`, and update `SiteStats` interface, `cmsStatCards`, `quickLinks`, and `useEffect` block.
Add:
- `blogsCount: number` to `SiteStats`
- Update `cmsStatCards` to include a Blogs card
- Update `quickLinks` to include Blogs manager link
- Fetch `/api/admin/blogs` in `Promise.all` inside `useEffect`

Code diff:
```typescript
// Replace imports:
import {
  Users,
  CheckCircle2,
  XCircle,
  Terminal,
  ShieldCheck,
  ArrowRight,
  Calendar,
  GitCommit,
  PanelTop,
  TrendingUp,
  BookOpen,
} from "lucide-react";

// Replace SiteStats:
interface SiteStats {
  eventsCount: number;
  contributionsCount: number;
  boardMembersCount: number;
  galleryCount: number;
  blogsCount: number;
}

// Inside Dashboard component, update state:
  const [siteStats, setSiteStats] = useState<SiteStats>({
    eventsCount: 0,
    contributionsCount: 0,
    boardMembersCount: 0,
    galleryCount: 0,
    blogsCount: 0,
  });

// Inside useEffect:
  useEffect(() => {
    Promise.all([
      fetch("/api/admin/members").then(r => r.json()),
      fetch("/api/admin/events").then(r => r.json()).catch(() => ({ success: false, data: [] })),
      fetch("/api/admin/contributions").then(r => r.json()).catch(() => ({ success: false, data: [] })),
      fetch("/api/admin/site-config?section=boardmembers").then(r => r.json()).catch(() => ({ success: false, data: { members: [] } })),
      fetch("/api/admin/site-config?section=gallery").then(r => r.json()).catch(() => ({ success: false, data: { images: [] } })),
      fetch("/api/admin/blogs").then(r => r.json()).catch(() => ({ success: false, data: [] })),
    ]).then(([membersData, eventsData, contribData, boardData, galleryData, blogsData]) => {
      if (membersData.success) {
        const verified = membersData.data.filter((m: { otpVerified: boolean }) => m.otpVerified).length;
        setStats({ total: membersData.count, verified, pending: membersData.count - verified });
      }
      setSiteStats({
        eventsCount: eventsData.success ? eventsData.data.length : 0,
        contributionsCount: contribData.success ? contribData.count : 0,
        boardMembersCount: boardData.success ? (boardData.data?.members?.length || 0) : 0,
        galleryCount: galleryData.success ? (galleryData.data?.images?.length || 0) : 0,
        blogsCount: blogsData.success ? blogsData.data.length : 0,
      });
    }).finally(() => setLoading(false));
  }, []);

// Update cmsStatCards array:
  const cmsStatCards = [
    { label: "Events", value: siteStats.eventsCount, icon: Calendar, color: "text-violet-400", bg: "bg-violet-500/10 border-violet-500/20", href: "/admin/events" },
    { label: "Contributions", value: siteStats.contributionsCount, icon: GitCommit, color: "text-cyan-400", bg: "bg-cyan-500/10 border-cyan-500/20", href: "/admin/contributions" },
    { label: "Blogs", value: siteStats.blogsCount, icon: BookOpen, color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20", href: "/admin/blogs" },
    { label: "Board Members", value: siteStats.boardMembersCount, icon: TrendingUp, color: "text-rose-400", bg: "bg-rose-500/10 border-rose-500/20", href: "/admin/site-cms" },
  ];

// Update quickLinks array:
  const quickLinks = [
    { href: "/admin/members", label: "VIEW_ALL_MEMBERS", desc: "Search, filter and manage registrations", icon: Users },
    { href: "/admin/site-cms", label: "SITE_CMS", desc: "Edit hero, about, members, gallery, footer", icon: PanelTop },
    { href: "/admin/events", label: "EVENTS_MANAGER", desc: "Create and edit events", icon: Calendar },
    { href: "/admin/blogs", label: "BLOGS_MANAGER", desc: "Write and publish blogs", icon: BookOpen },
  ];
```

- [ ] **Step 4: Verify build compiles cleanly**

Run:
```bash
npm run build
```
Expected: Output exit code 0.

- [ ] **Step 5: Commit**

Run:
```bash
git add src/app/\(admin\)/admin/blogs src/components/AdminSidebar.tsx src/app/\(admin\)/admin/page.tsx
git commit -m "feat(admin): implement blog management UI page and sidebar linking"
```

---

### Task 7: Public Blogs Page & Routing

**Files:**
- Create: `src/app/(landing)/blog/page.tsx`
- Create: `src/app/(landing)/blog/[slug]/page.tsx`
- Modify: `src/components/Navbar.tsx`

- [ ] **Step 1: Create public blogs listing page**

Create `src/app/(landing)/blog/page.tsx` with:
```typescript
/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { Image as ImageIcon, Loader2, Calendar, User, ArrowRight } from "lucide-react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

interface BlogCategory {
  _id: string;
  name: string;
  slug: string;
}

interface BlogPost {
  _id: string;
  title: string;
  slug: string;
  excerpt?: string;
  coverImage?: string;
  category: BlogCategory;
  author: string;
  publishedAt: string;
}

export default function BlogsPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [pRes, cRes] = await Promise.all([
          fetch("/api/blogs"),
          fetch("/api/blogs/categories")
        ]);
        const pData = await pRes.json();
        const cData = await cRes.json();
        if (pData.success) setPosts(pData.data);
        if (cData.success) setCategories(cData.data);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredPosts = posts.filter(post => 
    selectedCategory === "all" || post.category?.slug === selectedCategory
  );

  useEffect(() => {
    if (loading || posts.length === 0) return;
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      gsap.from(".blog-hero", { opacity: 0, y: 30, duration: 0.8, ease: "power2.out" });
      gsap.from(".blog-card", {
        opacity: 0, y: 20, stagger: 0.1, duration: 0.6, ease: "power2.out",
        scrollTrigger: { trigger: ".blogs-grid", start: "top 80%" }
      });
    }, containerRef);
    return () => ctx.revert();
  }, [loading, posts, selectedCategory]);

  if (loading) {
    return (
      <div className="min-h-screen bg-bg flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-10 h-10 text-text animate-spin" />
        <p className="font-pixel text-[10px] text-muted-2 tracking-[0.2em]">INITIALIZING_BLOGS_SYSTEM...</p>
      </div>
    );
  }

  return (
    <main ref={containerRef} className="min-h-screen bg-bg text-text pt-24 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-16">
        <div className="blog-hero text-center pt-8">
          <h1 className="text-4xl sm:text-5xl font-pixel tracking-tight text-text">BLOGS</h1>
          <p className="font-mono text-xs text-muted-2 mt-4 uppercase tracking-[0.15em]">Updates, tutorials, and tips from the core team</p>
        </div>

        {posts.length === 0 ? (
          <div className="flex flex-col items-center gap-4 py-24 text-muted-2">
            <span className="font-pixel text-2xl">{"{ }"}</span>
            <p className="font-mono text-sm uppercase tracking-widest">No articles found.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Filter tabs */}
            <div className="flex flex-wrap items-center justify-center gap-2 border-b border-border pb-4">
              <button
                onClick={() => setSelectedCategory("all")}
                className={`px-4 py-2 rounded-lg font-mono text-[10px] uppercase tracking-widest border transition-all ${selectedCategory === "all" ? "bg-text text-bg border-text" : "border-border text-muted-2 hover:text-text"}`}
              >
                ALL
              </button>
              {categories.map(c => (
                <button
                  key={c._id}
                  onClick={() => setSelectedCategory(c.slug)}
                  className={`px-4 py-2 rounded-lg font-mono text-[10px] uppercase tracking-widest border transition-all ${selectedCategory === c.slug ? "bg-text text-bg border-text" : "border-border text-muted-2 hover:text-text"}`}
                >
                  {c.name}
                </button>
              ))}
            </div>

            {/* Grid */}
            <div className="blogs-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPosts.map(post => (
                <Link key={post._id} href={`/blog/${post.slug}`} className="blog-card block group">
                  <div className="bg-bg border border-border rounded-xl p-4 transition-all duration-300 hover:border-text/30 hover:bg-surface shadow-sm h-full flex flex-col">
                    <div className="flex gap-2 mb-3">
                      <span className="text-[9px] uppercase font-mono bg-text text-bg px-2 py-0.5 rounded border border-text font-bold tracking-widest">
                        {post.category?.name || "POST"}
                      </span>
                    </div>
                    <div className="w-full aspect-[16/9] rounded-lg overflow-hidden bg-surface mb-4 relative border border-border/50">
                      {post.coverImage ? (
                        <img src={post.coverImage} alt={post.title} className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-2 bg-surface-2"><ImageIcon className="w-8 h-8 opacity-20" /></div>
                      )}
                    </div>
                    <h3 className="font-pixel text-sm w-full text-text uppercase mb-2 line-clamp-2 leading-relaxed h-10">{post.title}</h3>
                    {post.excerpt && <p className="font-mono text-[11px] text-muted-2 line-clamp-3 mb-4">{post.excerpt}</p>}
                    
                    <div className="mt-auto space-y-1.5 pt-4 border-t border-border">
                      <p className="text-[9px] font-mono text-muted flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-text opacity-50" />
                        <span className="text-text">DATE:</span> {new Date(post.publishedAt || post.createdAt).toLocaleDateString()}
                      </p>
                      <p className="text-[9px] font-mono text-muted flex items-center gap-2">
                        <User className="w-3.5 h-3.5 text-text opacity-50" />
                        <span className="text-text">AUTHOR:</span> {post.author}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
```

- [ ] **Step 2: Create public blog post detail page**

Create `src/app/(landing)/blog/[slug]/page.tsx` with:
```typescript
/* eslint-disable @next/next/no-img-element */
import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Calendar, User, Tag } from "lucide-react";
import dbConnect from "@/lib/db";
import BlogPost from "@/models/BlogPost";
import { marked } from "marked";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  await dbConnect();
  const post = await BlogPost.findOne({ slug, status: "published" });
  if (!post) return { title: "Blog Post Not Found" };
  return {
    title: `${post.title} | FOSS Club GCE Erode`,
    description: post.excerpt || "FOSS GCE Erode Blog Post",
  };
}

export default async function BlogDetailPage({ params }: Props) {
  const { slug } = await params;
  await dbConnect();
  const post = await BlogPost.findOne({ slug, status: "published" }).populate("category");

  if (!post) {
    return (
      <div className="min-h-screen bg-bg flex flex-col items-center justify-center space-y-4">
        <h1 className="font-pixel text-xl text-text">404_POST_NOT_FOUND</h1>
        <Link href="/blog" className="font-mono text-xs text-muted-2 hover:text-text border-b border-dashed border-muted-2">Return to Blog</Link>
      </div>
    );
  }

  const rawHtml = await marked.parse(post.content || "");

  return (
    <main className="min-h-screen bg-bg text-text pt-24 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        
        {/* Back Link */}
        <Link href="/blog" className="inline-flex items-center gap-2 font-mono text-xs text-muted-2 hover:text-text transition-colors">
          <ArrowLeft className="w-4 h-4" /> BACK_TO_BLOGS
        </Link>

        {/* Title details */}
        <div className="space-y-4">
          <div className="flex gap-2">
            <span className="text-[9px] uppercase font-mono bg-text text-bg px-2 py-0.5 rounded border border-text font-bold tracking-widest flex items-center gap-1">
              <Tag className="w-2.5 h-2.5" /> {post.category?.name || "BLOG"}
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-pixel text-text leading-tight uppercase">{post.title}</h1>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 font-mono text-xs text-muted-2 border-t border-b border-border py-3">
            <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4 opacity-50" /> {new Date(post.publishedAt || post.createdAt).toLocaleDateString()}</span>
            <span className="flex items-center gap-1.5"><User className="w-4 h-4 opacity-50" /> By {post.author}</span>
          </div>
        </div>

        {/* Cover Image */}
        {post.coverImage && (
          <div className="w-full aspect-video rounded-2xl overflow-hidden border border-border/50 bg-surface">
            <img src={post.coverImage} alt={post.title} className="w-full h-full object-cover" />
          </div>
        )}

        {/* Article Body Content */}
        <article 
          className="prose prose-invert max-w-none font-mono text-sm leading-relaxed text-text/80 space-y-6 pt-4"
          dangerouslySetInnerHTML={{ __html: rawHtml }}
        />

      </div>
    </main>
  );
}
```

- [ ] **Step 3: Add Blog Link to Main Navigation bar**

Modify `src/components/Navbar.tsx` to add Blog link to navigation items list.
Modify the links definition around lines 9-17:
```diff
 const links = [
   { label: "About", href: "/#about" },
   { label: "What We Do", href: "/#whatwedo" },
   { label: "Members", href: "/members" },
   { label: "Projects", href: "/projects" },
   { label: "Events", href: "/events" },
+  { label: "Blog", href: "/blog" },
   { label: "Forum", href: "https://forum.fossunited.org/t/foss-club-government-college-of-engineering-erode/" },
   { label: "Join Us", href: "/#join" },
 ];
```

- [ ] **Step 4: Verify build compiles cleanly**

Run:
```bash
npm run build
```
Expected: Successfully built without errors.

- [ ] **Step 5: Commit**

Run:
```bash
git add src/app/\(landing\)/blog src/components/Navbar.tsx
git commit -m "feat(blog): implement public blog listing, details view, and navigation link"
```
