/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useEffect, startTransition } from "react";
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
  FileText,
  Sparkles
} from "lucide-react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";

interface Category {
  _id: string;
  id?: string;
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
  const [isAddingTestBlog, setIsAddingTestBlog] = useState(false);
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
      if (cData.success && Array.isArray(cData.data)) {
        const normalized = cData.data.map((c: any) => ({
          ...c,
          _id: c.id || c._id,
          id: c.id || c._id
        }));
        setCategories(normalized);
        if (normalized.length > 0 && !formData.category) {
          setFormData(prev => ({ ...prev, category: normalized[0]._id }));
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
    const defaultCatId = categories[0]?._id || (categories[0] as any)?.id || "";
    setFormData({
      title: "",
      slug: "",
      content: "",
      excerpt: "",
      category: defaultCatId,
      author: "FOSS GCEE Core Team",
      status: "draft"
    });
    setIsPostModalOpen(true);
  };

  const handleAddTestBlog = async () => {
    setIsAddingTestBlog(true);
    try {
      const stamp = Date.now().toString().slice(-4);
      const catId = categories[0]?._id || (categories[0] as any)?.id || "General";
      const testPost = {
        title: `Welcome to Open Source at FOSS GCEE #${stamp}`,
        slug: `welcome-to-open-source-foss-gcee-${stamp}`,
        content: `### Welcome to FOSS GCEE\n\nOpen Source software powers the digital backbone of modern technology. In this introductory guide, we explore how engineering students at Government College of Engineering, Erode (GCEE) can get involved.\n\n#### Why Open Source?\n1. **Real-world Engineering**: Inspect, debug, and contribute to production-grade repositories.\n2. **Collaborative Development**: Master Git workflows, pull requests, issue triaging, and code reviews.\n3. **Community & Mentorship**: Connect with peers, alumni, and maintainers worldwide.\n\n#### Getting Started in 3 Steps\n- **Step 1**: Clone a community repository from [github.com/fossgcee](https://github.com/fossgcee).\n- **Step 2**: Pick a beginner-friendly issue labeled \`good-first-issue\`.\n- **Step 3**: Submit your pull request and get feedback from campus leads!\n\nHappy hacking! 🚀`,
        excerpt: "An introductory walkthrough for GCEE students looking to make their first contribution to open-source software and campus development initiatives.",
        category: catId,
        author: "FOSS GCEE Core Team",
        status: "published" as const
      };

      const res = await fetch("/api/admin/blogs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(testPost)
      });
      const d = await res.json();
      if (d.success) {
        await fetchData();
      } else {
        alert(d.error || "Failed to create test blog");
      }
    } catch (err: any) {
      alert("Error creating test blog: " + err.message);
    } finally {
      setIsAddingTestBlog(false);
    }
  };

  const handleEdit = (post: any) => {
    setEditingPost(post);
    setFormData({
      title: post.title,
      slug: post.slug,
      content: post.content,
      excerpt: post.excerpt || "",
      coverImage: post.coverImage || "",
      category: post.category_id || post.category?._id || post.category?.id || (typeof post.category === "string" ? post.category : "") || "",
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
        body: file,
        headers: {
          "Content-Type": file.type
        }
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
    const matchesCategory =
      categoryFilter === "all" ||
      p.category_id === categoryFilter ||
      p.category?._id === categoryFilter ||
      p.category?.id === categoryFilter;
    const matchesStatus = statusFilter === "all" || p.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="space-y-6 sm:space-y-8 py-6 sm:py-10 max-w-7xl mx-auto px-1 sm:px-0">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-2 border-b border-white/10 sm:border-0 sm:pb-0">
        <div className="space-y-1">
          <h1 className="font-pixel text-white whitespace-nowrap text-[clamp(1.1rem,4vw,1.875rem)]">BLOGS_MANAGER</h1>
          <p className="font-mono text-xs text-white/70">Compose, publish, and categorise blog articles</p>
        </div>
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 w-full sm:w-auto">
          <button
            onClick={() => setIsCatModalOpen(true)}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3.5 py-3 bg-white/5 border border-white/20 text-white rounded-xl font-pixel text-[10px] hover:bg-white/10 transition-all active:scale-95 cursor-pointer font-bold"
          >
            <FolderPlus className="w-4 h-4 text-white/70" />
            CATEGORIES
          </button>
          <button
            type="button"
            onClick={handleAddTestBlog}
            disabled={isAddingTestBlog}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl font-pixel text-[10px] hover:bg-emerald-500/20 transition-all active:scale-95 disabled:opacity-50 cursor-pointer font-bold"
            title="Generate a sample test blog post"
          >
            {isAddingTestBlog ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
            TEST_BLOG
          </button>
          <button
            onClick={handleCreateNew}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 sm:px-5 py-3 bg-white text-black rounded-xl font-pixel text-[10px] hover:bg-white/90 transition-all active:scale-95 shadow-[0_4px_20px_rgba(255,255,255,0.15)] cursor-pointer font-bold"
          >
            <Plus className="w-4 h-4" />
            NEW_POST
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
          <input
            type="text"
            placeholder="Search by title..."
            className="w-full pl-12 pr-4 py-3 bg-white/[0.04] border border-white/20 rounded-xl font-mono text-xs text-white placeholder:text-white/45 focus:outline-none focus:border-white/60 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="grid grid-cols-2 sm:flex sm:items-center gap-2">
          <select
            className="px-3.5 py-3 bg-[#111111] border border-white/20 rounded-xl font-mono text-xs text-white focus:outline-none focus:border-white/60 cursor-pointer font-medium"
            value={categoryFilter}
            onChange={(e) => startTransition(() => setCategoryFilter(e.target.value))}
          >
            <option value="all">All Categories</option>
            {categories.map(c => (
              <option key={c._id || (c as any).id} value={c._id || (c as any).id}>{c.name}</option>
            ))}
          </select>
          <select
            className="px-3.5 py-3 bg-[#111111] border border-white/20 rounded-xl font-mono text-xs text-white focus:outline-none focus:border-white/60 cursor-pointer font-medium"
            value={statusFilter}
            onChange={(e) => startTransition(() => setStatusFilter(e.target.value))}
          >
            <option value="all">All Statuses</option>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </div>
      </div>

      {/* Posts List */}
      <div className="grid grid-cols-1 gap-3 sm:gap-4">
        {loading && posts.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-4">
            <Loader2 className="w-8 h-8 text-white/50 animate-spin" />
            <p className="font-mono text-xs text-white/60 tracking-widest uppercase">Fetching logs...</p>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="py-16 text-center border border-dashed border-white/15 rounded-3xl p-6 bg-white/[0.01] space-y-4">
            <div className="space-y-1">
              <p className="font-pixel text-xs text-white/70 uppercase">NO_ARTICLES_FOUND</p>
              <p className="font-mono text-[11px] text-white/40">Try adjusting your search query, or create a new blog post.</p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleAddTestBlog}
                disabled={isAddingTestBlog}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 font-pixel text-[10px] hover:bg-emerald-500/20 transition-all cursor-pointer font-bold"
              >
                {isAddingTestBlog ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                CREATE_SAMPLE_POST
              </button>
              <button
                type="button"
                onClick={handleCreateNew}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-black font-pixel text-[10px] hover:bg-white/90 transition-all cursor-pointer font-bold"
              >
                <Plus className="w-3.5 h-3.5" />
                NEW_POST
              </button>
            </div>
          </div>
        ) : filteredPosts.map((post) => (
          <div key={post._id} className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-white/15 bg-white/[0.02] hover:border-white/30 transition-all space-y-3 sm:space-y-0 sm:flex sm:items-center sm:justify-between gap-4">
            <div className="flex items-start gap-3 sm:gap-4 min-w-0 flex-1">
              <div className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl border shrink-0 flex items-center justify-center ${post.status === "published" ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400" : "border-amber-500/30 bg-amber-500/10 text-amber-400"}`}>
                <FileText className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div className="space-y-1.5 min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className={`px-2 py-0.5 rounded-md border text-[9px] font-mono font-bold ${post.status === "published" ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300" : "border-amber-500/30 bg-amber-500/10 text-amber-300"}`}>
                    {post.status.toUpperCase()}
                  </span>
                  <span className="px-2 py-0.5 rounded-md border border-white/15 bg-white/5 text-[9px] font-mono text-white/80 font-medium">
                    {post.category?.name || "General"}
                  </span>
                </div>
                <h3 className="text-sm sm:text-base font-pixel text-white uppercase break-words leading-snug">{post.title}</h3>
                <p className="font-mono text-[10px] text-white/60">
                  By {post.author} · {new Date(post.createdAt || post.publishedAt || Date.now()).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                </p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2.5 sm:pt-0 border-t sm:border-t-0 border-white/10 shrink-0">
              <Link href={`/blog/${post.slug}`} target="_blank" className="p-2 sm:p-2.5 rounded-xl border border-white/15 bg-white/5 text-white/70 hover:text-white transition-all cursor-pointer" title="View Article"><ExternalLink className="w-4 h-4" /></Link>
              <button onClick={() => handleEdit(post)} className="p-2 sm:p-2.5 rounded-xl border border-white/15 bg-white/5 text-white/70 hover:text-white transition-all cursor-pointer" title="Edit Post"><Edit3 className="w-4 h-4" /></button>
              <button
                onClick={() => handleDelete(post._id!)}
                disabled={isDeleting === post._id}
                className="p-2 sm:p-2.5 rounded-xl border border-red-500/20 bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all disabled:opacity-50 cursor-pointer"
                title="Delete Post"
              >
                {isDeleting === post._id ? <Loader2 className="w-4 h-4 animate-spin text-red-400" /> : <Trash2 className="w-4 h-4" />}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Category Manager Modal */}
      <AnimatePresence>
        {isCatModalOpen && (
          <div className="fixed inset-0 z-[101] flex items-end sm:items-center justify-center p-0 sm:p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsCatModalOpen(false)} className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 30 }} className="relative w-full sm:max-w-md bg-[#0a0a0a] border border-white/15 rounded-t-[28px] sm:rounded-3xl p-5 sm:p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center border-b border-white/10 pb-4">
                <h3 className="font-pixel text-xs text-white">MANAGE_CATEGORIES</h3>
                <button onClick={() => setIsCatModalOpen(false)} className="text-white/60 hover:text-white p-1 cursor-pointer"><X className="w-5 h-5" /></button>
              </div>

              <form onSubmit={handleCreateCategory} className="flex gap-2">
                <input
                  required
                  type="text"
                  placeholder="New Category Name..."
                  className="flex-1 px-4 py-2.5 bg-white/[0.04] border border-white/20 rounded-xl font-mono text-xs text-white placeholder:text-white/45 focus:outline-none focus:border-white/50"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                />
                <button
                  type="submit"
                  disabled={isSavingCat}
                  className="px-5 py-2.5 bg-white text-black font-mono text-xs font-bold rounded-xl disabled:opacity-50 cursor-pointer"
                >
                  {isSavingCat ? "..." : "ADD"}
                </button>
              </form>

              <div className="max-h-60 overflow-y-auto space-y-2">
                {categories.map(c => (
                  <div key={c._id || (c as any).id} className="flex justify-between items-center p-3 bg-white/[0.03] border border-white/10 rounded-xl">
                    <span className="font-mono text-xs text-white font-medium">{c.name}</span>
                    <button type="button" onClick={() => handleDeleteCategory(c._id || (c as any).id)} className="text-red-400/70 hover:text-red-400 p-1.5 cursor-pointer"><Trash className="w-4 h-4" /></button>
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
          <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsPostModalOpen(false)} className="absolute inset-0 bg-black/90 backdrop-blur-md" />
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 30 }} className="relative w-full sm:max-w-4xl max-h-[92vh] overflow-y-auto bg-[#0a0a0a] border border-white/15 rounded-t-[28px] sm:rounded-3xl shadow-2xl">
              <div className="p-4 sm:p-6 border-b border-white/10 flex items-center justify-between sticky top-0 bg-[#0a0a0a] z-10">
                <div className="space-y-0.5">
                  <h3 className="text-base sm:text-lg font-pixel text-white uppercase">{editingPost ? "EDIT_POST" : "NEW_POST"}</h3>
                  <p className="font-mono text-[9px] text-white/50 uppercase tracking-[0.2em]">sector: ./blogs_manager</p>
                </div>
                <button onClick={() => setIsPostModalOpen(false)} className="p-2 rounded-xl text-white/50 hover:text-white cursor-pointer"><X className="w-5 h-5" /></button>
              </div>

              <form onSubmit={handleSavePost} className="p-4 sm:p-8 space-y-5 sm:space-y-6">
                {/* Poster Preview */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono text-white/70 uppercase pl-1 tracking-[0.2em] font-semibold">Cover Image</label>
                  <div className="relative group aspect-video md:aspect-[21/9] rounded-2xl bg-white/[0.02] border border-dashed border-white/20 overflow-hidden flex items-center justify-center">
                    {formData.coverImage ? (
                      <>
                        <img src={formData.coverImage} alt="Cover image" className="w-full h-full object-cover" />
                        <button type="button" onClick={() => setFormData(prev => ({ ...prev, coverImage: "" }))} className="absolute top-4 right-4 p-2.5 rounded-full bg-red-500/80 hover:bg-red-500 text-white cursor-pointer transition-transform"><Trash className="w-4 h-4" /></button>
                      </>
                    ) : (
                      <label className="flex flex-col items-center justify-center gap-2 cursor-pointer p-6 sm:p-10 text-center hover:bg-white/5 transition-colors w-full h-full">
                        <div className="p-3 sm:p-4 rounded-2xl bg-white/5 border border-white/10">
                          {isUploading ? <Loader2 className="w-6 h-6 animate-spin text-white/60" /> : <Upload className="w-6 h-6 text-white/50" />}
                        </div>
                        <span className="font-pixel text-[10px] text-white/70 uppercase">UPLOAD_COVER_IMAGE</span>
                        {coverUploadError && <p className="text-red-400 font-mono text-[10px] mt-1">{coverUploadError}</p>}
                        <input type="file" className="hidden" accept="image/*" onChange={handleUploadCover} disabled={isUploading} />
                      </label>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  <div className="space-y-1.5 col-span-full">
                    <label className="text-[10px] font-mono text-white/85 font-semibold uppercase pl-1">Blog Title *</label>
                    <input required type="text" className="w-full px-4 py-3 bg-white/[0.04] border border-white/20 rounded-xl font-mono text-xs text-white focus:outline-none focus:border-white/50" value={formData.title} onChange={e => {
                      const t = e.target.value;
                      setFormData(prev => ({ ...prev, title: t, slug: t.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") }));
                    }} />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-white/85 font-semibold uppercase pl-1">Category *</label>
                    <select required className="w-full px-4 py-3 bg-[#111111] border border-white/20 rounded-xl font-mono text-xs text-white focus:outline-none focus:border-white/50 cursor-pointer font-medium" value={formData.category} onChange={e => setFormData(prev => ({ ...prev, category: e.target.value }))}>
                      {categories.map(c => (
                        <option key={c._id || (c as any).id} value={c._id || (c as any).id}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-white/85 font-semibold uppercase pl-1">Author *</label>
                    <input required type="text" className="w-full px-4 py-3 bg-white/[0.04] border border-white/20 rounded-xl font-mono text-xs text-white focus:outline-none focus:border-white/50" value={formData.author} onChange={e => setFormData(prev => ({ ...prev, author: e.target.value }))} />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-white/85 font-semibold uppercase pl-1">Status</label>
                    <select className="w-full px-4 py-3 bg-[#111111] border border-white/20 rounded-xl font-mono text-xs text-white focus:outline-none focus:border-white/50 cursor-pointer font-medium" value={formData.status} onChange={e => setFormData(prev => ({ ...prev, status: e.target.value as any }))}>
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-white/85 font-semibold uppercase pl-1">Excerpt / Summary</label>
                    <input type="text" placeholder="Short description..." className="w-full px-4 py-3 bg-white/[0.04] border border-white/20 rounded-xl font-mono text-xs text-white placeholder:text-white/40 focus:outline-none focus:border-white/50" value={formData.excerpt || ""} onChange={e => setFormData(prev => ({ ...prev, excerpt: e.target.value }))} />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono text-white/85 font-semibold uppercase pl-1">Content (Markdown supported) *</label>
                  <textarea required rows={8} className="w-full px-4 py-3 bg-white/[0.04] border border-white/20 rounded-xl font-mono text-xs text-white focus:outline-none focus:border-white/50 resize-y" value={formData.content} onChange={e => setFormData(prev => ({ ...prev, content: e.target.value }))} />
                </div>

                <div className="pt-4 sm:pt-6 border-t border-white/10 flex flex-col-reverse sm:flex-row gap-2.5 sm:gap-4">
                  <button type="button" onClick={() => setIsPostModalOpen(false)} className="w-full sm:w-auto px-8 py-3.5 bg-white/5 border border-white/15 text-white/70 hover:text-white rounded-xl font-pixel text-[10px] uppercase cursor-pointer">CANCEL</button>
                  <button type="submit" disabled={loading} className="w-full sm:flex-1 py-3.5 sm:py-4 bg-white text-black font-bold rounded-xl font-pixel text-[10px] uppercase hover:bg-white/90 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-[0_4px_20px_rgba(255,255,255,0.15)]">
                    {loading ? <Loader2 className="w-4 h-4 animate-spin text-black" /> : <>EXECUTE::<span className="opacity-60">{editingPost ? "UPDATE" : "CREATE"}</span></>}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
