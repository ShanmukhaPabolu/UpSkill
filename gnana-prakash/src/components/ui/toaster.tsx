"use client";
import { useToast } from "@/lib/hooks/use-toast";
import { CheckCircle, AlertTriangle, Info, X } from "lucide-react";

export function Toaster() {
  const { toasts, dismiss } = useToast();

  return (
    <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`pointer-events-auto flex gap-3 p-4 rounded-xl border shadow-lg transition-all transform duration-300 animate-in slide-in-from-bottom-5 ${
            t.variant === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-950"
              : t.variant === "destructive"
              ? "bg-rose-50 border-rose-200 text-rose-950"
              : "bg-blue-50 border-blue-200 text-blue-950"
          }`}
        >
          {t.variant === "success" ? (
            <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          ) : t.variant === "destructive" ? (
            <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0" />
          ) : (
            <Info className="w-5 h-5 text-blue-600 flex-shrink-0" />
          )}
          <div className="flex-grow space-y-0.5">
            <p className="font-bold text-xs">{t.title}</p>
            {t.description && <p className="text-[11px] opacity-90 leading-relaxed">{t.description}</p>}
          </div>
          <button
            onClick={() => dismiss(t.id)}
            className="text-slate-400 hover:text-slate-600 self-start"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}
