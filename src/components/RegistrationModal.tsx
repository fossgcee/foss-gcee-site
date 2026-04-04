"use client";

import { useState, useEffect } from "react";
import { X, User, Hash, School, GraduationCap, Phone, Mail, Send, Loader2, CheckCircle2 } from "lucide-react";
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
    regNo: "",
    college: "Government College of Engineering, Erode",
    year: "1",
    mobile: "",
    email: ""
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Reset state when opening
  useEffect(() => {
    if (isOpen) {
      setIsSuccess(false);
      setIsSubmitting(false);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const res = await fetch("/api/events/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, eventTitle, eventSlug }),
      });
      const d = await res.json();
      if (d.success) {
        setIsSuccess(true);
        // Reset form
        setFormData({ name: "", regNo: "", college: "Government College of Engineering, Erode", year: "1", mobile: "", email: "" });
      }
    } catch (error) {
      console.error("Registration failed:", error);
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-lg bg-[#0f0f0f] border border-white/10 rounded-[32px] overflow-hidden shadow-2xl"
          >
            {/* Header */}
            <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
              <div>
                <h3 className="text-xl font-pixel text-white mb-1">EVENT_REGISTRATION</h3>
                <p className="text-[10px] font-mono text-white/40 uppercase tracking-widest">{eventTitle}</p>
              </div>
              <button 
                onClick={onClose}
                className="p-2 rounded-xl hover:bg-white/5 text-white/40 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-8">
              {isSuccess ? (
                <div className="py-12 flex flex-col items-center justify-center text-center space-y-6">
                  <div className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                    <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-2xl font-pixel text-white">SUCCESS!</h4>
                    <p className="font-mono text-xs text-white/40 max-w-xs mx-auto">
                      Your registration for &quot;{eventTitle}&quot; has been recorded. Check your mail for confirmation.
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
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-4">
                    {/* Name */}
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-[10px] font-mono text-white/40 uppercase tracking-widest pl-1">
                        <User className="w-3 h-3" /> Name with Initial
                      </label>
                      <input 
                        required
                        type="text" 
                        name="name"
                        placeholder="e.g. VISHNU S" 
                        className="w-full px-4 py-3 bg-white/5 border border-white/5 rounded-xl font-mono text-xs text-white placeholder:text-white/20 focus:outline-none focus:border-white/20 focus:bg-white/[0.07] transition-all"
                        value={formData.name}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      {/* Register Number */}
                      <div className="space-y-2">
                        <label className="flex items-center gap-2 text-[10px] font-mono text-white/40 uppercase tracking-widest pl-1">
                          <Hash className="w-3 h-3" /> Reg No
                        </label>
                        <input 
                          required
                          type="text" 
                          name="regNo"
                          placeholder="College Reg No" 
                          className="w-full px-4 py-3 bg-white/5 border border-white/5 rounded-xl font-mono text-xs text-white placeholder:text-white/20 focus:outline-none focus:border-white/20 focus:bg-white/[0.07] transition-all"
                          value={formData.regNo}
                          onChange={handleChange}
                        />
                      </div>

                      {/* Year */}
                      <div className="space-y-2">
                        <label className="flex items-center gap-2 text-[10px] font-mono text-white/40 uppercase tracking-widest pl-1">
                          <GraduationCap className="w-3 h-3" /> Year
                        </label>
                        <select 
                          required
                          name="year"
                          className="w-full px-4 py-3 bg-white/5 border border-white/5 rounded-xl font-mono text-xs text-white focus:outline-none focus:border-white/20 focus:bg-white/[0.07] transition-all appearance-none"
                          value={formData.year}
                          onChange={handleChange}
                        >
                          <option value="1">1st Year</option>
                          <option value="2">2nd Year</option>
                          <option value="3">3rd Year</option>
                          <option value="4">4th Year</option>
                        </select>
                      </div>
                    </div>

                    {/* College */}
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-[10px] font-mono text-white/40 uppercase tracking-widest pl-1">
                        <School className="w-3 h-3" /> College Name
                      </label>
                      <input 
                        required
                        type="text" 
                        name="college"
                        placeholder="Your College Name" 
                        className="w-full px-4 py-3 bg-white/5 border border-white/5 rounded-xl font-mono text-xs text-white placeholder:text-white/20 focus:outline-none focus:border-white/20 focus:bg-white/[0.07] transition-all"
                        value={formData.college}
                        onChange={handleChange}
                      />
                    </div>

                    {/* Mobile (WhatsApp) */}
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-[10px] font-mono text-white/40 uppercase tracking-widest pl-1">
                        <Phone className="w-3 h-3" /> Mobile Number (WhatsApp)
                      </label>
                      <input 
                        required
                        type="tel" 
                        name="mobile"
                        placeholder="+91 00000 00000" 
                        className="w-full px-4 py-3 bg-white/5 border border-white/5 rounded-xl font-mono text-xs text-white placeholder:text-white/20 focus:outline-none focus:border-white/20 focus:bg-white/[0.07] transition-all"
                        value={formData.mobile}
                        onChange={handleChange}
                      />
                    </div>

                    {/* Email */}
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-[10px] font-mono text-white/40 uppercase tracking-widest pl-1">
                        <Mail className="w-3 h-3" /> Mail ID
                      </label>
                      <input 
                        required
                        type="email" 
                        name="email"
                        placeholder="you@example.com" 
                        className="w-full px-4 py-3 bg-white/5 border border-white/5 rounded-xl font-mono text-xs text-white placeholder:text-white/20 focus:outline-none focus:border-white/20 focus:bg-white/[0.07] transition-all"
                        value={formData.email}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <button 
                    disabled={isSubmitting}
                    type="submit"
                    className="w-full mt-4 flex items-center justify-center gap-3 px-8 py-4 bg-white text-black rounded-2xl font-pixel text-xs hover:bg-white/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98] shadow-[0_0_30px_rgba(255,255,255,0.05)]"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" /> PROCESSING...
                      </>
                    ) : (
                      <>
                        CONFIRM_REGISTRATION <Send className="w-4 h-4" />
                      </>
                    )}
                  </button>
                  
                  <p className="text-center font-mono text-[9px] text-white/20 uppercase tracking-widest">
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
