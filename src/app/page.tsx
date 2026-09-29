"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { ArrowRight, ShieldCheck, Users, CalendarCheck, Coins, RefreshCw } from "lucide-react";
import { NavHeader } from "@/components/common/nav-header";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, isLoading, router]);

  return (
    <div className="min-h-screen flex flex-col bg-canvas text-ink">
      <NavHeader />

      <main className="flex-1 flex flex-col justify-center items-center px-4 sm:px-6 py-12 max-w-4xl mx-auto text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary-tint border border-primary/20 text-xs font-semibold text-primary mb-6 animate-fade-in">
          <Coins className="w-3.5 h-3.5 text-primary" />
          <span>The Modern Nigerian Savings Circle</span>
        </div>

        {/* Heading */}
        <h1 className="font-heading text-4xl sm:text-6xl font-extrabold tracking-tight text-ink max-w-2xl leading-[1.1] mb-6">
          Save together, <br />
          <span className="text-primary">collect in turns.</span>
        </h1>

        {/* Subtitle */}
        <p className="text-base sm:text-lg text-muted max-w-xl mb-10 leading-relaxed">
          The digital home for your <strong>ajo</strong>, <strong>esusu</strong>, and <strong>adashe</strong> circles.
          Contribute monthly with trusted friends, take home the lump-sum pot on your designated turn, with zero interest and total transparency.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center gap-3.5 w-full max-w-xs sm:max-w-md justify-center mb-16">
          <Link href="/register" className="w-full sm:w-auto">
            <Button variant="primary" size="lg" className="w-full sm:w-auto gap-2">
              <span>Start an Ajo Circle</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
          <Link href="/login" className="w-full sm:w-auto">
            <Button variant="outline" size="lg" className="w-full sm:w-auto">
              Log into circle
            </Button>
          </Link>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full text-left">
          <div className="bg-surface dark:bg-[#171B22] border border-line dark:border-white/[0.08] rounded-[14px] p-5 shadow-subtle dark:shadow-card">
            <div className="w-10 h-10 rounded-xl bg-primary-tint text-primary dark:bg-indigo-500/15 dark:text-indigo-300 flex items-center justify-center mb-3">
              <Users className="w-5 h-5" />
            </div>
            <h2 className="font-heading font-semibold text-ink text-base mb-1">
              Trusted Circles
            </h2>
            <p className="text-xs sm:text-sm text-muted leading-relaxed">
              Create circles with vetted colleagues and friends. Keep track of member roles, assigned payout positions, and verified phones.
            </p>
          </div>

          <div className="bg-surface dark:bg-[#171B22] border border-line dark:border-white/[0.08] rounded-[14px] p-5 shadow-subtle dark:shadow-card">
            <div className="w-10 h-10 rounded-xl bg-accent-tint text-accent dark:bg-amber-400/15 dark:text-amber-300 flex items-center justify-center mb-3">
              <CalendarCheck className="w-5 h-5" />
            </div>
            <h2 className="font-heading font-semibold text-ink text-base mb-1">
              Guaranteed Rotations
            </h2>
            <p className="text-xs sm:text-sm text-muted leading-relaxed">
              Every month, one member collects the full pot. Automated cycle timelines show scheduled due dates and payout claims clearly.
            </p>
          </div>

          <div className="bg-surface dark:bg-[#171B22] border border-line dark:border-white/[0.08] rounded-[14px] p-5 shadow-subtle dark:shadow-card">
            <div className="w-10 h-10 rounded-xl bg-positive/10 text-positive dark:bg-green-400/15 dark:text-green-300 flex items-center justify-center mb-3">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h2 className="font-heading font-semibold text-ink text-base mb-1">
              Double-Pay Protection
            </h2>
            <p className="text-xs sm:text-sm text-muted leading-relaxed">
              Built-in idempotency guarantees no double contributions or repeat payouts, even over erratic connections.
            </p>
          </div>
        </div>
      </main>

      <footer className="border-t border-line py-6 text-center text-xs text-muted">
        <p>Ajo — Digital Rotating Savings & Credit Platform. Designed for Nigeria.</p>
      </footer>
    </div>
  );
}
