"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2, Lock, Mail } from "lucide-react";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FadeIn } from "@/components/motion/FadeIn";

export default function LoginPage({
  searchParams,
}: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = use(
    searchParams ??
      (Promise.resolve({}) as Promise<{
        [key: string]: string | string[] | undefined;
      }>)
  );
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  useEffect(() => {
    if (params.reset === "success") {
      toast.success("Password reset successful!", {
        description: "Sign in with your new password.",
      });
    }
  }, [params.reset]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!email || !password) {
        toast.error("Please fill in all fields");
        return;
      }

      if (password.length < 12) {
        toast.error("Password must be at least 12 characters");
        return;
      }

      const result = await authClient.signIn.email({
        email,
        password,
      });

      if (result.error) {
        throw new Error(result.error.message ?? "Login failed");
      }

      router.push("/dashboard");
    } catch (err) {
      console.error("Login error:", err);

      const errorMessage = err instanceof Error ? err.message : "Login failed";

      if (errorMessage.includes("locked")) {
        toast.error("Account temporarily locked", {
          description: "Too many attempts. Try again in a few minutes.",
        });
      } else if (errorMessage.includes("Invalid") || errorMessage.includes("invalid")) {
        toast.error("Invalid email or password", {
          description: "Check your credentials and try again.",
        });
      } else if (errorMessage.includes("attempt")) {
        toast.error(errorMessage);
      } else {
        toast.error("Login failed", {
          description: "Check your connection and try again.",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-primary/6 relative flex min-h-screen items-center justify-center overflow-hidden py-10">
      <div className="pointer-events-none absolute inset-0" />

      <FadeIn
        className="relative z-10 w-full max-w-130 overflow-hidden p-6 sm:p-10"
        offset={24}
        duration={0.5}
      >
        <div className="mb-10 text-center">
          <h2 className="font-accent text-3xl font-bold tracking-tight sm:text-4xl">
            Welcome back!
          </h2>
          <p className="text-muted-foreground mt-2 text-base">Ready to make some 💸 ?</p>
        </div>

        <form className="space-y-3" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <div className="relative">
              <Mail className="text-muted-foreground pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2" />
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email or Username"
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
            <div className="flex justify-center">
              <Link href="/forgot-password" className="text-sm hover:underline">
                Forgot password?
              </Link>
            </div>
          </div>

          <Button type="submit" disabled={loading} size="lg" className="mt-6 w-full">
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Login"}
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
              callbackURL: "/dashboard",
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
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="font-medium hover:underline">
            Sign up
          </Link>
        </p>

        <p className="text-muted-foreground mt-4 text-center text-xs">
          <Link href="/privacy" className="underline">
            Privacy Policy
          </Link>
          <span className="mx-2">·</span>
          <Link href="/terms" className="underline">
            Terms of Service
          </Link>
        </p>
      </FadeIn>
    </div>
  );
}
