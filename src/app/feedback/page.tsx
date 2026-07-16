"use client";

import { useState, useEffect, Suspense } from "react";
import { Send, CheckCircle, AlertCircle } from "lucide-react";
import { useSearchParams } from "next/navigation";

interface EventItem {
  _id: string;
  title: string;
  status: string;
}

function FeedbackForm() {
  const searchParams = useSearchParams();
  const initialEventSlug = searchParams.get("event") || "";

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    year: "1",
    department: "",
    eventName: "",
    rating: 5,
    comments: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await fetch("/api/events");
        const json = await res.json();
        if (json.success) {
          const completedEvents = json.data.filter((e: EventItem) => e.status === "completed");
          setEvents(completedEvents);

          // Pre-select if URL has an event slug or title matching
          if (initialEventSlug) {
            const matchedEvent = completedEvents.find(
              (e: EventItem & { slug?: string }) => e.slug === initialEventSlug || e.title === initialEventSlug
            );
            if (matchedEvent) {
              setFormData((prev) => ({ ...prev, eventName: matchedEvent.title }));
            }
          }
        }
      } catch (err) {
        console.error("Failed to fetch events");
      } finally {
        setLoadingEvents(false);
      }
    };
    fetchEvents();
  }, [initialEventSlug]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (data.success) {
        setSuccess(true);
      } else {
        setError(data.error || "Failed to submit feedback.");
      }
    } catch (err) {
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen pt-32 pb-24 px-4 sm:px-6 flex items-center justify-center bg-bg text-white">
        <div className="max-w-md w-full bg-[#111] p-8 rounded-2xl border border-white/10 text-center space-y-6">
          <CheckCircle className="w-16 h-16 text-emerald-400 mx-auto" />
          <h1 className="text-3xl font-pixel text-white">Thank You!</h1>
          <p className="text-white/60 font-mono text-sm">Your feedback helps us improve future events.</p>
          <button
            onClick={() => {
              setSuccess(false);
              setFormData({ name: "", email: "", year: "1", department: "", eventName: "", rating: 5, comments: "" });
            }}
            className="px-6 py-3 bg-white text-black font-mono text-sm font-bold rounded-xl hover:bg-white/90 transition-all"
          >
            Submit Another
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-32 pb-24 px-4 sm:px-6 bg-bg flex items-center justify-center text-white">
      <div className="max-w-xl w-full space-y-8">
        <div className="text-center space-y-4">
          <h1 className="font-pixel tracking-tight whitespace-nowrap text-[clamp(1rem,5vw,3rem)]">EVENT_FEEDBACK</h1>
          <p className="font-mono text-sm text-white/60 max-w-md mx-auto">
            We&apos;d love to hear your thoughts on our recent event. Your feedback is highly appreciated!
          </p>
        </div>

        <div className="bg-[#111] p-6 sm:p-8 rounded-2xl border border-white/10 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 font-mono text-xs">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-mono text-[10px] uppercase tracking-widest text-white/40 ml-1">Name (Optional)</label>
                  <input
                    type="text"
                    className="w-full bg-white/[0.03] border border-white/8 rounded-xl px-4 py-3 font-mono text-sm text-white focus:outline-none focus:ring-1 focus:ring-white/20 transition-all"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-mono text-[10px] uppercase tracking-widest text-white/40 ml-1">Email (Optional)</label>
                  <input
                    type="email"
                    className="w-full bg-white/[0.03] border border-white/8 rounded-xl px-4 py-3 font-mono text-sm text-white focus:outline-none focus:ring-1 focus:ring-white/20 transition-all"
                    placeholder="john@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-mono text-[10px] uppercase tracking-widest text-white/40 ml-1">Year *</label>
                  <div className="relative">
                    <select
                      required
                      className="w-full bg-white/[0.03] border border-white/8 rounded-xl px-4 py-3 font-mono text-sm text-white focus:outline-none focus:ring-1 focus:ring-white/20 transition-all appearance-none cursor-pointer"
                      value={formData.year}
                      onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                      style={{ backgroundImage: "none" }}
                    >
                      <option value="1" className="bg-[#111]">1st Year</option>
                      <option value="2" className="bg-[#111]">2nd Year</option>
                      <option value="3" className="bg-[#111]">3rd Year</option>
                      <option value="4" className="bg-[#111]">4th Year</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-white/40">
                      <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                        <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                      </svg>
                    </div>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="font-mono text-[10px] uppercase tracking-widest text-white/40 ml-1">Department *</label>
                  <div className="relative">
                    <select
                      required
                      className="w-full bg-white/[0.03] border border-white/8 rounded-xl px-4 py-3 font-mono text-sm text-white focus:outline-none focus:ring-1 focus:ring-white/20 transition-all appearance-none cursor-pointer"
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      style={{ backgroundImage: "none" }}
                    >
                      <option value="" disabled className="bg-[#111] text-white/50">Select Dept</option>
                      <option value="CSE" className="bg-[#111]">CSE</option>
                      <option value="IT" className="bg-[#111]">IT</option>
                      <option value="ECE" className="bg-[#111]">ECE</option>
                      <option value="EEE" className="bg-[#111]">EEE</option>
                      <option value="MECH" className="bg-[#111]">Mechanical</option>
                      <option value="CIVIL" className="bg-[#111]">Civil</option>
                      <option value="AUTO" className="bg-[#111]">Automobile</option>
                      <option value="AIDS" className="bg-[#111]">AI & DS</option>
                      <option value="OTHER" className="bg-[#111]">Other</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-white/40">
                      <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                        <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-mono text-[10px] uppercase tracking-widest text-white/40 ml-1">Event Name *</label>
                {loadingEvents ? (
                  <div className="w-full bg-white/[0.03] border border-white/8 rounded-xl px-4 py-3 font-mono text-sm text-white/50 animate-pulse">
                    Loading events...
                  </div>
                ) : events.length === 0 ? (
                  <div className="w-full bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-3 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-500" />
                    <p className="font-mono text-sm text-amber-500">No completed events available for feedback.</p>
                  </div>
                ) : (
                  <div className="relative">
                    <select
                      required
                      className="w-full bg-white/[0.03] border border-white/8 rounded-xl px-4 py-3 font-mono text-sm text-white focus:outline-none focus:ring-1 focus:ring-white/20 transition-all appearance-none cursor-pointer"
                      value={formData.eventName}
                      onChange={(e) => setFormData({ ...formData, eventName: e.target.value })}
                      style={{ backgroundImage: "none" }}
                    >
                      <option value="" disabled className="bg-[#111] text-white/50">
                        Select an event
                      </option>
                      {events.map((evt) => (
                        <option key={evt._id} value={evt.title} className="bg-[#111] text-white">
                          {evt.title}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-white/40">
                      <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                        <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                      </svg>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="font-mono text-[10px] uppercase tracking-widest text-white/40 ml-1">Rating *</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFormData({ ...formData, rating: star })}
                      className={`w-12 h-12 rounded-xl border flex items-center justify-center transition-all ${
                        formData.rating >= star 
                          ? "bg-amber-500/10 border-amber-500 text-amber-500" 
                          : "bg-white/[0.03] border-white/8 text-white/40 hover:bg-white/[0.06]"
                      }`}
                    >
                      <svg
                        className="w-6 h-6"
                        fill={formData.rating >= star ? "currentColor" : "none"}
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                      </svg>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-mono text-[10px] uppercase tracking-widest text-white/40 ml-1">Comments / Suggestions</label>
                <textarea
                  className="w-full bg-white/[0.03] border border-white/8 rounded-xl px-4 py-3 font-mono text-sm text-white focus:outline-none focus:ring-1 focus:ring-white/20 transition-all resize-none"
                  rows={4}
                  placeholder="Tell us what you liked or how we can improve..."
                  value={formData.comments}
                  onChange={(e) => setFormData({ ...formData, comments: e.target.value })}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || events.length === 0}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-white text-black font-pixel text-xs hover:bg-white/90 transition-all disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              {loading ? "SUBMITTING..." : "SUBMIT_FEEDBACK"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function FeedbackPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-bg text-white pt-32 pb-24 text-center font-mono">Loading...</div>}>
      <FeedbackForm />
    </Suspense>
  );
}
