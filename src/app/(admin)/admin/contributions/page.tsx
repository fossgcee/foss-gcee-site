"use client";

import { useEffect, useState, useCallback } from "react";
import { GitCommit, Search, RefreshCw, Trash2, Plus, X, Link2 } from "lucide-react";

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
  createdAt: string;
}

function AddModal({
  members,
  onSave,
  onClose,
}: {
  members: Member[];
  onSave: (data: { memberId: string; title: string; description: string; url: string }) => Promise<void>;
  onClose: () => void;
}) {
  const [formData, setFormData] = useState({
    memberId: "",
    title: "",
    description: "",
    url: "",
  });
  const [loading, setLoading] = useState(false);

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-[#0a0a0a] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
        <div className="px-6 py-4 border-b border-white/5 flex justify-between items-center">
          <h2 className="font-pixel text-lg text-white">ADD_CONTRIBUTION</h2>
          <button onClick={onClose} className="p-2 text-white/40 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-1.5">
            <label className="font-mono text-[10px] uppercase tracking-widest text-white/40 ml-1">Member</label>
            <select
              required
              value={formData.memberId}
              onChange={(e) => setFormData({ ...formData, memberId: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 font-mono text-sm text-white focus:outline-none focus:ring-1 ring-white/20 appearance-none shadow-inner"
            >
              <option value="" disabled className="bg-[#0a0a0a]">Select a member...</option>
              {members.map((m) => (
                <option key={m._id} value={m._id} className="bg-[#0a0a0a]">
                  {m.name} ({m.department} - Yr {m.year})
                </option>
              ))}
            </select>
          </div>
          
          <div className="space-y-1.5">
            <label className="font-mono text-[10px] uppercase tracking-widest text-white/40 ml-1">Title</label>
            <input
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Added dark mode to website"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 font-mono text-sm text-white focus:outline-none focus:ring-1 ring-white/20"
            />
          </div>
          
          <div className="space-y-1.5">
            <label className="font-mono text-[10px] uppercase tracking-widest text-white/40 ml-1">Description</label>
            <textarea
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Briefly describe the contribution..."
              rows={3}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 font-mono text-sm text-white focus:outline-none focus:ring-1 ring-white/20 resize-none"
            />
          </div>
          
          <div className="space-y-1.5">
            <label className="font-mono text-[10px] uppercase tracking-widest text-white/40 ml-1">URL (Optional)</label>
            <input
              type="url"
              value={formData.url}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              placeholder="e.g. https://github.com/foss-gcee/site/pull/1"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 font-mono text-sm text-white focus:outline-none focus:ring-1 ring-white/20"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl border border-white/10 font-mono text-xs text-white/60 hover:text-white hover:bg-white/5 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !formData.memberId}
              className="px-8 py-2.5 rounded-xl bg-white text-black font-mono text-xs font-bold hover:bg-white/90 transition-all disabled:opacity-50"
            >
              {loading ? "Adding..." : "Add Contribution"}
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
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [contribRes, membersRes] = await Promise.all([
        fetch("/api/admin/contributions"),
        fetch("/api/admin/members?approved=true") // assuming you only add contributions for approved members
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

  const handleAdd = async (data: { memberId: string; title: string; description: string; url: string }) => {
    const res = await fetch("/api/admin/contributions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (result.success) {
      // Refresh to get populated member details
      fetchData();
    } else {
      alert("Error adding contribution: " + result.error);
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
          <h1 className="text-3xl font-pixel text-white">CONTRIBUTIONS_CMS</h1>
          <p className="font-mono text-xs text-white/40">Manage and track member contributions</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-black font-mono text-xs font-bold hover:bg-white/90 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            Add New
          </button>
          <button
            onClick={fetchData}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-white/10 font-mono text-xs text-white/60 hover:text-white hover:bg-white/5 transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by title or member name..."
          className="w-full bg-white/[0.03] border border-white/8 rounded-xl py-3 pl-12 pr-4 font-mono text-xs text-white placeholder:text-white/20 focus:outline-none focus:ring-1 ring-white/20"
          style={{ borderColor: "rgba(255,255,255,0.08)" }}
        />
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-white/5 overflow-hidden">
        {/* Table header */}
        <div
          className="grid gap-4 px-6 py-3 border-b border-white/5"
          style={{ gridTemplateColumns: "1.5fr 2fr 1fr 80px", background: "rgba(255,255,255,0.02)" }}
        >
          <span className="font-mono text-[10px] uppercase tracking-wider text-white/40">Member</span>
          <span className="font-mono text-[10px] uppercase tracking-wider text-white/40">Contribution</span>
          <span className="font-mono text-[10px] uppercase tracking-wider text-white/40">Date</span>
          <span className="font-mono text-[10px] uppercase tracking-wider text-white/40 text-right">Actions</span>
        </div>

        {loading && (
          <div className="py-20 flex flex-col items-center gap-3 opacity-30">
            <RefreshCw className="w-6 h-6 animate-spin" />
            <p className="font-mono text-xs">Fetching from MongoDB...</p>
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="py-20 flex flex-col items-center gap-4 opacity-20">
            <GitCommit className="w-12 h-12" />
            <p className="font-mono text-sm">No contributions found.</p>
          </div>
        )}

        {!loading && filtered.map((c) => (
          <div
            key={c._id}
            className="grid gap-4 px-6 py-4 border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors items-center"
            style={{ gridTemplateColumns: "1.5fr 2fr 1fr 80px" }}
          >
            {/* Member */}
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center font-pixel text-[10px] text-white shrink-0">
                {c.memberId?.name?.charAt(0).toUpperCase() || "?"}
              </div>
              <div className="min-w-0">
                <p className="font-mono text-sm text-white truncate">{c.memberId?.name || "Unknown"}</p>
                <p className="font-mono text-[10px] text-white/40 truncate">{c.memberId?.department} - Yr {c.memberId?.year}</p>
              </div>
            </div>

            {/* Contribution Details */}
            <div className="min-w-0 pr-4">
              <div className="flex items-center gap-2 mb-1">
                <p className="font-mono text-sm text-white truncate">{c.title}</p>
                {c.url && (
                  <a href={c.url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 transition-colors">
                    <Link2 className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
              <p className="font-mono text-[11px] text-white/50 line-clamp-1">{c.description}</p>
            </div>

            {/* Date */}
            <span className="font-mono text-xs text-white/60">
              {new Date(c.createdAt).toLocaleDateString("en-IN", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </span>

            {/* Actions */}
            <div className="flex items-center justify-end">
              <button
                onClick={() => handleDelete(c._id)}
                disabled={deleting === c._id}
                title="Delete contribution"
                className="p-2 rounded-lg text-red-500/40 hover:text-red-400 hover:bg-red-500/10 transition-all disabled:opacity-30"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {!loading && filtered.length > 0 && (
        <p className="font-mono text-[10px] text-white/20 text-right">
          Showing {filtered.length} contribution{filtered.length !== 1 ? "s" : ""}
        </p>
      )}

      {isAddModalOpen && (
        <AddModal
          members={members}
          onSave={handleAdd}
          onClose={() => setIsAddModalOpen(false)}
        />
      )}
    </div>
  );
}
