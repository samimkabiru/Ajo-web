"use client";

import React, { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Sun, Moon, Laptop } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface ThemeToggleProps {
  className?: string;
}

/**
 * Animated icon morph button for navigation headers and compact toolbars.
 * Smoothly rotates and scales between Sun and Moon with Framer Motion spring physics.
 */
export function ThemeToggle({ className }: ThemeToggleProps) {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div
        className={cn(
          "w-8 h-8 rounded-[8px] bg-canvas border border-line/50",
          className
        )}
      />
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      aria-label="Toggle theme mode"
      className={cn(
        "relative w-8 h-8 rounded-[8px] flex items-center justify-center text-muted hover:text-ink hover:bg-canvas transition-colors touch-press select-none border border-transparent hover:border-line/60",
        className
      )}
    >
      <AnimatePresence mode="wait" initial={false}>
        {isDark ? (
          <motion.div
            key="moon"
            initial={{ opacity: 0, rotate: -90, scale: 0.6 }}
            animate={{ opacity: 1, rotate: 0, scale: 1 }}
            exit={{ opacity: 0, rotate: 90, scale: 0.6 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="flex items-center justify-center text-accent"
          >
            <Moon className="w-4 h-4 fill-accent/15" />
          </motion.div>
        ) : (
          <motion.div
            key="sun"
            initial={{ opacity: 0, rotate: 90, scale: 0.6 }}
            animate={{ opacity: 1, rotate: 0, scale: 1 }}
            exit={{ opacity: 0, rotate: -90, scale: 0.6 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="flex items-center justify-center text-muted hover:text-ink"
          >
            <Sun className="w-4 h-4" />
          </motion.div>
        )}
      </AnimatePresence>
    </button>
  );
}

/**
 * Segmented 3-state or 2-state pill toggle with smooth Framer Motion spring sliding pill.
 */
export function ThemeSegmentedToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className={cn("h-8 w-28 rounded-[9px] bg-canvas border border-line/60", className)} />
    );
  }

  const options = [
    { value: "light", label: "Light", icon: Sun },
    { value: "dark", label: "Dark", icon: Moon },
    { value: "system", label: "System", icon: Laptop },
  ] as const;

  return (
    <div
      role="group"
      aria-label="Theme selection"
      className={cn(
        "relative inline-flex items-center p-1 rounded-[10px] bg-canvas border border-line/70 select-none shadow-xs",
        className
      )}
    >
      {options.map((opt) => {
        const Icon = opt.icon;
        const isActive = theme === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => setTheme(opt.value)}
            className={cn(
              "relative flex items-center justify-center gap-1.5 px-2.5 py-1 rounded-[7px] text-xs font-semibold transition-colors duration-150 touch-press",
              isActive ? "text-ink font-bold" : "text-muted hover:text-ink"
            )}
            title={`${opt.label} theme`}
            aria-pressed={isActive}
          >
            {isActive && (
              <motion.span
                layoutId="activeThemeSegmentPill"
                className="absolute inset-0 rounded-[7px] bg-surface shadow-xs border border-line/60 z-0"
                transition={{ type: "spring", stiffness: 450, damping: 35 }}
              />
            )}
            <Icon className="w-3.5 h-3.5 relative z-10" />
            <span className="relative z-10 hidden sm:inline text-[11px]">{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}
