"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import {
  Users,
  LayoutDashboard,
  Mail,
  LogOut,
  ShieldCheck,
  ShieldAlert,
  Coins,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";

export function NavHeader() {
  const { user, logout, isPhoneVerified } = useAuth();
  const pathname = usePathname();

  if (!user) {
    return (
      <header className="sticky top-0 z-40 bg-surface/85 backdrop-blur-xl border-b border-line/60 px-4 sm:px-8 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group touch-press">
          <div className="w-8 h-8 rounded-[10px] bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-white font-heading font-black text-base shadow-sm ring-1 ring-white/20">
            A
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-heading font-extrabold text-xl tracking-tight text-ink">
              Ajo
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-positive animate-pulse" />
          </div>
        </Link>

        <div className="flex items-center gap-2.5">
          <Link
            href="/login"
            className="text-xs sm:text-sm font-semibold text-muted hover:text-ink px-3 py-1.5 rounded-[8px] transition-colors touch-press"
          >
            Log in
          </Link>
          <Link
            href="/register"
            className="text-xs sm:text-sm font-semibold bg-primary text-white hover:bg-primary-dark px-3.5 py-1.5 rounded-[9px] transition-all shadow-xs touch-press"
          >
            Sign up
          </Link>
        </div>
      </header>
    );
  }

  const navLinks = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/groups", label: "Circles", icon: Users },
    { href: "/invites", label: "Invites", icon: Mail },
  ];

  return (
    <header className="sticky top-0 z-40 bg-surface/85 backdrop-blur-xl border-b border-line/60">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-6">
          {/* Jewel Brand Logo */}
          <Link href="/dashboard" className="flex items-center gap-2.5 group touch-press">
            <div className="w-8 h-8 rounded-[10px] bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-white font-heading font-black text-base shadow-sm ring-1 ring-white/20 group-hover:scale-[1.03] transition-transform">
              A
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-heading font-extrabold text-lg tracking-tight text-ink">
                Ajo
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-positive" title="Online" />
            </div>
          </Link>

          {/* Segmented Pill Navigation */}
          <nav className="hidden sm:flex items-center p-1 rounded-[10px] bg-canvas border border-line/60">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1 rounded-[7px] text-xs font-semibold transition-all duration-120 touch-press",
                    isActive
                      ? "bg-surface text-ink shadow-xs border border-line/40"
                      : "text-muted hover:text-ink hover:bg-surface/50"
                  )}
                >
                  <Icon
                    className={cn(
                      "w-3.5 h-3.5 transition-colors",
                      isActive ? "text-primary" : "text-muted"
                    )}
                  />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right Actions: Phone Status & Profile */}
        <div className="flex items-center gap-2.5">
          <Link
            href="/verify-phone"
            title={isPhoneVerified ? "Phone verified" : "Click to verify phone"}
            className={cn(
              "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all touch-press",
              isPhoneVerified
                ? "bg-positive-tint text-positive border border-positive/30 hover:bg-positive-tint/80"
                : "bg-warning-tint text-warning border border-warning/30 hover:bg-warning-tint/80 animate-pulse"
            )}
          >
            {isPhoneVerified ? (
              <>
                <ShieldCheck className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Verified</span>
              </>
            ) : (
              <>
                <ShieldAlert className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Verify Phone</span>
              </>
            )}
          </Link>

          {/* User Badge */}
          <div className="flex items-center gap-2 pl-1 border-l border-line/60">
            <div className="w-8 h-8 rounded-[9px] bg-gradient-to-br from-primary-tint to-primary/10 border border-primary/20 flex items-center justify-center text-xs font-heading font-bold text-primary shadow-xs">
              {user.fullName.charAt(0).toUpperCase()}
            </div>
            <span className="text-xs font-bold text-ink hidden md:inline truncate max-w-[120px]">
              {user.fullName.split(" ")[0]}
            </span>
            <button
              onClick={() => logout()}
              title="Log out"
              className="p-1.5 text-muted hover:text-danger rounded-[7px] hover:bg-canvas transition-colors touch-press"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

export function MobileBottomNav() {
  const { user } = useAuth();
  const pathname = usePathname();

  if (!user) return null;

  const navLinks = [
    { href: "/dashboard", label: "Home", icon: LayoutDashboard },
    { href: "/groups", label: "Circles", icon: Users },
    { href: "/invites", label: "Invites", icon: Mail },
  ];

  return (
    <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-surface/90 backdrop-blur-xl border-t border-line/60 px-4 py-1.5 flex items-center justify-around shadow-elevation">
      {navLinks.map((link) => {
        const Icon = link.icon;
        const isActive = pathname.startsWith(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "flex flex-col items-center gap-0.5 py-1 px-3 rounded-[9px] text-[11px] font-semibold transition-all touch-press",
              isActive
                ? "text-primary font-bold scale-[1.05]"
                : "text-muted hover:text-ink"
            )}
          >
            <Icon className="w-4 h-4" />
            <span>{link.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
