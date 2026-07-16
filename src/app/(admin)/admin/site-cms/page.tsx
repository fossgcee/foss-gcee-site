"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Layout,
  Info,
  Layers,
  Users,
  Image as ImageIcon,
  Link2,
  Plus,
  Trash2,
  Save,
  RefreshCw,
  ChevronRight,
  Check,
  AlertCircle,
  Eye,
  ExternalLink,
  X,
  Wand2,
  CheckCircle2,
  ChevronUp,
  ChevronDown,
} from "lucide-react";

// ──────────────────────────────────────────────────────────────────
// Google Drive URL converter
// Converts any sharing URL into a direct embeddable image URL
// ──────────────────────────────────────────────────────────────────
function convertDriveUrl(url: string): string {
  if (!url) return url;

  // Pattern 1: https://drive.google.com/file/d/FILE_ID/view...
  const fileMatch = url.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (fileMatch) {
    return `https://lh3.googleusercontent.com/d/${fileMatch[1]}`;
  }

  // Pattern 2: https://drive.google.com/open?id=FILE_ID
  const openMatch = url.match(/drive\.google\.com\/open\?id=([a-zA-Z0-9_-]+)/);
  if (openMatch) {
    return `https://lh3.googleusercontent.com/d/${openMatch[1]}`;
  }

  // Pattern 3: https://drive.google.com/uc?id=FILE_ID (already a direct link, upgrade to lh3)
  const ucMatch = url.match(/drive\.google\.com\/uc\?(?:export=view&)?id=([a-zA-Z0-9_-]+)/);
  if (ucMatch) {
    return `https://lh3.googleusercontent.com/d/${ucMatch[1]}`;
  }

  return url; // not a Drive URL — return as-is
}

function isDriveShareUrl(url: string): boolean {
  return /drive\.google\.com\/(file\/d\/|open\?id=|uc\?)/.test(url);
}

// ──────────────────────────────────────────────────────────────────
// Smart image URL input with Drive auto-convert + live preview
// ──────────────────────────────────────────────────────────────────
function ImageUrlInput({
  value,
  onChange,
  placeholder = "https://... or paste a Google Drive share link",
}: {
  value: string;
  onChange: (url: string) => void;
  placeholder?: string;
}) {
  const [raw, setRaw] = useState(value);
  const [previewOk, setPreviewOk] = useState<boolean | null>(null);
  const wasDriveLink = isDriveShareUrl(raw) && raw !== value;

  // Sync external value changes
  useEffect(() => {
    setRaw(value);
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    setRaw(input);
    setPreviewOk(null);
    const converted = convertDriveUrl(input.trim());
    onChange(converted);
  };

  const handleConvert = () => {
    const converted = convertDriveUrl(raw.trim());
    setRaw(converted);
    onChange(converted);
    setPreviewOk(null);
  };

  const needsConversion = isDriveShareUrl(raw) && raw.includes("/view");

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <input
            className="w-full bg-white/[0.03] border border-white/8 rounded-xl px-4 py-2.5 font-mono text-sm text-white focus:outline-none focus:ring-1 focus:ring-white/20 placeholder:text-white/20 transition-all pr-10"
            style={{ borderColor: needsConversion ? "rgba(251,191,36,0.4)" : undefined }}
            value={raw}
            onChange={handleChange}
            placeholder={placeholder}
          />
          {value && previewOk === true && (
            <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-400" />
          )}
          {value && previewOk === false && (
            <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-red-400" />
          )}
        </div>
        {needsConversion && (
          <button
            onClick={handleConvert}
            title="Auto-convert Drive link to embeddable URL"
            className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 font-mono text-[10px] text-amber-400 hover:bg-amber-500/20 transition-all whitespace-nowrap"
          >
            <Wand2 className="w-3.5 h-3.5" /> Convert
          </button>
        )}
      </div>

      {/* Drive link hint */}
      {needsConversion && (
        <p className="font-mono text-[10px] text-amber-400/80 flex items-center gap-1.5">
          <AlertCircle className="w-3 h-3 shrink-0" />
          This looks like a Google Drive share link — click <strong>Convert</strong> to make it embeddable.
        </p>
      )}

      {/* Converted confirmation */}
      {wasDriveLink && !needsConversion && (
        <p className="font-mono text-[10px] text-emerald-400/80 flex items-center gap-1.5">
          <Check className="w-3 h-3 shrink-0" /> Drive link auto-converted to direct image URL.
        </p>
      )}

      {/* Live image preview */}
      {value && (
        <div className="flex items-start gap-3 mt-1">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            key={value}
            src={value}
            alt="preview"
            className="w-20 h-16 object-cover rounded-lg bg-white/5 border border-white/10"
            onLoad={() => setPreviewOk(true)}
            onError={() => setPreviewOk(false)}
          />
          <div className="flex-1 min-w-0">
            {previewOk === true && (
              <p className="font-mono text-[10px] text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Image loaded successfully
              </p>
            )}
            {previewOk === false && (
              <div className="space-y-1">
                <p className="font-mono text-[10px] text-red-400 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> Image failed to load
                </p>
                <p className="font-mono text-[9px] text-white/30 leading-relaxed">
                  Make sure the file is publicly shared and the URL points directly to an image.
                  For Drive: set sharing to &quot;Anyone with the link&quot;.
                </p>
              </div>
            )}
            {previewOk === null && value && (
              <p className="font-mono text-[10px] text-white/30">Loading preview…</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}



// ──────────────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────────────
interface Stat { value: string; label: string }
interface Card { icon: string; title: string; text: string }
interface Activity { icon: string; title: string; desc: string; tag: string }
interface BoardMember { id: string; name: string; role: string; year: string; imageUrl: string; linkedInUrl?: string }
interface GalleryImage { id: string; src: string; alt?: string; year?: string }
interface SocialLink { platform: string; href: string; active: boolean }
interface QuickLink { label: string; href: string }

interface SiteData {
  hero: {
    badge: string;
    description: string;
    ctaPrimaryLabel: string;
    ctaPrimaryHref: string;
    ctaSecondaryLabel: string;
    ctaSecondaryHref: string;
    githubHref: string;
    collegeText: string;
    logoSubtext: string;
  };
  about: { stats: Stat[]; cards: Card[] };
  whatwedo: { activities: Activity[] };
  boardmembers: { members: BoardMember[]; staffAdvisors?: BoardMember[] };
  gallery: { images: GalleryImage[] };
  footer: {
    about: string;
    email: string;
    builtBy: string;
    socials: SocialLink[];
    quickLinks: QuickLink[];
  };
}

// ──────────────────────────────────────────────────────────────────
// Small shared UI atoms
// ──────────────────────────────────────────────────────────────────

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="font-mono text-[10px] uppercase tracking-widest text-white/40 ml-1 block">
        {label}
      </label>
      {children}
      {hint && <p className="font-mono text-[9px] text-white/25 ml-1">{hint}</p>}
    </div>
  );
}

const inputCls =
  "w-full bg-white/[0.03] border border-white/8 rounded-xl px-4 py-2.5 font-mono text-sm text-white focus:outline-none focus:ring-1 focus:ring-white/20 placeholder:text-white/20 transition-all";

const textareaCls =
  "w-full bg-white/[0.03] border border-white/8 rounded-xl px-4 py-3 font-mono text-sm text-white focus:outline-none focus:ring-1 focus:ring-white/20 placeholder:text-white/20 transition-all resize-none";

// ──────────────────────────────────────────────────────────────────
// Save button with status
// ──────────────────────────────────────────────────────────────────
function SaveBar({
  onSave,
  saving,
  saved,
  error,
}: {
  onSave: () => void;
  saving: boolean;
  saved: boolean;
  error: string | null;
}) {
  return (
    <div className="flex items-center justify-between gap-4 pt-6 border-t border-white/5">
      <div className="flex items-center gap-2">
        {saved && (
          <span className="flex items-center gap-1.5 font-mono text-xs text-emerald-400">
            <Check className="w-3.5 h-3.5" /> Saved successfully
          </span>
        )}
        {error && (
          <span className="flex items-center gap-1.5 font-mono text-xs text-red-400">
            <AlertCircle className="w-3.5 h-3.5" /> {error}
          </span>
        )}
      </div>
      <button
        onClick={onSave}
        disabled={saving}
        className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-white text-black font-pixel text-[10px] hover:bg-white/90 transition-all disabled:opacity-50 active:scale-95"
      >
        {saving ? (
          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <Save className="w-3.5 h-3.5" />
        )}
        {saving ? "SAVING..." : "SAVE_CHANGES"}
      </button>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────
// Section accordion wrapper
// ──────────────────────────────────────────────────────────────────
function Accordion({
  id,
  label,
  desc,
  icon: Icon,
  open,
  onToggle,
  children,
}: {
  id: string;
  label: string;
  desc: string;
  icon: React.ElementType;
  open: boolean;
  onToggle: (id: string) => void;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-white/5 bg-white/[0.02] overflow-hidden">
      <button
        onClick={() => onToggle(id)}
        className="w-full flex items-center justify-between px-6 py-5 text-left group hover:bg-white/[0.02] transition-colors"
      >
        <div className="flex items-center gap-4">
          <div
            className={`p-2.5 rounded-xl border transition-all ${
              open
                ? "bg-white text-black border-white"
                : "bg-white/5 text-white/50 border-white/10 group-hover:border-white/20"
            }`}
          >
            <Icon className="w-4 h-4" />
          </div>
          <div>
            <p className="font-pixel text-sm text-white">{label}</p>
            <p className="font-mono text-[10px] text-white/30 mt-0.5">{desc}</p>
          </div>
        </div>
        <div
          className={`text-white/40 transition-transform ${open ? "rotate-90" : ""}`}
        >
          <ChevronRight className="w-4 h-4" />
        </div>
      </button>
      {open && <div className="px-6 pb-6 pt-2 border-t border-white/5">{children}</div>}
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────
// Hero Editor
// ──────────────────────────────────────────────────────────────────
function HeroEditor({
  data,
  onChange,
  onSave,
  saving,
  saved,
  error,
}: {
  data: SiteData["hero"];
  onChange: (d: SiteData["hero"]) => void;
  onSave: () => void;
  saving: boolean;
  saved: boolean;
  error: string | null;
}) {
  const set = (k: keyof SiteData["hero"]) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    onChange({ ...data, [k]: e.target.value });

  return (
    <div className="space-y-5 mt-4">
      <Field label="Badge Text" hint="Shown in the pill at the top of the hero">
        <input className={inputCls} value={data.badge} onChange={set("badge")} placeholder="Free & Open Source Software Club..." />
      </Field>
      <Field label="Description">
        <textarea className={textareaCls} rows={3} value={data.description} onChange={set("description")} />
      </Field>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Primary CTA Label">
          <input className={inputCls} value={data.ctaPrimaryLabel} onChange={set("ctaPrimaryLabel")} placeholder="$ register_now" />
        </Field>
        <Field label="Primary CTA Link">
          <input className={inputCls} value={data.ctaPrimaryHref} onChange={set("ctaPrimaryHref")} placeholder="/join" />
        </Field>
        <Field label="Secondary CTA Label">
          <input className={inputCls} value={data.ctaSecondaryLabel} onChange={set("ctaSecondaryLabel")} placeholder="$ join_community" />
        </Field>
        <Field label="Secondary CTA Link">
          <input className={inputCls} value={data.ctaSecondaryHref} onChange={set("ctaSecondaryHref")} placeholder="/#join" />
        </Field>
        <Field label="GitHub Link">
          <input className={inputCls} value={data.githubHref} onChange={set("githubHref")} placeholder="https://github.com/fossgcee" />
        </Field>
        <Field label="College Name (logo area)">
          <input className={inputCls} value={data.collegeText} onChange={set("collegeText")} placeholder="FOSSGCEE" />
        </Field>
        <Field label="College Subtitle">
          <input className={inputCls} value={data.logoSubtext} onChange={set("logoSubtext")} placeholder="Govt. College of Engineering, Erode" />
        </Field>
      </div>
      <SaveBar onSave={onSave} saving={saving} saved={saved} error={error} />
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────
// About Editor
// ──────────────────────────────────────────────────────────────────
function AboutEditor({
  data,
  onChange,
  onSave,
  saving,
  saved,
  error,
}: {
  data: SiteData["about"];
  onChange: (d: SiteData["about"]) => void;
  onSave: () => void;
  saving: boolean;
  saved: boolean;
  error: string | null;
}) {
  const setCard = (i: number, k: keyof typeof data.cards[0], v: string) => {
    const cards = [...data.cards];
    cards[i] = { ...cards[i], [k]: v };
    onChange({ ...data, cards });
  };
  const setStat = (i: number, k: keyof Stat, v: string) => {
    const stats = [...data.stats];
    stats[i] = { ...stats[i], [k]: v };
    onChange({ ...data, stats });
  };

  return (
    <div className="space-y-6 mt-4">
      <div>
        <p className="font-mono text-[10px] uppercase tracking-widest text-white/40 mb-3">Stats</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {data.stats.map((s, i) => (
            <div key={i} className="space-y-2 p-4 rounded-xl bg-white/[0.02] border border-white/5">
              <input
                className={`${inputCls} text-center font-pixel text-lg`}
                value={s.value}
                onChange={e => setStat(i, "value", e.target.value)}
                placeholder="100+"
              />
              <input
                className={`${inputCls} text-center text-xs`}
                value={s.label}
                onChange={e => setStat(i, "label", e.target.value)}
                placeholder="Active Members"
              />
            </div>
          ))}
        </div>
      </div>

      <div>
        <p className="font-mono text-[10px] uppercase tracking-widest text-white/40 mb-3">Cards</p>
        <div className="space-y-4">
          {data.cards.map((c, i) => (
            <div key={i} className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field label={`Card ${i + 1} Icon`}>
                  <input className={inputCls} value={c.icon} onChange={e => setCard(i, "icon", e.target.value)} placeholder="heart / 🎯 / 🔭" />
                </Field>
                <Field label="Title">
                  <input className={inputCls} value={c.title} onChange={e => setCard(i, "title", e.target.value)} />
                </Field>
              </div>
              <Field label="Body Text">
                <textarea className={textareaCls} rows={2} value={c.text} onChange={e => setCard(i, "text", e.target.value)} />
              </Field>
            </div>
          ))}
        </div>
      </div>

      <SaveBar onSave={onSave} saving={saving} saved={saved} error={error} />
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────
// WhatWeDo Editor
// ──────────────────────────────────────────────────────────────────
function WhatWeDoEditor({
  data,
  onChange,
  onSave,
  saving,
  saved,
  error,
}: {
  data: SiteData["whatwedo"];
  onChange: (d: SiteData["whatwedo"]) => void;
  onSave: () => void;
  saving: boolean;
  saved: boolean;
  error: string | null;
}) {
  const setAct = (i: number, k: keyof Activity, v: string) => {
    const activities = [...data.activities];
    activities[i] = { ...activities[i], [k]: v };
    onChange({ ...data, activities });
  };
  const addActivity = () => {
    onChange({ ...data, activities: [...data.activities, { icon: ">_", title: "", desc: "", tag: "#newtag" }] });
  };
  const removeActivity = (i: number) => {
    onChange({ ...data, activities: data.activities.filter((_, idx) => idx !== i) });
  };

  return (
    <div className="space-y-4 mt-4">
      {data.activities.map((a, i) => (
        <div key={i} className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs text-white/40">Activity {i + 1}</span>
            <button
              onClick={() => removeActivity(i)}
              className="p-1.5 rounded-lg text-red-500/40 hover:text-red-400 hover:bg-red-500/10 transition-all"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Field label="Icon">
              <input className={inputCls} value={a.icon} onChange={e => setAct(i, "icon", e.target.value)} placeholder=">_" />
            </Field>
            <Field label="Tag">
              <input className={inputCls} value={a.tag} onChange={e => setAct(i, "tag", e.target.value)} placeholder="#terminal" />
            </Field>
            <div className="sm:col-span-2">
              <Field label="Title">
                <input className={inputCls} value={a.title} onChange={e => setAct(i, "title", e.target.value)} />
              </Field>
            </div>
          </div>
          <Field label="Description">
            <textarea className={textareaCls} rows={2} value={a.desc} onChange={e => setAct(i, "desc", e.target.value)} />
          </Field>
        </div>
      ))}
      <button
        onClick={addActivity}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-dashed border-white/10 font-mono text-xs text-white/40 hover:text-white hover:border-white/30 transition-all"
      >
        <Plus className="w-4 h-4" /> Add Activity
      </button>
      <SaveBar onSave={onSave} saving={saving} saved={saved} error={error} />
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────
// Board Members Editor
// ──────────────────────────────────────────────────────────────────
function BoardMembersEditor({
  data,
  onChange,
  onSave,
  saving,
  saved,
  error,
}: {
  data: SiteData["boardmembers"];
  onChange: (d: SiteData["boardmembers"]) => void;
  onSave: () => void;
  saving: boolean;
  saved: boolean;
  error: string | null;
}) {
  const [selectedYear, setSelectedYear] = useState<string>("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingType, setEditingType] = useState<"member" | "advisor" | null>(null);

  const staffAdvisors = data.staffAdvisors || [];
  const years = Array.from(new Set([...data.members.map(m => m.year), ...staffAdvisors.map(a => a.year)])).sort((a, b) => b.localeCompare(a));
  
  useEffect(() => {
    if (!selectedYear && years.length > 0) {
      setSelectedYear(years[0]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [years.join(",")]);

  const setPerson = (id: string, k: keyof BoardMember, v: string, type: "member" | "advisor") => {
    if (type === "member") {
      onChange({
        ...data,
        members: data.members.map(m => m.id === id ? { ...m, [k]: v } : m)
      });
    } else {
      onChange({
        ...data,
        staffAdvisors: staffAdvisors.map(m => m.id === id ? { ...m, [k]: v } : m)
      });
    }
  };

  const addPerson = (type: "member" | "advisor") => {
    const id = `${type}-${Date.now()}`;
    const newYear = selectedYear || "2026 - 27";
    if (type === "member") {
      onChange({ ...data, members: [...data.members, { id, name: "", role: "", year: newYear, imageUrl: "", linkedInUrl: "" }] });
    } else {
      onChange({ ...data, staffAdvisors: [...staffAdvisors, { id, name: "", role: "", year: newYear, imageUrl: "", linkedInUrl: "" }] });
    }
    if (!selectedYear) setSelectedYear(newYear);
    setEditingId(id);
    setEditingType(type);
  };

  const removePerson = (id: string, type: "member" | "advisor") => {
    if (type === "member") {
      onChange({ ...data, members: data.members.filter(m => m.id !== id) });
    } else {
      onChange({ ...data, staffAdvisors: staffAdvisors.filter(m => m.id !== id) });
    }
    if (editingId === id) {
      setEditingId(null);
      setEditingType(null);
    }
  };

  const movePerson = (id: string, direction: -1 | 1, type: "member" | "advisor") => {
    const list = type === "member" ? [...data.members] : [...staffAdvisors];
    const index = list.findIndex(m => m.id === id);
    if (index < 0) return;
    
    const targetMembers = list.filter(m => m.year === selectedYear);
    const targetIndex = targetMembers.findIndex(m => m.id === id);
    
    if (direction === -1 && targetIndex > 0) {
      const swapId = targetMembers[targetIndex - 1].id;
      const swapIndex = list.findIndex(m => m.id === swapId);
      [list[index], list[swapIndex]] = [list[swapIndex], list[index]];
      if (type === "member") onChange({ ...data, members: list });
      else onChange({ ...data, staffAdvisors: list });
    } else if (direction === 1 && targetIndex < targetMembers.length - 1) {
      const swapId = targetMembers[targetIndex + 1].id;
      const swapIndex = list.findIndex(m => m.id === swapId);
      [list[index], list[swapIndex]] = [list[swapIndex], list[index]];
      if (type === "member") onChange({ ...data, members: list });
      else onChange({ ...data, staffAdvisors: list });
    }
  };

  const filteredMembers = data.members.filter(m => m.year === selectedYear);
  const filteredAdvisors = staffAdvisors.filter(m => m.year === selectedYear);
  const editingPerson = editingType === "member" ? data.members.find(m => m.id === editingId) : staffAdvisors.find(m => m.id === editingId);

  return (
    <div className="space-y-4 mt-4 relative">
      {years.length > 0 && (
        <div className="flex gap-2 mb-4 overflow-x-auto pb-2" style={{ scrollbarWidth: "none" }}>
          {years.map(y => (
            <button
              key={y}
              onClick={() => setSelectedYear(y)}
              className={`px-4 py-2 rounded-xl font-mono text-xs transition-colors whitespace-nowrap border ${
                selectedYear === y 
                  ? "bg-white text-black border-white" 
                  : "bg-transparent text-white/50 border-white/10 hover:text-white hover:border-white/30"
              }`}
            >
              {y}
            </button>
          ))}
        </div>
      )}

      {/* Staff Advisors Section */}
      <div className="pt-2">
        <h3 className="font-mono text-[10px] uppercase tracking-widest text-white/40 mb-3">Staff Advisors</h3>
        {filteredAdvisors.length === 0 && (
          <p className="font-mono text-xs text-white/30 text-center py-4 border border-dashed border-white/10 rounded-2xl mb-4">
            No staff advisors for {selectedYear || "this year"}. Add one below.
          </p>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
          {filteredAdvisors.map((m, idx) => (
            <div key={m.id} className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex items-center gap-4 transition-colors hover:bg-white/[0.04]">
              <div className="flex flex-col gap-1 shrink-0">
                <button 
                  onClick={() => movePerson(m.id, -1, "advisor")} 
                  disabled={idx === 0}
                  className="p-1 rounded text-white/40 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent"
                >
                  <ChevronUp className="w-3 h-3" />
                </button>
                <button 
                  onClick={() => movePerson(m.id, 1, "advisor")} 
                  disabled={idx === filteredAdvisors.length - 1}
                  className="p-1 rounded text-white/40 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent"
                >
                  <ChevronDown className="w-3 h-3" />
                </button>
              </div>
              <div className="w-12 h-12 rounded-lg bg-black/20 overflow-hidden shrink-0 flex items-center justify-center relative border border-white/5">
                 {m.imageUrl ? (
                   <img src={m.imageUrl} alt={m.name} className="w-full h-full object-cover" />
                 ) : (
                   <Users className="w-5 h-5 text-white/20" />
                 )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-mono text-sm text-white truncate font-bold">{m.name || "Unnamed Advisor"}</p>
                <p className="font-mono text-xs text-white/50 truncate">{m.role || "No role specified"}</p>
              </div>
              <button
                onClick={() => { setEditingId(m.id); setEditingType("advisor"); }}
                className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white font-mono text-xs transition-colors shrink-0 border border-white/5 hover:border-white/20 shadow-sm"
              >
                Edit
              </button>
            </div>
          ))}
        </div>
        <button
          onClick={() => addPerson("advisor")}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-dashed border-white/10 font-mono text-xs text-white/40 hover:text-white hover:border-white/30 transition-all bg-white/[0.01] hover:bg-white/[0.03]"
        >
          <Plus className="w-4 h-4" /> Add Staff Advisor
        </button>
      </div>

      <div className="my-6 border-b border-white/10" />

      {/* Board Members Section */}
      <div>
        <h3 className="font-mono text-[10px] uppercase tracking-widest text-white/40 mb-3">Board Members</h3>
        {filteredMembers.length === 0 && (
          <p className="font-mono text-xs text-white/30 text-center py-8 border border-dashed border-white/10 rounded-2xl mb-4">
            No board members for {selectedYear || "this year"}. Add one below.
          </p>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
          {filteredMembers.map((m, idx) => (
            <div key={m.id} className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex items-center gap-4 transition-colors hover:bg-white/[0.04]">
              <div className="flex flex-col gap-1 shrink-0">
                <button 
                  onClick={() => movePerson(m.id, -1, "member")} 
                  disabled={idx === 0}
                  className="p-1 rounded text-white/40 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent"
                >
                  <ChevronUp className="w-3 h-3" />
                </button>
                <button 
                  onClick={() => movePerson(m.id, 1, "member")} 
                  disabled={idx === filteredMembers.length - 1}
                  className="p-1 rounded text-white/40 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent"
                >
                  <ChevronDown className="w-3 h-3" />
                </button>
              </div>
              <div className="w-12 h-12 rounded-lg bg-black/20 overflow-hidden shrink-0 flex items-center justify-center relative border border-white/5">
                 {m.imageUrl ? (
                   <img src={m.imageUrl} alt={m.name} className="w-full h-full object-cover" />
                 ) : (
                   <Users className="w-5 h-5 text-white/20" />
                 )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-mono text-sm text-white truncate font-bold">{m.name || "Unnamed Member"}</p>
                <p className="font-mono text-xs text-white/50 truncate">{m.role || "No role specified"}</p>
              </div>
              <button
                onClick={() => { setEditingId(m.id); setEditingType("member"); }}
                className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white font-mono text-xs transition-colors shrink-0 border border-white/5 hover:border-white/20 shadow-sm"
              >
                Edit
              </button>
            </div>
          ))}
        </div>
        <button
          onClick={() => addPerson("member")}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-dashed border-white/10 font-mono text-xs text-white/40 hover:text-white hover:border-white/30 transition-all bg-white/[0.01] hover:bg-white/[0.03]"
        >
          <Plus className="w-4 h-4" /> Add Board Member
        </button>
      </div>
      
      <SaveBar onSave={onSave} saving={saving} saved={saved} error={error} />

      {/* MODAL */}
      {editingPerson && editingType && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-xl bg-[#0a0a0a] border border-white/10 rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
            <div className="px-5 py-4 border-b border-white/5 flex justify-between items-center shrink-0">
              <h2 className="font-mono text-sm text-white font-bold">Edit {editingType === "member" ? "Member" : "Staff Advisor"}</h2>
              <button onClick={() => { setEditingId(null); setEditingType(null); }} className="p-1.5 text-white/40 hover:text-white transition-colors bg-white/5 hover:bg-white/10 rounded-lg">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 space-y-4 overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Full Name">
                  <input className={inputCls} value={editingPerson.name} onChange={e => setPerson(editingPerson.id, "name", e.target.value, editingType)} placeholder="John Doe" />
                </Field>
                <Field label="Role">
                  <input className={inputCls} value={editingPerson.role} onChange={e => setPerson(editingPerson.id, "role", e.target.value, editingType)} placeholder={editingType === "member" ? "President" : "Staff Advisor"} />
                </Field>
                <Field label="Academic Year">
                  <input className={inputCls} value={editingPerson.year} onChange={e => setPerson(editingPerson.id, "year", e.target.value, editingType)} placeholder="2026 - 27" />
                </Field>
                <Field label="LinkedIn URL">
                  <input className={inputCls} value={editingPerson.linkedInUrl || ""} onChange={e => setPerson(editingPerson.id, "linkedInUrl", e.target.value, editingType)} placeholder="https://linkedin.com/in/..." />
                </Field>
                <div className="sm:col-span-2">
                  <Field label="Photo URL" hint="Paste any public image URL or a Google Drive share link">
                    <ImageUrlInput
                      value={editingPerson.imageUrl}
                      onChange={url => setPerson(editingPerson.id, "imageUrl", url, editingType)}
                      placeholder="/members/photo.jpg or paste a Google Drive link"
                    />
                  </Field>
                </div>
              </div>
            </div>
            <div className="px-5 py-4 border-t border-white/5 bg-black/20 flex justify-between items-center shrink-0">
               <button
                  onClick={() => removePerson(editingPerson.id, editingType)}
                  className="px-4 py-2 rounded-xl text-red-500 hover:bg-red-500/10 font-mono text-xs transition-colors font-semibold"
                >
                  Delete
                </button>
               <button
                  onClick={() => { setEditingId(null); setEditingType(null); }}
                  className="px-6 py-2 rounded-xl bg-white text-black font-mono text-xs font-bold hover:bg-white/90 transition-colors shadow-lg"
                >
                  Done
                </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────
// Gallery Editor
// ──────────────────────────────────────────────────────────────────
function GalleryEditor({
  data,
  onChange,
  onSave,
  saving,
  saved,
  error,
}: {
  data: SiteData["gallery"];
  onChange: (d: SiteData["gallery"]) => void;
  onSave: () => void;
  saving: boolean;
  saved: boolean;
  error: string | null;
}) {
  const [selectedYear, setSelectedYear] = useState<string>("");
  const [editingId, setEditingId] = useState<string | null>(null);

  const years = Array.from(new Set(data.images.map(img => img.year))).filter(Boolean).sort((a, b) => b!.localeCompare(a!));
  
  useEffect(() => {
    if (!selectedYear && years.length > 0) {
      setSelectedYear(years[0]!);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [years.join(",")]);

  const setImage = (id: string, k: keyof GalleryImage, v: string) => {
    onChange({
      ...data,
      images: data.images.map(img => img.id === id ? { ...img, [k]: v } : img)
    });
  };

  const addImage = () => {
    const id = `gallery-${Date.now()}`;
    const newYear = selectedYear || "2026 - 27";
    onChange({ ...data, images: [...data.images, { id, src: "", alt: "", year: newYear }] });
    if (!selectedYear) setSelectedYear(newYear);
    setEditingId(id);
  };

  const removeImage = (id: string) => {
    onChange({ ...data, images: data.images.filter(img => img.id !== id) });
    if (editingId === id) setEditingId(null);
  };

  const filteredImages = data.images.filter(img => img.year === selectedYear);
  const editingImage = data.images.find(img => img.id === editingId);

  return (
    <div className="space-y-4 mt-4 relative">
      {years.length > 0 && (
        <div className="flex gap-2 mb-4 overflow-x-auto pb-2" style={{ scrollbarWidth: "none" }}>
          {years.map(y => (
            <button
              key={y!}
              onClick={() => setSelectedYear(y!)}
              className={`px-4 py-2 rounded-xl font-mono text-xs transition-colors whitespace-nowrap border ${
                selectedYear === y 
                  ? "bg-white text-black border-white" 
                  : "bg-transparent text-white/50 border-white/10 hover:text-white hover:border-white/30"
              }`}
            >
              {y}
            </button>
          ))}
        </div>
      )}

      {filteredImages.length === 0 && (
        <p className="font-mono text-xs text-white/30 text-center py-8 border border-dashed border-white/10 rounded-2xl">
          No gallery images for {selectedYear || "this year"}. Add photos below.
        </p>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {filteredImages.map((img) => (
          <div key={img.id} className="relative aspect-video rounded-xl overflow-hidden bg-white/5 border border-white/5 group">
             {img.src ? (
               <img src={img.src} alt={img.alt || ""} className="w-full h-full object-cover" />
             ) : (
               <div className="w-full h-full flex items-center justify-center"><ImageIcon className="w-6 h-6 text-white/20" /></div>
             )}
             <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-sm">
                <button
                  onClick={() => setEditingId(img.id)}
                  className="px-4 py-2 rounded-lg bg-white text-black font-mono text-[10px] font-bold hover:bg-white/90 shadow-lg"
                >
                  Edit Image
                </button>
             </div>
          </div>
        ))}
      </div>

      <button
        onClick={addImage}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-dashed border-white/10 font-mono text-xs text-white/40 hover:text-white hover:border-white/30 transition-all bg-white/[0.01] hover:bg-white/[0.03]"
      >
        <Plus className="w-4 h-4" /> Add Image
      </button>
      
      <SaveBar onSave={onSave} saving={saving} saved={saved} error={error} />

      {/* MODAL */}
      {editingImage && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-xl bg-[#0a0a0a] border border-white/10 rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
            <div className="px-5 py-4 border-b border-white/5 flex justify-between items-center shrink-0">
              <h2 className="font-mono text-sm text-white font-bold">Edit Gallery Image</h2>
              <button onClick={() => setEditingId(null)} className="p-1.5 text-white/40 hover:text-white transition-colors bg-white/5 hover:bg-white/10 rounded-lg">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 space-y-4 overflow-y-auto">
                <Field label="Academic Year">
                  <input className={inputCls} value={editingImage.year || ""} onChange={e => setImage(editingImage.id, "year", e.target.value)} placeholder="2026 - 27" />
                </Field>
                <Field label="Image URL" hint="Paste any public image URL or a Google Drive share link">
                  <ImageUrlInput
                    value={editingImage.src}
                    onChange={url => setImage(editingImage.id, "src", url)}
                    placeholder="/members-gallery/photo.jpg or paste a Google Drive link"
                  />
                </Field>
                <Field label="Alt Text">
                  <input className={inputCls} value={editingImage.alt || ""} onChange={e => setImage(editingImage.id, "alt", e.target.value)} placeholder="Description of the photo" />
                </Field>
                
                {editingImage.src && (
                  <div className="mt-4 aspect-video rounded-xl overflow-hidden bg-black/20 border border-white/5 relative">
                     <img src={editingImage.src} alt="Preview" className="w-full h-full object-cover" onError={e => ((e.target as HTMLImageElement).style.display = "none")} />
                  </div>
                )}
            </div>
            <div className="px-5 py-4 border-t border-white/5 bg-black/20 flex justify-between items-center shrink-0">
               <button
                  onClick={() => removeImage(editingImage.id)}
                  className="px-4 py-2 rounded-xl text-red-500 hover:bg-red-500/10 font-mono text-xs transition-colors font-semibold"
                >
                  Delete Image
                </button>
               <button
                  onClick={() => setEditingId(null)}
                  className="px-6 py-2 rounded-xl bg-white text-black font-mono text-xs font-bold hover:bg-white/90 transition-colors shadow-lg"
                >
                  Done
                </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────
// Footer / Settings Editor
// ──────────────────────────────────────────────────────────────────
function FooterEditor({
  data,
  onChange,
  onSave,
  saving,
  saved,
  error,
}: {
  data: SiteData["footer"];
  onChange: (d: SiteData["footer"]) => void;
  onSave: () => void;
  saving: boolean;
  saved: boolean;
  error: string | null;
}) {
  const setSocial = (i: number, k: keyof SocialLink, v: string | boolean) => {
    const socials = [...data.socials];
    socials[i] = { ...socials[i], [k]: v };
    onChange({ ...data, socials });
  };
  const setLink = (i: number, k: keyof QuickLink, v: string) => {
    const quickLinks = [...data.quickLinks];
    quickLinks[i] = { ...quickLinks[i], [k]: v };
    onChange({ ...data, quickLinks });
  };
  const addQuickLink = () => onChange({ ...data, quickLinks: [...data.quickLinks, { label: "", href: "" }] });
  const removeQuickLink = (i: number) => onChange({ ...data, quickLinks: data.quickLinks.filter((_, idx) => idx !== i) });

  return (
    <div className="space-y-6 mt-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="About Text">
          <textarea className={textareaCls} rows={2} value={data.about} onChange={e => onChange({ ...data, about: e.target.value })} />
        </Field>
        <div className="space-y-3">
          <Field label="Contact Email">
            <input className={inputCls} value={data.email} onChange={e => onChange({ ...data, email: e.target.value })} placeholder="fossgcee@gmail.com" />
          </Field>
        </div>
      </div>

      <div>
        <p className="font-mono text-[10px] uppercase tracking-widest text-white/40 mb-3">Social Links</p>
        <div className="space-y-2">
          {data.socials.map((s, i) => (
            <div key={s.platform} className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/5">
              <span className="font-mono text-xs text-white/60 w-20 shrink-0">{s.platform}</span>
              <input
                className={`${inputCls} flex-1`}
                value={s.href}
                onChange={e => setSocial(i, "href", e.target.value)}
                placeholder="https://..."
              />
              <label className="flex items-center gap-2 cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  checked={s.active}
                  onChange={e => setSocial(i, "active", e.target.checked)}
                  className="w-4 h-4 rounded"
                />
                <span className="font-mono text-xs text-white/50">Active</span>
              </label>
            </div>
          ))}
        </div>
      </div>

      <div>
        <p className="font-mono text-[10px] uppercase tracking-widest text-white/40 mb-3">Quick Links</p>
        <div className="space-y-2">
          {data.quickLinks.map((l, i) => (
            <div key={i} className="flex items-center gap-2">
              <input className={`${inputCls} flex-1`} value={l.label} onChange={e => setLink(i, "label", e.target.value)} placeholder="Label" />
              <input className={`${inputCls} flex-1`} value={l.href} onChange={e => setLink(i, "href", e.target.value)} placeholder="/#section" />
              <button onClick={() => removeQuickLink(i)} className="p-2 text-red-500/40 hover:text-red-400 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
          <button onClick={addQuickLink} className="flex items-center gap-2 font-mono text-xs text-white/40 hover:text-white transition-colors mt-1">
            <Plus className="w-3.5 h-3.5" /> Add Link
          </button>
        </div>
      </div>

      <SaveBar onSave={onSave} saving={saving} saved={saved} error={error} />
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────
// Main CMS Page
// ──────────────────────────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const SECTIONS = [
  { id: "hero", label: "HERO_SECTION", desc: "Badge, headline, description, CTAs", icon: Layout },
  { id: "about", label: "ABOUT_SECTION", desc: "Stats and information cards", icon: Info },
  { id: "whatwedo", label: "WHAT_WE_DO", desc: "Activities and program cards", icon: Layers },
  { id: "boardmembers", label: "BOARD_MEMBERS", desc: "Member cards shown on the Members page", icon: Users },
  { id: "gallery", label: "MEMBERS_GALLERY", desc: "Photo gallery on the Members page", icon: ImageIcon },
  { id: "footer", label: "FOOTER_&_SETTINGS", desc: "Social links, quick links, footer text", icon: Link2 },
] as const;

type SectionId = typeof SECTIONS[number]["id"];

export default function SiteCMSPage() {
  const [siteData, setSiteData] = useState<SiteData | null>(null);
  const [loading, setLoading] = useState(true);
  const [openSection, setOpenSection] = useState<SectionId | null>("hero");
  const [savingSection, setSavingSection] = useState<SectionId | null>(null);
  const [savedSection, setSavedSection] = useState<SectionId | null>(null);
  const [errorSection, setErrorSection] = useState<Record<SectionId, string | null>>({
    hero: null, about: null, whatwedo: null, boardmembers: null, gallery: null, footer: null,
  });

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/site-config");
      const json = await res.json();
      if (json.success) setSiteData(json.data as SiteData);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleSave = async (section: SectionId) => {
    if (!siteData) return;
    setSavingSection(section);
    setSavedSection(null);
    setErrorSection(prev => ({ ...prev, [section]: null }));
    try {
      const res = await fetch("/api/admin/site-config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ section, data: siteData[section] }),
      });
      const json = await res.json();
      if (json.success) {
        setSavedSection(section);
        setTimeout(() => setSavedSection(null), 3000);
      } else {
        setErrorSection(prev => ({ ...prev, [section]: json.error || "Save failed" }));
      }
    } catch {
      setErrorSection(prev => ({ ...prev, [section]: "Network error" }));
    } finally {
      setSavingSection(null);
    }
  };

  const toggle = (id: string) =>
    setOpenSection(prev => (prev === id ? null : (id as SectionId)));

  if (loading) {
    return (
      <div className="space-y-8 py-10">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-pixel text-white">SITE_CMS</h1>
          <p className="font-mono text-xs text-white/40">Loading site content…</p>
        </div>
        <div className="space-y-3">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-16 rounded-2xl bg-white/[0.02] animate-pulse border border-white/5" />
          ))}
        </div>
      </div>
    );
  }

  if (!siteData) return null;

  return (
    <div className="space-y-8 py-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-pixel text-white">SITE_CMS</h1>
          <p className="font-mono text-xs text-white/40">
            Edit every section of the public website — changes go live immediately on save
          </p>
        </div>
        <div className="flex gap-2">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/10 font-mono text-xs text-white/60 hover:text-white hover:bg-white/5 transition-all"
          >
            <Eye className="w-3.5 h-3.5" /> Preview Site
            <ExternalLink className="w-3 h-3" />
          </a>
          <button
            onClick={fetchAll}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/10 font-mono text-xs text-white/60 hover:text-white hover:bg-white/5 transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Reload
          </button>
        </div>
      </div>

      {/* Notice banner */}
      <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-500/5 border border-amber-500/20">
        <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <p className="font-mono text-xs text-amber-400/80">
          Changes are saved to MongoDB and reflect live on the public website. For Hero, About, WhatWeDo and Footer, the public components must be updated to fetch from the API — see the integration guide.
        </p>
      </div>

      {/* CMS Sections */}
      <div className="space-y-3">
        {/* Hero */}
        <Accordion id="hero" label="HERO_SECTION" desc="Badge, headline, description, CTAs" icon={Layout} open={openSection === "hero"} onToggle={toggle}>
          <HeroEditor
            data={siteData.hero}
            onChange={d => setSiteData(prev => prev ? { ...prev, hero: d } : prev)}
            onSave={() => handleSave("hero")}
            saving={savingSection === "hero"}
            saved={savedSection === "hero"}
            error={errorSection.hero}
          />
        </Accordion>

        {/* About */}
        <Accordion id="about" label="ABOUT_SECTION" desc="Stats and information cards" icon={Info} open={openSection === "about"} onToggle={toggle}>
          <AboutEditor
            data={siteData.about}
            onChange={d => setSiteData(prev => prev ? { ...prev, about: d } : prev)}
            onSave={() => handleSave("about")}
            saving={savingSection === "about"}
            saved={savedSection === "about"}
            error={errorSection.about}
          />
        </Accordion>

        {/* What We Do */}
        <Accordion id="whatwedo" label="WHAT_WE_DO" desc="Activities and program cards" icon={Layers} open={openSection === "whatwedo"} onToggle={toggle}>
          <WhatWeDoEditor
            data={siteData.whatwedo}
            onChange={d => setSiteData(prev => prev ? { ...prev, whatwedo: d } : prev)}
            onSave={() => handleSave("whatwedo")}
            saving={savingSection === "whatwedo"}
            saved={savedSection === "whatwedo"}
            error={errorSection.whatwedo}
          />
        </Accordion>

        {/* Board Members */}
        <Accordion id="boardmembers" label="BOARD_MEMBERS" desc="Member cards on the Members page" icon={Users} open={openSection === "boardmembers"} onToggle={toggle}>
          <BoardMembersEditor
            data={siteData.boardmembers}
            onChange={d => setSiteData(prev => prev ? { ...prev, boardmembers: d } : prev)}
            onSave={() => handleSave("boardmembers")}
            saving={savingSection === "boardmembers"}
            saved={savedSection === "boardmembers"}
            error={errorSection.boardmembers}
          />
        </Accordion>

        {/* Gallery */}
        <Accordion id="gallery" label="MEMBERS_GALLERY" desc="Photos on the Members page" icon={ImageIcon} open={openSection === "gallery"} onToggle={toggle}>
          <GalleryEditor
            data={siteData.gallery}
            onChange={d => setSiteData(prev => prev ? { ...prev, gallery: d } : prev)}
            onSave={() => handleSave("gallery")}
            saving={savingSection === "gallery"}
            saved={savedSection === "gallery"}
            error={errorSection.gallery}
          />
        </Accordion>

        {/* Footer */}
        <Accordion id="footer" label="FOOTER_&_SETTINGS" desc="Social links, quick links, footer text" icon={Link2} open={openSection === "footer"} onToggle={toggle}>
          <FooterEditor
            data={siteData.footer}
            onChange={d => setSiteData(prev => prev ? { ...prev, footer: d } : prev)}
            onSave={() => handleSave("footer")}
            saving={savingSection === "footer"}
            saved={savedSection === "footer"}
            error={errorSection.footer}
          />
        </Accordion>
      </div>
    </div>
  );
}
