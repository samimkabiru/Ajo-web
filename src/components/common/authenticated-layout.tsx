"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { NavHeader, MobileBottomNav } from "./nav-header";
import { VerificationBanner } from "./verification-banner";
import { CardSkeleton } from "@/components/ui/skeleton";

import { PageTransition } from "./page-transition";

export function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-canvas flex flex-col">
        <NavHeader />
        <main className="max-w-4xl mx-auto px-4 py-8 w-full space-y-4">
          <CardSkeleton />
          <CardSkeleton />
        </main>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-canvas flex flex-col pb-16 sm:pb-8">
      <NavHeader />
      <VerificationBanner />
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <PageTransition>{children}</PageTransition>
      </main>
      <MobileBottomNav />
    </div>
  );
}
