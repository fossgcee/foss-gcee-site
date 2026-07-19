"use client";

import { useState, useEffect } from "react";
import { Mail, Send, Users, CalendarDays, CheckCircle2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type EventData = {
  _id: string;
  title: string;
  slug: string;
};

export default function CampaignsPage() {
  const [targetAudience, setTargetAudience] = useState<"all" | "event">("all");
  const [selectedEventSlug, setSelectedEventSlug] = useState("");
  const [events, setEvents] = useState<EventData[]>([]);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [testEmail, setTestEmail] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isTestSending, setIsTestSending] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await fetch("/api/admin/events");
        const data = await res.json();
        if (data.success) {
          setEvents(data.data);
        }
      } catch (err) {
        console.error("Failed to fetch events:", err);
      }
    };
    fetchEvents();
  }, []);

  const handleSendTestEmail = async () => {
    const tEmail = testEmail.trim();
    if (!subject.trim() || !message.trim() || !tEmail) {
      setStatus({ type: "error", text: "Subject, message, and test email are required." });
      return;
    }
    if (targetAudience === "event" && !selectedEventSlug) {
      setStatus({ type: "error", text: "Please select an event." });
      return;
    }
    
    setIsTestSending(true);
    setStatus(null);
    try {
      const res = await fetch("/api/admin/campaigns/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          target: targetAudience,
          eventSlug: selectedEventSlug,
          subject: subject.trim(),
          message: message.trim(),
          testEmail: tEmail
        }),
      });
      const d = await res.json();
      if (!d.success) throw new Error(d.error || "Failed to send test email.");
      setStatus({ type: "success", text: `Test email sent successfully to ${tEmail}.` });
    } catch (err: any) {
      setStatus({ type: "error", text: err.message });
    } finally {
      setIsTestSending(false);
    }
  };

  const handleSendCampaign = async () => {
    if (!subject.trim() || !message.trim()) {
      setStatus({ type: "error", text: "Subject and message are required." });
      return;
    }
    if (targetAudience === "event" && !selectedEventSlug) {
      setStatus({ type: "error", text: "Please select an event." });
      return;
    }
    if (!confirm("Are you sure you want to blast this email to the selected audience? This cannot be undone.")) {
      return;
    }

    setIsSending(true);
    setStatus(null);
    try {
      const res = await fetch("/api/admin/campaigns/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          target: targetAudience,
          eventSlug: selectedEventSlug,
          subject: subject.trim(),
          message: message.trim(),
        }),
      });
      const d = await res.json();
      if (!d.success) throw new Error(d.error || "Failed to send campaign.");
      setStatus({ type: "success", text: `Campaign sent successfully! ${d.sentCount} emails delivered.` });
      // Reset form on success
      setSubject("");
      setMessage("");
    } catch (err: any) {
      setStatus({ type: "error", text: err.message });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-pixel text-white mb-2 tracking-wide">CAMPAIGNS</h1>
          <p className="font-mono text-[10px] md:text-xs text-white/50 uppercase tracking-wider">
            Email blast system for announcements & updates
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-[#0a0a0a] border border-white/10 p-6 rounded-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
            
            <h2 className="font-pixel text-xs text-white/80 mb-6 flex items-center gap-2">
              <Mail className="w-4 h-4" /> COMPOSE_MESSAGE
            </h2>

            <div className="space-y-5 relative z-10">
              <div className="space-y-2">
                <label className="font-mono text-[10px] text-white/50 uppercase tracking-widest">Target Audience</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setTargetAudience("all")}
                    className={cn(
                      "flex items-center justify-center gap-2 py-3 rounded-xl border transition-all font-mono text-[10px] uppercase",
                      targetAudience === "all" 
                        ? "bg-white/10 border-white/20 text-white" 
                        : "bg-white/5 border-white/10 text-white/50 hover:bg-white/[0.07]"
                    )}
                  >
                    <Users className="w-3.5 h-3.5" /> All Members
                  </button>
                  <button
                    onClick={() => setTargetAudience("event")}
                    className={cn(
                      "flex items-center justify-center gap-2 py-3 rounded-xl border transition-all font-mono text-[10px] uppercase",
                      targetAudience === "event" 
                        ? "bg-white/10 border-white/20 text-white" 
                        : "bg-white/5 border-white/10 text-white/50 hover:bg-white/[0.07]"
                    )}
                  >
                    <CalendarDays className="w-3.5 h-3.5" /> Event Attendees
                  </button>
                </div>
              </div>

              {targetAudience === "event" && (
                <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                  <label className="font-mono text-[10px] text-white/50 uppercase tracking-widest">Select Event</label>
                  <select
                    value={selectedEventSlug}
                    onChange={(e) => setSelectedEventSlug(e.target.value)}
                    className="w-full px-4 py-3 bg-white/[0.03] border border-white/10 rounded-xl font-mono text-[10px] text-white focus:outline-none focus:border-white/20 transition-all appearance-none"
                  >
                    <option value="" className="bg-[#0a0a0a]">-- Select an event --</option>
                    {events.map((e) => (
                      <option key={e.slug} value={e.slug} className="bg-[#0a0a0a]">{e.title}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="space-y-2">
                <label className="font-mono text-[10px] text-white/50 uppercase tracking-widest">Email Subject</label>
                <input
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Subject line..."
                  className="w-full px-4 py-3 bg-white/[0.03] border border-white/10 rounded-xl font-mono text-[10px] text-white focus:outline-none focus:border-white/20 transition-all placeholder:text-white/20"
                />
              </div>

              <div className="space-y-2">
                <label className="font-mono text-[10px] text-white/50 uppercase tracking-widest">Message Content</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Write your email here..."
                  rows={8}
                  className="w-full px-4 py-3 bg-white/[0.03] border border-white/10 rounded-xl font-mono text-[10px] text-white focus:outline-none focus:border-white/20 transition-all placeholder:text-white/20 resize-none"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-[#0a0a0a] border border-white/10 p-6 rounded-2xl relative overflow-hidden flex flex-col h-full">
            <h2 className="font-pixel text-xs text-white/80 mb-6 flex items-center gap-2">
              <Send className="w-4 h-4" /> DISPATCH
            </h2>

            <div className="flex-1 space-y-6">
              <div className="space-y-3">
                <label className="font-mono text-[10px] text-white/50 uppercase tracking-widest">Test Delivery</label>
                <input
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  placeholder="test@example.com"
                  className="w-full px-4 py-2.5 bg-white/[0.03] border border-white/10 rounded-xl font-mono text-[10px] text-white focus:outline-none focus:border-white/20 transition-all placeholder:text-white/20"
                />
                <button
                  onClick={handleSendTestEmail}
                  disabled={isTestSending || !testEmail.trim()}
                  className="w-full py-2.5 rounded-xl bg-white/5 border border-white/10 text-white font-mono text-[10px] hover:bg-white/10 transition-all flex items-center justify-center gap-2 uppercase disabled:opacity-50"
                >
                  {isTestSending ? "Testing..." : "Send Test Email"}
                </button>
              </div>

              <div className="h-[1px] w-full bg-white/10" />

              <div className="space-y-3">
                <button
                  onClick={handleSendCampaign}
                  disabled={isSending || (targetAudience === "event" && !selectedEventSlug)}
                  className="w-full py-4 rounded-xl bg-white text-black font-pixel text-[10px] hover:bg-white/90 transition-all flex items-center justify-center gap-2 uppercase disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  {isSending ? "SENDING..." : "BLAST_CAMPAIGN.EXE"}
                </button>
              </div>
            </div>

            {status && (
              <div className={cn(
                "mt-6 p-4 rounded-xl border flex items-start gap-3",
                status.type === "success" ? "bg-green-500/10 border-green-500/20" : "bg-red-500/10 border-red-500/20"
              )}>
                {status.type === "success" ? (
                  <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                )}
                <p className={cn(
                  "font-mono text-[10px] uppercase tracking-wider leading-relaxed",
                  status.type === "success" ? "text-green-200" : "text-red-200"
                )}>
                  {status.text}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
