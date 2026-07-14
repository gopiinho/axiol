"use client";

import { useState } from "react";
import { Trash2, Loader2, AlertCircle } from "lucide-react";
import { useUser } from "@/features/auth/client/UserContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQueryParam } from "@/lib/hooks/useQueryParam";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useIntegrations } from "@/features/integrations/hooks/useIntegrations";
import IntegrationCard from "@/features/integrations/components/IntegrationCard";
import type { IntegrationDefinition } from "@/features/integrations/types";

const INTEGRATION_DEFINITIONS: IntegrationDefinition[] = [
  {
    provider: "instagram",
    name: "Instagram",
    description: "Automate DM replies to reel comments",
    icon: "/icons/instagram-icon.svg",
    connectUrl: "/api/auth/instagram",
    brandColor: "from-[#833AB4] via-[#E1306C] to-[#F77737]",
  },
  {
    provider: "google_calendar",
    name: "Google Calendar",
    description: "Sync bookings and appointments",
    icon: "/icons/google-calendar.svg",
    connectUrl: "#",
    brandColor: "from-blue-500 to-blue-600",
  },
];

export default function SettingsPage() {
  const { user: profile } = useUser();
  const { integrations } = useIntegrations();

  const [tab, setTab] = useQueryParam("tab", "general");

  const subscriptionLabel =
    profile?.subscriptionStatus === "trial" && profile?.trialEndsAt
      ? `Trial — ends ${new Date(profile.trialEndsAt).toLocaleDateString()}`
      : (profile?.subscriptionStatus ?? "N/A");

  return (
    <div className="px-5 pt-6 lg:px-6 lg:pt-8">
      <div className="mx-auto max-w-xl">
        <h1 className="app-title">Settings</h1>
        <p className="app-subtitle mt-1">Your account and connected services.</p>
      </div>

      <div className="mx-auto mt-6 max-w-xl">
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList
            variant="line"
            className="border-border/70 w-full justify-start gap-0 rounded-none border-b p-0"
          >
            <TabsTrigger
              value="general"
              className="rounded-none px-3 py-2.5 text-sm data-[state=active]:shadow-none sm:px-4"
            >
              General
            </TabsTrigger>
            <TabsTrigger
              value="integrations"
              className="rounded-none px-3 py-2.5 text-sm data-[state=active]:shadow-none sm:px-4"
            >
              Integrations
            </TabsTrigger>
            <TabsTrigger
              value="advanced"
              className="rounded-none px-3 py-2.5 text-sm data-[state=active]:shadow-none sm:px-4"
            >
              Advanced
            </TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="pt-6">
            <GeneralTab profile={profile} subscriptionLabel={subscriptionLabel} />
          </TabsContent>

          <TabsContent value="integrations" className="pt-6">
            <IntegrationsTab integrations={integrations} />
          </TabsContent>

          <TabsContent value="advanced" className="pt-6">
            <AdvancedTab username={profile?.username} />
          </TabsContent>
        </Tabs>
      </div>
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
      <SectionHeader title="Account" description="Your account details and subscription status." />

      <div className="app-panel divide-border/70 divide-y">
        <SettingsRow label="Username" value={`@${profile?.username ?? ""}`} />
        <SettingsRow label="Email" value={profile?.email ?? ""} />
        <div className="flex items-center justify-between px-4 py-3.5">
          <div>
            <p className="text-foreground text-sm font-medium">Subscription</p>
            <p className="text-muted-foreground mt-0.5 text-xs">{subscriptionLabel}</p>
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
  integrations,
}: {
  integrations: ReturnType<typeof useIntegrations>["integrations"];
}) {
  return (
    <div className="space-y-5">
      <SectionHeader
        title="Connected Services"
        description="Manage your connected accounts and integrations."
      />

      <div className="grid gap-4">
        {INTEGRATION_DEFINITIONS.map((def) => (
          <IntegrationCard
            key={def.provider}
            definition={def}
            integration={integrations.find((i) => i.provider === def.provider)}
          />
        ))}
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

      <div className="border-destructive/20 bg-destructive/9 rounded-xs border p-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0 space-y-1">
            <p className="text-foreground text-sm font-semibold">Delete Account</p>
            <p className="text-muted-foreground text-xs leading-relaxed">
              Permanently delete your account and all associated data. This cannot be undone.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive shrink-0"
            disabled
          >
            <Trash2 className="h-3.5 w-3.5" />
            Coming soon
          </Button>
        </div>
      </div>

      <DeleteAccountDialog open={deleteOpen} onOpenChange={setDeleteOpen} username={username} />
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
      const res = await fetch("/api/account/delete", { method: "POST" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to delete account");
      }
      window.location.href = "/login";
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to delete account";
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
          <DialogTitle className="text-destructive flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Delete Account
          </DialogTitle>
          <DialogDescription className="text-left">
            This will permanently delete your account and all associated data including collections,
            items, Instagram configurations, automation mappings, and all logs. This action is
            irreversible.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 pt-1">
          <p className="text-muted-foreground text-sm">
            To confirm, type{" "}
            <span className="bg-muted text-foreground rounded-md px-1.5 py-0.5 font-mono text-xs select-all">
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
          <div className="border-destructive/25 bg-destructive/8 text-destructive rounded-xl border px-3 py-2 text-sm">
            {error}
          </div>
        )}

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={isDeleting}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={!isConfirmed || isDeleting}
          >
            {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
            Delete Account
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function SectionHeader({ title, description }: { title: string; description: string }) {
  return (
    <div>
      <h2 className="text-foreground text-sm font-semibold">{title}</h2>
      <p className="text-muted-foreground mt-0.5 text-xs">{description}</p>
    </div>
  );
}

function SettingsRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between px-4 py-3.5">
      <p className="text-foreground text-sm font-medium">{label}</p>
      <p className="text-muted-foreground ml-4 truncate text-sm">{value}</p>
    </div>
  );
}
