"use client";

import { useState, useEffect } from "react";
import { X, User, Hash, School, GraduationCap, Phone, Mail, Send, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface RegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventTitle: string;
  eventSlug: string;
}

export default function RegistrationModal({ isOpen, onClose, eventTitle, eventSlug }: RegistrationModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    department: "",
    college: "Government College of Engineering, Erode",
    year: "1",
    mobile: "",
    email: ""
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Reset state when opening
  useEffect(() => {
    if (isOpen) {
      setIsSuccess(false);
      setIsSubmitting(false);
      setErrorMsg(null);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/events/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, eventTitle, eventSlug }),
      });
      const d = await res.json();
      if (d.success) {
        setIsSuccess(true);
        setFormData({ name: "", department: "", college: "Government College of Engineering, Erode", year: "1", mobile: "", email: "" });
      } else {
        setErrorMsg(d.error || "Registration failed. Please try again.");
      }
    } catch {
      setErrorMsg("Network error. Please check your connection.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />

          {/* Modal — slides up from bottom on mobile, scales in on desktop */}
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 60 }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            className="relative w-full sm:max-w-lg sm:mx-4 max-h-[92dvh] overflow-y-auto bg-[#0f0f0f] border border-white/10 rounded-t-[28px] sm:rounded-[28px] shadow-2xl"
          >
            {/* Header */}
            <div className="sticky top-0 z-10 px-5 py-4 border-b border-white/5 flex items-center justify-between bg-[#0f0f0f]/95 backdrop-blur-md">
              <div className="min-w-0 flex-1 pr-4">
                {/* Fixed-size pixel title that never wraps */}
                <h3 className="text-[13px] sm:text-base font-pixel text-white whitespace-nowrap tracking-tight">
                  EVENT_REGISTRATION
                </h3>
                <p className="text-[10px] font-mono text-white/35 uppercase tracking-widest mt-0.5 truncate leading-tight">
                  {eventTitle}
                </p>
              </div>
              <button
                onClick={onClose}
                className="shrink-0 w-8 h-8 flex items-center justify-center rounded-xl hover:bg-white/8 text-white/40 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="px-5 py-6">
              {isSuccess ? (
                <div className="py-10 flex flex-col items-center justify-center text-center space-y-5">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                    <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                  </div>
                  <div className="space-y-1.5">
                    <h4 className="text-xl font-pixel text-white">SUCCESS!</h4>
                    <p className="font-mono text-xs text-white/40 max-w-[240px] mx-auto leading-relaxed">
                      Registered for &ldquo;{eventTitle}&rdquo;. Check your mail for confirmation.
                    </p>
                  </div>
                  <button
                    onClick={onClose}
                    className="px-8 py-3 bg-white text-black rounded-xl font-pixel text-[11px] hover:bg-white/90 transition-all"
                  >
                    CLOSE_WINDOW
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">

                  {/* Error banner */}
                  {errorMsg && (
                    <div className="flex items-start gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 font-mono text-xs">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>{errorMsg}</span>
                    </div>
                  )}

                  {/* Name */}
                  <div className="space-y-1.5">
                    <label className="flex items-center gap-1.5 text-[10px] font-mono text-white/40 uppercase tracking-widest">
                      <User className="w-3 h-3" /> Name with Initial
                    </label>
                    <input
                      required
                      type="text"
                      name="name"
                      placeholder="e.g. R. Linus"
                      className="w-full px-4 py-3 bg-white/5 border border-white/8 rounded-xl font-mono text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-white/25 focus:bg-white/[0.07] transition-all"
                      value={formData.name}
                      onChange={handleChange}
                    />
                  </div>

                  {/* Department + Year */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="flex items-center gap-1.5 text-[10px] font-mono text-white/40 uppercase tracking-widest">
                        <Hash className="w-3 h-3" /> Dept
                      </label>
                      <div className="relative">
                        <select
                          required
                          name="department"
                          className="w-full px-3 py-3 bg-white/5 border border-white/8 rounded-xl font-mono text-xs text-white focus:outline-none focus:border-white/25 transition-all appearance-none pr-7"
                          value={formData.department}
                          onChange={handleChange}
                        >
                          <option value="" disabled className="bg-[#111] text-white/50">Dept</option>
                          <option value="CSE" className="bg-[#111]">CSE</option>
                          <option value="IT" className="bg-[#111]">IT</option>
                          <option value="ECE" className="bg-[#111]">ECE</option>
                          <option value="EEE" className="bg-[#111]">EEE</option>
                          <option value="MECH" className="bg-[#111]">Mech</option>
                          <option value="CIVIL" className="bg-[#111]">Civil</option>
                          <option value="AUTO" className="bg-[#111]">Auto</option>
                          <option value="AIDS" className="bg-[#111]">AI&DS</option>
                          <option value="OTHER" className="bg-[#111]">Other</option>
                        </select>
                        <svg className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-white/30 fill-current" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="flex items-center gap-1.5 text-[10px] font-mono text-white/40 uppercase tracking-widest">
                        <GraduationCap className="w-3 h-3" /> Year
                      </label>
                      <div className="relative">
                        <select
                          required
                          name="year"
                          className="w-full px-3 py-3 bg-white/5 border border-white/8 rounded-xl font-mono text-xs text-white focus:outline-none focus:border-white/25 transition-all appearance-none pr-7"
                          value={formData.year}
                          onChange={handleChange}
                        >
                          <option value="1" className="bg-[#111]">1st Year</option>
                          <option value="2" className="bg-[#111]">2nd Year</option>
                          <option value="3" className="bg-[#111]">3rd Year</option>
                          <option value="4" className="bg-[#111]">4th Year</option>
                        </select>
                        <svg className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-white/30 fill-current" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                      </div>
                    </div>
                  </div>

                  {/* College */}
                  <div className="space-y-1.5">
                    <label className="flex items-center gap-1.5 text-[10px] font-mono text-white/40 uppercase tracking-widest">
                      <School className="w-3 h-3" /> College
                    </label>
                    <input
                      required
                      type="text"
                      name="college"
                      placeholder="Your College Name"
                      className="w-full px-4 py-3 bg-white/5 border border-white/8 rounded-xl font-mono text-xs text-white placeholder:text-white/20 focus:outline-none focus:border-white/25 focus:bg-white/[0.07] transition-all"
                      value={formData.college}
                      onChange={handleChange}
                    />
                  </div>

                  {/* Mobile */}
                  <div className="space-y-1.5">
                    <label className="flex items-center gap-1.5 text-[10px] font-mono text-white/40 uppercase tracking-widest">
                      <Phone className="w-3 h-3" /> WhatsApp Number
                    </label>
                    <input
                      required
                      type="tel"
                      name="mobile"
                      placeholder="+91 00000 00000"
                      inputMode="tel"
                      className="w-full px-4 py-3 bg-white/5 border border-white/8 rounded-xl font-mono text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-white/25 focus:bg-white/[0.07] transition-all"
                      value={formData.mobile}
                      onChange={handleChange}
                    />
                  </div>

                  {/* Email */}
                  <div className="space-y-1.5">
                    <label className="flex items-center gap-1.5 text-[10px] font-mono text-white/40 uppercase tracking-widest">
                      <Mail className="w-3 h-3" /> Mail ID
                    </label>
                    <input
                      required
                      type="email"
                      name="email"
                      placeholder="you@example.com"
                      inputMode="email"
                      className="w-full px-4 py-3 bg-white/5 border border-white/8 rounded-xl font-mono text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-white/25 focus:bg-white/[0.07] transition-all"
                      value={formData.email}
                      onChange={handleChange}
                    />
                  </div>

                  <button
                    disabled={isSubmitting}
                    type="submit"
                    className="w-full mt-2 flex items-center justify-center gap-2 px-6 py-4 bg-white text-black rounded-2xl font-pixel text-[11px] hover:bg-white/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
                  >
                    {isSubmitting ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> PROCESSING...</>
                    ) : (
                      <>CONFIRM_REGISTRATION <Send className="w-4 h-4" /></>
                    )}
                  </button>

                  <p className="text-center font-mono text-[9px] text-white/20 uppercase tracking-widest leading-relaxed">
                    By registering you agree to receive event updates via WhatsApp and Email
                  </p>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
