"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Users, Search, RefreshCw, Trash2, CheckCircle2,
  XCircle, Link2, Phone, Mail, ChevronDown,
  ShieldCheck, Tag, X, Check, Edit2, ChevronRight,
  Loader2,
} from "lucide-react";

interface Registration {
  id: string;
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
type SortKey = "createdAt" | "name" | "year" | "department";
type SortDir = "asc" | "desc";

function VerifiedBadge({ verified }: { verified: boolean }) {
  return verified ? (
    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 font-mono text-[9px] text-emerald-400 whitespace-nowrap">
      <CheckCircle2 className="w-2.5 h-2.5 shrink-0" /> Verified
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 font-mono text-[9px] text-amber-400 whitespace-nowrap">
      <XCircle className="w-2.5 h-2.5 shrink-0" /> Pending
    </span>
  );
}

// ——— Edit Modal ———
function EditModal({ member, onSave, onClose }: {
  member: Registration;
  onSave: (data: Partial<Registration>) => Promise<void>;
  onClose: () => void;
}) {
  const [formData, setFormData] = useState({
    name: member.name, email: member.email, phone: member.phone,
    linkedin: member.linkedin, year: member.year, department: member.department,
    role: member.role || "", otpVerified: member.otpVerified, approved: member.approved,
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try { await onSave(formData); onClose(); } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm">
      <div className="w-full sm:max-w-lg bg-[#0a0a0a] border border-white/10 rounded-t-[24px] sm:rounded-[24px] shadow-2xl max-h-[92dvh] overflow-y-auto">
        <div className="sticky top-0 z-10 px-5 py-4 border-b border-white/5 flex justify-between items-center bg-[#0a0a0a]/95 backdrop-blur-md">
          <h2 className="font-pixel text-sm text-white whitespace-nowrap">EDIT_MEMBER</h2>
          <button onClick={onClose} className="p-2 text-white/40 hover:text-white transition-colors rounded-xl hover:bg-white/5">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { label: "Full Name", key: "name", type: "text" },
              { label: "Email", key: "email", type: "email" },
              { label: "Phone", key: "phone", type: "tel" },
              { label: "LinkedIn", key: "linkedin", type: "url" },
            ].map(({ label, key, type }) => (
              <div key={key} className="space-y-1">
                <label className="font-mono text-[9px] uppercase tracking-widest text-white/40">{label}</label>
                <input
                  required
                  type={type}
                  value={formData[key as keyof typeof formData] as string}
                  onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 font-mono text-xs text-white focus:outline-none focus:ring-1 ring-white/20"
                />
              </div>
            ))}
            <div className="space-y-1">
              <label className="font-mono text-[9px] uppercase tracking-widest text-white/40">Department</label>
              <select
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 font-mono text-xs text-white focus:outline-none appearance-none"
              >
                {["Computer Science & Engineering", "Information Technology", "Electronics & Communication Engineering", "Electrical & Electronics Engineering", "Mechanical Engineering", "Civil Engineering", "Computer Science & Data Science", "Other"].map(d => (
                  <option key={d} value={d} className="bg-[#0a0a0a]">{d}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="font-mono text-[9px] uppercase tracking-widest text-white/40">Year</label>
              <input
                list="years-list-modal"
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                placeholder="e.g. 3rd Year"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 font-mono text-xs text-white focus:outline-none focus:ring-1 ring-white/20"
              />
              <datalist id="years-list-modal">
                {["1st Year", "2nd Year", "3rd Year", "4th Year", "Passed Out"].map(y => <option key={y} value={y} />)}
              </datalist>
            </div>
            <div className="sm:col-span-2 space-y-1">
              <label className="font-mono text-[9px] uppercase tracking-widest text-white/40">Role</label>
              <input
                list="roles-list-modal"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                placeholder="e.g. Core Member, Secretary..."
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 font-mono text-xs text-white focus:outline-none focus:ring-1 ring-white/20"
              />
              <datalist id="roles-list-modal">
                {["President", "Vice President", "Secretary", "Joint Secretary", "Website Management", "Technical Team", "Event Management Head", "Event Management", "Social Media", "Documentation"].map(r => <option key={r} value={r} />)}
              </datalist>
            </div>
          </div>

          <div className="flex gap-6 pt-3 border-t border-white/5">
            {[
              { key: "otpVerified", label: "OTP Verified", color: "text-emerald-400" },
              { key: "approved", label: "Approved", color: "text-blue-400" },
            ].map(({ key, label, color }) => (
              <label key={key} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData[key as keyof typeof formData] as boolean}
                  onChange={(e) => setFormData({ ...formData, [key]: e.target.checked })}
                  className="w-4 h-4 rounded"
                />
                <span className={`font-mono text-xs ${color}`}>{label}</span>
              </label>
            ))}
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-3 rounded-xl border border-white/10 font-mono text-xs text-white/50 hover:text-white hover:bg-white/5 transition-all">Cancel</button>
            <button type="submit" disabled={loading} className="flex-1 py-3 rounded-xl bg-white text-black font-mono text-xs font-bold hover:bg-white/90 transition-all disabled:opacity-50">
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ——— Member Card (mobile-first) ———
function MemberCard({ m, onApprove, onDelete, onEdit, onRole, actionLoading, deleting }: {
  m: Registration;
  onApprove: () => void;
  onDelete: () => void;
  onEdit: () => void;
  onRole: () => void;
  actionLoading: string | null;
  deleting: string | null;
}) {
  const deptShort = m.department.replace("Computer Science & Engineering", "CSE").replace("Information Technology", "IT").replace("Electronics & Communication Engineering", "ECE").replace("Electrical & Electronics Engineering", "EEE").replace("Mechanical Engineering", "Mech").replace("Civil Engineering", "Civil").replace("Computer Science & Data Science", "CS&DS");

  return (
    <div className="rounded-2xl border border-white/8 bg-white/[0.02] overflow-hidden">
      {/* Card Top */}
      <div className="p-4 flex items-start gap-3">
        {/* Avatar */}
        <div className="relative shrink-0">
          <div className="w-10 h-10 rounded-full bg-white/8 flex items-center justify-center font-pixel text-sm text-white border border-white/10">
            {m.name.charAt(0).toUpperCase()}
          </div>
          {m.approved && (
            <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-blue-500 border-2 border-[#080808] flex items-center justify-center">
              <Check className="w-2 h-2 text-white" strokeWidth={3} />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex items-center gap-2">
              <p className="font-mono text-sm text-white truncate leading-tight">{m.name}</p>
              <VerifiedBadge verified={m.otpVerified} />
            </div>
          </div>
          <div className="font-mono text-[10px] text-white/40 flex items-center gap-3 mt-1.5 flex-wrap">
            <a href={`mailto:${m.email}`} className="hover:text-white transition-colors flex items-center gap-1"><Mail className="w-3 h-3"/> {m.email}</a>
            <a href={`tel:${m.phone}`} className="hover:text-emerald-400 transition-colors flex items-center gap-1"><Phone className="w-3 h-3"/> {m.phone}</a>
            <a href={m.linkedin} target="_blank" rel="noopener noreferrer" className="hover:text-blue-400 transition-colors flex items-center gap-1"><Link2 className="w-3 h-3"/> LinkedIn</a>
          </div>
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <span className="font-mono text-[9px] text-white/50 bg-white/5 px-1.5 py-0.5 rounded-md border border-white/5">{deptShort}</span>
            <span className="font-mono text-[9px] text-white/50 bg-white/5 px-1.5 py-0.5 rounded-md border border-white/5">Year {m.year}</span>
            {m.role && <span className="font-mono text-[9px] text-blue-400/80 bg-blue-500/10 px-1.5 py-0.5 rounded-md border border-blue-500/20">{m.role}</span>}
            <span className="font-mono text-[9px] text-white/30 px-1.5 py-0.5">{new Date(m.createdAt).toLocaleDateString("en-IN", { day: 'numeric', month: 'short', year: 'numeric' })}</span>
          </div>
        </div>
      </div>

      {/* Actions Row */}
      <div className="px-4 pb-3 flex items-center justify-end gap-2 border-t border-white/5 pt-3">
        {/* Approve */}
        <button
          onClick={onApprove}
          disabled={actionLoading === m._id + "-approve"}
          title={m.approved ? "Revoke approval" : "Approve"}
          className={`flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl font-mono text-[10px] transition-all ${m.approved ? "bg-blue-500/15 text-blue-400 border border-blue-500/20" : "bg-white/5 text-white/40 hover:text-white hover:bg-white/10 border border-white/8"} disabled:opacity-30`}
        >
          {actionLoading === m._id + "-approve" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ShieldCheck className="w-3.5 h-3.5" />}
          {m.approved ? "Approved" : "Approve"}
        </button>

        {/* Role */}
        <button
          onClick={onRole}
          title="Assign role"
          className={`flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl transition-all font-mono text-[10px] ${m.role ? "bg-purple-500/15 text-purple-400 border border-purple-500/20" : "bg-white/5 text-white/30 hover:bg-white/10 hover:text-white border border-white/8"}`}
        >
          <Tag className="w-3.5 h-3.5" />
          Role
        </button>

        {/* Edit */}
        <button onClick={onEdit} title="Edit" className="p-1.5 rounded-xl bg-white/5 text-white/30 hover:bg-white/10 hover:text-white border border-white/8 transition-all">
          <Edit2 className="w-4 h-4" />
        </button>

        {/* Delete */}
        <button
          onClick={onDelete}
          disabled={deleting === m._id}
          title="Delete"
          className="p-1.5 rounded-xl text-red-500/40 hover:text-red-400 hover:bg-red-500/10 border border-white/8 hover:border-red-500/20 transition-all disabled:opacity-30"
        >
          {deleting === m._id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
        </button>
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
  const [roleEditId, setRoleEditId] = useState<string | null>(null);
  const [roleValue, setRoleValue] = useState("");
  const [editingMember, setEditingMember] = useState<Registration | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [showSort, setShowSort] = useState(false);

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
    } finally { setLoading(false); }
  }, [search, filter]);

  useEffect(() => {
    const t = setTimeout(fetchMembers, 300);
    return () => clearTimeout(t);
  }, [fetchMembers]);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this registration? This cannot be undone.")) return;
    setDeleting(id);
    try {
      await fetch("/api/admin/members", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
      setMembers(prev => prev.filter(m => m._id !== id));
    } finally { setDeleting(null); }
  };

  const handleApprove = async (id: string, currentApproved: boolean) => {
    setActionLoading(id + "-approve");
    try {
      const res = await fetch("/api/admin/members", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, approved: !currentApproved }) });
      const data = await res.json();
      if (data.success) setMembers(prev => prev.map(m => m._id === id ? { ...m, approved: data.data.approved } : m));
    } finally { setActionLoading(null); }
  };

  const handleSaveRole = async (id: string) => {
    setActionLoading(id + "-role");
    setRoleEditId(null);
    try {
      const res = await fetch("/api/admin/members", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, role: roleValue }) });
      const data = await res.json();
      if (data.success) setMembers(prev => prev.map(m => m._id === id ? { ...m, role: data.data.role } : m));
    } finally { setActionLoading(null); }
  };

  const handleUpdateMember = async (data: Partial<Registration>) => {
    if (!editingMember) return;
    try {
      const res = await fetch("/api/admin/members", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: editingMember._id, ...data }) });
      const result = await res.json();
      if (result.success) setMembers(prev => prev.map(m => m._id === editingMember._id ? { ...m, ...result.data } : m));
    } finally {}
  };

  const sortOptions: { key: SortKey; label: string }[] = [
    { key: "createdAt", label: "Joined Date" },
    { key: "name", label: "Name" },
    { key: "year", label: "Year" },
    { key: "department", label: "Dept" },
  ];

  const sorted = [...members].sort((a, b) => {
    const va = a[sortKey], vb = b[sortKey];
    const cmp = va < vb ? -1 : va > vb ? 1 : 0;
    return sortDir === "asc" ? cmp : -cmp;
  });

  const verified = members.filter(m => m.otpVerified).length;
  const approved = members.filter(m => m.approved).length;
  const pending = members.length - verified;

  return (
    <div className="space-y-5 pb-10">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-start gap-3 pt-2">
        <div className="space-y-0.5">
          <h1 className="font-pixel text-white whitespace-nowrap text-[clamp(1rem,3.8vw,1.875rem)]">REGISTERED_MEMBERS</h1>
          <p className="font-mono text-xs text-white/40">All club join requests</p>
        </div>
        <button
          onClick={fetchMembers}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 font-mono text-xs text-white/60 hover:text-white hover:bg-white/5 transition-all"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total", value: members.length, color: "text-white" },
          { label: "Verified", value: verified, color: "text-emerald-400" },
          { label: "Approved", value: approved, color: "text-blue-400" },
          { label: "Pending OTP", value: pending, color: "text-amber-400" },
        ].map(s => (
          <div key={s.label} className="p-4 rounded-2xl border border-white/8 bg-white/[0.02] flex flex-col gap-1">
            <span className={`text-2xl font-pixel ${s.color}`}>{s.value}</span>
            <span className="font-mono text-[9px] text-white/30 uppercase tracking-widest">{s.label}</span>
          </div>
        ))}
      </div>

      {/* Search + Filters */}
      <div className="space-y-2">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search name, email, department…"
            className="w-full bg-white/[0.03] border border-white/8 rounded-xl py-3 pl-10 pr-4 font-mono text-xs text-white placeholder:text-white/20 focus:outline-none focus:ring-1 ring-white/20"
          />
        </div>
        <div className="flex gap-2 flex-wrap items-center justify-between">
          {/* Filter chips */}
          <div className="flex gap-1.5 flex-wrap">
            {(["all", "verified", "approved", "unverified"] as FilterType[]).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-xl font-mono text-[10px] uppercase tracking-wider transition-all border ${filter === f ? "bg-white text-black border-white" : "text-white/40 border-white/8 hover:border-white/20 hover:text-white"}`}
              >
                {f}
              </button>
            ))}
          </div>
          {/* Sort dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowSort(!showSort)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-white/8 font-mono text-[10px] text-white/40 hover:text-white hover:border-white/20 transition-all"
            >
              Sort: {sortOptions.find(o => o.key === sortKey)?.label}
              <ChevronDown className={`w-3 h-3 transition-transform ${showSort ? "rotate-180" : ""}`} />
            </button>
            {showSort && (
              <div className="absolute right-0 top-full mt-1 w-40 bg-[#111] border border-white/10 rounded-xl overflow-hidden z-20 shadow-xl">
                {sortOptions.map(o => (
                  <button
                    key={o.key}
                    onClick={() => {
                      if (sortKey === o.key) setSortDir(d => d === "asc" ? "desc" : "asc");
                      else { setSortKey(o.key); setSortDir("desc"); }
                      setShowSort(false);
                    }}
                    className={`w-full text-left px-4 py-2.5 font-mono text-xs transition-colors flex items-center justify-between ${sortKey === o.key ? "text-white bg-white/8" : "text-white/50 hover:text-white hover:bg-white/5"}`}
                  >
                    {o.label}
                    {sortKey === o.key && <ChevronRight className={`w-3 h-3 transition-transform ${sortDir === "asc" ? "-rotate-90" : "rotate-90"}`} />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Role edit panel */}
      {roleEditId && (
        <div className="p-4 rounded-2xl border border-purple-500/20 bg-purple-500/5 space-y-2">
          <p className="font-mono text-[10px] text-purple-400/70 uppercase tracking-widest">
            Assign role for {members.find(m => m._id === roleEditId)?.name}
          </p>
          <div className="flex gap-2">
            <input
              autoFocus
              list="roles-list"
              value={roleValue}
              onChange={e => setRoleValue(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") handleSaveRole(roleEditId!); if (e.key === "Escape") setRoleEditId(null); }}
              placeholder="e.g. Core Member, Secretary..."
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 font-mono text-xs text-white focus:outline-none focus:ring-1 ring-white/20 placeholder:text-white/20"
            />
            <datalist id="roles-list">
              {["President","Vice President","Secretary","Joint Secretary","Website Management","Technical Team","Event Management Head","Event Management","Social Media","Documentation"].map(r => <option key={r} value={r} />)}
            </datalist>
            <button onClick={() => handleSaveRole(roleEditId!)} className="px-4 py-2 rounded-xl bg-emerald-500/20 text-emerald-400 font-mono text-xs hover:bg-emerald-500/30 transition-colors">Save</button>
            <button onClick={() => setRoleEditId(null)} className="px-4 py-2 rounded-xl bg-white/5 text-white/40 font-mono text-xs hover:bg-white/10 transition-colors">Cancel</button>
          </div>
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="py-16 flex flex-col items-center gap-3 opacity-30">
          <RefreshCw className="w-6 h-6 animate-spin" />
          <p className="font-mono text-xs">Fetching from MongoDB...</p>
        </div>
      ) : sorted.length === 0 ? (
        <div className="py-16 flex flex-col items-center gap-4 opacity-20">
          <Users className="w-12 h-12" />
          <p className="font-mono text-sm">No registrations found.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sorted.map(m => (
            <MemberCard
              key={m._id}
              m={m}
              onApprove={() => handleApprove(m._id, m.approved)}
              onDelete={() => handleDelete(m._id)}
              onEdit={() => setEditingMember(m)}
              onRole={() => { setRoleEditId(m._id); setRoleValue(m.role || ""); }}
              actionLoading={actionLoading}
              deleting={deleting}
            />
          ))}
        </div>
      )}

      {!loading && sorted.length > 0 && (
        <p className="font-mono text-[10px] text-white/20 text-right">
          Showing {sorted.length} registration{sorted.length !== 1 ? "s" : ""}
        </p>
      )}

      {editingMember && (
        <EditModal member={editingMember} onSave={handleUpdateMember} onClose={() => setEditingMember(null)} />
      )}
    </div>
  );
}
