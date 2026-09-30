"use client";

import React from "react";
import Link from "next/link";
import { AlertCircle, ArrowRight } from "lucide-react";
import { useAuth } from "@/context/auth-context";

export function VerificationBanner() {
  const { user, isPhoneVerified } = useAuth();

  if (!user || isPhoneVerified) {
    return null;
  }

  return (
    <div className="bg-[#FAF8F5] dark:bg-[#161A24] border-b border-[#EFE7DA] dark:border-white/10 px-4 py-2 text-xs sm:text-sm text-ink flex items-center justify-between gap-3">
      <div className="flex items-center gap-2.5">
        <div className="w-5 h-5 rounded-md bg-amber-500/10 text-amber-700 dark:text-amber-400 flex items-center justify-center shrink-0">
          <AlertCircle className="w-3.5 h-3.5" />
        </div>
        <span className="text-muted leading-tight">
          Your phone number is not verified yet. Verification is required to create or join circles.
        </span>
      </div>
      <Link
        href="/verify-phone"
        className="inline-flex items-center gap-1 font-semibold text-amber-800 dark:text-amber-300 hover:text-amber-900 dark:hover:text-amber-200 hover:underline shrink-0 whitespace-nowrap touch-press"
      >
        <span>Verify now</span>
        <ArrowRight className="w-3.5 h-3.5" />
      </Link>
    </div>
  );
}
