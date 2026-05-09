import Sidebar from "@/components/layout/Sidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-[#000000]">
      <Sidebar isAdmin />
      <main className="flex-1 ml-64 min-h-screen relative">
        <div className="fixed inset-0 pointer-events-none z-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(237,177,255,0.05),_transparent_50%)]" />
        <div className="relative z-10">{children}</div>
      </main>
    </div>
  );
}
