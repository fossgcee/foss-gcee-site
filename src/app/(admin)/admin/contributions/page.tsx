"use client";

import { useEffect, useState, useCallback } from "react";
import { GitCommit, Search, RefreshCw, Trash2, Plus, X, Link2, Pencil } from "lucide-react";

interface Member {
  _id: string;
  name: string;
  department: string;
  year: string;
}

interface Contribution {
  _id: string;
  memberId: Member;
  title: string;
  description: string;
  url: string;
  links?: { label: string; url: string }[];
  imageUrl?: string;
  isFeatured: boolean;
  order?: number;
  createdAt: string;
}

function convertDriveUrl(url: string): string {
  if (!url) return url;
  
  // Pattern 1: https://drive.google.com/file/d/FILE_ID/view...
  const fileMatch = url.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (fileMatch) return `https://lh3.googleusercontent.com/d/${fileMatch[1]}`;
  
  // Pattern 2: https://drive.google.com/open?id=FILE_ID
  const openMatch = url.match(/drive\.google\.com\/open\?id=([a-zA-Z0-9_-]+)/);
  if (openMatch) return `https://lh3.googleusercontent.com/d/${openMatch[1]}`;
  
  // Pattern 3: https://drive.google.com/uc?id=FILE_ID
  const ucMatch = url.match(/drive\.google\.com\/uc\?(?:export=view&)?id=([a-zA-Z0-9_-]+)/);
  if (ucMatch) return `https://lh3.googleusercontent.com/d/${ucMatch[1]}`;
  
  return url;
}

function ContributionModal({
  members,
  initialData,
  onSave,
  onClose,
}: {
  members: Member[];
  initialData?: Contribution | null;
  onSave: (data: { memberId: string; title: string; description: string; url: string; links: {label: string, url: string}[]; imageUrl: string; isFeatured: boolean; order: number }) => Promise<void>;
  onClose: () => void;
}) {
  const [formData, setFormData] = useState({
    memberId: initialData?.memberId?._id || "",
    title: initialData?.title || "",
    description: initialData?.description || "",
    url: initialData?.url || "",
    links: initialData?.links || [],
    imageUrl: initialData?.imageUrl || "",
    isFeatured: initialData?.isFeatured || false,
    order: initialData?.order || 0,
  });
  const [loading, setLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const [memberSearch, setMemberSearch] = useState(initialData?.memberId?.name || "");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  const filteredMembers = members.filter(m => 
    m.name.toLowerCase().includes(memberSearch.toLowerCase()) || 
    m.department.toLowerCase().includes(memberSearch.toLowerCase())
  );

  const handleUploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const name = file.name || "image";
      const ext = name.includes(".") ? name.split(".").pop()!.toLowerCase() : "";
      const base = name.replace(/\.[^/.]+$/, "").toLowerCase();
      const safeBase = base.replace(/[^a-z0-9-]+/g, "-").replace(/(^-|-$)/g, "") || "image";
      const stamp = new Date().toISOString().replace(/[:.]/g, "-");
      const filename = `contributions/${stamp}-${safeBase}${ext ? `.${ext}` : ""}`;

      const res = await fetch(`/api/admin/contributions/upload?filename=${encodeURIComponent(filename)}`, {
        method: "POST", body: file,
      });
      const d = await res.json();
      if (d.url) setFormData(prev => ({ ...prev, imageUrl: d.url }));
      else alert("Upload failed");
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave(formData);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md">
      <div className="w-full max-w-lg bg-[#0a0a0a] border border-white/15 rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        <div className="px-5 sm:px-6 py-4 border-b border-white/10 flex justify-between items-center bg-white/[0.02]">
          <h2 className="font-pixel text-base sm:text-lg text-white">{initialData ? "EDIT_CONTRIBUTION" : "ADD_CONTRIBUTION"}</h2>
          <button 
            type="button"
            onClick={onClose} 
            className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-xl transition-all"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 overflow-y-auto overflow-x-hidden flex-1">
          <div className="space-y-1.5 relative">
            <label className="font-mono text-[10px] uppercase tracking-widest text-white/70 font-semibold ml-1">Member (Search by Name)</label>
            <input
              required={!formData.memberId}
              value={memberSearch}
              onChange={(e) => {
                setMemberSearch(e.target.value);
                setIsDropdownOpen(true);
                // Clear memberId if they start typing something else
                if (formData.memberId && e.target.value !== members.find(m => m._id === formData.memberId)?.name) {
                  setFormData({ ...formData, memberId: "" });
                }
              }}
              onFocus={() => setIsDropdownOpen(true)}
              onBlur={() => setTimeout(() => setIsDropdownOpen(false), 200)}
              placeholder="Start typing a name or department..."
              className="w-full bg-white/[0.05] border border-white/15 rounded-xl px-4 py-3 font-mono text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-1 ring-white/30"
            />
            
            {isDropdownOpen && memberSearch.length > 0 && (
              <div 
                className="absolute z-50 w-full mt-1 bg-[#1a1a1a] border border-white/15 rounded-xl max-h-48 overflow-y-auto shadow-2xl"
                onMouseDown={(e) => e.preventDefault()}
              >
                {filteredMembers.length > 0 ? (
                  filteredMembers.map(m => (
                    <div 
                      key={m._id}
                      className="px-4 py-3 hover:bg-white/10 cursor-pointer border-b border-white/5 last:border-b-0 transition-colors"
                      onClick={() => {
                        setMemberSearch(m.name);
                        setFormData({ ...formData, memberId: m._id });
                        setIsDropdownOpen(false);
                      }}
                    >
                      <div className="font-semibold text-sm text-white">{m.name}</div>
                      <div className="font-mono text-[10px] text-white/60 mt-0.5">{m.department} • Year {m.year}</div>
                    </div>
                  ))
                ) : (
                  <div className="px-4 py-3 font-mono text-xs text-white/50">{`No members found matching "${memberSearch}"`}</div>
                )}
              </div>
            )}
          </div>
          
          <div className="space-y-1.5">
            <label className="font-mono text-[10px] uppercase tracking-widest text-white/70 font-semibold ml-1">Title</label>
            <input
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Added dark mode to website"
              className="w-full bg-white/[0.05] border border-white/15 rounded-xl px-4 py-3 font-mono text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-1 ring-white/30"
            />
          </div>
          
          <div className="space-y-1.5">
            <label className="font-mono text-[10px] uppercase tracking-widest text-white/70 font-semibold ml-1">Description</label>
            <textarea
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Briefly describe the contribution..."
              rows={3}
              className="w-full bg-white/[0.05] border border-white/15 rounded-xl px-4 py-3 font-mono text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-1 ring-white/30 resize-none"
            />
          </div>
          
          <div className="space-y-1.5">
            <label className="font-mono text-[10px] uppercase tracking-widest text-white/70 font-semibold ml-1">Project Image</label>
            <div className="flex flex-col gap-3">
              <div className="flex gap-3 sm:gap-4 items-center">
                {formData.imageUrl && (
                  <div className="w-16 h-16 rounded-xl overflow-hidden relative shrink-0 border border-white/15">
                    <img src={formData.imageUrl} alt="Project" className="w-full h-full object-cover" />
                    <button type="button" onClick={() => setFormData(prev => ({ ...prev, imageUrl: "" }))} className="absolute top-0 right-0 p-1 bg-black/80 text-white rounded-bl hover:bg-red-500 transition-colors">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
                <label className="flex-1 px-4 py-3 bg-white/[0.05] border border-white/15 rounded-xl font-mono text-xs sm:text-sm text-white/80 hover:bg-white/10 cursor-pointer transition-colors text-center">
                  {isUploading ? "Uploading..." : formData.imageUrl ? "Upload Different Image" : "Upload Image File"}
                  <input type="file" accept="image/*" onChange={handleUploadImage} disabled={isUploading} className="hidden" />
                </label>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-px bg-white/10 flex-1"></div>
                <span className="font-mono text-[10px] text-white/50">OR</span>
                <div className="h-px bg-white/10 flex-1"></div>
              </div>
              <input
                type="url"
                value={formData.imageUrl}
                onChange={(e) => {
                  const val = e.target.value;
                  setFormData({ ...formData, imageUrl: convertDriveUrl(val) });
                }}
                placeholder="https://drive.google.com/... or any image URL"
                className="w-full bg-white/[0.05] border border-white/15 rounded-xl px-4 py-3 font-mono text-xs sm:text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-1 ring-white/30"
              />
            </div>
          </div>
          
          <div className="space-y-1.5">
            <label className="font-mono text-[10px] uppercase tracking-widest text-white/70 font-semibold ml-1">Main Link (Optional)</label>
            <input
              type="url"
              value={formData.url}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              placeholder="e.g. https://github.com/foss-gcee/site"
              className="w-full bg-white/[0.05] border border-white/15 rounded-xl px-4 py-3 font-mono text-xs sm:text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-1 ring-white/30"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center ml-1">
              <label className="font-mono text-[10px] uppercase tracking-widest text-white/70 font-semibold">Additional Links</label>
              <button 
                type="button" 
                onClick={() => setFormData({ ...formData, links: [...formData.links, { label: "", url: "" }] })}
                className="text-[10px] font-mono text-white/80 hover:text-white px-2.5 py-1.5 bg-white/10 rounded-lg border border-white/15"
              >
                + Add Link
              </button>
            </div>
            {formData.links.map((link, idx) => (
              <div key={idx} className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center mt-2 p-2.5 sm:p-0 rounded-xl bg-white/[0.02] sm:bg-transparent border border-white/5 sm:border-0">
                <input
                  type="text"
                  value={link.label}
                  onChange={(e) => {
                    const newLinks = [...formData.links];
                    newLinks[idx].label = e.target.value;
                    setFormData({ ...formData, links: newLinks });
                  }}
                  placeholder="Label (e.g. GitHub)"
                  className="w-full sm:w-1/3 bg-white/[0.05] border border-white/15 rounded-xl px-3 py-2.5 font-mono text-xs text-white placeholder:text-white/40 focus:outline-none focus:ring-1 ring-white/30"
                />
                <div className="flex items-center gap-2 flex-1">
                  <input
                    type="url"
                    value={link.url}
                    onChange={(e) => {
                      const newLinks = [...formData.links];
                      newLinks[idx].url = e.target.value;
                      setFormData({ ...formData, links: newLinks });
                    }}
                    placeholder="URL"
                    className="flex-1 bg-white/[0.05] border border-white/15 rounded-xl px-3 py-2.5 font-mono text-xs text-white placeholder:text-white/40 focus:outline-none focus:ring-1 ring-white/30"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const newLinks = [...formData.links];
                      newLinks.splice(idx, 1);
                      setFormData({ ...formData, links: newLinks });
                    }}
                    className="p-2.5 text-white/50 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors shrink-0"
                    aria-label="Remove link"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-3 pt-2">
            <input
              type="checkbox"
              id="isFeatured"
              checked={formData.isFeatured}
              onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
              className="w-4 h-4 rounded border-white/30 bg-white/10 text-white focus:ring-1 focus:ring-white/30"
            />
            <label htmlFor="isFeatured" className="font-mono text-xs uppercase tracking-wider text-white/80 cursor-pointer select-none">
              Featured on Home Page
            </label>
          </div>

          <div className="space-y-1.5">
            <label className="font-mono text-[10px] uppercase tracking-widest text-white/70 font-semibold ml-1">Order</label>
            <input
              type="number"
              value={formData.order}
              onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
              placeholder="0"
              className="w-full bg-white/[0.05] border border-white/15 rounded-xl px-4 py-3 font-mono text-sm text-white focus:outline-none focus:ring-1 ring-white/30"
            />
            <p className="font-mono text-[10px] text-white/50 ml-1">Lower numbers appear first. Example: 1, 2, 3.</p>
          </div>

          <div className="flex flex-col-reverse sm:flex-row justify-end gap-2.5 sm:gap-3 pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-6 py-3 rounded-xl border border-white/15 font-mono text-xs text-white/70 hover:text-white hover:bg-white/5 transition-all text-center min-h-[44px]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !formData.memberId}
              className="w-full sm:w-auto px-8 py-3 rounded-xl bg-white text-black font-mono text-xs font-bold hover:bg-white/90 transition-all disabled:opacity-50 text-center min-h-[44px]"
            >
              {loading ? (initialData ? "Saving..." : "Adding...") : (initialData ? "Save Changes" : "Add Contribution")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AdminContributionsPage() {
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingContribution, setEditingContribution] = useState<Contribution | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [contribRes, membersRes] = await Promise.all([
        fetch("/api/admin/contributions"),
        fetch("/api/admin/members?approved=true")
      ]);
      
      const contribData = await contribRes.json();
      const membersData = await membersRes.json();
      
      if (contribData.success) setContributions(contribData.data);
      if (membersData.success) setMembers(membersData.data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this contribution? This cannot be undone.")) return;
    setDeleting(id);
    try {
      await fetch(`/api/admin/contributions/${id}`, {
        method: "DELETE",
      });
      setContributions((prev) => prev.filter((c) => c._id !== id));
    } finally {
      setDeleting(null);
    }
  };

  const handleEdit = (contribution: Contribution) => {
    setEditingContribution(contribution);
    setIsModalOpen(true);
  };

  const handleSave = async (data: { memberId: string; title: string; description: string; url: string; links: {label: string, url: string}[]; imageUrl: string; isFeatured: boolean; order: number }) => {
    const url = editingContribution ? `/api/admin/contributions/${editingContribution._id}` : "/api/admin/contributions";
    const method = editingContribution ? "PUT" : "POST";
    
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (result.success) {
      fetchData();
      setIsModalOpen(false);
      setEditingContribution(null);
    } else {
      alert(`Error ${editingContribution ? "updating" : "adding"} contribution: ` + result.error);
    }
  };

  const filtered = contributions.filter(c => 
    c.title.toLowerCase().includes(search.toLowerCase()) || 
    (c.memberId && c.memberId.name.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-8 py-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div className="space-y-1">
          <h1 className="font-pixel text-white whitespace-nowrap text-[clamp(1.1rem,4vw,1.875rem)]">CONTRIBUTIONS_CMS</h1>
          <p className="font-mono text-xs text-white/70">Manage and track member contributions</p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => {
              setEditingContribution(null);
              setIsModalOpen(true);
            }}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white text-black font-mono text-xs font-bold hover:bg-white/90 transition-all min-h-[44px]"
          >
            <Plus className="w-4 h-4" />
            Add New
          </button>
          <button
            onClick={fetchData}
            title="Refresh contributions"
            className="flex items-center justify-center px-4 py-3 rounded-xl border border-white/15 bg-white/5 font-mono text-xs text-white/80 hover:text-white hover:bg-white/10 transition-all min-h-[44px] min-w-[44px]"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by title or member name..."
          className="w-full bg-white/[0.04] border border-white/15 rounded-xl py-3 pl-12 pr-4 font-mono text-xs text-white placeholder:text-white/40 focus:outline-none focus:ring-1 ring-white/30 transition-all"
        />
      </div>

      {/* Loading state */}
      {loading && (
        <div className="py-20 flex flex-col items-center gap-3 text-white/60">
          <RefreshCw className="w-6 h-6 animate-spin text-white/80" />
          <p className="font-mono text-xs tracking-wider uppercase">Loading contributions...</p>
        </div>
      )}

      {/* Empty state */}
      {!loading && filtered.length === 0 && (
        <div className="py-20 flex flex-col items-center gap-4 text-white/40 border border-white/10 rounded-2xl bg-white/[0.02]">
          <GitCommit className="w-12 h-12 opacity-60" />
          <p className="font-mono text-sm text-white/70">No contributions found.</p>
        </div>
      )}

      {/* Mobile Cards View (< 768px) */}
      {!loading && filtered.length > 0 && (
        <div className="md:hidden space-y-3">
          {filtered.map((c) => (
            <div
              key={c._id}
              className="p-4 rounded-2xl border border-white/15 bg-white/[0.03] space-y-3 hover:border-white/25 transition-all"
            >
              {/* Member header row */}
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-white/10 border border-white/15 flex items-center justify-center font-pixel text-xs text-white shrink-0">
                    {c.memberId?.name?.charAt(0).toUpperCase() || "?"}
                  </div>
                  <div className="min-w-0">
                    <p className="font-mono text-sm font-semibold text-white truncate">{c.memberId?.name || "Unknown"}</p>
                    <p className="font-mono text-[10px] text-white/70 truncate">{c.memberId?.department} • Yr {c.memberId?.year}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  {c.isFeatured && (
                    <span className="px-2 py-0.5 rounded-md border border-amber-500/30 bg-amber-500/10 text-amber-300 text-[9px] font-mono font-semibold">
                      FEATURED
                    </span>
                  )}
                  <span className="px-2 py-0.5 rounded-md border border-white/15 bg-white/5 font-mono text-[10px] text-white/80">
                    #{c.order || 0}
                  </span>
                </div>
              </div>

              {/* Title & description */}
              <div className="space-y-1.5 pt-2 border-t border-white/5">
                <div className="flex items-start justify-between gap-2">
                  <h4 className="font-mono text-sm font-bold text-white break-words">{c.title}</h4>
                  {c.url && (
                    <a
                      href={c.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 text-blue-400 hover:text-blue-300 transition-colors shrink-0"
                      title="Open external link"
                    >
                      <Link2 className="w-4 h-4" />
                    </a>
                  )}
                </div>
                <p className="font-mono text-xs text-white/70 line-clamp-3 leading-relaxed">{c.description}</p>
                {c.imageUrl && (
                  <div className="mt-2 w-full h-36 rounded-xl overflow-hidden border border-white/15 bg-white/5">
                    <img src={c.imageUrl} alt={c.title} className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              {/* Footer: Date & Actions */}
              <div className="flex items-center justify-between pt-2.5 border-t border-white/5">
                <span className="font-mono text-[11px] text-white/60">
                  {new Date(c.createdAt).toLocaleDateString("en-IN", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEdit(c)}
                    className="flex items-center gap-1 px-3 py-2 rounded-xl border border-white/15 bg-white/5 text-white/90 hover:text-white hover:bg-white/10 text-xs font-mono min-h-[40px] transition-all"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => handleDelete(c._id)}
                    disabled={deleting === c._id}
                    className="flex items-center gap-1 px-3 py-2 rounded-xl border border-red-500/25 bg-red-500/10 text-red-400 hover:text-red-300 hover:bg-red-500/20 text-xs font-mono min-h-[40px] transition-all disabled:opacity-40"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Desktop Table View (>= 768px) */}
      {!loading && filtered.length > 0 && (
        <div className="hidden md:block rounded-2xl border border-white/15 overflow-hidden bg-black/40">
          <div className="overflow-x-auto min-w-full">
            <div className="min-w-[680px]">
              {/* Table header */}
              <div
                className="grid gap-4 px-6 py-3 border-b border-white/10 bg-white/[0.03]"
                style={{ gridTemplateColumns: "1.5fr 2fr 1fr 1fr 90px" }}
              >
                <span className="font-mono text-[10px] uppercase tracking-wider text-white/70 font-semibold">Member</span>
                <span className="font-mono text-[10px] uppercase tracking-wider text-white/70 font-semibold">Contribution</span>
                <span className="font-mono text-[10px] uppercase tracking-wider text-white/70 font-semibold">Order</span>
                <span className="font-mono text-[10px] uppercase tracking-wider text-white/70 font-semibold">Date</span>
                <span className="font-mono text-[10px] uppercase tracking-wider text-white/70 font-semibold text-right">Actions</span>
              </div>

              {filtered.map((c) => (
                <div
                  key={c._id}
                  className="grid gap-4 px-6 py-4 border-b border-white/[0.05] hover:bg-white/[0.02] transition-colors items-center"
                  style={{ gridTemplateColumns: "1.5fr 2fr 1fr 1fr 90px" }}
                >
                  {/* Member */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-white/10 border border-white/15 flex items-center justify-center font-pixel text-[11px] text-white shrink-0">
                      {c.memberId?.name?.charAt(0).toUpperCase() || "?"}
                    </div>
                    <div className="min-w-0">
                      <p className="font-mono text-sm text-white font-medium truncate">{c.memberId?.name || "Unknown"}</p>
                      <p className="font-mono text-[10px] text-white/60 truncate">{c.memberId?.department} - Yr {c.memberId?.year}</p>
                    </div>
                  </div>

                  {/* Contribution Details */}
                  <div className="min-w-0 pr-4">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-mono text-sm text-white font-semibold truncate">{c.title}</p>
                      {c.url && (
                        <a href={c.url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 transition-colors shrink-0">
                          <Link2 className="w-3.5 h-3.5" />
                        </a>
                      )}
                      {c.isFeatured && (
                        <span className="px-1.5 py-0.5 rounded text-[8px] font-mono border border-amber-500/30 bg-amber-500/10 text-amber-300 font-semibold shrink-0">
                          FEATURED
                        </span>
                      )}
                    </div>
                    <p className="font-mono text-[11px] text-white/60 line-clamp-1">{c.description}</p>
                  </div>

                  {/* Order */}
                  <span className="font-mono text-xs text-white/75">
                    {c.order || 0}
                  </span>

                  {/* Date */}
                  <span className="font-mono text-xs text-white/75">
                    {new Date(c.createdAt).toLocaleDateString("en-IN", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </span>

                  {/* Actions */}
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => handleEdit(c)}
                      title="Edit contribution"
                      className="p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-all"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(c._id)}
                      disabled={deleting === c._id}
                      title="Delete contribution"
                      className="p-2 rounded-lg text-red-400/70 hover:text-red-400 hover:bg-red-500/15 transition-all disabled:opacity-30"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {!loading && filtered.length > 0 && (
        <p className="font-mono text-[11px] text-white/50 text-right">
          Showing {filtered.length} contribution{filtered.length !== 1 ? "s" : ""}
        </p>
      )}

      {isModalOpen && (
        <ContributionModal
          members={members}
          initialData={editingContribution}
          onSave={handleSave}
          onClose={() => {
            setIsModalOpen(false);
            setEditingContribution(null);
          }}
        />
      )}
    </div>
  );
}
