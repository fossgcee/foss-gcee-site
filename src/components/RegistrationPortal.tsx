"use client";

import { useState, useRef } from "react";
import {
  User, Mail, Link2, Phone, GraduationCap, BookOpen,
  ArrowRight, Loader2, CheckCircle2, RefreshCw, RotateCcw
} from "lucide-react";
import { GitHubIcon, YouTubeIcon, InstagramIcon, DiscordIcon, LinkedInIcon, EmailIcon } from "@/components/icons/SocialIcons";

const DEPARTMENTS = [
  "Computer Science & Engineering",
  "Information Technology",
  "Electronics & Communication Engineering",
  "Electrical & Electronics Engineering",
  "Mechanical Engineering",
  "Civil Engineering",
  "Artificial Intelligence & Data Science",
  "Other",
];

const YEARS = ["1st Year", "2nd Year", "3rd Year", "4th Year"];

type Step = "form" | "otp" | "success";

interface FormData {
  name: string;
  email: string;
  linkedin: string;
  phone: string;
  year: string;
  department: string;
}

const SOCIALS = [
  { Icon: GitHubIcon, label: "GitHub", href: "https://github.com/fossgcee", sub: "github.com/fossgcee", active: true },
  { Icon: YouTubeIcon, label: "YouTube", href: "https://www.youtube.com/channel/UCTtzkb23e6iQAMMkgigHQqQ", sub: "FOSSGCEE Channel", active: true },
  { Icon: InstagramIcon, label: "Instagram", href: "https://www.instagram.com/fossgcee/", sub: "@fossgcee", active: true },
  { Icon: DiscordIcon, label: "Discord", href: "https://discord.com/invite/d6SUMn4JF", sub: "Join our server", active: true },
  { Icon: LinkedInIcon, label: "LinkedIn", href: "#", sub: "Coming soon", active: false },
  { Icon: EmailIcon, label: "Email", href: "mailto:fossgcee@gmail.com", sub: "fossgcee@gmail.com", active: true },
];

const getErrorMessage = (error: unknown) => {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  return "Something went wrong.";
};

// ————— Input field component —————
function Field({
  icon: Icon, label, name, type = "text", value, onChange, placeholder, disabled,
  pattern, hint, title: inputTitle, inputMode,
}: {
  icon: React.ElementType; label: string; name: string; type?: string;
  value: string; onChange: (v: string) => void; placeholder: string; disabled?: boolean;
  pattern?: string; hint?: string; title?: string; 
  inputMode?: "text" | "none" | "tel" | "url" | "email" | "numeric" | "decimal" | "search";
}) {
  return (
    <div className="space-y-2">
      <label className="font-mono text-[10px] text-black/50 dark:text-white/40 uppercase tracking-widest">
        {label}
      </label>
      <div className="relative group">
        <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-black/30 dark:text-white/25 group-focus-within:text-black/60 dark:group-focus-within:text-white/70 transition-colors" />
        <input
          name={name}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required
          disabled={disabled}
          pattern={pattern}
          title={inputTitle}
          inputMode={inputMode}
          className="w-full bg-black/[0.04] dark:bg-white/[0.03] border border-black/10 dark:border-white/8 rounded-xl py-3.5 pl-12 pr-4 font-mono text-sm text-black dark:text-white placeholder:text-black/30 dark:placeholder:text-white/20 focus:outline-none focus:ring-1 ring-black/20 dark:ring-white/20 hover:bg-black/[0.07] dark:hover:bg-white/[0.05] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        />
      </div>
      {hint && <p className="font-mono text-[9px] text-black/40 dark:text-white/25 pl-1">{hint}</p>}
    </div>
  );
}

// ————— Select field component —————
function SelectField({
  icon: Icon, label, name, value, onChange, options, placeholder, disabled,
}: {
  icon: React.ElementType; label: string; name: string; value: string;
  onChange: (v: string) => void; options: string[]; placeholder: string; disabled?: boolean;
}) {
  return (
    <div className="space-y-2">
      <label className="font-mono text-[10px] text-black/50 dark:text-white/40 uppercase tracking-widest">
        {label}
      </label>
      <div className="relative group">
        <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-black/30 dark:text-white/25 group-focus-within:text-black/60 dark:group-focus-within:text-white/70 transition-colors z-10" />
        <select
          name={name}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required
          disabled={disabled}
          className="w-full bg-white dark:bg-[#0f0f0f] border border-black/10 dark:border-white/8 rounded-xl py-3.5 pl-12 pr-4 font-mono text-sm text-black dark:text-white focus:outline-none focus:ring-1 ring-black/20 dark:ring-white/20 appearance-none cursor-pointer hover:bg-black/[0.04] dark:hover:bg-white/[0.05] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <option value="" disabled className="bg-white dark:bg-[#0f0f0f]">{placeholder}</option>
          {options.map((o) => (
            <option key={o} value={o} className="bg-white dark:bg-[#0f0f0f]">{o}</option>
          ))}
        </select>
        <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-black/30 dark:text-white/30">▾</div>
      </div>
    </div>
  );
}

export default function RegistrationPortal() {
  const [step, setStep] = useState<Step>("form");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [resendTimer, setResendTimer] = useState(0);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const resendIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const [form, setForm] = useState<FormData>({
    name: "", email: "", linkedin: "", phone: "+91 ", year: "", department: "",
  });

  const startResendTimer = () => {
    setResendTimer(60);
    if (resendIntervalRef.current) clearInterval(resendIntervalRef.current);
    resendIntervalRef.current = setInterval(() => {
      setResendTimer((t) => {
        if (t <= 1) { clearInterval(resendIntervalRef.current!); return 0; }
        return t - 1;
      });
    }, 1000);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const normalizedLinkedin = form.linkedin.startsWith("http")
        ? form.linkedin
        : `https://${form.linkedin}`;
      const res = await fetch("/api/register/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, linkedin: normalizedLinkedin }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      setStep("otp");
      startResendTimer();
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const next = [...otp];
    next[index] = value.slice(-1);
    setOtp(next);
    if (value && index < 5) otpRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 6) {
      setOtp(pasted.split(""));
      otpRefs.current[5]?.focus();
    }
    e.preventDefault();
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = otp.join("");
    if (code.length < 6) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/register/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email, otp: code }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      setStep("success");
    } catch (err: unknown) {
      setError(getErrorMessage(err) || "Verification failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendTimer > 0) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/register/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      setOtp(["", "", "", "", "", ""]);
      otpRefs.current[0]?.focus();
      startResendTimer();
    } catch (err: unknown) {
      setError(getErrorMessage(err) || "Failed to resend OTP.");
    } finally {
      setLoading(false);
    }
  };

  // ——— SUCCESS SCREEN ———
  if (step === "success") {
    return (
      <section className="min-h-screen pt-32 pb-24 px-4 flex items-center justify-center">
        <div className="max-w-md w-full text-center space-y-8">
          <div className="w-24 h-24 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto animate-bounce">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 dark:text-emerald-400" />
          </div>
          <div>
            <h2 className="text-3xl font-pixel text-black dark:text-white mb-3">ACCESS_GRANTED</h2>
            <p className="font-mono text-sm text-black/60 dark:text-white/50 leading-relaxed">
              Welcome to the <span className="text-black dark:text-white font-semibold">FOSS Club GCE Erode</span>, {form.name.split(" ")[0]}!<br />
              Your email has been verified and your registration is complete.
            </p>
          </div>
          <div className="p-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.04] space-y-3 text-left">
            {[
              ["Name", form.name],
              ["Email", form.email],
              ["Year", form.year],
              ["Department", form.department],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between font-mono text-xs">
                <span className="text-black/50 dark:text-white/40">{k}</span>
                <span className="text-black dark:text-white">{v}</span>
              </div>
            ))}
          </div>
          <p className="font-mono text-[10px] text-black/40 dark:text-white/30">
            Watch your inbox for further updates from the club.
          </p>

          <div className="pt-6 space-y-4">
            <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-black/50 dark:text-white/40">
              Follow us for updates
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
              {SOCIALS.map((s) => (
                <a
                  key={s.label}
                  href={s.active ? s.href : undefined}
                  target={s.active ? "_blank" : undefined}
                  rel="noopener noreferrer"
                  className={`flex items-center min-w-[44px] min-h-[44px] md:min-w-0 md:min-h-0 gap-3 rounded-xl border border-black/10 dark:border-white/10 bg-black/[0.03] dark:bg-white/[0.03] px-3 py-2.5 text-black/70 dark:text-white/70 transition-colors ${s.active ? "hover:text-black dark:hover:text-white hover:bg-black/[0.06] dark:hover:bg-white/[0.06]" : "opacity-50 pointer-events-none"}`}
                >
                  <span className="w-8 h-8 rounded-lg border border-black/10 dark:border-white/10 flex items-center justify-center text-black/60 dark:text-white/60">
                    <s.Icon />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-xs font-semibold">{s.label}</span>
                    <span className="block text-[10px] font-mono text-black/40 dark:text-white/40 truncate">{s.sub}</span>
                  </span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen pt-32 pb-24 px-4 flex items-start justify-center">
      <div className="w-full max-w-xl">
        {/* Header */}
        <div className="mb-10 space-y-2 text-center">
          <p className="font-mono text-[10px] text-black/40 dark:text-white/30 tracking-[0.3em] uppercase">
            {step === "form" ? "Step 1 of 2 — Registration Details" : "Step 2 of 2 — Email Verification"}
          </p>
          <h1 className="text-3xl font-pixel text-black dark:text-white leading-tight">
            {step === "form" ? "JOIN_FOSS_CLUB" : "VERIFY_EMAIL"}
          </h1>
          <p className="font-mono text-xs text-black/50 dark:text-white/40 mt-1">
            {step === "form"
              ? "Fill in your details to request membership."
              : <>OTP sent to <span className="text-black dark:text-white font-semibold">{form.email}</span>. Check your inbox.</>
            }
          </p>
        </div>

        {/* Progress indicator */}
        <div className="flex gap-2 mb-10">
          {["form", "otp"].map((s, i) => {
            const filled = (step === "otp" && i === 0) || (step === "otp" && i === 1) || (step === "form" && i === 0);
            return (
              <div
                key={s}
                className={`h-1 flex-1 rounded-full transition-all duration-500 ${filled ? "bg-black dark:bg-white" : "bg-black/10 dark:bg-white/10"}`}
              />
            );
          })}
        </div>

        {/* Card */}
        <div className="rounded-3xl p-8 border border-black/8 dark:border-white/7 bg-black/[0.02] dark:bg-white/[0.02]">

          {/* ——— STEP 1: FORM ——— */}
          {step === "form" && (
            <form onSubmit={handleFormSubmit} className="space-y-5">
              <Field icon={User} label="Full Name" name="name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} placeholder="e.g. Linus Torvalds" />
              <Field icon={Mail} label="Gmail Address" name="email" type="email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} placeholder="e.g. you@gmail.com" inputMode="email" />
              <Field
                icon={Link2}
                label="LinkedIn Profile URL"
                name="linkedin"
                type="text"
                value={form.linkedin}
                onChange={(v) => setForm({ ...form, linkedin: v })}
                placeholder="www.linkedin.com/in/your-profile"
                pattern="(https?://)?www\..*"
                title="Must start with www. (e.g. www.linkedin.com/in/yourname)"
                hint="https:// is optional — but www. is required"
              />
              <Field icon={Phone} label="Phone Number" name="phone" type="tel" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} placeholder="+91 9876543210" inputMode="tel" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <SelectField icon={GraduationCap} label="Year" name="year" value={form.year} onChange={(v) => setForm({ ...form, year: v })} options={YEARS} placeholder="Select year" />
                <SelectField icon={BookOpen} label="Department" name="department" value={form.department} onChange={(v) => setForm({ ...form, department: v })} options={DEPARTMENTS} placeholder="Select dept." />
              </div>

              {error && (
                <div className="flex gap-3 items-start p-4 rounded-xl border border-red-500/20 bg-red-500/10">
                  <span className="text-red-600 dark:text-red-400 font-mono text-[11px] leading-relaxed">{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full h-14 rounded-2xl bg-black dark:bg-white text-white dark:text-black font-pixel text-[11px] flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition-transform disabled:opacity-50 disabled:cursor-not-allowed mt-2"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>SEND_OTP <ArrowRight className="w-4 h-4" /></>}
              </button>
            </form>
          )}

          {/* ——— STEP 2: OTP ——— */}
          {step === "otp" && (
            <form onSubmit={handleOtpSubmit} className="space-y-8">
              <div className="space-y-4 text-center">
                <p className="font-mono text-[10px] sm:text-xs text-black/50 dark:text-white/40">Enter the 6-digit code we sent to your inbox</p>
                <div className="flex gap-2 sm:gap-3 justify-center" onPaste={handleOtpPaste}>
                  {otp.map((digit, i) => (
                    <input
                      key={i}
                      ref={(el) => { otpRefs.current[i] = el; }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(i, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(i, e)}
                      className={`w-10 sm:w-12 h-12 sm:h-14 text-center text-xl sm:text-2xl font-pixel text-black dark:text-white bg-black/[0.04] dark:bg-white/[0.04] border rounded-xl focus:outline-none focus:ring-2 ring-black/20 dark:ring-white/30 transition-all caret-transparent ${digit
                          ? "border-black/40 dark:border-white/40"
                          : "border-black/10 dark:border-white/10"
                        }`}
                    />
                  ))}
                </div>
              </div>

              {error && (
                <div className="flex gap-3 items-start p-4 rounded-xl border border-red-500/20 bg-red-500/10">
                  <span className="text-red-600 dark:text-red-400 font-mono text-[11px] leading-relaxed">{error}</span>
                </div>
              )}

              <div className="space-y-3">
                <button
                  type="submit"
                  disabled={loading || otp.join("").length < 6}
                  className="w-full h-14 rounded-2xl bg-black dark:bg-white text-white dark:text-black font-pixel text-[11px] flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>VERIFY_OTP <CheckCircle2 className="w-4 h-4" /></>}
                </button>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={loading || resendTimer > 0}
                    className="flex-1 h-11 rounded-xl border border-black/10 dark:border-white/10 text-black/60 dark:text-white/60 font-mono text-xs flex items-center justify-center gap-2 transition-all disabled:opacity-30 hover:bg-black/5 dark:hover:bg-white/5"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    {resendTimer > 0 ? `Resend in ${resendTimer}s` : "Resend OTP"}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setStep("form"); setError(null); setOtp(["", "", "", "", "", ""]); }}
                    className="flex-1 h-11 rounded-xl border border-black/10 dark:border-white/10 text-black/60 dark:text-white/60 font-mono text-xs flex items-center justify-center gap-2 transition-all hover:bg-black/5 dark:hover:bg-white/5"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Edit Details
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
