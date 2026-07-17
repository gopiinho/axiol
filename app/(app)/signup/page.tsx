"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useConvexAuth, useQuery, useMutation } from "convex/react";
import {
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
import { toast } from "sonner";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [debouncedUsername, setDebouncedUsername] = useState("");

  const router = useRouter();
  const { isAuthenticated: convexAuthed } = useConvexAuth();
  const createProfile = useMutation(api.users.createProfile);
  const pending = useRef<{ username: string; email: string } | null>(null);

  const usernameCheck = useQuery(
    api.users.checkUsernameAvailable,
    !loading && debouncedUsername.length >= 3 ? { username: debouncedUsername } : "skip"
  );

  useEffect(() => {
    if (!convexAuthed || !pending.current) return;
    const { username, email: userEmail } = pending.current;
    pending.current = null;

    createProfile({ username, emailVerified: false })
      .then(async () => {
        await authClient.emailOtp.sendVerificationOtp({
          email: userEmail,
          type: "email-verification",
        });
        router.push(`/verify-email?email=${encodeURIComponent(userEmail)}`);
      })
      .catch((err: unknown) => {
        const msg = err instanceof Error ? err.message : "Failed to create profile";
        toast.error(msg || "Failed to create profile");
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
    setLoading(true);

    try {
      if (!email || !username || !name || !password) {
        toast.error("Please fill in all fields");
        return;
      }

      if (password.length < 12) {
        toast.error("Password must be at least 12 characters");
        return;
      }

      const result = await authClient.signUp.email({
        email,
        password,
        name: name.trim(),
      });

      if (result.error) {
        toast.error(result.error.message ?? "Signup failed");
        setLoading(false);
        return;
      }

      pending.current = {
        username: username.toLowerCase().trim(),
        email,
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Signup failed. Please try again.";
      toast.error(errorMessage);
      setLoading(false);
    }
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
          <h2 className="font-accent flex items-center justify-center text-center text-3xl font-bold tracking-tight sm:text-4xl">
            Hey @{username ? username : <span className="capitalize">username</span>}
          </h2>
          <p className="text-muted-foreground mt-2 text-base">
            Let&apos;s monetize your following!
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-1">
            <div className="relative flex items-center justify-center">
              <AtSign className="text-muted-foreground pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2" />
              <span className="text-foreground pointer-events-none absolute top-1/2 left-10 -translate-y-1/2 text-base font-semibold whitespace-nowrap select-none">
                axiol.store/
              </span>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) =>
                  setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))
                }
                placeholder="username"
                required
                disabled={loading}
                className="h-12 pl-34"
                maxLength={30}
              />
              {debouncedUsername.length >= 3 && usernameCheck && (
                <div className="absolute top-1/2 right-3 -translate-y-1/2">
                  {usernameCheck.available ? (
                    <CheckCircle2 className="text-status-success h-4 w-4" />
                  ) : (
                    <XCircle className="text-destructive h-4 w-4" />
                  )}
                </div>
              )}
            </div>
            {debouncedUsername.length >= 3 && usernameCheck && !usernameCheck.available && (
              <p className="text-destructive text-xs">{usernameCheck.reason}</p>
            )}
          </div>

          <div className="space-y-2">
            <div className="relative">
              <User className="text-muted-foreground pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2" />
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Full name"
                required
                disabled={loading}
                className="h-12 pl-10"
              />
            </div>
          </div>

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

          <div className="space-y-2">
            <div className="relative">
              <Lock className="text-muted-foreground pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
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

          <Button type="submit" disabled={loading} size="lg" className="mt-6 w-full">
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Next"}
          </Button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="text-muted-foreground bg-background px-2">or</span>
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          size="lg"
          className="w-full"
          onClick={() =>
            authClient.signIn.social({
              provider: "google",
              callbackURL: "/onboarding/username",
            })
          }
        >
          <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          Continue with Google
        </Button>

        <p className="text-muted-foreground mt-6 text-center text-sm">
          Already have an account?{" "}
          <Link href="/login" className="font-medium hover:underline">
            Login
          </Link>
        </p>

        <p className="text-muted-foreground mt-4 text-center text-xs">
          By signing up, you agree to our{" "}
          <Link href="/terms" className="hover:text-foreground underline">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="hover:text-foreground underline">
            Privacy Policy
          </Link>
          .
        </p>
      </FadeIn>
    </div>
  );
}
