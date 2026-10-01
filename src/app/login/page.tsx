"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { Input } from "@/components/ui/input";
import { PhoneInput } from "@/components/ui/phone-input";
import { Button } from "@/components/ui/button";
import { ApiError, getErrorMessage } from "@/lib/api/errors";
import { Eye, EyeOff, AlertCircle, Lock, ArrowRight, ShieldCheck, Clock } from "lucide-react";
import { toast } from "sonner";

const RATE_LIMIT_STORAGE_KEY = "ajo_login_unblock_epoch";

function formatCountdown(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();

  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Rate-limiting unblock epoch timestamp (milliseconds since epoch)
  const [unblockEpochMs, setUnblockEpochMs] = useState<number | null>(null);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(0);

  // Restore unblock timestamp from sessionStorage on mount
  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(RATE_LIMIT_STORAGE_KEY);
      if (stored) {
        const epoch = parseInt(stored, 10);
        if (!isNaN(epoch) && epoch > Date.now()) {
          setUnblockEpochMs(epoch);
        } else {
          sessionStorage.removeItem(RATE_LIMIT_STORAGE_KEY);
        }
      }
    } catch {
      // Ignore sessionStorage restrictions (e.g. private mode)
    }
  }, []);

  // Live countdown timer ticking once a second
  useEffect(() => {
    if (!unblockEpochMs) {
      setSecondsRemaining(0);
      return;
    }

    const updateRemaining = () => {
      const now = Date.now();
      const diff = Math.max(0, Math.ceil((unblockEpochMs - now) / 1000));
      setSecondsRemaining(diff);
      if (diff <= 0) {
        setUnblockEpochMs(null);
        try {
          sessionStorage.removeItem(RATE_LIMIT_STORAGE_KEY);
        } catch {
          // Ignore
        }
      }
    };

    updateRemaining();
    const interval = setInterval(updateRemaining, 1000);
    return () => clearInterval(interval);
  }, [unblockEpochMs]);

  // Editing phone number immediately clears countdown because rate limits are per number
  const handlePhoneChange = (newVal: string) => {
    setPhone(newVal);
    if (unblockEpochMs) {
      setUnblockEpochMs(null);
      try {
        sessionStorage.removeItem(RATE_LIMIT_STORAGE_KEY);
      } catch {
        // Ignore
      }
    }
    if (errorMsg) setErrorMsg(null);
  };

  const isRateLimited = unblockEpochMs !== null && secondsRemaining > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isRateLimited) {
      return;
    }
    if (!phone.trim() || !password) {
      setErrorMsg("Please enter both your phone number and password.");
      return;
    }
    setIsLoading(true);
    setErrorMsg(null);
    try {
      await login(phone.trim(), password);
      toast.success("Welcome back to Ajo!");
      router.push("/dashboard");
    } catch (err) {
      if (err instanceof ApiError && err.status === 429) {
        // Distinguish 429 from 401 explicitly
        const retrySec =
          typeof err.retryAfterSeconds === "number" && err.retryAfterSeconds > 0
            ? err.retryAfterSeconds
            : 900;
        const unblockTime = Date.now() + retrySec * 1000;
        setUnblockEpochMs(unblockTime);
        try {
          sessionStorage.setItem(RATE_LIMIT_STORAGE_KEY, unblockTime.toString());
        } catch {
          // Ignore
        }
        setErrorMsg(null);
        toast.error("Too many failed attempts. Please wait before trying again.");
      } else {
        setErrorMsg(getErrorMessage(err));
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-canvas dark:bg-[#0F1117]">
      {/* ── Left decorative panel (hidden on mobile) ── */}
      <div className="hidden lg:flex lg:w-[42%] xl:w-[46%] relative flex-col justify-between p-10 bg-gradient-to-br from-indigo-600 via-indigo-700 to-[#312E81] overflow-hidden">
        {/* Grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.4) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        {/* Ambient orbs */}
        <div className="absolute -top-32 -left-32 w-80 h-80 rounded-full bg-indigo-400/20 blur-3xl pointer-events-none" />
        <div className="absolute bottom-20 right-10 w-60 h-60 rounded-full bg-amber-400/14 blur-3xl pointer-events-none" />

        {/* Brand */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-white/15 backdrop-blur border border-white/25 flex items-center justify-center font-heading font-black text-white text-base">
            A
          </div>
          <span className="font-heading font-extrabold text-white text-xl tracking-tight">Ajo</span>
        </div>

        {/* Hero copy */}
        <div className="relative z-10 space-y-5">
          <div>
            <p className="text-indigo-200 text-xs font-bold uppercase tracking-widest mb-3">
              Rotational Savings Platform
            </p>
            <h2 className="font-heading font-extrabold text-white text-3xl xl:text-4xl leading-tight">
              Save together,<br />collect in turns.
            </h2>
            <p className="mt-3 text-indigo-200 text-sm leading-relaxed max-w-xs">
              The digital home for your ajo, esusu, and adashe circles — transparent, zero-interest, and fully tracked.
            </p>
          </div>

          <div className="flex items-center gap-2 text-indigo-200 text-xs">
            <ShieldCheck className="w-4 h-4 text-indigo-300 shrink-0" />
            <span>Idempotency-protected. No double payments, ever.</span>
          </div>
        </div>

        {/* Bottom tagline */}
        <p className="relative z-10 text-indigo-300/60 text-[11px]">
          © {new Date().getFullYear()} Ajo — Designed for Nigeria.
        </p>
      </div>

      {/* ── Right: Form panel ── */}
      <div className="flex-1 flex flex-col justify-center items-center px-6 sm:px-10 py-12">
        {/* Mobile brand */}
        <div className="lg:hidden mb-8 text-center">
          <Link href="/" className="inline-flex items-center gap-2.5 touch-press">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center text-white font-heading font-black text-xl shadow-md">
              A
            </div>
            <span className="font-heading font-extrabold text-2xl tracking-tight text-ink">Ajo</span>
          </Link>
        </div>

        <div className="w-full max-w-[360px]">
          {/* Heading */}
          <div className="mb-6">
            <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-ink tracking-tight">
              Welcome back
            </h1>
            <p className="text-sm text-muted mt-1.5 leading-relaxed">
              Log in to view your circles and savings pot.
            </p>
          </div>

          {/* Form card */}
          <div className="bg-surface dark:bg-[#171B22] rounded-[16px] border border-[#E5E7EB] dark:border-white/[0.08] shadow-card p-6 sm:p-7 space-y-4">
            {/* Rate limit 429 banner */}
            {isRateLimited && (
              <div
                role="alert"
                className="p-3.5 rounded-[12px] bg-amber-500/10 border border-amber-500/25 dark:border-amber-400/30 text-amber-950 dark:text-amber-200 space-y-1.5 transition-all"
              >
                <div className="flex items-center gap-2 font-bold text-xs text-amber-950 dark:text-amber-100">
                  <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                  <span>Too many sign-in attempts</span>
                </div>
                <p className="text-xs leading-relaxed text-amber-900/90 dark:text-amber-200/90">
                  For your security, sign-in is paused for this number. Try again in{" "}
                  <strong className="font-semibold tabular-nums text-amber-950 dark:text-white">
                    {formatCountdown(secondsRemaining)}
                  </strong>{" "}
                  — or reset your password to sign in right away.
                </p>
              </div>
            )}

            {/* Standard error banner (401 etc) */}
            {!isRateLimited && errorMsg && (
              <div className="flex items-start gap-2.5 p-3.5 rounded-[10px] bg-red-50 dark:bg-rose-500/10 border border-red-200 dark:border-rose-400/28 text-xs text-red-700 dark:text-rose-300 font-medium leading-snug">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-500 dark:text-rose-400" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              {/* Phone */}
              <PhoneInput
                id="phone"
                name="phone"
                label="Phone Number"
                value={phone}
                onChange={handlePhoneChange}
                autoComplete="tel"
                required
              />

              {/* Password */}
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                label="Password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
                disabled={isRateLimited}
                leadingIcon={<Lock className="w-4 h-4" />}
                trailingSlot={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="p-1 text-slate-400 hover:text-slate-600 dark:text-slate-400 dark:hover:text-slate-200 transition-colors rounded-md"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                }
              />

              {/* Actions & Escape Hatch */}
              {isRateLimited ? (
                <div className="space-y-3 pt-1">
                  {/* Promoted primary action: Reset password escape hatch */}
                  <Link
                    href={
                      phone.trim()
                        ? `/forgot-password?phone=${encodeURIComponent(phone.trim())}`
                        : "/forgot-password"
                    }
                    className="block w-full"
                  >
                    <Button
                      type="button"
                      variant="primary"
                      fullWidth
                      size="lg"
                      className="gap-2 shadow-sm font-semibold"
                    >
                      <span>Reset password to sign in</span>
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>

                  {/* Disabled submit button with ticking countdown */}
                  <Button
                    type="button"
                    variant="outline"
                    fullWidth
                    size="lg"
                    disabled
                    className="tabular-nums opacity-60 cursor-not-allowed select-none"
                  >
                    <Clock className="w-4 h-4 mr-1.5 text-muted" />
                    <span>Try again in {formatCountdown(secondsRemaining)}</span>
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Forgot password */}
                  <div className="flex justify-end -mt-1">
                    <Link
                      href={
                        phone.trim()
                          ? `/forgot-password?phone=${encodeURIComponent(phone.trim())}`
                          : "/forgot-password"
                      }
                      className="text-xs font-semibold text-primary hover:text-primary-dark dark:hover:text-indigo-300 transition-colors"
                    >
                      Forgot password?
                    </Link>
                  </div>

                  {/* Submit */}
                  <Button
                    type="submit"
                    variant="primary"
                    fullWidth
                    size="lg"
                    isLoading={isLoading}
                    loadingText="Signing in…"
                  >
                    Log in to Ajo
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </form>
          </div>

          {/* Sign-up prompt */}
          <p className="mt-6 text-center text-xs text-muted">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="font-semibold text-primary hover:text-primary-dark dark:hover:text-indigo-300 transition-colors">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
