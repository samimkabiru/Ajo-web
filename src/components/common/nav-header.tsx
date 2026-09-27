"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { Users, LayoutDashboard, Mail, LogOut, ShieldCheck, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";

export function NavHeader() {
  const { user, logout, isPhoneVerified } = useAuth();
  const pathname = usePathname();

  if (!user) {
    return (
      <header className="sticky top-0 z-40 bg-surface/90 backdrop-blur-md border-b border-line px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group touch-press">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white font-heading font-black text-lg shadow-sm">
            A
          </div>
          <span className="font-heading font-bold text-xl tracking-tight text-ink">
            Ajo
          </span>
        </Link>

        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="text-sm font-semibold text-muted hover:text-ink px-3 py-2 rounded-lg transition-colors touch-press"
          >
            Log in
          </Link>
          <Link
            href="/register"
            className="text-sm font-semibold bg-primary text-white hover:bg-primary-dark px-4 py-2 rounded-[10px] transition-colors shadow-sm touch-press"
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
    <header className="sticky top-0 z-40 bg-surface/90 backdrop-blur-md border-b border-line">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="flex items-center gap-2 group touch-press">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white font-heading font-black text-lg shadow-sm">
              A
            </div>
            <span className="font-heading font-bold text-xl tracking-tight text-ink">
              Ajo
            </span>
          </Link>

          <nav className="hidden sm:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors touch-press",
                    isActive
                      ? "bg-primary-tint text-primary font-semibold"
                      : "text-muted hover:text-ink hover:bg-canvas"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/verify-phone"
            title={isPhoneVerified ? "Phone verified" : "Phone unverified"}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border touch-press transition-colors"
          >
            {isPhoneVerified ? (
              <span className="flex items-center gap-1 text-positive">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Verified</span>
              </span>
            ) : (
              <span className="flex items-center gap-1 text-warning bg-warning/10 px-2 py-0.5 rounded-full border border-warning/20">
                <ShieldAlert className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Unverified</span>
              </span>
            )}
          </Link>

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary-tint border border-primary/20 flex items-center justify-center text-xs font-bold text-primary">
              {user.fullName.charAt(0).toUpperCase()}
            </div>
            <button
              onClick={() => logout()}
              title="Log out"
              className="p-1.5 text-muted hover:text-danger rounded-lg transition-colors touch-press"
            >
              <LogOut className="w-4 h-4" />
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
    <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-surface/95 backdrop-blur-md border-t border-line px-4 py-2 flex items-center justify-around">
      {navLinks.map((link) => {
        const Icon = link.icon;
        const isActive = pathname.startsWith(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "flex flex-col items-center gap-1 py-1 px-3 rounded-lg text-xs font-medium transition-colors touch-press",
              isActive ? "text-primary font-bold" : "text-muted hover:text-ink"
            )}
          >
            <Icon className="w-5 h-5" />
            <span>{link.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
