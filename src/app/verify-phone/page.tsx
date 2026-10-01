"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import {
  apiRequestPhoneVerification,
  apiConfirmPhoneVerification,
} from "@/lib/api/endpoints";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ApiError, getErrorMessage } from "@/lib/api/errors";
import { ShieldCheck, AlertCircle, RefreshCw, Info, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export default function VerifyPhonePage() {
  const { user, setUser, isAuthenticated } = useAuth();
  const router = useRouter();

  const [digits, setDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const [isLoading, setIsLoading] = useState(false);
  const [isRequestingCode, setIsRequestingCode] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [expiresAt, setExpiresAt] = useState<Date | null>(null);
  const [resendAvailableAt, setResendAvailableAt] = useState<Date | null>(null);
  const [secondsUntilResend, setSecondsUntilResend] = useState(0);
  const [secondsUntilExpiry, setSecondsUntilExpiry] = useState(0);

  const hasRequestedRef = useRef(false);

  const getStorageKey = (userId?: string) => `ajo_phone_code_session_${userId || "current"}`;

  // Automatically restore active session or request verification code on mount (run once)
  useEffect(() => {
    if (!isAuthenticated || !user || user.phoneVerified) return;

    const storageKey = getStorageKey(user.id);
    const saved = typeof window !== "undefined" ? sessionStorage.getItem(storageKey) : null;

    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const expTime = parsed.expiresAt ? new Date(parsed.expiresAt).getTime() : 0;
        const resendTime = parsed.resendAvailableAt ? new Date(parsed.resendAvailableAt).getTime() : 0;
        const now = Date.now();

        // If the code is still within its validity window or cooldown
        if (expTime > now || resendTime > now) {
          if (expTime > now) setExpiresAt(new Date(parsed.expiresAt));
          if (resendTime > now) setResendAvailableAt(new Date(parsed.resendAvailableAt));
          setSuccessMsg("Enter the 6-digit verification code sent to your phone.");
          hasRequestedRef.current = true;
          setTimeout(() => inputRefs.current[0]?.focus(), 100);
          return;
        }
      } catch {
        sessionStorage.removeItem(storageKey);
      }
    }

    if (!hasRequestedRef.current) {
      hasRequestedRef.current = true;
      handleRequestCode(false);
    }
  }, [isAuthenticated, user]);

  // Timers for expiry and resend countdowns
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      if (resendAvailableAt) {
        const diff = Math.max(0, Math.ceil((resendAvailableAt.getTime() - now) / 1000));
        setSecondsUntilResend(diff);
      }
      if (expiresAt) {
        const diff = Math.max(0, Math.ceil((expiresAt.getTime() - now) / 1000));
        setSecondsUntilExpiry(diff);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [resendAvailableAt, expiresAt]);

  const handleRequestCode = async (isManual = false) => {
    if (!user) return;
    setIsRequestingCode(true);
    if (isManual) {
      setErrorMsg(null);
    }

    const storageKey = getStorageKey(user.id);

    try {
      const res = await apiRequestPhoneVerification();
      const codeExpiresAt = res.expiresAt ? new Date(res.expiresAt) : new Date(Date.now() + 10 * 60 * 1000);
      const codeResendAt = res.resendAvailableAt
        ? new Date(res.resendAvailableAt)
        : new Date(Date.now() + 60 * 1000);

      setExpiresAt(codeExpiresAt);
      setResendAvailableAt(codeResendAt);
      setSuccessMsg("Verification code sent to your phone.");
      if (isManual) {
        toast.info("Verification code sent to your phone.");
      }

      // Persist timestamps in sessionStorage so reloading does not trigger another request
      if (typeof window !== "undefined") {
        sessionStorage.setItem(
          storageKey,
          JSON.stringify({
            expiresAt: codeExpiresAt.toISOString(),
            resendAvailableAt: codeResendAt.toISOString(),
            requestedAt: Date.now(),
          })
        );
      }

      // Focus first input
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        setErrorMsg("Your phone number is already verified.");
      } else if (err instanceof ApiError && err.status === 429) {
        // A code was sent moments ago, or hourly request rate limit hit
        const cooldownSecs = err.retryAfterSeconds && err.retryAfterSeconds > 0 ? err.retryAfterSeconds : 60;
        const codeResendAt = new Date(Date.now() + cooldownSecs * 1000);
        const codeExpiresAt = expiresAt || new Date(Date.now() + 10 * 60 * 1000);

        setResendAvailableAt(codeResendAt);
        if (!expiresAt) {
          setExpiresAt(codeExpiresAt);
        }

        // Persist cooldown so reloads don't spam 429s
        if (typeof window !== "undefined") {
          sessionStorage.setItem(
            storageKey,
            JSON.stringify({
              expiresAt: codeExpiresAt.toISOString(),
              resendAvailableAt: codeResendAt.toISOString(),
              requestedAt: Date.now(),
            })
          );
        }

        if (isManual) {
          setErrorMsg(
            err.detail || "Rate limit reached. Please wait before requesting another code."
          );
        } else {
          setSuccessMsg(
            "A verification code was already dispatched to your phone. Enter the 6 digits below to activate your account."
          );
        }
        setTimeout(() => inputRefs.current[0]?.focus(), 100);
      } else {
        setErrorMsg(getErrorMessage(err));
      }
    } finally {
      setIsRequestingCode(false);
    }
  };

  const handleDigitChange = (index: number, value: string) => {
    setErrorMsg(null);

    // Handle paste of complete 6-digit code
    if (value.length > 1) {
      const cleanDigits = value.replace(/\D/g, "").slice(0, 6).split("");
      const newDigits = [...digits];
      cleanDigits.forEach((d, i) => {
        newDigits[i] = d;
      });
      setDigits(newDigits);
      const nextIndex = Math.min(cleanDigits.length, 5);
      inputRefs.current[nextIndex]?.focus();

      if (cleanDigits.length === 6) {
        handleConfirmCode(newDigits.join(""));
      }
      return;
    }

    const digit = value.replace(/\D/g, "").slice(-1);
    const newDigits = [...digits];
    newDigits[index] = digit;
    setDigits(newDigits);

    // Auto-advance
    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all 6 digits entered
    if (digit && index === 5 && newDigits.every((d) => d !== "")) {
      handleConfirmCode(newDigits.join(""));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pastedData) return;

    const newDigits = [...digits];
    for (let i = 0; i < 6; i++) {
      newDigits[i] = pastedData[i] || "";
    }
    setDigits(newDigits);

    const focusIndex = Math.min(pastedData.length, 5);
    inputRefs.current[focusIndex]?.focus();

    if (pastedData.length === 6) {
      handleConfirmCode(newDigits.join(""));
    }
  };

  const handleConfirmCode = async (codeToSubmit?: string) => {
    const code = codeToSubmit || digits.join("");
    if (code.length !== 6) {
      setErrorMsg("Please enter all 6 digits of the verification code.");
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const updatedUser = await apiConfirmPhoneVerification(code);
      setUser(updatedUser);
      setSuccessMsg("Phone verified successfully!");
      toast.success("Phone verified successfully!");
      if (user && typeof window !== "undefined") {
        sessionStorage.removeItem(getStorageKey(user.id));
      }
      setTimeout(() => {
        router.push("/dashboard");
      }, 1200);
    } catch (err) {
      if (err instanceof ApiError && err.status === 410) {
        setErrorMsg("This verification code has expired. Please click 'Resend Code' to receive a new one.");
        setDigits(["", "", "", "", "", ""]);
        inputRefs.current[0]?.focus();
      } else if (err instanceof ApiError && err.status === 429) {
        setErrorMsg("Too many incorrect attempts. This code is now invalid; please request a new code.");
        setDigits(["", "", "", "", "", ""]);
      } else if (err instanceof ApiError && err.status === 404) {
        setErrorMsg("No active verification code found or it is no longer valid. Please request a new code.");
      } else {
        setErrorMsg(getErrorMessage(err));
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated && !user) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center px-4 py-8 bg-canvas dark:bg-[#0F1117]">
        <Card className="max-w-md p-6 text-center">
          <AlertCircle className="w-12 h-12 text-warning mx-auto mb-3" />
          <h2 className="font-heading text-lg font-bold text-ink mb-2">Login Required</h2>
          <p className="text-sm text-muted mb-4">Please log in to verify your phone number.</p>
          <Link href="/login">
            <Button variant="primary" fullWidth>Go to Login</Button>
          </Link>
        </Card>
      </div>
    );
  }

  if (user?.phoneVerified) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center px-4 py-8 bg-canvas dark:bg-[#0F1117]">
        <Card className="max-w-md p-8 text-center space-y-4">
          <div className="w-14 h-14 bg-positive/10 text-positive rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="font-heading text-2xl font-bold text-ink">Phone Already Verified</h2>
          <p className="text-sm text-muted">
            Your phone number <strong>{user.phone}</strong> is verified. You have full access to create and join circles.
          </p>
          <Link href="/dashboard" className="block pt-2">
            <Button variant="primary" fullWidth>Continue to Dashboard</Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 py-8 bg-canvas dark:bg-[#0F1117]">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-primary-tint text-primary dark:bg-indigo-500/15 dark:text-indigo-400 flex items-center justify-center mx-auto mb-3 shadow-xs">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h1 className="font-heading text-2xl font-bold text-ink">Verify your phone</h1>
          <p className="text-sm text-muted mt-1">
            We sent a 6-digit code to <strong className="text-ink">{user?.phone}</strong>
          </p>
        </div>

        <Card className="p-6 sm:p-8">
          {errorMsg && (
            <div className="p-3.5 mb-4 rounded-[10px] bg-danger/10 border border-danger/20 flex items-start gap-2.5 text-xs sm:text-sm text-danger font-medium leading-snug">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 mb-4 rounded-[10px] bg-positive/10 border border-positive/20 flex items-start gap-2.5 text-xs sm:text-sm text-positive font-medium leading-snug">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          <div className="p-3 mb-6 rounded-lg bg-canvas dark:bg-[#0C0F14] border border-line dark:border-white/10 text-xs text-muted flex items-start gap-2">
            <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
            <span>
              <strong>Development Notice:</strong> In dev mode, SMS is simulated. The 6-digit code is logged in the backend server output.
            </span>
          </div>

          {/* 6 Digit Inputs */}
          <div className="flex justify-between gap-2 sm:gap-3 mb-6">
            {digits.map((digit, idx) => (
              <input
                key={idx}
                ref={(el) => {
                  inputRefs.current[idx] = el;
                }}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={1}
                value={digit}
                onChange={(e) => handleDigitChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                onPaste={handlePaste}
                autoComplete="one-time-code"
                aria-label={`Digit ${idx + 1}`}
                className="w-11 h-13 sm:w-13 sm:h-15 text-center text-xl sm:text-2xl font-bold font-heading rounded-[10px] border border-line bg-surface text-ink dark:bg-[#0C0F14] dark:border-white/10 dark:text-white dark:shadow-[inset_0_2px_4px_rgba(0,0,0,0.50)] focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/25 dark:focus:border-indigo-400 dark:focus:ring-indigo-400/20 outline-none transition-all tabular-nums"
              />
            ))}
          </div>

          {/* Countdown & Expiry */}
          <div className="flex items-center justify-between text-xs text-muted tabular-nums mb-6 font-medium">
            <span>
              {secondsUntilExpiry > 0 ? (
                <>Code expires in: <strong>{Math.floor(secondsUntilExpiry / 60)}:{(secondsUntilExpiry % 60).toString().padStart(2, "0")}</strong></>
              ) : expiresAt ? (
                <span className="text-danger font-semibold">Code expired</span>
              ) : (
                "Waiting for code..."
              )}
            </span>

            <button
              type="button"
              onClick={() => handleRequestCode(true)}
              disabled={secondsUntilResend > 0 || isRequestingCode}
              className="text-primary hover:underline disabled:text-muted disabled:no-underline font-semibold touch-press inline-flex items-center gap-1"
            >
              {isRequestingCode ? (
                <RefreshCw className="w-3 h-3 animate-spin" />
              ) : null}
              {secondsUntilResend > 0
                ? secondsUntilResend >= 60
                  ? `Resend in ${Math.floor(secondsUntilResend / 60)}m ${(secondsUntilResend % 60).toString().padStart(2, "0")}s`
                  : `Resend in ${secondsUntilResend}s`
                : "Resend code"}
            </button>
          </div>

          <Button
            type="button"
            variant="primary"
            fullWidth
            onClick={() => handleConfirmCode()}
            disabled={digits.some((d) => !d) || isLoading}
            isLoading={isLoading}
            loadingText="Verifying..."
          >
            Confirm & Activate
          </Button>

          <div className="mt-5 text-center">
            <Link
              href="/dashboard"
              className="text-xs text-muted hover:text-ink transition-colors"
            >
              Skip for now & go to dashboard →
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
