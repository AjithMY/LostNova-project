"use client";
import { createContext, useContext, useState, useCallback, useEffect } from "react";

type ToastType = "success" | "error" | "info" | "warning";

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
}

interface ToastCtxType {
  toast: (type: ToastType, title: string, message?: string) => void;
  success: (title: string, message?: string) => void;
  error:   (title: string, message?: string) => void;
  info:    (title: string, message?: string) => void;
  warning: (title: string, message?: string) => void;
}

const ToastCtx = createContext<ToastCtxType | null>(null);
export const useToast = () => useContext(ToastCtx)!;

const ICONS: Record<ToastType, string> = {
  success: "check_circle",
  error:   "error",
  info:    "info",
  warning: "warning",
};

const COLORS: Record<ToastType, { border: string; icon: string; bg: string }> = {
  success: { border: "border-[#a5e7ff]/40", icon: "text-[#a5e7ff]", bg: "bg-[#a5e7ff]/10" },
  error:   { border: "border-[#ffb4ab]/40", icon: "text-[#ffb4ab]", bg: "bg-[#ffb4ab]/10" },
  info:    { border: "border-[#edb1ff]/40", icon: "text-[#edb1ff]", bg: "bg-[#edb1ff]/10" },
  warning: { border: "border-[#ffd700]/40", icon: "text-[#ffd700]", bg: "bg-[#ffd700]/10" },
};

function ToastItem({ t, onDismiss }: { t: Toast; onDismiss: () => void }) {
  const c = COLORS[t.type];
  useEffect(() => {
    const timer = setTimeout(onDismiss, 4500);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <div
      className={`flex items-start gap-3 p-4 rounded-2xl glass-panel border ${c.border} shadow-xl min-w-[280px] max-w-[360px] animate-fade-in-up`}
      style={{ animationDuration: "0.3s" }}
    >
      <div className={`shrink-0 w-9 h-9 rounded-xl flex items-center justify-center ${c.bg} border ${c.border}`}>
        <span className={`material-symbols-outlined icon-fill text-lg ${c.icon}`}>{ICONS[t.type]}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-[#e2e2e2] text-sm leading-tight">{t.title}</p>
        {t.message && <p className="text-[#859399] text-xs mt-0.5 leading-relaxed">{t.message}</p>}
      </div>
      <button
        onClick={onDismiss}
        className="shrink-0 text-[#859399] hover:text-[#e2e2e2] transition-colors"
      >
        <span className="material-symbols-outlined text-base">close</span>
      </button>
    </div>
  );
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const toast = useCallback((type: ToastType, title: string, message?: string) => {
    const id = Math.random().toString(36).slice(2);
    setToasts(prev => [...prev.slice(-4), { id, type, title, message }]);
  }, []);

  const ctx: ToastCtxType = {
    toast,
    success: (title, msg) => toast("success", title, msg),
    error:   (title, msg) => toast("error",   title, msg),
    info:    (title, msg) => toast("info",    title, msg),
    warning: (title, msg) => toast("warning", title, msg),
  };

  return (
    <ToastCtx.Provider value={ctx}>
      {children}
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none">
        {toasts.map(t => (
          <div key={t.id} className="pointer-events-auto">
            <ToastItem t={t} onDismiss={() => dismiss(t.id)} />
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}
