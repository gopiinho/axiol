"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";

export function WaitlistForm() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<
    "idle" | "loading" | "success" | "already_registered" | "error"
  >("idle");

  const joinWaitlist = useMutation(api.waitlist.joinWaitlist);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;

    setState("loading");
    try {
      const result = await joinWaitlist({ email });
      setState(result.status);
    } catch {
      setState("error");
    }
  }

  if (state === "success") {
    return (
      <div className="flex items-center gap-3 pt-2">
        <p className="text-base sm:text-lg font-semibold text-primary">
          You&apos;re on the list! We&apos;ll let you know when we launch.
        </p>
      </div>
    );
  }

  if (state === "already_registered") {
    return (
      <div className="flex items-center gap-3 pt-2">
        <p className="text-base sm:text-lg font-semibold text-muted-foreground">
          This email is already on the waitlist.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2"
    >
      <input
        type="email"
        required
        placeholder="your@email.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        disabled={state === "loading"}
        className="h-14 rounded-xl border-2 border-border bg-background px-5 text-base sm:text-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary disabled:opacity-60 min-w-0 w-full sm:w-72"
      />
      <Button
        type="submit"
        disabled={state === "loading"}
        className="h-14 px-8 text-base sm:text-lg"
      >
        {state === "loading" ? "Joining..." : "Join waitlist"}
      </Button>
      {state === "error" && (
        <p className="text-sm text-destructive sm:absolute sm:mt-16">
          Something went wrong. Please try again.
        </p>
      )}
    </form>
  );
}
