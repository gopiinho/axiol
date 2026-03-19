"use client";

import {
  Instagram,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Shield,
  Clock,
} from "lucide-react";
import { useUser } from "@/features/auth/client/UserContext";
import { useInstagramConnection } from "@/features/instagram-mappings/hooks/useInstagramConnection";
import ConnectInstagramCTA from "@/features/instagram-mappings/components/ConnectInstagramCTA";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FadeIn } from "@/components/motion/FadeIn";

export default function SettingsPage() {
  const { user: profile } = useUser();
  const ig = useInstagramConnection();

  const subscriptionLabel =
    profile?.subscriptionStatus === "trial" && profile?.trialEndsAt
      ? `Trial — ends ${new Date(profile.trialEndsAt).toLocaleDateString()}`
      : (profile?.subscriptionStatus ?? "N/A");

  return (
    <div>
      <FadeIn>
        <section className="px-5 py-6 lg:px-6 lg:py-8">
          <h1 className="app-title">Settings</h1>
          <p className="app-subtitle">Your account and connected services.</p>
        </section>
      </FadeIn>

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
        <section className="px-5 lg:px-6 pb-10">
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
                    Automate DM replies to reel comments
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
