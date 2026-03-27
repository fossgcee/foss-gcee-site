import AdminSidebar from "@/components/AdminSidebar";

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen bg-[#080808]">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto p-8 relative">
        {/* Subtle decorative elements for admin */}
        <div className="absolute top-0 right-0 p-10 opacity-10 pointer-events-none">
          <div className="font-pixel text-[120px] leading-none">ROOT</div>
        </div>
        <div className="relative z-10 w-full max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
