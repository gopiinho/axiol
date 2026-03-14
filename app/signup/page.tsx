"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import {
  AlertCircle,
  Loader2,
  Lock,
  Mail,
  User,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { api } from "@/convex/_generated/api";
import { setAuthToken } from "@/lib/auth";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [debouncedUsername, setDebouncedUsername] = useState("");

  const router = useRouter();
  const signupMutation = useMutation(api.auth.signup);

  const usernameCheck = useQuery(
    api.auth.checkUsernameAvailable,
    debouncedUsername.length >= 3 ? { username: debouncedUsername } : "skip",
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedUsername(username.toLowerCase().trim());
    }, 300);
    return () => clearTimeout(timer);
  }, [username]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (!email || !username || !name || !password) {
        throw new Error("Please fill in all fields");
      }

      if (password.length < 12) {
        throw new Error("Password must be at least 12 characters");
      }

      if (password !== confirmPassword) {
        throw new Error("Passwords do not match");
      }

      let ipAddress: string | undefined;
      try {
        const ipResponse = await fetch("https://api.ipify.org?format=json");
        const ipData = await ipResponse.json();
        ipAddress = ipData.ip;
      } catch {
        ipAddress = undefined;
      }

      const result = await signupMutation({
        email,
        username: username.toLowerCase().trim(),
        name: name.trim(),
        password,
        ipAddress,
        userAgent: navigator.userAgent,
      });

      setAuthToken(result.token, result.expiresAt);
      router.push("/dashboard");
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Signup failed. Please try again.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10">
      <div className="auth-bg pointer-events-none absolute inset-0" />

      <div className="app-panel relative z-10 w-full max-w-[520px] overflow-hidden rounded-3xl p-6 sm:p-10">
        <div className="mb-8 text-center">
          <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <User className="h-6 w-6" />
          </div>
          <h2 className="font-accent text-3xl font-semibold tracking-tight">
            Create account
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Start your 14-day free trial. No credit card required.
          </p>
        </div>

        {error && (
          <div className="mb-5 rounded-xl border border-destructive/25 bg-destructive/8 px-4 py-3 text-destructive">
            <div className="flex items-start gap-3">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
              <p className="text-sm">{error}</p>
            </div>
          </div>
        )}

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <div className="relative">
              <User className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                required
                disabled={loading}
                className="pl-10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <div className="relative">
              <span className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-sm text-muted-foreground">
                @
              </span>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) =>
                  setUsername(
                    e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""),
                  )
                }
                placeholder="yourname"
                required
                disabled={loading}
                className="pl-8"
                maxLength={30}
              />
              {debouncedUsername.length >= 3 && usernameCheck && (
                <div className="absolute top-1/2 right-3 -translate-y-1/2">
                  {usernameCheck.available ? (
                    <CheckCircle2 className="h-4 w-4 text-status-success" />
                  ) : (
                    <XCircle className="h-4 w-4 text-destructive" />
                  )}
                </div>
              )}
            </div>
            {debouncedUsername.length >= 3 &&
              usernameCheck &&
              !usernameCheck.available && (
                <p className="text-xs text-destructive">{usernameCheck.reason}</p>
              )}
            <p className="text-xs text-muted-foreground">
              Your store will be at linkkit.com/{username || "yourname"}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email address</Label>
            <div className="relative">
              <Mail className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
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
                placeholder="Min. 12 characters"
                required
                minLength={12}
                disabled={loading}
                className="pl-10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirm password</Label>
            <div className="relative">
              <Lock className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat your password"
                required
                minLength={12}
                disabled={loading}
                className="pl-10"
              />
            </div>
          </div>

          <Button type="submit" disabled={loading} size="lg" className="w-full">
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Creating account...
              </>
            ) : (
              "Create account"
            )}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-primary hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
