import Sidebar from "@/components/layout/Sidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-[#000000]">
      <Sidebar />
      <main className="flex-1 ml-64 min-h-screen relative">
        {/* Ambient glows */}
        <div className="fixed top-[-20%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-primary/5 blur-[120px] pointer-events-none z-0" />
        <div className="fixed bottom-[-20%] left-[-10%] w-[40vw] h-[40vw] rounded-full bg-secondary/5 blur-[120px] pointer-events-none z-0" />
        <div className="relative z-10">
          {children}
        </div>
      </main>
    </div>
  );
}
