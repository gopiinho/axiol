"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import {
  AlertCircle,
  AtSign,
  Eye,
  EyeOff,
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
import { Button } from "@/components/ui/button";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [debouncedUsername, setDebouncedUsername] = useState("");

  const router = useRouter();
  const signupMutation = useMutation(api.auth.signup);

  const usernameCheck = useQuery(
    api.auth.checkUsernameAvailable,
    !loading && debouncedUsername.length >= 3
      ? { username: debouncedUsername }
      : "skip",
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
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10">
      <div className="auth-bg pointer-events-none absolute inset-0" />

      <div className="relative z-10 w-full max-w-130 overflow-hidden p-6 sm:p-10">
        <div className="mb-8 text-center">
          <h2 className="font-accent text-3xl flex text-center items-center justify-center font-semibold tracking-tight">
            Hey @{username ? username : <p className="capitalize">username</p>}
          </h2>
          <p className="text-xl text-muted-foreground">
            Let&apos;s monetize your following!
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

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-1">
            <div className="relative flex items-center justify-center">
              <AtSign className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <span className="pointer-events-none font-semibold text-base absolute top-1/2 left-10 -translate-y-1/2 select-none whitespace-nowrap text-foreground">
                linkkit.store/
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
                placeholder="username"
                required
                disabled={loading}
                className="pl-34 h-12"
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
                <p className="text-xs text-destructive">
                  {usernameCheck.reason}
                </p>
              )}
          </div>

          <div className="space-y-2">
            <div className="relative">
              <User className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Full name"
                required
                disabled={loading}
                className="pl-10 h-12"
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="relative">
              <Mail className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
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
                Creating account...
              </>
            ) : (
              "Next"
            )}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-primary hover:underline"
          >
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
