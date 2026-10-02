"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { useAuth } from "@/context/auth-context";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { SimpleTooltip } from "@/components/ui/tooltip";
import { ThemeToggle } from "@/components/common/theme-toggle";
import {
  Users,
  LayoutDashboard,
  Mail,
  LogOut,
  ShieldCheck,
  ShieldAlert,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export function NavHeader() {
  const { user, logout, isPhoneVerified } = useAuth();
  const pathname = usePathname();
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  if (!user) {
    return (
      <header className="sticky top-0 z-40 bg-surface/85 backdrop-blur-xl border-b border-line/60 px-4 sm:px-8 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group touch-press">
          <div className="w-8 h-8 rounded-[10px] bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center text-white font-heading font-black text-base shadow-sm ring-1 ring-white/20">
            A
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-heading font-extrabold text-xl tracking-tight text-ink">
              Ajo
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-positive animate-pulse" />
          </div>
        </Link>

        <div className="flex items-center gap-2">
          <ThemeToggle />
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
    <>
      <header className="sticky top-0 z-40 bg-surface/90 dark:bg-[#171B22]/90 backdrop-blur-xl border-b border-line/60 dark:border-white/[0.07]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-6">
            {/* Jewel Brand Logo */}
            <Link href="/dashboard" className="flex items-center gap-2.5 group touch-press">
              <div className="w-8 h-8 rounded-[10px] bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center text-white font-heading font-black text-base shadow-sm ring-1 ring-white/20 group-hover:scale-[1.03] transition-transform">
                A
              </div>
              <div className="flex items-center gap-1.5">
                <span className="font-heading font-extrabold text-lg tracking-tight text-ink">
                  Ajo
                </span>
                <SimpleTooltip content="System Online">
                  <span className="w-1.5 h-1.5 rounded-full bg-positive cursor-default" />
                </SimpleTooltip>
              </div>
            </Link>

            {/* Segmented Sliding Pill Navigation */}
            <motion.nav
              layoutRoot
              className="hidden sm:flex items-center p-1 rounded-[10px] bg-canvas dark:bg-[#0F1117] border border-line/60 dark:border-white/10 relative"
            >
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive =
                  link.href === "/groups"
                    ? pathname.startsWith("/groups") || pathname.startsWith("/rounds")
                    : pathname.startsWith(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "relative flex items-center gap-1.5 px-3 py-1 rounded-[7px] text-xs font-semibold transition-colors duration-150 touch-press select-none",
                      isActive ? "text-ink font-bold" : "text-muted hover:text-ink"
                    )}
                  >
                    {isActive && (
                      <motion.span
                        layoutId="activeNavPill"
                        className="absolute inset-0 rounded-[7px] bg-surface dark:bg-[#1E2330] shadow-xs border border-[#E5E7EB] dark:border-indigo-400/20 z-0"
                        transition={{
                          type: "spring",
                          stiffness: 450,
                          damping: 35,
                          y: { duration: 0 },
                        }}
                      />
                    )}
                    <Icon
                      className={cn(
                        "w-3.5 h-3.5 relative z-10 transition-colors",
                        isActive ? "text-primary" : "text-muted"
                      )}
                    />
                    <span className="relative z-10">{link.label}</span>
                  </Link>
                );
              })}
            </motion.nav>
          </div>

          {/* Right Actions: Theme, Phone Status & Profile */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            <ThemeToggle />

            <SimpleTooltip content={isPhoneVerified ? "Phone verified and active" : "Verification required to create or join circles"}>
              <Link
                href="/verify-phone"
                className={cn(
                  "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all touch-press",
                  isPhoneVerified
                    ? "bg-positive/10 text-positive border border-positive/25 hover:bg-positive/15 dark:bg-emerald-400/15 dark:text-emerald-300 dark:border-emerald-400/35 dark:shadow-[0_0_10px_rgba(52,211,153,0.18)]"
                    : "bg-[#FAF7F2] text-[#92400E] border border-[#EBE1D0] hover:bg-amber-100/60 dark:bg-amber-400/15 dark:text-amber-300 dark:border-amber-400/35"
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
            </SimpleTooltip>

            {/* User Profile & Logout */}
            <div className="flex items-center gap-2 pl-1 border-l border-line/60">
              <div className="w-8 h-8 rounded-[9px] bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-500/20 dark:to-indigo-500/5 border border-indigo-200 dark:border-indigo-400/30 flex items-center justify-center text-xs font-heading font-bold text-primary shadow-xs">
                {user.fullName.charAt(0).toUpperCase()}
              </div>
              <span className="text-xs font-bold text-ink hidden md:inline truncate max-w-[120px]">
                {user.fullName.split(" ")[0]}
              </span>
              <SimpleTooltip content="Sign out of Ajo">
                <button
                  type="button"
                  onClick={() => setIsLogoutModalOpen(true)}
                  className="p-1.5 text-muted hover:text-danger rounded-[7px] hover:bg-canvas transition-colors touch-press"
                  aria-label="Sign out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </SimpleTooltip>
            </div>
          </div>
        </div>
      </header>

      {/* Logout Confirmation Modal */}
      <Modal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        title="Sign out of Ajo"
        description="Are you sure you want to sign out of your account on this device?"
      >
        <div className="space-y-4 pt-2">
          <p className="text-xs sm:text-sm text-muted leading-relaxed">
            You will need your phone number and password to log back into your active savings circles, turns, and cycle contributions.
          </p>
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-line/60">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsLogoutModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="danger"
              size="sm"
              onClick={async () => {
                setIsLogoutModalOpen(false);
                await logout();
                toast.info("You have been signed out.");
              }}
            >
              <LogOut className="w-3.5 h-3.5 mr-1.5" />
              Sign Out
            </Button>
          </div>
        </div>
      </Modal>
    </>
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
    <motion.nav
      layoutRoot
      className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-surface/90 dark:bg-[#171B22]/92 backdrop-blur-xl border-t border-line/60 dark:border-white/[0.07] px-4 py-1.5 flex items-center justify-around shadow-elevation"
    >
      {navLinks.map((link) => {
        const Icon = link.icon;
        const isActive =
          link.href === "/groups"
            ? pathname.startsWith("/groups") || pathname.startsWith("/rounds")
            : pathname.startsWith(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "relative flex flex-col items-center gap-0.5 py-1 px-4 rounded-[9px] text-[11px] font-semibold transition-all touch-press",
              isActive ? "text-primary font-bold" : "text-muted hover:text-ink"
            )}
          >
            {isActive && (
              <motion.span
                layoutId="mobileNavPill"
                className="absolute inset-0 rounded-[9px] bg-indigo-50 dark:bg-indigo-500/12 z-0"
                transition={{
                  type: "spring",
                  stiffness: 450,
                  damping: 35,
                  y: { duration: 0 },
                }}
              />
            )}
            <Icon className="w-4 h-4 relative z-10" />
            <span className="relative z-10">{link.label}</span>
          </Link>
        );
      })}
    </motion.nav>
  );
}
