"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { NavHeader, MobileBottomNav } from "./nav-header";
import { VerificationBanner } from "./verification-banner";

const AUTHENTICATED_PREFIXES = ["/dashboard", "/groups", "/rounds", "/invites"];

interface AppNavigationShellProps {
  children: React.ReactNode;
}

export function AppNavigationShell({ children }: AppNavigationShellProps) {
  const pathname = usePathname();

  const isAppRoute = AUTHENTICATED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(prefix + "/")
  );

  if (!isAppRoute) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-canvas flex flex-col pb-16 sm:pb-8">
      <NavHeader />
      <VerificationBanner />
      <div className="flex-1 flex flex-col">
        {children}
      </div>
      <MobileBottomNav />
    </div>
  );
}
