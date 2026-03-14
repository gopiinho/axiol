"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import Link from "next/link";
import { ExternalLink, Save } from "lucide-react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { getAdminSessionToken } from "@/features/auth/client/session";

export default function SettingsPage() {
  const token = getAdminSessionToken();
  const profile = useQuery(api.users.getProfile, token ? { token } : "skip");
  const updateProfile = useMutation(api.users.updateProfile);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState<string | null>(null);
  const [bio, setBio] = useState<string | null>(null);

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
            <Button onClick={handleSave} disabled={saving || !hasChanges} className="gap-2">
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
              <p className="text-sm text-muted-foreground">@{profile?.username}</p>
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
                  : profile?.subscriptionStatus ?? "N/A"}
              </p>
            </div>
            <Badge variant="secondary">
              {profile?.subscriptionStatus ?? "N/A"}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
