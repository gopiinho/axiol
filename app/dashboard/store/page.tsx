"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useQuery, useMutation } from "convex/react";
import {
  ArrowUpRight,
  Check,
  ExternalLink,
  EyeOff,
  Globe,
  Instagram,
  Pencil,
  Settings2,
  Sparkles,
  Trash2,
  X,
  Youtube,
} from "lucide-react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useUser } from "@/features/auth/client/UserContext";
import { useCachedQueryResult } from "@/lib/hooks/useCachedQueryResult";
import { FadeIn } from "@/components/motion/FadeIn";
import {
  AnimatedList,
  AnimatedListItem,
} from "@/components/motion/AnimatedList";
import { StorePreview } from "@/components/StorePreview";
import { EditProfile } from "@/components/EditProfile";
import { themes, themeKeys, type ThemeKey } from "@/lib/themes";

const ACCENT_PRESETS = [
  { label: "Pink", value: "oklch(0.65 0.2 340)" },
  { label: "Blue", value: "oklch(0.52 0.2 254)" },
  { label: "Purple", value: "oklch(0.55 0.2 300)" },
  { label: "Green", value: "oklch(0.6 0.18 155)" },
  { label: "Orange", value: "oklch(0.65 0.18 50)" },
  { label: "Red", value: "oklch(0.55 0.22 25)" },
  { label: "Teal", value: "oklch(0.6 0.15 195)" },
  { label: "Yellow", value: "oklch(0.8 0.15 90)" },
];

export default function MyStorePage() {
  const { user } = useUser();
  const rawMappings = useQuery(api.instagram.getPublishedMappings, {
    limit: 24,
  });
  const publishedMappings = useCachedQueryResult("store:mappings", rawMappings);
  const rawCollections = useQuery(api.collections.listByUser);
  const collections = useCachedQueryResult("store:collections", rawCollections);
  const updateProfile = useMutation(api.users.updateProfile);
  const deleteMapping = useMutation(api.instagram.deleteReelMapping);
  const toggleMapping = useMutation(api.instagram.toggleReelMapping);

  const [deleteTarget, setDeleteTarget] = useState<Id<"reelMappings"> | null>(
    null,
  );
  const [unpublishTarget, setUnpublishTarget] =
    useState<Id<"reelMappings"> | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUnpublishing, setIsUnpublishing] = useState(false);
  const [isManaging, setIsManaging] = useState(false);

  const [editOpen, setEditOpen] = useState(false);
  const [storeName, setStoreName] = useState("");
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [instagramUrl, setInstagramUrl] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [saving, setSaving] = useState(false);

  const [selectedTheme, setSelectedTheme] = useState<ThemeKey>(
    (user?.theme as ThemeKey) ?? "default",
  );
  const [selectedAccent, setSelectedAccent] = useState(user?.accentColor ?? "");
  const [themeDirty, setThemeDirty] = useState(false);
  const [themeSaving, setThemeSaving] = useState(false);

  const profileImageUrl = user?.profileImageUrl ?? user?.avatarUrl ?? null;

  const currentTheme = (user?.theme as ThemeKey) ?? "default";
  const currentAccent = user?.accentColor ?? "";
  if (
    !themeDirty &&
    (selectedTheme !== currentTheme || selectedAccent !== currentAccent)
  ) {
    setSelectedTheme(currentTheme);
    setSelectedAccent(currentAccent);
  }

  const openEditModal = () => {
    setStoreName(user?.storeName ?? "");
    setName(user?.name ?? "");
    setBio(user?.bio ?? "");
    setInstagramUrl(user?.instagramUrl ?? "");
    setYoutubeUrl(user?.youtubeUrl ?? "");
    setWebsiteUrl(user?.websiteUrl ?? "");
    setEditOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateProfile({
        name,
        bio,
        instagramUrl,
        youtubeUrl,
        websiteUrl,
        storeName,
        theme: selectedTheme,
        accentColor: selectedAccent,
      });
      setThemeDirty(false);
      setEditOpen(false);
    } catch (error) {
      console.error("Failed to save profile:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleThemeSave = async () => {
    setThemeSaving(true);
    try {
      await updateProfile({
        theme: selectedTheme,
        accentColor: selectedAccent,
      });
      setThemeDirty(false);
    } catch (error) {
      console.error("Failed to save theme:", error);
    } finally {
      setThemeSaving(false);
    }
  };

  const handleThemeChange = (key: ThemeKey) => {
    setSelectedTheme(key);
    setThemeDirty(true);
  };

  const handleAccentChange = (value: string) => {
    setSelectedAccent(value);
    setThemeDirty(true);
  };

  const handleDelete = async (id: Id<"reelMappings">) => {
    try {
      setIsDeleting(true);
      await deleteMapping({ id });
    } finally {
      setDeleteTarget(null);
      setIsDeleting(false);
    }
  };

  const handleUnpublish = async (id: Id<"reelMappings">) => {
    try {
      setIsUnpublishing(true);
      await toggleMapping({ id });
    } finally {
      setUnpublishTarget(null);
      setIsUnpublishing(false);
    }
  };

  const publicUrl = user?.username
    ? `${typeof window !== "undefined" ? window.location.origin : ""}/${user.username}`
    : "";

  const formatDisplayUrl = (url: string) =>
    url.replace(/^https?:\/\//, "").replace(/\/+$/, "");

  const socialLinks = [
    {
      url: user?.instagramUrl
        ? `https://instagram.com/${user.instagramUrl}`
        : undefined,
      icon: Instagram,
      label: "Instagram",
    },
    {
      url: user?.youtubeUrl
        ? `https://youtube.com/@${user.youtubeUrl}`
        : undefined,
      icon: Youtube,
      label: "YouTube",
    },
    { url: user?.websiteUrl, icon: Globe, label: "Website" },
  ].filter((link) => link.url);

  const storeSocialLinks = [
    user?.instagramUrl
      ? {
          url: `https://instagram.com/${user.instagramUrl}`,
          icon: "instagram" as const,
          label: "Instagram",
          display: `@${user.instagramUrl.replace(/^@/, "")}`,
        }
      : null,
    user?.youtubeUrl
      ? {
          url: `https://youtube.com/@${user.youtubeUrl}`,
          icon: "youtube" as const,
          label: "YouTube",
          display: `@${user.youtubeUrl.replace(/^@/, "")}`,
        }
      : null,
    user?.websiteUrl
      ? {
          url: user.websiteUrl.startsWith("http")
            ? user.websiteUrl
            : `https://${user.websiteUrl}`,
          icon: "globe" as const,
          label: "Website",
          display: formatDisplayUrl(user.websiteUrl),
        }
      : null,
  ].filter(Boolean) as {
    url: string;
    icon: "instagram" | "youtube" | "globe";
    label: string;
    display: string;
  }[];

  const displayName = user?.storeName || user?.name || "";

  return (
    <>
      <div className="flex w-full min-h-screen">
        <div className="w-full lg:min-w-[60%] lg:border-r border-border/70">
          <FadeIn>
            <div className="flex max-lg:flex-col lg:flex items-center justify-center lg:items-start gap-4 px-5 lg:px-6 py-6 lg:py-8">
              <div className="h-24 w-24 overflow-hidden border-2 border-border/25 bg-linear-to-br from-primary/15 to-pink/15 p-0.5">
                <div className="h-full w-full overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={
                      profileImageUrl ??
                      `https://api.dicebear.com/9.x/avataaars/svg?seed=${user?.username ?? "creator"}`
                    }
                    alt="Avatar"
                    className="h-full w-full object-cover"
                  />
                </div>
              </div>

              <div className="grid lg:flex justify-center lg:justify-between items-center lg:items-start w-full">
                <div className="flex flex-col items-center justify-center lg:items-start">
                  <h1 className="font-accent text-xl font-extrabold tracking-tight">
                    {displayName}
                  </h1>

                  <p className="text-xs text-muted-foreground">
                    @{user?.username}
                  </p>

                  {user?.bio && (
                    <p className="mt-2 max-w-sm text-center text-sm text-muted-foreground">
                      {user.bio}
                    </p>
                  )}

                  {socialLinks.length > 0 && (
                    <div className="mt-3 flex items-center gap-3">
                      {socialLinks.map((link) => {
                        const Icon = link.icon;
                        return (
                          <a
                            key={link.label}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded-lg p-2 text-muted-foreground transition hover:bg-secondary hover:text-foreground"
                            aria-label={link.label}
                          >
                            <Icon className="h-4.5 w-4.5" />
                          </a>
                        );
                      })}
                    </div>
                  )}
                </div>
                <div className="flex items-start justify-center h-full max-lg:mt-8 gap-2">
                  {publicUrl && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-1.5"
                      asChild
                    >
                      <Link href={`/${user?.username}`} target="_blank">
                        <ExternalLink className="h-3.5 w-3.5" />
                        Visit Store
                      </Link>
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={openEditModal}
                    className="gap-1.5"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    Edit Store
                  </Button>
                </div>
              </div>
            </div>
          </FadeIn>

          <div className="border-t border-border/70" />

          <FadeIn delay={0.1}>
            {publishedMappings && publishedMappings.length > 0 ? (
              <>
                <div className="flex items-center justify-end px-3 py-2">
                  <button
                    type="button"
                    onClick={() => setIsManaging((v) => !v)}
                    className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition ${
                      isManaging
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {isManaging ? (
                      <>
                        <X className="h-3 w-3" />
                        Done
                      </>
                    ) : (
                      <>
                        <Settings2 className="h-3 w-3" />
                        Manage
                      </>
                    )}
                  </button>
                </div>
                <AnimatedList className="grid grid-cols-3 gap-1">
                  {publishedMappings.map((mapping) => (
                    <AnimatedListItem key={mapping._id}>
                      <div className="relative block">
                        {isManaging ? (
                          <div className="relative aspect-square overflow-hidden bg-secondary/40">
                            {mapping.thumbnailUrl ? (
                              <Image
                                src={mapping.thumbnailUrl}
                                alt={mapping.sectionTitle}
                                fill
                                className="object-cover brightness-50"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-primary/20 to-pink-400/20" />
                            )}

                            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                              <button
                                type="button"
                                onClick={() => setUnpublishTarget(mapping._id)}
                                className="flex items-center gap-1.5 rounded-lg bg-white/20 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-sm transition active:bg-white/30"
                              >
                                <EyeOff className="h-3.5 w-3.5" />
                                Unpublish
                              </button>
                              <button
                                type="button"
                                onClick={() => setDeleteTarget(mapping._id)}
                                className="flex items-center gap-1.5 rounded-lg bg-destructive/80 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-sm transition active:bg-destructive"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                                Delete
                              </button>
                            </div>

                            <div className="absolute bottom-1.5 left-1.5">
                              <Badge className="border-0 bg-black/50 px-1.5 py-0.5 text-[10px] text-white backdrop-blur-sm">
                                {mapping.keyword}
                              </Badge>
                            </div>
                          </div>
                        ) : (
                          <a
                            href={mapping.reelUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group block"
                          >
                            <div className="relative aspect-square overflow-hidden bg-secondary/40">
                              {mapping.thumbnailUrl ? (
                                <Image
                                  src={mapping.thumbnailUrl}
                                  alt={mapping.sectionTitle}
                                  fill
                                  className="object-cover transition duration-300 group-hover:scale-[1.03]"
                                />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-primary/20 to-pink-400/20">
                                  <Sparkles className="h-6 w-6 text-muted-foreground/50" />
                                </div>
                              )}

                              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/0 transition group-hover:bg-black/40">
                                <div className="flex items-center gap-1 opacity-0 transition group-hover:opacity-100">
                                  <ArrowUpRight className="h-4 w-4 text-white" />
                                  <span className="text-xs font-medium text-white">
                                    Open Reel
                                  </span>
                                </div>
                              </div>

                              <div className="absolute bottom-1.5 left-1.5">
                                <Badge className="border-0 bg-black/50 px-1.5 py-0.5 text-[10px] text-white backdrop-blur-sm">
                                  {mapping.keyword}
                                </Badge>
                              </div>
                            </div>
                          </a>
                        )}
                      </div>
                    </AnimatedListItem>
                  ))}
                </AnimatedList>
              </>
            ) : (
              <div className="flex flex-1 flex-col items-center justify-center py-20 text-center">
                <Sparkles className="mx-auto h-10 w-10 text-primary" />
                <p className="mt-4 text-sm text-muted-foreground">
                  No active product yet. Let&apos;s publish one to get started.
                </p>
                <Button className="mt-5">
                  <Link href="/dashboard/create">Create a product</Link>
                </Button>
              </div>
            )}
          </FadeIn>
        </div>

        <div className="hidden lg:flex flex-col items-center sticky top-0 w-full h-screen overflow-y-auto">
          <FadeIn delay={0.15} className="w-full h-full">
            <div className="flex flex-col h-full items-center justify-between gap-4 py-6 px-6 w-full">
              <div className="w-full space-y-4">
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <p className="text-xs mb-2 font-semibold text-muted-foreground">
                      Theme
                    </p>
                    <div className="grid grid-cols-5 gap-1.5">
                      {themeKeys.map((key) => {
                        const theme = themes[key];
                        const isSelected = selectedTheme === key;
                        return (
                          <button
                            key={key}
                            type="button"
                            onClick={() => handleThemeChange(key)}
                            className={`relative flex flex-col cursor-pointer items-center gap-1 rounded-lg border p-1.5 transition ${
                              isSelected
                                ? "border-primary bg-primary/5"
                                : "border-border/50 hover:border-border"
                            }`}
                          >
                            <div
                              className="h-6 w-full rounded-md border"
                              style={{
                                backgroundColor: theme.vars["--store-bg"],
                                borderColor: theme.vars["--store-border"],
                              }}
                            >
                              <div
                                className="mx-auto mt-1 h-2.5 w-[60%] rounded-sm"
                                style={{
                                  backgroundColor:
                                    theme.vars["--store-card-bg"],
                                }}
                              />
                            </div>
                            <span className="text-[9px] font-medium">
                              {theme.label}
                            </span>
                            {isSelected && (
                              <div className="absolute -right-1 -top-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                                <Check className="h-2 w-2" />
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="flex items-end gap-3">
                  <div className="flex-1">
                    <p className="text-xs mb-2 font-semibold text-muted-foreground">
                      Accent color
                    </p>
                    <div className="flex gap-2">
                      {ACCENT_PRESETS.map((preset) => {
                        const isSelected = selectedAccent === preset.value;
                        return (
                          <button
                            key={preset.label}
                            type="button"
                            onClick={() =>
                              handleAccentChange(isSelected ? "" : preset.value)
                            }
                            className={`relative h-7 w-7 shrink-0 rounded-sm border-2 cursor-pointer transition ${
                              isSelected
                                ? "border-foreground scale-110"
                                : "border-transparent hover:scale-105"
                            }`}
                            style={{ backgroundColor: preset.value }}
                            aria-label={preset.label}
                            title={preset.label}
                          >
                            {isSelected && (
                              <Check className="absolute inset-0 m-auto h-3 w-3 text-white drop-shadow-sm" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  {themeDirty && (
                    <Button
                      size="sm"
                      onClick={handleThemeSave}
                      disabled={themeSaving}
                      className="shrink-0 rounded-full"
                    >
                      {themeSaving ? "Saving..." : "Save theme"}
                    </Button>
                  )}
                </div>
              </div>

              <StorePreview
                displayName={displayName}
                bio={user?.bio}
                profileImageUrl={user?.profileImageUrl}
                coverImageUrl={user?.coverImageUrl}
                publicUrl={publicUrl}
                username={user?.username ?? ""}
                theme={selectedTheme}
                accentColor={selectedAccent}
                collections={collections ?? []}
                socialLinks={storeSocialLinks}
              />
            </div>
          </FadeIn>
        </div>
      </div>

      <AlertDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this post?</AlertDialogTitle>
            <AlertDialogDescription>
              This removes the post permanently and cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-white hover:bg-destructive/90"
              onClick={() => deleteTarget && handleDelete(deleteTarget)}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete post"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={unpublishTarget !== null}
        onOpenChange={(open) => !open && setUnpublishTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unpublish this post?</AlertDialogTitle>
            <AlertDialogDescription>
              Auto-DMs will stop and the post will move back to drafts.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isUnpublishing}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                unpublishTarget && handleUnpublish(unpublishTarget)
              }
              disabled={isUnpublishing}
            >
              {isUnpublishing ? "Unpublishing..." : "Unpublish"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <EditProfile
        open={editOpen}
        onOpenChange={setEditOpen}
        user={user}
        storeName={storeName}
        setStoreName={setStoreName}
        name={name}
        setName={setName}
        bio={bio}
        setBio={setBio}
        instagramUrl={instagramUrl}
        setInstagramUrl={setInstagramUrl}
        youtubeUrl={youtubeUrl}
        setYoutubeUrl={setYoutubeUrl}
        websiteUrl={websiteUrl}
        setWebsiteUrl={setWebsiteUrl}
        saving={saving}
        onSave={handleSave}
        selectedTheme={selectedTheme}
        selectedAccent={selectedAccent}
        onThemeChange={handleThemeChange}
        onAccentChange={handleAccentChange}
      />
    </>
  );
}
