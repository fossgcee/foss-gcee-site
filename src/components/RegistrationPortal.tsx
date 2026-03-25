"use client";

export default function RegistrationPortal() {
  return (
    <section className="min-h-screen pt-32 pb-24 px-4 sm:px-6 lg:px-8 bg-black flex items-center justify-center">
      <div className="max-w-2xl w-full backend-placeholder block rounded-2xl overflow-hidden glass-card relative h-full min-h-[420px] flex items-center justify-center p-8 border border-dashed border-white/20">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full mx-auto mb-6 flex items-center justify-center" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "rgba(255,255,255,0.6)" }}>
              <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
            </svg>
          </div>
          <h3 className="text-xl font-bold mb-3" style={{ color: "#ffffff" }}>
            Backend Integration Space
          </h3>
          <p className="text-sm max-w-[280px] mx-auto leading-relaxed font-mono" style={{ color: "rgba(255,255,255,0.4)" }}>
            // TODO: Backend team to insert the recruitment registration form or OAuth components here.
          </p>
        </div>
      </div>
    </section>
  );
}
