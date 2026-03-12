"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { AlertCircle, Loader2, Lock, Mail, ShieldCheck } from "lucide-react";
import { api } from "@/convex/_generated/api";
import { setAuthToken } from "@/lib/auth";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const loginMutation = useMutation(api.auth.login);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (!email || !password) {
        throw new Error("Please fill in all fields");
      }

      if (password.length < 12) {
        throw new Error("Password must be at least 12 characters");
      }

      let ipAddress: string | undefined;
      try {
        const ipResponse = await fetch("https://api.ipify.org?format=json");
        const ipData = await ipResponse.json();
        ipAddress = ipData.ip;
      } catch {
        ipAddress = undefined;
      }

      const result = await loginMutation({
        email,
        password,
        ipAddress,
        userAgent: navigator.userAgent,
      });

      setAuthToken(result.token, result.expiresAt);
      router.push("/dashboard");
    } catch (err) {
      console.error("Login error:", err);

      const errorMessage =
        err instanceof Error ? err.message : "Login failed. Please try again.";

      if (errorMessage.includes("locked")) {
        setError(errorMessage);
      } else if (errorMessage.includes("Invalid")) {
        setError(
          "Invalid email or password. Please check your credentials and try again.",
        );
      } else if (errorMessage.includes("attempt")) {
        setError(errorMessage);
      } else {
        setError("An error occurred during login. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(80rem 50rem at 10% 10%, oklch(0.95 0.09 240 / 0.6), transparent 50%), radial-gradient(80rem 40rem at 95% 95%, oklch(0.93 0.08 215 / 0.45), transparent 45%)",
        }}
      />

      <div className="app-panel relative z-10 w-full max-w-[980px] overflow-hidden rounded-3xl">
        <div className="grid lg:grid-cols-[1fr_460px]">
          <section className="hidden border-r border-border/70 bg-secondary/35 p-10 lg:block">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
              Welcome
            </p>
            <h1 className="mt-3 font-accent text-4xl font-semibold leading-tight">
              Affiliate automation,
              <br />
              under one dashboard.
            </h1>
            <p className="mt-4 max-w-sm text-sm text-muted-foreground">
              Secure access for managing reel mappings, DM workflows, and
              product lists.
            </p>

            <div className="mt-8 space-y-3">
              <div className="app-panel-soft flex items-center gap-3 px-4 py-3">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                <p className="text-sm">
                  Session verification on every dashboard load
                </p>
              </div>
              <div className="app-panel-soft flex items-center gap-3 px-4 py-3">
                <Lock className="h-4 w-4 text-primary" />
                <p className="text-sm">
                  Brute-force protection and lockout handling enabled
                </p>
              </div>
            </div>
          </section>

          <section className="p-6 sm:p-10">
            <div className="mb-8 text-center lg:text-left">
              <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Lock className="h-6 w-6" />
              </div>
              <h2 className="font-accent text-3xl font-semibold tracking-tight">
                Sign in
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Access your dashboard workspace.
              </p>
            </div>

            {error && (
              <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700">
                <div className="flex items-start gap-3">
                  <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
                  <p className="text-sm">{error}</p>
                </div>
              </div>
            )}

            <form className="space-y-5" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label htmlFor="email">Email address</Label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@example.com"
                    required
                    disabled={loading}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                    minLength={12}
                    disabled={loading}
                    className="pl-10"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Minimum 12 characters required.
                </p>
              </div>

              <Button
                type="submit"
                disabled={loading}
                size="lg"
                className="w-full"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign in"
                )}
              </Button>
            </form>
          </section>
        </div>
      </div>
    </div>
  );
}
