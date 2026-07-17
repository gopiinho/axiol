"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export function WaitlistForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const joinWaitlist = useMutation(api.waitlist.joinWaitlist);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    try {
      const result: { status: string } = await joinWaitlist({ email });
      if (result.status === "success") {
        toast.success("You're on the list!", { description: "We'll let you know when we launch." });
      } else if (result.status === "already_registered") {
        toast.error("You're already on the list", { description: "We've got you covered." });
      } else if (result.status === "error") {
        toast.error("Something went wrong", { description: "Please try again." });
      }
    } catch {
      toast.error("Something went wrong", { description: "Please try again." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-3 pt-2">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center"
      >
        <input
          type="email"
          required
          placeholder="your@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
          className="border-primary bg-foreground text-background placeholder:text-background focus:ring-primary/40 focus:border-primary h-14 w-full min-w-0 border-2 px-5 text-base focus:ring-2 focus:outline-none disabled:opacity-60 sm:w-72 sm:text-lg"
        />
        <Button type="submit" disabled={loading} className="h-14 px-8 text-base sm:text-lg">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Join waitlist"}
        </Button>
      </form>
    </div>
  );
}
