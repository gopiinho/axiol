"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { AlertCircle, AtSign, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { api } from "@/convex/_generated/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FadeIn } from "@/components/motion/FadeIn";

export default function OnboardingUsernamePage() {
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [debouncedUsername, setDebouncedUsername] = useState("");

  const router = useRouter();
  const { isAuthenticated: convexAuthed, isLoading: convexLoading } = useConvexAuth();
  const profile = useQuery(
    api.users.getProfile,
    convexLoading || !convexAuthed ? "skip" : undefined
  );
  const createProfile = useMutation(api.users.createProfile);
  const redirected = useRef(false);

  const usernameCheck = useQuery(
    api.users.checkUsernameAvailable,
    !loading && debouncedUsername.length >= 3 ? { username: debouncedUsername } : "skip"
  );

  useEffect(() => {
    if (convexLoading || redirected.current) return;
    if (!convexAuthed) {
      redirected.current = true;
      router.replace("/login");
      return;
    }
    if (profile !== undefined && profile !== null) {
      redirected.current = true;
      router.replace("/dashboard");
    }
  }, [convexLoading, convexAuthed, profile, router]);

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
      const trimmed = username.toLowerCase().trim();
      if (!trimmed) {
        throw new Error("Please choose a username");
      }

      await createProfile({ username: trimmed, emailVerified: true });
      router.push("/dashboard");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create profile. Please try again."
      );
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
          <h2 className="font-accent text-3xl font-bold tracking-tight sm:text-4xl">
            Almost there!
          </h2>
          <p className="text-muted-foreground mt-2 text-basel">
            Choose your username
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

          <Button
            type="submit"
            disabled={loading || !usernameCheck?.available}
            size="lg"
            className="mt-6 w-full"
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Complete setup"}
          </Button>
        </form>
      </FadeIn>
    </div>
  );
}
