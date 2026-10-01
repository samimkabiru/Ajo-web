"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { Input } from "@/components/ui/input";
import { PhoneInput } from "@/components/ui/phone-input";
import { Button } from "@/components/ui/button";
import { getErrorMessage } from "@/lib/api/errors";
import { Eye, EyeOff, AlertCircle, Lock, User, Mail, ArrowRight, Users, Coins } from "lucide-react";
import { toast } from "sonner";

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !phone.trim() || !password || !confirmPassword) {
      setErrorMsg("Please fill in your full name, phone number, password, and confirm password.");
      return;
    }
    if (password.length < 8) {
      setErrorMsg("Password should be at least 8 characters long.");
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match. Please re-enter.");
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
      toast.success("Account created! Let's verify your phone number.");
      router.push("/verify-phone");
    } catch (err) {
      setErrorMsg(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-canvas dark:bg-[#0F1117]">
      {/* ── Left decorative panel ── */}
      <div className="hidden lg:flex lg:w-[42%] xl:w-[46%] relative flex-col justify-between p-10 bg-gradient-to-br from-indigo-600 via-indigo-700 to-[#312E81] overflow-hidden">
        {/* Grid texture */}
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.4) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        <div className="absolute -top-32 -left-32 w-80 h-80 rounded-full bg-indigo-400/20 blur-3xl pointer-events-none" />
        <div className="absolute bottom-20 right-10 w-60 h-60 rounded-full bg-amber-400/14 blur-3xl pointer-events-none" />

        {/* Brand */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-white/15 backdrop-blur border border-white/25 flex items-center justify-center font-heading font-black text-white text-base">
            A
          </div>
          <span className="font-heading font-extrabold text-white text-xl tracking-tight">Ajo</span>
        </div>

        {/* Features list */}
        <div className="relative z-10 space-y-6">
          <div>
            <p className="text-indigo-200 text-xs font-bold uppercase tracking-widest mb-3">
              Start saving smarter
            </p>
            <h2 className="font-heading font-extrabold text-white text-3xl xl:text-4xl leading-tight">
              Your circle.<br />Your turns.<br />Your money.
            </h2>
          </div>

          <div className="space-y-3">
            {[
              { icon: Users, text: "Invite trusted friends, family, or colleagues" },
              { icon: Coins, text: "Contribute monthly, collect a lump sum on your turn" },
              { icon: Mail,  text: "Phone-verified members, zero interest, full transparency" },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3 text-sm text-indigo-100">
                <div className="w-7 h-7 rounded-lg bg-white/12 flex items-center justify-center shrink-0">
                  <Icon className="w-3.5 h-3.5 text-white" />
                </div>
                <span>{text}</span>
              </div>
            ))}
          </div>
        </div>

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
              Create an account
            </h1>
            <p className="text-sm text-muted mt-1.5 leading-relaxed">
              Join savings circles with people you trust.
            </p>
          </div>

          {/* Form card */}
          <div className="bg-surface dark:bg-[#171B22] rounded-[16px] border border-[#E5E7EB] dark:border-white/[0.08] shadow-card p-6 sm:p-7 space-y-4">
            {errorMsg && (
              <div className="flex items-start gap-2.5 p-3.5 rounded-[10px] bg-red-50 dark:bg-rose-500/10 border border-red-200 dark:border-rose-400/28 text-xs text-red-700 dark:text-rose-300 font-medium leading-snug">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-500 dark:text-rose-400" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <Input
                id="fullName"
                name="fullName"
                label="Full Name"
                placeholder="e.g. Amina Bello"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                autoComplete="name"
                required
                leadingIcon={<User className="w-4 h-4" />}
              />

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
                id="email"
                name="email"
                type="email"
                label="Email Address"
                placeholder="Optional — for recovery"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                leadingIcon={<Mail className="w-4 h-4" />}
              />

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

              <Input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                label="Confirm Password"
                placeholder="Re-enter your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
                required
                leadingIcon={<Lock className="w-4 h-4" />}
                trailingSlot={
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="p-1 text-slate-400 hover:text-slate-600 dark:text-slate-400 dark:hover:text-slate-200 transition-colors rounded-md"
                    aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                }
              />

              <Button
                type="submit"
                variant="primary"
                fullWidth
                size="lg"
                isLoading={isLoading}
                loadingText="Creating account…"
                className="mt-1"
              >
                Sign up for Ajo
                <ArrowRight className="w-4 h-4" />
              </Button>
            </form>
          </div>

          <p className="mt-6 text-center text-xs text-muted">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-primary hover:text-primary-dark dark:hover:text-indigo-300 transition-colors">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
