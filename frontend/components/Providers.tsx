"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, createContext, useContext, useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { useAuthStore } from "@/store/authStore";
import { ToastProvider } from "@/components/ui/Toast";

/* ─── React Query ─── */
function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        refetchOnWindowFocus: true,
        retry: 1,
        retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 10000),
      },
    },
  });
}

/* ─── Socket Context ─── */
const SocketCtx = createContext<Socket | null>(null);
export const useSocket = () => useContext(SocketCtx);

/* ─── Provider ─── */
export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(makeQueryClient);
  const socketRef = useRef<Socket | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    const url = process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") || "http://localhost:5000";
    const s = io(url, {
      transports: ["websocket", "polling"],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });
    socketRef.current = s;
    setSocket(s);

    s.on("connect", () => {
      if (user?.id) s.emit("auth", user.id);
    });

    // Real-time cache invalidation
    s.on("items:changed",         () => queryClient.invalidateQueries({ queryKey: ["items"] }));
    s.on("matches:changed",       () => queryClient.invalidateQueries({ queryKey: ["matches"] }));
    s.on("claims:changed",        () => queryClient.invalidateQueries({ queryKey: ["claims"] }));
    s.on("notifications:changed", () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notifications", "unread"] });
    });
    s.on("stats:changed",         () => queryClient.invalidateQueries({ queryKey: ["stats"] }));
    s.on("activity:changed",      () => queryClient.invalidateQueries({ queryKey: ["activity"] }));

    return () => { s.disconnect(); };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Re-auth on user change
  useEffect(() => {
    if (socket?.connected && user?.id) {
      socket.emit("auth", user.id);
    }
  }, [user?.id, socket]);

  return (
    <SocketCtx.Provider value={socket}>
      <QueryClientProvider client={queryClient}>
        <ToastProvider>
          {children}
        </ToastProvider>
      </QueryClientProvider>
    </SocketCtx.Provider>
  );
}
