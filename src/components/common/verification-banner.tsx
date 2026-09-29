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
    <div className="bg-warning/8 dark:bg-amber-500/10 border-b border-warning/20 dark:border-amber-500/25 px-4 py-2.5 text-xs sm:text-sm text-ink flex items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        <AlertCircle className="w-4 h-4 text-warning shrink-0" />
        <span className="text-muted">
          Your phone number is not verified yet. Verification is required to create or join circles.
        </span>
      </div>
      <Link
        href="/verify-phone"
        className="inline-flex items-center gap-1 font-semibold text-warning hover:underline shrink-0 touch-press"
      >
        <span>Verify now</span>
        <ArrowRight className="w-3.5 h-3.5" />
      </Link>
    </div>
  );
}
