"use client";

import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  maxWidth?: string;
}

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  maxWidth = "max-w-lg",
}: ModalProps) {
  // Prevent background scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={onClose}
            className="fixed inset-0 bg-ink/35 dark:bg-black/75 backdrop-blur-sm"
          />

          {/* Modal Card / Bottom Sheet on mobile */}
          <motion.div
            initial={{ y: "100%", opacity: 0.9 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 30, stiffness: 350, duration: 0.22 }}
            className={cn(
              "relative w-full rounded-t-[20px] sm:rounded-[16px] bg-surface p-6 shadow-elevation border border-[#E5E7EB] z-10 max-h-[90vh] overflow-y-auto",
              "dark:bg-[#1E2330] dark:border-white/12 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.07),0_24px_64px_-12px_rgba(0,0,0,0.82),0_0_28px_rgba(129,140,248,0.09)]",
              maxWidth
            )}
          >
            {/* Mobile drag handle */}
            <div className="sm:hidden w-12 h-1.5 bg-line dark:bg-white/20 rounded-full mx-auto mb-4" />

            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-heading text-lg sm:text-xl font-bold text-ink">
                  {title}
                </h3>
                {description && (
                  <p className="text-xs sm:text-sm text-muted mt-1">{description}</p>
                )}
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-lg text-muted hover:text-ink hover:bg-canvas dark:hover:bg-white/10 transition-colors touch-press"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
