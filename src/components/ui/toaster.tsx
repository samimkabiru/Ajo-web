"use client";

import React from "react";
import { Toaster as SonnerToaster, toast } from "sonner";
import { useTheme } from "next-themes";
import { Check, X, AlertTriangle, Info, Loader2 } from "lucide-react";

export function Toaster() {
  const { resolvedTheme } = useTheme();

  return (
    <SonnerToaster
      theme={(resolvedTheme as "light" | "dark" | "system") || "system"}
      position="bottom-right"
      gap={10}
      offset={18}
      duration={3400}
      icons={{
        success: (
          <div className="w-7 h-7 rounded-full bg-emerald-500/12 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/25 shadow-xs">
            <Check className="w-3.5 h-3.5 stroke-[2.75]" />
          </div>
        ),
        error: (
          <div className="w-7 h-7 rounded-full bg-rose-500/12 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0 border border-rose-500/25 shadow-xs">
            <X className="w-3.5 h-3.5 stroke-[2.75]" />
          </div>
        ),
        warning: (
          <div className="w-7 h-7 rounded-full bg-amber-500/12 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/25 shadow-xs">
            <AlertTriangle className="w-3.5 h-3.5 stroke-[2.5]" />
          </div>
        ),
        info: (
          <div className="w-7 h-7 rounded-full bg-indigo-500/12 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-500/25 shadow-xs">
            <Info className="w-3.5 h-3.5 stroke-[2.5]" />
          </div>
        ),
        loading: (
          <div className="w-7 h-7 rounded-full bg-primary/12 dark:bg-primary/20 text-primary flex items-center justify-center shrink-0 border border-primary/25">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          </div>
        ),
      }}
      toastOptions={{
        unstyled: false,
        className:
          "group !flex !items-center !gap-3 w-full max-w-[340px] sm:max-w-[360px] !p-3 sm:!py-3 sm:!px-3.5 !rounded-[22px] select-none transition-all duration-200 " +
          // White glassmorphic background in light mode:
          "!bg-white/85 text-ink !backdrop-blur-xl !border !border-white/70 !shadow-[0_12px_36px_rgba(0,0,0,0.08),0_2px_8px_rgba(0,0,0,0.03)] " +
          // Sleek glassmorphic background in dark mode:
          "dark:!bg-[#131722]/90 dark:text-[#EDF0F4] dark:!backdrop-blur-xl dark:!border-white/14 dark:!shadow-[0_16px_40px_rgba(0,0,0,0.65)]",
        classNames: {
          title: "text-xs sm:text-[13px] font-semibold tracking-tight text-ink dark:text-white leading-snug",
          description: "text-[11px] text-muted leading-relaxed mt-0.5",
          content: "flex flex-col justify-center min-w-0 flex-1",
          icon: "shrink-0 mr-0 self-center",
          actionButton:
            "rounded-full px-3 py-1 text-xs font-semibold bg-primary text-white hover:bg-primary-hover active:scale-95 transition-transform",
          cancelButton:
            "rounded-full px-2.5 py-1 text-xs font-medium text-muted hover:text-ink hover:bg-canvas transition-colors",
        },
      }}
    />
  );
}

export { toast };
