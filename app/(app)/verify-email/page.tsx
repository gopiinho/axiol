"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useConvexAuth, useMutation } from "convex/react";
import { AlertCircle, Loader2, CheckCircle2 } from "lucide-react";
import { api } from "@/convex/_generated/api";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { FadeIn } from "@/components/motion/FadeIn";
import { cn } from "@/lib/utils";

const OTP_LENGTH = 6;

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  const router = useRouter();
  const { isAuthenticated: convexAuthed } = useConvexAuth();

  const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [verified, setVerified] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const inputsRef = useRef<(HTMLInputElement | null)[]>(Array(OTP_LENGTH).fill(null));
  const formRef = useRef<HTMLFormElement>(null);

  const markEmailVerified = useMutation(api.users.markEmailVerified);

  const otp = digits.join("");

  useEffect(() => {
    if (!email) {
      router.replace("/login");
    }
  }, [email, router]);

  useEffect(() => {
    if (!convexAuthed || !verified) return;

    const doSetup = async () => {
      try {
        await markEmailVerified();
        router.push("/dashboard");
      } catch {
        router.push("/dashboard");
      }
    };
    doSetup();
  }, [convexAuthed, verified, markEmailVerified, router]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

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
    const focusIdx = nextEmpty === -1 ? OTP_LENGTH - 1 : nextEmpty;
    focusInput(focusIdx);
  };

  const handleVerify = useCallback(async () => {
    if (!email || otp.length !== OTP_LENGTH) return;
    setError("");
    setLoading(true);

    try {
      const result = await authClient.emailOtp.verifyEmail({ email, otp });
      if (result.error) {
        throw new Error(result.error.message || "Invalid or expired code");
      }
      setVerified(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Invalid or expired code. Please try again."
      );
      setDigits(Array(OTP_LENGTH).fill(""));
      setLoading(false);
      focusInput(0);
    }
  }, [email, otp]);

  const handleResend = useCallback(async () => {
    if (!email || cooldown > 0) return;
    setError("");
    setCooldown(30);
    setDigits(Array(OTP_LENGTH).fill(""));

    try {
      await authClient.emailOtp.sendVerificationOtp({
        email,
        type: "email-verification",
      });
    } catch {
      setCooldown(0);
    }

    focusInput(0);
  }, [email, cooldown]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleVerify();
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10">
      <div className="pointer-events-none absolute inset-0" />

      <FadeIn
        className="relative z-10 w-full max-w-130 overflow-hidden p-6 sm:p-10"
        offset={24}
        duration={0.5}
      >
        <div className="mb-10 text-center">
          <h2 className="font-accent text-3xl font-bold tracking-tight sm:text-4xl">
            Check your email
          </h2>
          <p className="text-muted-foreground mt-2 text-base">
            We sent a 6-digit code to <span className="font-semibold text-foreground">{email}</span>
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

        {verified && (
          <div className="border-status-success/25 bg-status-success/8 text-status-success mb-5 rounded-xl border px-4 py-3">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 shrink-0" />
              <p className="text-sm font-medium">Verified! Redirecting to your dashboard...</p>
            </div>
          </div>
        )}

        <form ref={formRef} onSubmit={handleSubmit} className="space-y-5">
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
                disabled={loading || verified}
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

          <Button
            type="submit"
            disabled={loading || otp.length !== OTP_LENGTH || verified}
            size="lg"
            className="mt-6 w-full"
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Verify"}
          </Button>

          <div className="text-center">
            <Button
              type="button"
              onClick={handleResend}
              disabled={cooldown > 0 || verified}
              variant="ghost"
              className="w-full"
            >
              {cooldown > 0
                ? `Resend code in ${cooldown}s`
                : "Resend code"}
            </Button>
          </div>
        </form>

        <p className="text-muted-foreground mt-6 text-center text-sm">
          Wrong email?{" "}
          <a href="/signup" className="font-medium hover:underline">
            Sign up again
          </a>
        </p>
      </FadeIn>
    </div>
  );
}
