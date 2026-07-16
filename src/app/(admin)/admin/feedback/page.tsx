"use client";

import { useState, useEffect } from "react";
import { MessageSquare, Star, Trash2, Calendar, RefreshCw } from "lucide-react";

interface FeedbackItem {
  _id: string;
  name?: string;
  email?: string;
  eventName: string;
  rating: number;
  comments?: string;
  createdAt: string;
}

export default function AdminFeedbackPage() {
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFeedback = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/feedback");
      const data = await res.json();
      if (data.success) {
        setFeedbacks(data.data);
      }
    } catch (err) {
      console.error("Failed to fetch feedback", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedback();
  }, []);

  const deleteFeedback = async (id: string) => {
    if (!confirm("Are you sure you want to delete this feedback?")) return;
    try {
      const res = await fetch(`/api/admin/feedback?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setFeedbacks((prev) => prev.filter((f) => f._id !== id));
      }
    } catch (err) {
      console.error("Failed to delete feedback", err);
    }
  };

  const averageRating = feedbacks.length > 0 
    ? (feedbacks.reduce((acc, f) => acc + f.rating, 0) / feedbacks.length).toFixed(1)
    : "0.0";

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-pixel text-white">FEEDBACK</h1>
        <div className="animate-pulse flex space-x-4">
          <div className="flex-1 space-y-4 py-1">
            <div className="h-4 bg-white/10 rounded w-3/4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-white/10 rounded"></div>
              <div className="h-4 bg-white/10 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-3xl font-pixel text-white">FEEDBACK</h1>
          <p className="font-mono text-xs text-white/40 mt-2">
            View and manage event feedback from participants.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl flex items-center gap-3">
            <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
            <div>
              <p className="font-mono text-[10px] text-white/40 uppercase tracking-wider">Avg Rating</p>
              <p className="font-mono text-sm text-white font-bold">{averageRating} / 5</p>
            </div>
          </div>
          <button
            onClick={fetchFeedback}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 font-mono text-xs text-white transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh
          </button>
        </div>
      </div>

      {feedbacks.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-white/10 rounded-2xl bg-white/[0.02]">
          <MessageSquare className="w-12 h-12 text-white/20 mx-auto mb-4" />
          <h2 className="font-mono text-sm text-white">No feedback yet</h2>
          <p className="font-mono text-xs text-white/40 mt-1">When participants submit feedback, it will appear here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {feedbacks.map((f) => (
            <div key={f._id} className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 flex flex-col gap-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-mono text-sm text-white font-bold line-clamp-1">{f.eventName}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="font-mono text-[10px] text-white/40 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(f.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="flex gap-0.5 bg-black/20 p-1.5 rounded-lg border border-white/5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-3.5 h-3.5 ${star <= f.rating ? "text-amber-400 fill-amber-400" : "text-white/10 fill-white/5"}`}
                    />
                  ))}
                </div>
              </div>

              <div className="flex-1">
                <p className="font-mono text-xs text-white/70 whitespace-pre-wrap italic">
                  "{f.comments || "No comments provided."}"
                </p>
              </div>

              <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                <div>
                  <p className="font-mono text-xs text-white">{f.name || "Anonymous"}</p>
                  <p className="font-mono text-[10px] text-white/40">{f.email || "No email"}</p>
                </div>
                <button
                  onClick={() => deleteFeedback(f._id)}
                  className="p-2 rounded-lg text-red-400/50 hover:text-red-400 hover:bg-red-400/10 transition-colors"
                  title="Delete Feedback"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
