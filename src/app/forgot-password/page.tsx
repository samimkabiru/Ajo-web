"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiRequestPasswordReset } from "@/lib/api/endpoints";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getErrorMessage } from "@/lib/api/errors";
import { KeyRound, AlertCircle, ArrowLeft } from "lucide-react";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [noticeMsg, setNoticeMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim()) {
      setErrorMsg("Please enter your registered phone number.");
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    try {
      await apiRequestPasswordReset(phone.trim());
      // Specification rule: deliberate anti-enumeration wording
      setNoticeMsg("If an account exists for that number, a code is on its way.");
      setTimeout(() => {
        router.push(`/reset-password?phone=${encodeURIComponent(phone.trim())}`);
      }, 2000);
    } catch (err) {
      setErrorMsg(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 py-8 bg-canvas">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-primary-tint text-primary flex items-center justify-center mx-auto mb-3">
            <KeyRound className="w-6 h-6" />
          </div>
          <h1 className="font-heading text-2xl font-bold text-ink">Forgot password</h1>
          <p className="text-sm text-muted mt-1">Enter your phone number to receive a reset code</p>
        </div>

        <Card className="p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            {errorMsg && (
              <div className="p-3.5 rounded-[10px] bg-danger/10 border border-danger/20 flex items-start gap-2.5 text-xs sm:text-sm text-danger font-medium leading-snug">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            {noticeMsg && (
              <div className="p-3.5 rounded-[10px] bg-primary-tint border border-primary/20 flex items-start gap-2.5 text-xs sm:text-sm text-primary font-medium leading-snug">
                <span>{noticeMsg}</span>
              </div>
            )}

            <Input
              id="phone"
              name="phone"
              label="Registered Phone Number"
              placeholder="e.g. 08012345678"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              autoComplete="tel"
              required
            />

            <Button
              type="submit"
              variant="primary"
              fullWidth
              isLoading={isLoading}
              loadingText="Checking number..."
              className="mt-2"
            >
              Request Reset Code
            </Button>
          </form>

          <div className="mt-6 pt-5 border-t border-line text-center">
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted hover:text-ink transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to log in</span>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
