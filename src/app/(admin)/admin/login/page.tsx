"use client";

import { useState } from "react";
import { ShieldCheck, Terminal, ArrowRight, Loader2 } from "lucide-react";
import { loginAction } from "./actions";

export default function AdminLogin() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const result = await loginAction(formData);

    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#080808] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Visual flare */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-pixel text-[200px] leading-none select-none">
          SECURE
        </div>
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="flex flex-col items-center gap-6 mb-12">
          <div className="w-20 h-20 rounded-3xl bg-white flex items-center justify-center shadow-[0_0_50px_rgba(255,255,255,0.15)] animate-pulse">
            <ShieldCheck className="w-10 h-10 text-black" />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-pixel text-white mb-2">ADMIN_PORTAL_AUTH</h1>
            <p className="font-mono text-[10px] text-white/40 tracking-widest uppercase">Verification Required for Root Access</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative group">
            <div className="absolute left-5 top-1/2 -translate-y-1/2 opacity-30 group-focus-within:opacity-100 transition-opacity">
              <Terminal className="w-5 h-5 text-white" />
            </div>
            <input
              name="password"
              type="password"
              placeholder="Enter cluster_access_key..."
              required
              autoFocus
              className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-5 pl-14 pr-6 font-mono text-sm text-white focus:outline-none focus:ring-2 ring-white/20 transition-all placeholder:text-white/20 hover:bg-white/[0.05]"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-14 bg-white text-black rounded-2xl font-pixel text-[11px] flex items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed group shadow-[0_0_20px_rgba(255,255,255,0.1)]"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                INITIALIZE_SESSION
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-center gap-3 animate-shake">
              <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
              <p className="font-mono text-[10px] text-red-500 uppercase tracking-wider font-bold">Error: Access Denied. Check credentials.</p>
            </div>
          )}
        </form>

        <p className="mt-12 text-center font-mono text-[9px] text-white/20 uppercase tracking-[0.2em]">
          Powered by FOSS Club GCE Erode – Terminal v1.0
        </p>
      </div>
    </div>
  );
}
