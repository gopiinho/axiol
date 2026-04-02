"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useConvexAuth, useMutation, useQuery } from "convex/react";
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
import { authClient } from "@/lib/auth-client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FadeIn } from "@/components/motion/FadeIn";

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
  const { isAuthenticated: convexAuthed } = useConvexAuth();
  const createProfile = useMutation(api.users.createProfile);
  const pendingUsername = useRef<string | null>(null);

  const usernameCheck = useQuery(
    api.users.checkUsernameAvailable,
    !loading && debouncedUsername.length >= 3
      ? { username: debouncedUsername }
      : "skip",
  );

  useEffect(() => {
    if (!convexAuthed || !pendingUsername.current) return;
    const usernameToCreate = pendingUsername.current;
    pendingUsername.current = null;

    createProfile({ username: usernameToCreate })
      .then(() => {
        router.push("/dashboard");
      })
      .catch((err: unknown) => {
        const msg =
          err instanceof Error ? err.message : "Failed to create profile";
        setError(msg);
        setLoading(false);
      });
  }, [convexAuthed, createProfile, router]);

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

      const result = await authClient.signUp.email({
        email,
        password,
        name: name.trim(),
      });

      if (result.error) {
        throw new Error(result.error.message ?? "Signup failed");
      }

      pendingUsername.current = username.toLowerCase().trim();
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

      <FadeIn
        className="relative z-10 w-full max-w-130 overflow-hidden p-6 sm:p-10"
        offset={24}
        duration={0.5}
      >
        <div className="mb-10 text-center">
          <h2 className="font-accent text-3xl flex text-center items-center justify-center font-bold tracking-tight sm:text-4xl">
            Hey @{username ? username : <p className="capitalize">username</p>}
          </h2>
          <p className="mt-2 text-lg text-muted-foreground sm:text-xl">
            Let&apos;s monetize your following!
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

        <p className="mt-4 text-center text-xs text-muted-foreground">
          By signing up, you agree to our{" "}
          <Link href="/terms" className="underline hover:text-foreground">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="underline hover:text-foreground">
            Privacy Policy
          </Link>
          .
        </p>
      </FadeIn>
    </div>
  );
}
