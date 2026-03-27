"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Users, Search, RefreshCw, Trash2, CheckCircle2,
  XCircle, Link2, Phone, Mail, ChevronDown, ChevronUp,
  ShieldCheck, Tag, X, Check, Edit2,
} from "lucide-react";

interface Registration {
  _id: string;
  name: string;
  email: string;
  linkedin: string;
  phone: string;
  year: string;
  department: string;
  otpVerified: boolean;
  approved: boolean;
  role: string;
  createdAt: string;
}

type FilterType = "all" | "verified" | "unverified" | "approved";
type SortKey = "createdAt" | "name" | "year";
type SortDir = "asc" | "desc";

function VerifiedBadge({ verified }: { verified: boolean }) {
  return verified ? (
    <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 font-mono text-[10px] text-emerald-400">
      <CheckCircle2 className="w-3 h-3" /> Verified
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 font-mono text-[10px] text-amber-400">
      <XCircle className="w-3 h-3" /> Pending
    </span>
  );
}

function SortButton({ label, sortKey, current, dir, onClick }: {
  label: string; sortKey: SortKey; current: SortKey; dir: SortDir; onClick: (k: SortKey) => void;
}) {
  const active = current === sortKey;
  return (
    <button
      onClick={() => onClick(sortKey)}
      className="flex items-center gap-1 font-mono text-[10px] uppercase tracking-wider text-white/40 hover:text-white transition-colors"
    >
      {label}
      {active ? (dir === "desc" ? <ChevronDown className="w-3 h-3 text-white" /> : <ChevronUp className="w-3 h-3 text-white" />) : null}
    </button>
  );
}

// ——— Inline role editor ———
function RoleInput({ currentRole, onSave, onCancel }: {
  currentRole: string; onSave: (role: string) => void; onCancel: () => void;
}) {
  const [value, setValue] = useState(currentRole);
  return (
    <div className="flex items-center gap-2 mt-0.5" onClick={(e) => e.stopPropagation()}>
      <input
        autoFocus
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") onSave(value);
          if (e.key === "Escape") onCancel();
        }}
        placeholder="e.g. Core Member, Secretary..."
        className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 font-mono text-xs text-white focus:outline-none focus:ring-1 ring-white/20 placeholder:text-white/20"
      />
      <button
        onClick={() => onSave(value)}
        className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-colors"
      >
        <Check className="w-3.5 h-3.5" />
      </button>
      <button
        onClick={onCancel}
        className="p-1.5 rounded-lg bg-white/5 text-white/40 hover:bg-white/10 transition-colors"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

// ——— Edit Modal ———
function EditModal({ member, onSave, onClose }: {
  member: Registration;
  onSave: (data: Partial<Registration>) => Promise<void>;
  onClose: () => void;
}) {
  const [formData, setFormData] = useState({
    name: member.name,
    email: member.email,
    phone: member.phone,
    linkedin: member.linkedin,
    year: member.year,
    department: member.department,
    role: member.role || "",
    otpVerified: member.otpVerified,
    approved: member.approved,
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
      <div className="w-full max-w-2xl bg-[#0a0a0a] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
        <div className="px-6 py-4 border-b border-white/5 flex justify-between items-center">
          <h2 className="font-pixel text-lg text-white">EDIT_MEMBER</h2>
          <button onClick={onClose} className="p-2 text-white/40 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="font-mono text-[10px] uppercase tracking-widest text-white/40 ml-1">Full Name</label>
              <input
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 font-mono text-sm text-white focus:outline-none focus:ring-1 ring-white/20"
              />
            </div>
            <div className="space-y-1.5">
              <label className="font-mono text-[10px] uppercase tracking-widest text-white/40 ml-1">Email Address</label>
              <input
                required
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 font-mono text-sm text-white focus:outline-none focus:ring-1 ring-white/20"
              />
            </div>
            <div className="space-y-1.5">
              <label className="font-mono text-[10px] uppercase tracking-widest text-white/40 ml-1">Phone Number</label>
              <input
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 font-mono text-sm text-white focus:outline-none focus:ring-1 ring-white/20"
              />
            </div>
            <div className="space-y-1.5">
              <label className="font-mono text-[10px] uppercase tracking-widest text-white/40 ml-1">LinkedIn Profile</label>
              <input
                required
                value={formData.linkedin}
                onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 font-mono text-sm text-white focus:outline-none focus:ring-1 ring-white/20"
              />
            </div>
            <div className="space-y-1.5">
              <label className="font-mono text-[10px] uppercase tracking-widest text-white/40 ml-1">Department</label>
              <select
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 font-mono text-sm text-white focus:outline-none focus:ring-1 ring-white/20 appearance-none shadow-inner"
              >
                {[
                  "Computer Science & Engineering",
                  "Information Technology",
                  "Electronics & Communication Engineering",
                  "Electrical & Electronics Engineering",
                  "Mechanical Engineering",
                  "Civil Engineering",
                  "Artificial Intelligence & Data Science",
                  "Other",
                ].map((dept) => (
                  <option key={dept} value={dept} className="bg-[#0a0a0a]">{dept}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="font-mono text-[10px] uppercase tracking-widest text-white/40 ml-1">Year</label>
              <select
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 font-mono text-sm text-white focus:outline-none focus:ring-1 ring-white/20 appearance-none shadow-inner"
              >
                {["1st Year", "2nd Year", "3rd Year", "4th Year"].map((year) => (
                  <option key={year} value={year} className="bg-[#0a0a0a]">{year}</option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2 space-y-1.5">
              <label className="font-mono text-[10px] uppercase tracking-widest text-white/40 ml-1">Role</label>
              <input
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                placeholder="e.g. Core Member, Secretary..."
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 font-mono text-sm text-white focus:outline-none focus:ring-1 ring-white/20"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-4 pt-4 border-t border-white/5">
            <label className="flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                checked={formData.otpVerified}
                onChange={(e) => setFormData({ ...formData, otpVerified: e.target.checked })}
                className="w-4 h-4 rounded border-white/10 bg-white/5 text-emerald-500 focus:ring-offset-0 focus:ring-0"
              />
              <span className="font-mono text-xs text-white/60 group-hover:text-white transition-colors">Verified</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                checked={formData.approved}
                onChange={(e) => setFormData({ ...formData, approved: e.target.checked })}
                className="w-4 h-4 rounded border-white/10 bg-white/5 text-blue-500 focus:ring-offset-0 focus:ring-0"
              />
              <span className="font-mono text-xs text-white/60 group-hover:text-white transition-colors">Approved</span>
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl border border-white/10 font-mono text-xs text-white/60 hover:text-white hover:bg-white/5 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-2.5 rounded-xl bg-white text-black font-mono text-xs font-bold hover:bg-white/90 transition-all disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AdminMembersPage() {
  const [members, setMembers] = useState<Registration[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterType>("all");
  const [sortKey, setSortKey] = useState<SortKey>("createdAt");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [editingRole, setEditingRole] = useState<string | null>(null);
  const [editingMember, setEditingMember] = useState<Registration | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchMembers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (filter === "verified") params.set("verified", "true");
      if (filter === "unverified") params.set("verified", "false");
      if (filter === "approved") params.set("approved", "true");

      const res = await fetch(`/api/admin/members?${params}`);
      const data = await res.json();
      if (data.success) setMembers(data.data);
    } finally {
      setLoading(false);
    }
  }, [search, filter]);

  useEffect(() => {
    const t = setTimeout(fetchMembers, 300);
    return () => clearTimeout(t);
  }, [fetchMembers]);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this registration? This cannot be undone.")) return;
    setDeleting(id);
    try {
      await fetch("/api/admin/members", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      setMembers((prev) => prev.filter((m) => m._id !== id));
    } finally {
      setDeleting(null);
    }
  };

  const handleApprove = async (id: string, currentApproved: boolean) => {
    setActionLoading(id + "-approve");
    try {
      const res = await fetch("/api/admin/members", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, approved: !currentApproved }),
      });
      const data = await res.json();
      if (data.success) {
        setMembers((prev) =>
          prev.map((m) => (m._id === id ? { ...m, approved: data.data.approved } : m))
        );
      }
    } finally {
      setActionLoading(null);
    }
  };

  const handleSaveRole = async (id: string, role: string) => {
    setActionLoading(id + "-role");
    setEditingRole(null);
    try {
      const res = await fetch("/api/admin/members", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, role }),
      });
      const data = await res.json();
      if (data.success) {
        setMembers((prev) =>
          prev.map((m) => (m._id === id ? { ...m, role: data.data.role } : m))
        );
      }
    } finally {
      setActionLoading(null);
    }
  };

  const handleUpdateMember = async (data: Partial<Registration>) => {
    if (!editingMember) return;
    setActionLoading(editingMember._id + "-update");
    try {
      const res = await fetch("/api/admin/members", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editingMember._id, ...data }),
      });
      const result = await res.json();
      if (result.success) {
        setMembers((prev) =>
          prev.map((m) => (m._id === editingMember._id ? { ...m, ...result.data } : m))
        );
      }
    } finally {
      setActionLoading(null);
    }
  };

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("desc"); }
  };

  const sorted = [...members].sort((a, b) => {
    const va = a[sortKey], vb = b[sortKey];
    const cmp = va < vb ? -1 : va > vb ? 1 : 0;
    return sortDir === "asc" ? cmp : -cmp;
  });

  const verified = members.filter((m) => m.otpVerified).length;
  const approved = members.filter((m) => m.approved).length;
  const pending = members.length - verified;

  return (
    <div className="space-y-8 py-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-pixel text-white">REGISTERED_MEMBERS</h1>
          <p className="font-mono text-xs text-white/40">All club join requests from the registration portal</p>
        </div>
        <button
          onClick={fetchMembers}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-white/10 font-mono text-xs text-white/60 hover:text-white hover:bg-white/5 transition-all"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Total", value: members.length, color: "text-white" },
          { label: "Verified", value: verified, color: "text-emerald-400" },
          { label: "Approved", value: approved, color: "text-blue-400" },
          { label: "Pending OTP", value: pending, color: "text-amber-400" },
        ].map((s) => (
          <div key={s.label} className="p-5 rounded-2xl border border-white/5 bg-white/[0.02] flex flex-col gap-1">
            <span className={`text-2xl font-pixel ${s.color}`}>{s.value}</span>
            <span className="font-mono text-[10px] text-white/30 uppercase tracking-widest">{s.label}</span>
          </div>
        ))}
      </div>

      {/* Filters + Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, department, year..."
            className="w-full bg-white/[0.03] border border-white/8 rounded-xl py-3 pl-12 pr-4 font-mono text-xs text-white placeholder:text-white/20 focus:outline-none focus:ring-1 ring-white/20"
            style={{ borderColor: "rgba(255,255,255,0.08)" }}
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {(["all", "verified", "approved", "unverified"] as FilterType[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className="px-4 py-2.5 rounded-xl font-mono text-[10px] uppercase tracking-wider transition-all border"
              style={{
                background: filter === f ? "white" : "transparent",
                color: filter === f ? "black" : "rgba(255,255,255,0.4)",
                borderColor: filter === f ? "white" : "rgba(255,255,255,0.08)",
              }}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-white/5 overflow-hidden">
        {/* Table header */}
        <div
          className="grid gap-4 px-6 py-3 border-b border-white/5"
          style={{ gridTemplateColumns: "2fr 2fr 1.2fr 1fr 0.8fr 160px", background: "rgba(255,255,255,0.02)" }}
        >
          <SortButton label="Name" sortKey="name" current={sortKey} dir={sortDir} onClick={handleSort} />
          <span className="font-mono text-[10px] uppercase tracking-wider text-white/40">Email</span>
          <span className="font-mono text-[10px] uppercase tracking-wider text-white/40">Department</span>
          <SortButton label="Year" sortKey="year" current={sortKey} dir={sortDir} onClick={handleSort} />
          <span className="font-mono text-[10px] uppercase tracking-wider text-white/40">Status</span>
          <span className="font-mono text-[10px] uppercase tracking-wider text-white/40">Actions</span>
        </div>

        {loading && (
          <div className="py-20 flex flex-col items-center gap-3 opacity-30">
            <RefreshCw className="w-6 h-6 animate-spin" />
            <p className="font-mono text-xs">Fetching from MongoDB...</p>
          </div>
        )}

        {!loading && sorted.length === 0 && (
          <div className="py-20 flex flex-col items-center gap-4 opacity-20">
            <Users className="w-12 h-12" />
            <p className="font-mono text-sm">No registrations found.</p>
          </div>
        )}

        {!loading && sorted.map((m) => (
          <div key={m._id}>
            {/* Main row */}
            <div
              className="grid gap-4 px-6 py-4 border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors cursor-pointer items-center"
              style={{ gridTemplateColumns: "2fr 2fr 1.2fr 1fr 0.8fr 160px" }}
              onClick={() => setExpanded(expanded === m._id ? null : m._id)}
            >
              {/* Name + approved indicator */}
              <div className="flex items-center gap-3 min-w-0">
                <div className="relative shrink-0">
                  <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center font-pixel text-[10px] text-white">
                    {m.name.charAt(0).toUpperCase()}
                  </div>
                  {m.approved && (
                    <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-blue-500 border-2 border-[#080808] flex items-center justify-center">
                      <Check className="w-2 h-2 text-white" strokeWidth={3} />
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="font-mono text-sm text-white truncate">{m.name}</p>
                  {m.role && (
                    <p className="font-mono text-[10px] text-blue-400/80 truncate">{m.role}</p>
                  )}
                </div>
              </div>

              <span className="font-mono text-xs text-white/50 truncate">{m.email}</span>

              <span className="font-mono text-xs text-white/50 truncate">
                {m.department.replace("Engineering", "Eng.").replace("Computer Science", "CS")}
              </span>

              <span className="font-mono text-xs text-white/60">{m.year}</span>

              <VerifiedBadge verified={m.otpVerified} />

              {/* Actions */}
              <div
                className="flex items-center gap-1.5"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Approve / Un-approve */}
                <button
                  onClick={() => handleApprove(m._id, m.approved)}
                  disabled={actionLoading === m._id + "-approve"}
                  title={m.approved ? "Revoke approval" : "Approve member"}
                  className={`p-2 rounded-lg transition-all ${
                    m.approved
                      ? "bg-blue-500/20 text-blue-400 hover:bg-blue-500/30"
                      : "bg-white/5 text-white/30 hover:bg-white/10 hover:text-white"
                  } disabled:opacity-30`}
                >
                  <ShieldCheck className="w-4 h-4" />
                </button>

                {/* Assign role */}
                <button
                  onClick={() => setEditingRole(editingRole === m._id ? null : m._id)}
                  title="Assign role"
                  className={`p-2 rounded-lg transition-all ${
                    m.role
                      ? "bg-purple-500/20 text-purple-400 hover:bg-purple-500/30"
                      : "bg-white/5 text-white/30 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <Tag className="w-4 h-4" />
                </button>

                {/* Edit details */}
                <button
                  onClick={() => setEditingMember(m)}
                  title="Edit member details"
                  className="p-2 rounded-lg bg-white/5 text-white/30 hover:bg-white/10 hover:text-white transition-all"
                >
                  <Edit2 className="w-4 h-4" />
                </button>

                {/* Delete */}
                <button
                  onClick={() => handleDelete(m._id)}
                  disabled={deleting === m._id}
                  title="Delete registration"
                  className="p-2 rounded-lg text-red-500/40 hover:text-red-400 hover:bg-red-500/10 transition-all disabled:opacity-30"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Role editor — inline below row */}
            {editingRole === m._id && (
              <div
                className="px-6 py-3 border-b border-white/[0.04]"
                style={{ background: "rgba(139,92,246,0.04)" }}
              >
                <p className="font-mono text-[10px] text-purple-400/70 uppercase tracking-widest mb-2">
                  Assign role for {m.name}
                </p>
                <RoleInput
                  currentRole={m.role}
                  onSave={(role) => handleSaveRole(m._id, role)}
                  onCancel={() => setEditingRole(null)}
                />
              </div>
            )}

            {/* Expanded detail row */}
            {expanded === m._id && editingRole !== m._id && (
              <div
                className="px-6 py-5 border-b border-white/[0.04] grid grid-cols-1 sm:grid-cols-3 gap-4"
                style={{ background: "rgba(255,255,255,0.015)" }}
              >
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-white/30 shrink-0" />
                  <div>
                    <p className="font-mono text-[9px] text-white/30 uppercase tracking-widest mb-0.5">Phone</p>
                    <p className="font-mono text-xs text-white">{m.phone}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Link2 className="w-4 h-4 text-white/30 shrink-0" />
                  <div className="min-w-0">
                    <p className="font-mono text-[9px] text-white/30 uppercase tracking-widest mb-0.5">LinkedIn</p>
                    <a
                      href={m.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-xs text-blue-400 hover:text-blue-300 truncate block"
                    >
                      {m.linkedin.replace("https://", "")}
                    </a>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-white/30 shrink-0" />
                  <div>
                    <p className="font-mono text-[9px] text-white/30 uppercase tracking-widest mb-0.5">Registered</p>
                    <p className="font-mono text-xs text-white">
                      {new Date(m.createdAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {!loading && sorted.length > 0 && (
        <p className="font-mono text-[10px] text-white/20 text-right">
          Showing {sorted.length} registration{sorted.length !== 1 ? "s" : ""}
        </p>
      )}

      {editingMember && (
        <EditModal
          member={editingMember}
          onSave={handleUpdateMember}
          onClose={() => setEditingMember(null)}
        />
      )}
    </div>
  );
}
