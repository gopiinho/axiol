"use client";

import { useState, useEffect } from "react";
import { useMutation } from "convex/react";
import { useUser } from "@/features/auth/client/UserContext";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ExternalLink,
  Save,
  Instagram,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useInstagramConnection } from "@/features/instagram-mappings/hooks/useInstagramConnection";
import ConnectInstagramCTA from "@/features/instagram-mappings/components/ConnectInstagramCTA";

export default function SettingsPage() {
  const { user: profile, token } = useUser();
  const searchParams = useSearchParams();
  const ig = useInstagramConnection();
  const updateProfile = useMutation(api.users.updateProfile);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState<string | null>(null);
  const [bio, setBio] = useState<string | null>(null);
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

  const displayName = name ?? profile?.name ?? "";
  const displayBio = bio ?? profile?.bio ?? "";

  const handleSave = async () => {
    if (!token) return;
    setSaving(true);
    try {
      await updateProfile({
        token,
        name: displayName,
        bio: displayBio,
      });
      setName(null);
      setBio(null);
    } finally {
      setSaving(false);
    }
  };

  const hasChanges =
    (name !== null && name !== profile?.name) ||
    (bio !== null && bio !== profile?.bio);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Manage your profile and store settings.
        </p>
      </div>

      {igToast && (
        <div
          className={`flex items-center gap-2 rounded-lg border px-4 py-3 text-sm ${
            igToast.type === "success"
              ? "border-green-200 bg-green-50 text-green-800"
              : "border-red-200 bg-red-50 text-red-800"
          }`}
        >
          {igToast.type === "success" ? (
            <CheckCircle2 className="h-4 w-4 shrink-0" />
          ) : (
            <AlertTriangle className="h-4 w-4 shrink-0" />
          )}
          {igToast.message}
          <button
            onClick={() => setIgToast(null)}
            className="ml-auto text-current opacity-60 hover:opacity-100"
          >
            &times;
          </button>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Name</Label>
            <Input
              value={displayName}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
            />
          </div>

          <div className="space-y-2">
            <Label>Bio</Label>
            <Textarea
              value={displayBio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell people about yourself..."
              rows={3}
            />
          </div>

          <div className="flex items-center justify-between">
            <Button
              onClick={handleSave}
              disabled={saving || !hasChanges}
              className="gap-2"
            >
              <Save className="h-4 w-4" />
              {saving ? "Saving..." : "Save changes"}
            </Button>

            {profile?.username && (
              <Button asChild variant="outline" className="gap-2">
                <Link href={`/${profile.username}`} target="_blank">
                  <ExternalLink className="h-4 w-4" />
                  View your store
                </Link>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Username</p>
              <p className="text-sm text-muted-foreground">
                @{profile?.username}
              </p>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Email</p>
              <p className="text-sm text-muted-foreground">{profile?.email}</p>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Subscription</p>
              <p className="text-sm text-muted-foreground">
                {profile?.subscriptionStatus === "trial" && profile?.trialEndsAt
                  ? `Trial (ends ${new Date(profile.trialEndsAt).toLocaleDateString()})`
                  : (profile?.subscriptionStatus ?? "N/A")}
              </p>
            </div>
            <Badge variant="secondary">
              {profile?.subscriptionStatus ?? "N/A"}
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Instagram className="h-5 w-5" />
            Instagram
          </CardTitle>
        </CardHeader>
        <CardContent>
          {(ig.status === "not_connected" ||
            ig.status === "expired" ||
            ig.status === "loading") && (
            <ConnectInstagramCTA status={ig.status} className="py-8" />
          )}

          {ig.status === "connected" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">
                    {ig.instagramUsername
                      ? `@${ig.instagramUsername}`
                      : `Account ${ig.instagramAccountId}`}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Token expires{" "}
                    {ig.tokenExpiresAt
                      ? new Date(ig.tokenExpiresAt).toLocaleDateString()
                      : "N/A"}
                  </p>
                </div>
                <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                  Connected
                </Badge>
              </div>
              <Button variant="outline" asChild size="sm">
                {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- API route requires full redirect */}
                <a href="/api/auth/instagram">Reconnect</a>
              </Button>
            </div>
          )}

          {ig.status === "expiring_soon" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">
                    {ig.instagramUsername
                      ? `@${ig.instagramUsername}`
                      : `Account ${ig.instagramAccountId}`}
                  </p>
                  <p className="text-sm text-amber-600">
                    Token expiring soon (
                    {ig.tokenExpiresAt
                      ? new Date(ig.tokenExpiresAt).toLocaleDateString()
                      : "N/A"}
                    )
                  </p>
                </div>
                <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">
                  Expiring Soon
                </Badge>
              </div>
              <Button asChild size="sm">
                {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- API route requires full redirect */}
                <a href="/api/auth/instagram">Reconnect</a>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
