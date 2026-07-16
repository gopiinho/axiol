"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Loader2, CheckCircle2, Lock, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FadeIn } from "@/components/motion/FadeIn";
import { cn } from "@/lib/utils";

const OTP_LENGTH = 6;

export default function ResetPasswordPage({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  const email = (searchParams?.email as string) || "";
  const router = useRouter();

  const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const inputsRef = useRef<(HTMLInputElement | null)[]>(Array(OTP_LENGTH).fill(null));

  const otp = digits.join("");

  useEffect(() => {
    if (!email) {
      router.replace("/forgot-password");
    }
  }, [email, router]);

  useEffect(() => {
    if (confirmPassword && password !== confirmPassword) {
      setPasswordError("Passwords do not match");
    } else {
      setPasswordError("");
    }
  }, [password, confirmPassword]);

  useEffect(() => {
    if (!success) return;
    const timer = setTimeout(() => {
      router.push("/login?reset=success");
    }, 2000);
    return () => clearTimeout(timer);
  }, [success, router]);

  const focusInput = (index: number) => {
    const el = inputsRef.current[index];
    if (el) el.focus();
  };

  const handleDigitChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, "").slice(0, 1);
    if (!digit) return;

    const copy = [...digits];
    copy[index] = digit;
    setDigits(copy);

    if (index < OTP_LENGTH - 1) {
      focusInput(index + 1);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      if (digits[index]) {
        const copy = [...digits];
        copy[index] = "";
        setDigits(copy);
      } else if (index > 0) {
        focusInput(index - 1);
      }
      return;
    }

    if (e.key === "ArrowLeft" && index > 0) {
      focusInput(index - 1);
      return;
    }

    if (e.key === "ArrowRight" && index < OTP_LENGTH - 1) {
      focusInput(index + 1);
      return;
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
    if (!pasted) return;

    const copy = [...digits];
    for (let i = 0; i < OTP_LENGTH; i++) {
      copy[i] = pasted[i] || "";
    }
    setDigits(copy);

    const nextEmpty = copy.findIndex((d) => !d);
    focusInput(nextEmpty === -1 ? OTP_LENGTH - 1 : nextEmpty);
  };

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError("");
      setLoading(true);

      try {
        if (!email || otp.length !== OTP_LENGTH) {
          throw new Error("Please enter the verification code");
        }

        if (password.length < 12) {
          throw new Error("Password must be at least 12 characters");
        }

        if (password !== confirmPassword) {
          throw new Error("Passwords do not match");
        }

        const result = await authClient.emailOtp.resetPassword({
          email,
          otp,
          password,
        });

        if (result.error) {
          throw new Error(result.error.message ?? "Failed to reset password");
        }

        setSuccess(true);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Something went wrong. Please try again."
        );
        setDigits(Array(OTP_LENGTH).fill(""));
        setLoading(false);
        focusInput(0);
      }
    },
    [email, otp, password, confirmPassword]
  );

  if (success) {
    return (
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10">
        <div className="pointer-events-none absolute inset-0" />
        <FadeIn
          className="relative z-10 w-full max-w-130 overflow-hidden p-6 sm:p-10"
          offset={24}
          duration={0.5}
        >
          <div className="mb-10 text-center">
            <CheckCircle2 className="text-status-success mx-auto mb-4 h-12 w-12" />
            <h2 className="font-accent text-3xl font-bold tracking-tight sm:text-4xl">
              Password reset
            </h2>
            <p className="text-muted-foreground mt-2 text-lg sm:text-xl">
              Your password has been reset successfully. Redirecting to login...
            </p>
          </div>
        </FadeIn>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden py-10">
      <div className="pointer-events-none absolute inset-0" />

      <FadeIn
        className="relative z-10 w-full max-w-130 overflow-hidden p-6 sm:p-10"
        offset={24}
        duration={0.5}
      >
        <div className="mb-10 text-center">
          <h2 className="font-accent text-3xl font-bold tracking-tight sm:text-4xl">
            Reset your password
          </h2>
          <p className="text-muted-foreground mt-2 text-base">
            Enter the code sent to {email}
          </p>
        </div>

        {error && (
          <div className="border-destructive/25 bg-destructive/8 text-destructive animate-shake mb-5 rounded-xl border px-4 py-3">
            <div className="flex items-start gap-3">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
              <p className="text-sm">{error}</p>
            </div>
          </div>
        )}

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="flex items-center justify-center gap-2 sm:gap-3">
            {digits.map((digit, i) => (
              <input
                key={i}
                ref={(el) => {
                  inputsRef.current[i] = el;
                }}
                type="text"
                inputMode="numeric"
                value={digit}
                onChange={(e) => handleDigitChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                onPaste={i === 0 ? handlePaste : undefined}
                disabled={loading}
                className={cn(
                  "h-14 w-11 rounded-md border text-center text-2xl font-mono font-bold outline-none transition-colors sm:h-16 sm:w-13",
                  "focus:ring-primary/50 focus:ring-2",
                  "disabled:cursor-not-allowed disabled:opacity-50",
                  error
                    ? "border-destructive/50 bg-destructive/5"
                    : "border-input bg-card/90"
                )}
                maxLength={1}
                autoFocus={i === 0}
                aria-label={`Digit ${i + 1}`}
              />
            ))}
          </div>

          <div className="space-y-2">
            <div className="relative">
              <Lock className="text-muted-foreground pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="New password"
                required
                minLength={12}
                disabled={loading}
                className="h-12 pr-10 pl-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3.5 -translate-y-1/2 transition-colors"
                aria-label={showPassword ? "Hide password" : "Show password"}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <div className="relative">
              <Lock className="text-muted-foreground pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2" />
              <Input
                id="confirm-password"
                type={showConfirm ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                required
                minLength={12}
                disabled={loading}
                className={`h-12 pr-10 pl-10 ${
                  passwordError ? "border-destructive" : ""
                }`}
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3.5 -translate-y-1/2 transition-colors"
                aria-label={showConfirm ? "Hide password" : "Show password"}
                tabIndex={-1}
              >
                {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {passwordError && (
              <p className="text-destructive text-xs">{passwordError}</p>
            )}
          </div>

          <Button
            type="submit"
            disabled={loading || otp.length !== OTP_LENGTH || !password || !confirmPassword}
            size="lg"
            className="mt-6 w-full"
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Reset password"}
          </Button>
        </form>

        <p className="text-muted-foreground mt-6 text-center text-sm">
          <Link href="/login" className="hover:underline">
           Go back to Login
          </Link>
        </p>
      </FadeIn>
    </div>
  );
}
