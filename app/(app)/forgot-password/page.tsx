"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Loader2, Mail } from "lucide-react";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FadeIn } from "@/components/motion/FadeIn";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (!email) {
        throw new Error("Please enter your email address");
      }

      await authClient.emailOtp.sendVerificationOtp({
        email,
        type: "forget-password",
      });
    } catch {
      // Silently proceed — don't reveal whether the email exists
    }

    router.push(`/reset-password?email=${encodeURIComponent(email)}`);
  };

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
            Forgot your password?
          </h2>
          <p className="text-muted-foreground mt-2 text-base sm:text-base">
            Enter your email and we&apos;ll send you a reset code if an account exists.
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

        <form className="space-y-3" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <div className="relative">
              <Mail className="text-muted-foreground pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2" />
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                required
                disabled={loading}
                className="h-12 pl-10"
              />
            </div>
          </div>

          <Button type="submit" disabled={loading} size="lg" className="mt-6 w-full">
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Send code"}
          </Button>
        </form>

        <p className="text-muted-foreground mt-6 text-center text-sm">
          Remember your password?{" "}
          <Link href="/login" className="font-medium hover:underline">
            Login
          </Link>
        </p>
      </FadeIn>
    </div>
  );
}
