import AdminSidebar from "@/components/AdminSidebar";

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen bg-[#080808]">
      <AdminSidebar />
      {/*
        On mobile: pt-14 accounts for the fixed top nav bar (h-14).
        On desktop: p-8 as before, sidebar is sticky so no offset needed.
      */}
      <main className="flex-1 overflow-y-auto pt-14 lg:pt-0 px-4 py-5 sm:px-6 sm:py-6 lg:p-8 relative min-w-0">
        {/* Subtle decorative watermark — hidden on small screens to save space */}
        <div className="hidden xl:block absolute top-0 right-0 p-10 opacity-10 pointer-events-none select-none">
          <div className="font-pixel text-[120px] leading-none">ROOT</div>
        </div>
        <div className="relative z-10 w-full max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
