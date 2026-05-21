import Sidebar from "@/components/layout/Sidebar";
import VideoBackground from "@/components/VideoBackground";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen" style={{ background: "transparent", position: "relative" }}>
      {/* Fullscreen video background — fixed, behind everything */}
      <VideoBackground />

      {/* Sidebar — stays above video */}
      <Sidebar />

      {/* Main content — stays above video */}
      <main className="flex-1 ml-64 min-h-screen relative" style={{ zIndex: 10 }}>
        <div className="relative z-10">
          {children}
        </div>
      </main>
    </div>
  );
}
