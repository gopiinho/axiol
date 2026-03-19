"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Instagram,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Shield,
  Clock,
  Trash2,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@/features/auth/client/UserContext";
import { useInstagramConnection } from "@/features/instagram-mappings/hooks/useInstagramConnection";
import { authClient } from "@/lib/auth-client";
import ConnectInstagramCTA from "@/features/instagram-mappings/components/ConnectInstagramCTA";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FadeIn } from "@/components/motion/FadeIn";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function SettingsPage() {
  const { user: profile } = useUser();
  const ig = useInstagramConnection();

  const subscriptionLabel =
    profile?.subscriptionStatus === "trial" && profile?.trialEndsAt
      ? `Trial — ends ${new Date(profile.trialEndsAt).toLocaleDateString()}`
      : (profile?.subscriptionStatus ?? "N/A");

  return (
    <div className="px-5 py-6 lg:px-6 lg:py-8">
      <FadeIn>
        <div className="mx-auto max-w-xl">
          <h1 className="app-title">Settings</h1>
          <p className="app-subtitle mt-1">
            Your account and connected services.
          </p>
        </div>
      </FadeIn>

      <FadeIn delay={0.06}>
        <div className="mx-auto max-w-xl mt-6">
          <Tabs defaultValue="general">
            <TabsList
              variant="line"
              className="w-full justify-start gap-0 border-b border-border/70 rounded-none p-0"
            >
              <TabsTrigger
                value="general"
                className="rounded-none px-3 sm:px-4 py-2.5 text-sm data-[state=active]:shadow-none"
              >
                General
              </TabsTrigger>
              <TabsTrigger
                value="integrations"
                className="rounded-none px-3 sm:px-4 py-2.5 text-sm data-[state=active]:shadow-none"
              >
                Integrations
              </TabsTrigger>
              <TabsTrigger
                value="advanced"
                className="rounded-none px-3 sm:px-4 py-2.5 text-sm data-[state=active]:shadow-none"
              >
                Advanced
              </TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="pt-6">
              <GeneralTab
                profile={profile}
                subscriptionLabel={subscriptionLabel}
              />
            </TabsContent>

            <TabsContent value="integrations" className="pt-6">
              <IntegrationsTab ig={ig} />
            </TabsContent>

            <TabsContent value="advanced" className="pt-6">
              <AdvancedTab username={profile?.username} />
            </TabsContent>
          </Tabs>
        </div>
      </FadeIn>
    </div>
  );
}

function GeneralTab({
  profile,
  subscriptionLabel,
}: {
  profile: ReturnType<typeof useUser>["user"];
  subscriptionLabel: string;
}) {
  return (
    <div className="space-y-5">
      <SectionHeader
        title="Account"
        description="Your account details and subscription status."
      />

      <div className="app-panel divide-y divide-border/70">
        <SettingsRow label="Username" value={`@${profile?.username ?? ""}`} />
        <SettingsRow label="Email" value={profile?.email ?? ""} />
        <div className="flex items-center justify-between px-4 py-3.5">
          <div>
            <p className="text-sm font-medium text-foreground">Subscription</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {subscriptionLabel}
            </p>
          </div>
          <Badge variant="secondary" className="capitalize">
            {profile?.subscriptionStatus ?? "N/A"}
          </Badge>
        </div>
      </div>
    </div>
  );
}

function IntegrationsTab({
  ig,
}: {
  ig: ReturnType<typeof useInstagramConnection>;
}) {
  return (
    <div className="space-y-5">
      <SectionHeader
        title="Connected Services"
        description="Manage your connected social accounts."
      />

      <div className="app-panel p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#833AB4] via-[#E1306C] to-[#F77737]">
            <Instagram className="h-5 w-5 text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-foreground">Instagram</p>
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
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center justify-center gap-1">
                  <p className="text-sm font-medium text-foreground">
                    {ig.instagramUsername
                      ? `@${ig.instagramUsername}`
                      : `Account ${ig.instagramAccountId}`}
                  </p>
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
              </div>

              <Button variant="outline" size="sm" asChild className="gap-1.5">
                {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- API route requires full redirect */}
                <a href="/api/auth/instagram">
                  <RefreshCw className="h-3.5 w-3.5" />
                  Reconnect
                </a>
              </Button>
            </div>
          )}

          {ig.status === "expiring_soon" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-medium text-foreground">
                  {ig.instagramUsername
                    ? `@${ig.instagramUsername}`
                    : `Account ${ig.instagramAccountId}`}
                </p>
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
  );
}

function AdvancedTab({ username }: { username?: string }) {
  const [deleteOpen, setDeleteOpen] = useState(false);

  return (
    <div className="space-y-5">
      <SectionHeader
        title="Danger Zone"
        description="Irreversible actions that permanently affect your account."
      />

      <div className="rounded-2xl border border-destructive/20 bg-destructive/[0.03] p-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1 min-w-0">
            <p className="text-sm font-semibold text-foreground">
              Delete Account
            </p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Permanently delete your account and all associated data. This
              cannot be undone.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="shrink-0 border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive"
            onClick={() => setDeleteOpen(true)}
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete Account
          </Button>
        </div>
      </div>

      <DeleteAccountDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        username={username}
      />
    </div>
  );
}

function DeleteAccountDialog({
  open,
  onOpenChange,
  username,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  username?: string;
}) {
  const router = useRouter();
  const deleteAccount = useMutation(api.users.deleteAccount);
  const [confirmText, setConfirmText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState("");

  const expectedText = `delete ${username ?? "my account"}`;
  const isConfirmed = confirmText.toLowerCase() === expectedText.toLowerCase();

  const handleDelete = async () => {
    if (!isConfirmed) return;
    setError("");
    setIsDeleting(true);

    try {
      await deleteAccount();
      await authClient.signOut();
      router.replace("/login");
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Failed to delete account";
      setError(msg);
      setIsDeleting(false);
    }
  };

  const handleOpenChange = (next: boolean) => {
    if (isDeleting) return;
    if (!next) {
      setConfirmText("");
      setError("");
    }
    onOpenChange(next);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent showCloseButton={!isDeleting}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
            Delete Account
          </DialogTitle>
          <DialogDescription className="text-left">
            This will permanently delete your account and all associated data
            including collections, items, Instagram configurations, automation
            mappings, and all logs. This action is irreversible.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 pt-1">
          <p className="text-sm text-muted-foreground">
            To confirm, type{" "}
            <span className="font-mono text-xs rounded-md bg-muted px-1.5 py-0.5 text-foreground select-all">
              {expectedText}
            </span>{" "}
            below:
          </p>
          <Input
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder={expectedText}
            disabled={isDeleting}
            className="font-mono text-sm"
            autoComplete="off"
            spellCheck={false}
          />
        </div>

        {error && (
          <div className="rounded-xl border border-destructive/25 bg-destructive/8 px-3 py-2 text-sm text-destructive">
            {error}
          </div>
        )}

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={!isConfirmed || isDeleting}
          >
            {isDeleting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4" />
                Delete Account
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function SectionHeader({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div>
      <h2 className="text-sm font-semibold text-foreground">{title}</h2>
      <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
    </div>
  );
}

function SettingsRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between px-4 py-3.5">
      <p className="text-sm font-medium text-foreground">{label}</p>
      <p className="text-sm text-muted-foreground truncate ml-4">{value}</p>
    </div>
  );
}
