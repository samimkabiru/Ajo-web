"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { apiConfirmPasswordReset } from "@/lib/api/endpoints";
import { Input } from "@/components/ui/input";
import { PhoneInput } from "@/components/ui/phone-input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getErrorMessage } from "@/lib/api/errors";
import { Lock, Eye, EyeOff, AlertCircle, CheckCircle2 } from "lucide-react";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialPhone = searchParams.get("phone") || "";

  const [phone, setPhone] = useState(initialPhone);
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim() || !code.trim() || !newPassword) {
      setErrorMsg("Please fill in your phone number, the 6-digit code, and your new password.");
      return;
    }

    if (newPassword.length < 8) {
      setErrorMsg("New password must be at least 8 characters long.");
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    try {
      await apiConfirmPasswordReset({
        phone: phone.trim(),
        code: code.trim(),
        newPassword,
      });

      setSuccess(true);
      // Specification rule: "After a successful reset every session is revoked, so send the user to login."
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (err) {
      setErrorMsg(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <Card className="p-8 text-center space-y-4">
        <div className="w-14 h-14 bg-positive/10 text-positive rounded-full flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h2 className="font-heading text-xl font-bold text-ink">Password Reset Complete</h2>
        <p className="text-sm text-muted">
          Your password has been changed successfully. Redirecting you to log in with your new credentials...
        </p>
        <Link href="/login" className="block pt-2">
          <Button variant="primary" fullWidth>Go to Login</Button>
        </Link>
      </Card>
    );
  }

  return (
    <Card className="p-6 sm:p-7">
      <form onSubmit={handleSubmit} className="space-y-4">
        {errorMsg && (
          <div className="p-3.5 rounded-[10px] bg-danger/10 border border-danger/20 flex items-start gap-2.5 text-xs text-danger font-medium leading-snug">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        <PhoneInput
          id="phone"
          name="phone"
          label="Phone Number"
          value={phone}
          onChange={setPhone}
          autoComplete="tel"
          required
        />

        <Input
          id="code"
          name="code"
          label="6-Digit Reset Code"
          placeholder="123456"
          maxLength={6}
          inputMode="numeric"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          autoComplete="one-time-code"
          required
        />

        <Input
          id="newPassword"
          name="newPassword"
          type={showPassword ? "text" : "password"}
          label="New Password"
          placeholder="At least 8 characters"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          autoComplete="new-password"
          required
          leadingIcon={<Lock className="w-4 h-4" />}
          trailingSlot={
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="p-1 text-muted hover:text-ink dark:hover:text-white/80 transition-colors"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          }
        />

        <Button
          type="submit"
          variant="primary"
          fullWidth
          isLoading={isLoading}
          loadingText="Resetting password..."
          className="mt-2"
        >
          Confirm New Password
        </Button>
      </form>

      <div className="mt-6 pt-5 border-t border-line text-center">
        <Link
          href="/login"
          className="text-xs font-semibold text-muted hover:text-ink transition-colors"
        >
          Remember your password? Log in
        </Link>
      </div>
    </Card>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 py-8 bg-canvas dark:bg-[#0F1117]">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-primary-tint text-primary dark:bg-indigo-500/15 dark:text-indigo-400 flex items-center justify-center mx-auto mb-3 shadow-xs">
            <Lock className="w-6 h-6" />
          </div>
          <h1 className="font-heading text-2xl font-bold text-ink tracking-tight">Reset password</h1>
          <p className="text-xs sm:text-sm text-muted mt-1">Enter the 6-digit code and your new password</p>
        </div>

        <Suspense fallback={<Card className="p-8 text-center text-sm text-muted">Loading...</Card>}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
