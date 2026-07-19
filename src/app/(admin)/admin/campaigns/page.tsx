"use client";

import { useState, useEffect } from "react";
import { Mail, Send, Users, CalendarDays, CheckCircle2, AlertCircle, FileText, SendHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

type EventData = {
  _id: string;
  title: string;
  slug: string;
};

export default function CampaignsPage() {
  const [targetAudience, setTargetAudience] = useState<"all" | "event" | "custom">("all");
  const [selectedEventSlug, setSelectedEventSlug] = useState("");
  const [customEmails, setCustomEmails] = useState("");
  const [events, setEvents] = useState<EventData[]>([]);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sendTelegram, setSendTelegram] = useState(false);
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
    
    setIsTestSending(true);
    setStatus(null);
    try {
      const res = await fetch("/api/admin/campaigns/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          target: targetAudience,
          eventSlug: selectedEventSlug,
          customEmails,
          subject: subject.trim(),
          message: message.trim(),
          testEmail: tEmail,
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
    if (targetAudience === "custom" && !customEmails.trim()) {
      setStatus({ type: "error", text: "Please enter at least one custom email address." });
      return;
    }
    if (!confirm("Are you sure you want to blast this campaign to the selected audience? This cannot be undone.")) {
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
          customEmails,
          subject: subject.trim(),
          message: message.trim(),
          sendTelegram,
        }),
      });
      const d = await res.json();
      if (!d.success) throw new Error(d.error || "Failed to send campaign.");

      let successText = `Campaign dispatched! ${d.sentCount} emails delivered.`;
      if (sendTelegram) {
        successText += " (Also broadcasted to Telegram)";
      }

      setStatus({ type: "success", text: successText });
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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/5 pb-4">
        <div>
          <h1 className="text-xl md:text-2xl font-pixel text-white mb-1 tracking-wide">EMAIL & ANNOUNCEMENT CAMPAIGNS</h1>
          <p className="font-mono text-[10px] md:text-xs text-white/50 uppercase tracking-wider">
            Centralized notification widget for members, event attendees & custom blasts
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-[#0a0a0a] border border-white/10 p-6 rounded-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
            
            <h2 className="font-pixel text-xs text-white/80 mb-6 flex items-center gap-2">
              <Mail className="w-4 h-4" /> COMPOSE_CAMPAIGN
            </h2>

            <div className="space-y-5 relative z-10">
              <div className="space-y-2">
                <label className="font-mono text-[10px] text-white/50 uppercase tracking-widest">1. Select Target Audience</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button
                    onClick={() => setTargetAudience("all")}
                    className={cn(
                      "flex items-center justify-center gap-2 py-3 px-3 rounded-xl border transition-all font-mono text-[10px] uppercase",
                      targetAudience === "all" 
                        ? "bg-white/10 border-white/20 text-white font-bold" 
                        : "bg-white/5 border-white/10 text-white/50 hover:bg-white/[0.07]"
                    )}
                  >
                    <Users className="w-3.5 h-3.5" /> All Members
                  </button>
                  <button
                    onClick={() => setTargetAudience("event")}
                    className={cn(
                      "flex items-center justify-center gap-2 py-3 px-3 rounded-xl border transition-all font-mono text-[10px] uppercase",
                      targetAudience === "event" 
                        ? "bg-white/10 border-white/20 text-white font-bold" 
                        : "bg-white/5 border-white/10 text-white/50 hover:bg-white/[0.07]"
                    )}
                  >
                    <CalendarDays className="w-3.5 h-3.5" /> Event Attendees
                  </button>
                  <button
                    onClick={() => setTargetAudience("custom")}
                    className={cn(
                      "flex items-center justify-center gap-2 py-3 px-3 rounded-xl border transition-all font-mono text-[10px] uppercase",
                      targetAudience === "custom" 
                        ? "bg-white/10 border-white/20 text-white font-bold" 
                        : "bg-white/5 border-white/10 text-white/50 hover:bg-white/[0.07]"
                    )}
                  >
                    <FileText className="w-3.5 h-3.5" /> Custom List
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
                    <option value="" className="bg-[#0a0a0a]">-- Select an Event --</option>
                    {events.map((e) => (
                      <option key={e.slug} value={e.slug} className="bg-[#0a0a0a]">{e.title}</option>
                    ))}
                  </select>
                </div>
              )}

              {targetAudience === "custom" && (
                <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                  <label className="font-mono text-[10px] text-white/50 uppercase tracking-widest">Custom Email Addresses (comma or newline separated)</label>
                  <textarea
                    value={customEmails}
                    onChange={(e) => setCustomEmails(e.target.value)}
                    placeholder="email1@example.com, email2@example.com..."
                    rows={3}
                    className="w-full px-4 py-3 bg-white/[0.03] border border-white/10 rounded-xl font-mono text-[10px] text-white focus:outline-none focus:border-white/20 transition-all placeholder:text-white/20 resize-none"
                  />
                </div>
              )}

              <div className="space-y-2">
                <label className="font-mono text-[10px] text-white/50 uppercase tracking-widest">2. Email Subject</label>
                <input
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Announcement: Upcoming Workshop & Event Updates"
                  className="w-full px-4 py-3 bg-white/[0.03] border border-white/10 rounded-xl font-mono text-[10px] text-white focus:outline-none focus:border-white/20 transition-all placeholder:text-white/20"
                />
              </div>

              <div className="space-y-2">
                <label className="font-mono text-[10px] text-white/50 uppercase tracking-widest">3. Message Body</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type your message here..."
                  rows={8}
                  className="w-full px-4 py-3 bg-white/[0.03] border border-white/10 rounded-xl font-mono text-[10px] text-white focus:outline-none focus:border-white/20 transition-all placeholder:text-white/20 resize-none"
                />
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={sendTelegram}
                    onChange={(e) => setSendTelegram(e.target.checked)}
                    className="w-4 h-4 rounded border-white/20 bg-white/5 text-white focus:ring-0 focus:ring-offset-0 cursor-pointer"
                  />
                  <span className="font-mono text-xs text-white/70 group-hover:text-white transition-colors">
                    Also broadcast this announcement to Telegram Subscribers / Group
                  </span>
                </label>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-[#0a0a0a] border border-white/10 p-6 rounded-2xl relative overflow-hidden flex flex-col justify-between h-full">
            <div>
              <h2 className="font-pixel text-xs text-white/80 mb-6 flex items-center gap-2">
                <SendHorizontal className="w-4 h-4" /> TEST_&_BLAST
              </h2>

              <div className="space-y-6">
                <div className="space-y-3">
                  <label className="font-mono text-[10px] text-white/50 uppercase tracking-widest">Test Single Email First</label>
                  <input
                    value={testEmail}
                    onChange={(e) => setTestEmail(e.target.value)}
                    placeholder="your-email@gmail.com"
                    className="w-full px-4 py-2.5 bg-white/[0.03] border border-white/10 rounded-xl font-mono text-[10px] text-white focus:outline-none focus:border-white/20 transition-all placeholder:text-white/20"
                  />
                  <button
                    onClick={handleSendTestEmail}
                    disabled={isTestSending || !testEmail.trim()}
                    className="w-full py-2.5 rounded-xl bg-white/5 border border-white/10 text-white font-mono text-[10px] hover:bg-white/10 transition-all flex items-center justify-center gap-2 uppercase disabled:opacity-50"
                  >
                    {isTestSending ? "Sending Test..." : "Send Test Email"}
                  </button>
                </div>

                <div className="h-[1px] w-full bg-white/10" />

                <div className="space-y-3">
                  <button
                    onClick={handleSendCampaign}
                    disabled={isSending || (targetAudience === "event" && !selectedEventSlug) || (targetAudience === "custom" && !customEmails.trim())}
                    className="w-full py-4 rounded-xl bg-white text-black font-pixel text-[10px] hover:bg-white/90 transition-all flex items-center justify-center gap-2 uppercase disabled:opacity-50 shadow-lg shadow-white/5"
                  >
                    <Send className="w-4 h-4" />
                    {isSending ? "DISPATCHING..." : "BLAST_CAMPAIGN.EXE"}
                  </button>
                </div>
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
