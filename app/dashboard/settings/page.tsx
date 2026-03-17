"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  Instagram,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Shield,
  Clock,
  X,
} from "lucide-react";
import { useUser } from "@/features/auth/client/UserContext";
import { useInstagramConnection } from "@/features/instagram-mappings/hooks/useInstagramConnection";
import ConnectInstagramCTA from "@/features/instagram-mappings/components/ConnectInstagramCTA";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FadeIn } from "@/components/motion/FadeIn";
import { AnimatePresence, motion } from "motion/react";

export default function SettingsPage() {
  const { user: profile } = useUser();
  const searchParams = useSearchParams();
  const ig = useInstagramConnection();
  const [igToast, setIgToast] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  useEffect(() => {
    if (searchParams.get("ig_connected") === "true") {
      setIgToast({
        type: "success",
        message: "Instagram connected successfully!",
      });
    } else if (searchParams.get("ig_error")) {
      const errorMap: Record<string, string> = {
        csrf: "Security check failed. Please try again.",
        token_exchange: "Failed to connect Instagram. Please try again.",
        server: "Something went wrong. Please try again.",
        config: "Instagram app is not configured.",
        user_denied: "You denied the Instagram permission request.",
      };
      const error = searchParams.get("ig_error")!;
      setIgToast({
        type: "error",
        message: errorMap[error] ?? "Failed to connect Instagram.",
      });
    }
  }, [searchParams]);

  const subscriptionLabel =
    profile?.subscriptionStatus === "trial" && profile?.trialEndsAt
      ? `Trial — ends ${new Date(profile.trialEndsAt).toLocaleDateString()}`
      : (profile?.subscriptionStatus ?? "N/A");

  return (
    <div className="w-full">
      <FadeIn>
        <section className="px-5 py-6 lg:px-6 lg:py-8">
          <h1 className="app-title">Settings</h1>
          <p className="app-subtitle">
            Manage your account and connected services.
          </p>
        </section>
      </FadeIn>

      <AnimatePresence>
        {igToast && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25, ease: [0.25, 1, 0.5, 1] }}
            className="mx-5 mb-4 lg:mx-6"
          >
            <div
              className={`flex items-center gap-2.5 rounded-xl px-4 py-3 text-sm font-medium ${
                igToast.type === "success" ? "tone-ok" : "tone-danger"
              }`}
            >
              {igToast.type === "success" ? (
                <CheckCircle2 className="h-4 w-4 shrink-0" />
              ) : (
                <AlertTriangle className="h-4 w-4 shrink-0" />
              )}
              <span className="flex-1">{igToast.message}</span>
              <button
                onClick={() => setIgToast(null)}
                className="shrink-0 rounded-md p-0.5 opacity-60 transition hover:opacity-100"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <FadeIn delay={0.06}>
        <section className="px-5 lg:px-6">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Account
          </h2>

          <div className="mt-4 divide-y divide-border/70">
            <SettingsRow
              label="Username"
              value={`@${profile?.username ?? ""}`}
            />
            <SettingsRow label="Email" value={profile?.email ?? ""} />
            <div className="flex items-center justify-between py-3.5">
              <div>
                <p className="text-sm font-medium text-foreground">
                  Subscription
                </p>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  {subscriptionLabel}
                </p>
              </div>
              <Badge variant="secondary" className="capitalize">
                {profile?.subscriptionStatus ?? "N/A"}
              </Badge>
            </div>
          </div>
        </section>
      </FadeIn>

      <div className="my-6 border-t border-border/50 mx-5 lg:mx-6" />

      <FadeIn delay={0.12}>
        <section className="px-5 lg:px-6 pb-12">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Socials
          </h2>

          <div className="mt-4">
            <div className="app-panel p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#833AB4] via-[#E1306C] to-[#F77737]">
                  <Instagram className="h-5 w-5 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-foreground">
                    Instagram
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Auto-DM automation & reel comments
                  </p>
                </div>
              </div>

              <div className="mt-4 border-t border-border/50 pt-4">
                {(ig.status === "not_connected" ||
                  ig.status === "expired" ||
                  ig.status === "loading") && (
                  <ConnectInstagramCTA status={ig.status} className="py-4" />
                )}

                {ig.status === "connected" && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground">
                          {ig.instagramUsername
                            ? `@${ig.instagramUsername}`
                            : `Account ${ig.instagramAccountId}`}
                        </p>
                      </div>
                      <Badge className="tone-ok shrink-0 border-0">
                        <CheckCircle2 className="h-3 w-3" />
                        Connected
                      </Badge>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="h-3.5 w-3.5 shrink-0" />
                      <span>
                        Token expires{" "}
                        {ig.tokenExpiresAt
                          ? new Date(ig.tokenExpiresAt).toLocaleDateString()
                          : "N/A"}
                      </span>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                      className="gap-1.5"
                    >
                      {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- API route requires full redirect */}
                      <a href="/api/auth/instagram">
                        <RefreshCw className="h-3.5 w-3.5" />
                        Reconnect
                      </a>
                    </Button>
                  </div>
                )}

                {ig.status === "expiring_soon" && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground">
                          {ig.instagramUsername
                            ? `@${ig.instagramUsername}`
                            : `Account ${ig.instagramAccountId}`}
                        </p>
                      </div>
                      <Badge className="tone-warn shrink-0 border-0">
                        <AlertTriangle className="h-3 w-3" />
                        Expiring Soon
                      </Badge>
                    </div>

                    <div className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium tone-warn">
                      <Shield className="h-3.5 w-3.5 shrink-0" />
                      <span>
                        Token expires{" "}
                        {ig.tokenExpiresAt
                          ? new Date(ig.tokenExpiresAt).toLocaleDateString()
                          : "soon"}{" "}
                        — reconnect to avoid interruptions
                      </span>
                    </div>

                    <Button size="sm" asChild className="gap-1.5">
                      {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- API route requires full redirect */}
                      <a href="/api/auth/instagram">
                        <RefreshCw className="h-3.5 w-3.5" />
                        Reconnect Now
                      </a>
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </FadeIn>
    </div>
  );
}

function SettingsRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-3.5">
      <p className="text-sm font-medium text-foreground">{label}</p>
      <p className="text-sm text-muted-foreground">{value}</p>
    </div>
  );
}
