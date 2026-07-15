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
            onChange={(e) => startTransition(() => setCategoryFilter(e.target.value))}
          >
            <option value="all" className="text-black">All Categories</option>
            {categories.map(c => (
              <option key={c._id} value={c._id} className="text-black">{c.name}</option>
            ))}
          </select>
          <select
            className="px-4 py-2.5 bg-white/[0.02] border border-white/5 rounded-xl font-mono text-xs text-white"
            value={statusFilter}
            onChange={(e) => startTransition(() => setStatusFilter(e.target.value))}
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
                        {coverUploadError && <p className="text-red-500 font-mono text-[10px] mt-1">{coverUploadError}</p>}
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
