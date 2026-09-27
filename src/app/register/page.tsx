"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getErrorMessage } from "@/lib/api/errors";
import { Eye, EyeOff, AlertCircle } from "lucide-react";

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !phone.trim() || !password) {
      setErrorMsg("Please fill in your full name, phone number, and password.");
      return;
    }

    if (password.length < 8) {
      setErrorMsg("Password should be at least 8 characters long.");
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    try {
      await register({
        fullName: fullName.trim(),
        phone: phone.trim(),
        email: email.trim() ? email.trim() : null,
        password,
      });

      // Specification rule: "After registration, take them straight to the verification screen"
      router.push("/verify-phone");
    } catch (err) {
      setErrorMsg(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 py-8 bg-canvas">
      <div className="w-full max-w-md">
        {/* Brand header */}
        <div className="text-center mb-6">
          <Link href="/" className="inline-flex items-center gap-2 mb-3 touch-press">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white font-heading font-black text-xl shadow-sm">
              A
            </div>
            <span className="font-heading font-bold text-2xl tracking-tight text-ink">
              Ajo
            </span>
          </Link>
          <h1 className="font-heading text-2xl font-bold text-ink">Create an account</h1>
          <p className="text-sm text-muted mt-1">Join savings circles with people you trust</p>
        </div>

        <Card className="p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            {errorMsg && (
              <div className="p-3.5 rounded-[10px] bg-danger/10 border border-danger/20 flex items-start gap-2.5 text-xs sm:text-sm text-danger font-medium leading-snug animate-shake">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            <Input
              id="fullName"
              name="fullName"
              label="Full Name"
              placeholder="e.g. Amina Bello or Chukwuma Obi"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              autoComplete="name"
              required
            />

            <Input
              id="phone"
              name="phone"
              label="Phone Number"
              placeholder="e.g. 08012345678 or +234 801..."
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              autoComplete="tel"
              hint="Any Nigerian phone format is accepted"
              required
            />

            <Input
              id="email"
              name="email"
              type="email"
              label="Email Address (Optional)"
              placeholder="e.g. amina@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />

            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                label="Password"
                placeholder="At least 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-8 text-muted hover:text-ink transition-colors p-1"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <Button
              type="submit"
              variant="primary"
              fullWidth
              isLoading={isLoading}
              loadingText="Creating account..."
              className="mt-2"
            >
              Sign up for Ajo
            </Button>
          </form>

          <div className="mt-6 pt-5 border-t border-line text-center text-xs text-muted">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-primary hover:underline">
              Log in
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
