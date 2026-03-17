"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import {
  AlertCircle,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
} from "lucide-react";
import Link from "next/link";
import { api } from "@/convex/_generated/api";
import { setAuthToken } from "@/lib/auth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FadeIn } from "@/components/motion/FadeIn";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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
        setError("Something unexpected happened. Check your connection and try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10">
      <div className="auth-bg pointer-events-none absolute inset-0" />

      <FadeIn className="relative z-10 w-full max-w-130 overflow-hidden p-6 sm:p-10" offset={24} duration={0.5}>
        <div className="mb-10 text-center">
          <h2 className="font-accent text-3xl font-bold tracking-tight sm:text-4xl">
            Welcome back!
          </h2>
          <p className="mt-2 text-lg text-muted-foreground sm:text-xl">
            Access your creator workspace.
          </p>
        </div>

        {error && (
          <div className="mb-5 rounded-xl border border-destructive/25 bg-destructive/8 px-4 py-3 text-destructive animate-shake">
            <div className="flex items-start gap-3">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
              <p className="text-sm">{error}</p>
            </div>
          </div>
        )}

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <div className="relative">
              <Mail className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email or Username"
                required
                disabled={loading}
                className="pl-10 h-12"
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="relative">
              <Lock className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                required
                minLength={12}
                disabled={loading}
                className="pl-10 pr-10 h-12"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute top-1/2 right-3.5 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                aria-label={showPassword ? "Hide password" : "Show password"}
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading}
            size="lg"
            className="w-full mt-6"
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Logging in...
              </>
            ) : (
              "Login"
            )}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link
            href="/signup"
            className="font-medium text-primary hover:underline"
          >
            Sign up
          </Link>
        </p>
      </FadeIn>
    </div>
  );
}
