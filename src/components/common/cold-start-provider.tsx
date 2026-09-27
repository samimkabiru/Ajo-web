"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Server, RefreshCw, Sparkles } from "lucide-react";

interface ColdStartContextType {
  isWaking: boolean;
  isBackendReady: boolean;
  checkBackendHealth: () => Promise<boolean>;
}

const ColdStartContext = createContext<ColdStartContextType>({
  isWaking: false,
  isBackendReady: true,
  checkBackendHealth: async () => true,
});

export function ColdStartProvider({ children }: { children: React.ReactNode }) {
  const [isWaking, setIsWaking] = useState(false);
  const [isBackendReady, setIsBackendReady] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const checkBackendHealth = async (): Promise<boolean> => {
    try {
      const res = await fetch("/api-proxy/actuator/health", {
        headers: { Accept: "application/json" },
      });
      if (res.ok) {
        setIsBackendReady(true);
        setIsWaking(false);
        return true;
      }
    } catch {
      // Backend may be waking
    }
    return false;
  };

  useEffect(() => {
    let timer3s: NodeJS.Timeout | null = null;
    let elapsedInterval: NodeJS.Timeout | null = null;
    let isMounted = true;

    // Start 3 second timer
    timer3s = setTimeout(() => {
      if (isMounted && !isBackendReady) {
        setIsWaking(true);
      }
    }, 3000);

    // Warm-up ping immediately
    const pollHealth = async () => {
      const ok = await checkBackendHealth();
      if (!ok && isMounted) {
        // Poll every 4 seconds until awake
        const pollInterval = setInterval(async () => {
          if (!isMounted) {
            clearInterval(pollInterval);
            return;
          }
          const ready = await checkBackendHealth();
          if (ready) {
            clearInterval(pollInterval);
          }
        }, 4000);
      }
    };

    pollHealth();

    return () => {
      isMounted = false;
      if (timer3s) clearTimeout(timer3s);
      if (elapsedInterval) clearInterval(elapsedInterval);
    };
  }, []);

  // Elapsed timer when waking
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isWaking) {
      interval = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      setElapsedSeconds(0);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isWaking]);

  return (
    <ColdStartContext.Provider
      value={{
        isWaking,
        isBackendReady,
        checkBackendHealth,
      }}
    >
      {children}

      <AnimatePresence>
        {isWaking && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-canvas/95 backdrop-blur-md p-6"
          >
            <div className="w-full max-w-md bg-surface border border-line rounded-2xl p-8 shadow-elevation text-center">
              <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-primary-tint flex items-center justify-center text-primary relative">
                <Server className="w-8 h-8" />
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
                  className="absolute -top-1 -right-1 text-accent"
                >
                  <Sparkles className="w-5 h-5 fill-accent" />
                </motion.div>
              </div>

              <h2 className="text-2xl font-bold font-heading text-ink mb-2">
                Waking up the server
              </h2>
              <p className="text-sm text-muted leading-relaxed mb-6">
                The Ajo backend is waking up from idle mode. Cold starts typically take 30–60
                seconds. Your savings data is completely safe and we’ll connect you automatically
                the moment it responds.
              </p>

              {/* Progress indication */}
              <div className="w-full bg-line/60 rounded-full h-2 mb-3 overflow-hidden">
                <motion.div
                  className="bg-primary h-full rounded-full"
                  initial={{ width: "5%" }}
                  animate={{ width: `${Math.min(95, 5 + elapsedSeconds * 2)}%` }}
                  transition={{ ease: "linear", duration: 0.5 }}
                />
              </div>

              <div className="flex items-center justify-between text-xs text-muted tabular-nums mb-6 font-medium">
                <span>Connecting to cloud instance...</span>
                <span>{elapsedSeconds}s elapsed</span>
              </div>

              <button
                type="button"
                onClick={() => checkBackendHealth()}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg border border-line text-sm font-medium text-ink hover:bg-canvas transition-colors touch-press"
              >
                <RefreshCw className="w-4 h-4 animate-spin text-muted" />
                Retry connection
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </ColdStartContext.Provider>
  );
}

export function useColdStart() {
  return useContext(ColdStartContext);
}
