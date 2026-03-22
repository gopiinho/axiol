"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useQuery, useMutation } from "convex/react";
import {
  ArrowUpRight,
  Check,
  ExternalLink,
  Globe,
  ImageIcon,
  Instagram,
  Pencil,
  Sparkles,
  Youtube,
} from "lucide-react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useUser } from "@/features/auth/client/UserContext";
import { useCachedQueryResult } from "@/lib/hooks/useCachedQueryResult";
import { FadeIn } from "@/components/motion/FadeIn";
import {
  AnimatedList,
  AnimatedListItem,
} from "@/components/motion/AnimatedList";
import { ImageUpload } from "@/components/ImageUpload";
import { StorePreview } from "@/components/StorePreview";
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
  const saveProfileImage = useMutation(api.storage.saveProfileImage);
  const saveCoverImage = useMutation(api.storage.saveCoverImage);
  const removeProfileImage = useMutation(api.storage.removeProfileImage);
  const removeCoverImage = useMutation(api.storage.removeCoverImage);

  const [editOpen, setEditOpen] = useState(false);
  const [storeName, setStoreName] = useState("");
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [instagramUrl, setInstagramUrl] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [saving, setSaving] = useState(false);

  // Theme state — lives in store page so both desktop editor + mobile dialog can use it
  const [selectedTheme, setSelectedTheme] = useState<ThemeKey>(
    (user?.theme as ThemeKey) ?? "default",
  );
  const [selectedAccent, setSelectedAccent] = useState(user?.accentColor ?? "");
  const [themeDirty, setThemeDirty] = useState(false);
  const [themeSaving, setThemeSaving] = useState(false);

  const profileImageUrl = user?.profileImageUrl ?? user?.avatarUrl ?? null;

  // Sync theme state when user data loads/changes
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

  const publicUrl = user?.username
    ? `${typeof window !== "undefined" ? window.location.origin : ""}/${user.username}`
    : "";

  const socialLinks = [
    { url: user?.instagramUrl, icon: Instagram, label: "Instagram" },
    { url: user?.youtubeUrl, icon: Youtube, label: "YouTube" },
    { url: user?.websiteUrl, icon: Globe, label: "Website" },
  ].filter((link) => link.url);

  const displayName = user?.storeName || user?.name || "";

  return (
    <>
      <div className="flex w-full min-h-screen">
        <div className="w-full lg:min-w-[60%] lg:border-r border-border/70">
          <FadeIn>
            <div className="flex max-lg:flex-col lg:flex items-center justify-center lg:items-start gap-4 px-5 lg:px-6 py-6 lg:py-8">
              <div className="h-24 w-24 overflow-hidden rounded-xl border-2 border-primary/25 bg-linear-to-br from-primary/15 to-pink/15 p-0.5 shadow-[0_4px_16px_-6px_oklch(0.5_0.22_254/0.2)]">
                <div className="h-full w-full overflow-hidden rounded-full">
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
                <div className="flex items-start h-full max-lg:mt-8 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={openEditModal}
                    className="gap-1.5"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    Edit Store
                  </Button>
                  {publicUrl && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1.5 xl:hidden"
                      asChild
                    >
                      <Link href={`/${user?.username}`} target="_blank">
                        <ExternalLink className="h-3.5 w-3.5" />
                        View Store
                      </Link>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </FadeIn>

          <div className="border-t border-border/70" />

          <FadeIn delay={0.1}>
            {publishedMappings && publishedMappings.length > 0 ? (
              <AnimatedList className="grid grid-cols-3 gap-1">
                {publishedMappings.map((mapping) => (
                  <AnimatedListItem key={mapping._id}>
                    <a
                      href={mapping.reelUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group relative block"
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
                          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/20 to-pink-400/20">
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
                  </AnimatedListItem>
                ))}
              </AnimatedList>
            ) : (
              <div className="flex flex-1 flex-col items-center justify-center py-20 text-center">
                <Sparkles className="mx-auto h-10 w-10 text-muted-foreground/30" />
                <p className="mt-4 text-sm text-muted-foreground">
                  No active posts yet. Let's publish one to get started.
                </p>
                <Button asChild variant="outline" size="sm" className="mt-5">
                  <Link href="/dashboard/create">Create a post</Link>
                </Button>
              </div>
            )}
          </FadeIn>
        </div>

        <div className="hidden lg:flex flex-col items-center sticky top-0 w-full h-screen overflow-y-auto">
          <FadeIn delay={0.15}>
            <div className="flex flex-col h-full items-center justify-between gap-5 py-6 px-4 w-full max-w-md">
              <div className="flex w-full justify-between gap-3">
                <div>
                  <p className="text-xs mb-1 font-semibold text-muted-foreground">
                    Theme
                  </p>
                  <div className="grid grid-cols-3 gap-1.5">
                    {themeKeys.map((key) => {
                      const theme = themes[key];
                      const isSelected = selectedTheme === key;
                      return (
                        <button
                          key={key}
                          type="button"
                          onClick={() => handleThemeChange(key)}
                          className={`relative flex flex-col items-center gap-1 rounded-lg border-2 p-1.5 transition ${
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
                                backgroundColor: theme.vars["--store-card-bg"],
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

                <div className="grid flex-col justify-between h-full">
                  <div className="flex flex-col">
                    <p className="text-xs mb-1 font-semibold text-muted-foreground">
                      Accent color
                    </p>
                    <div className="grid grid-cols-4 gap-1.5">
                      {ACCENT_PRESETS.map((preset) => {
                        const isSelected = selectedAccent === preset.value;
                        return (
                          <button
                            key={preset.label}
                            type="button"
                            onClick={() =>
                              handleAccentChange(isSelected ? "" : preset.value)
                            }
                            className={`relative mx-auto h-7 w-7 rounded-full border-2 transition ${
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
                  <>
                    {themeDirty && (
                      <Button
                        onClick={handleThemeSave}
                        disabled={themeSaving}
                        className="w-full rounded-full"
                      >
                        {themeSaving ? "Saving..." : "Save theme"}
                      </Button>
                    )}
                  </>
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
                collections={collections}
              />
            </div>
          </FadeIn>
        </div>
      </div>

      {/* Edit dialog — images + profile info (theme only on mobile) */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent
          showCloseButton={false}
          className="max-w-2xl gap-0 overflow-hidden p-0"
        >
          <DialogHeader className="flex-row items-center justify-between border-b border-border/70 px-5 py-3.5">
            <DialogTitle className="text-lg font-semibold">
              Edit store
            </DialogTitle>
            <Button
              size="sm"
              onClick={handleSave}
              disabled={saving}
              className="rounded-full px-5"
            >
              {saving ? "Saving..." : "Save"}
            </Button>
          </DialogHeader>

          <div className="max-h-[70vh] overflow-y-auto lg:max-h-none lg:overflow-visible">
            {/* Cover + Profile image row */}
            <div className="flex flex-col sm:flex-row gap-5 border-b border-border/50 px-5 py-5">
              <div className="flex-1 space-y-2">
                <Label className="text-xs text-muted-foreground">
                  Cover photo
                </Label>
                <ImageUpload
                  currentImageUrl={user?.coverImageUrl}
                  onUploaded={(storageId) =>
                    saveCoverImage({ storageId: storageId as never })
                  }
                  onRemove={() => removeCoverImage()}
                  maxSizeBytes={4 * 1024 * 1024}
                  maxSizeLabel="4 MB"
                  aspectRatio="3/1"
                  placeholder={
                    <div className="flex flex-col items-center gap-1 text-muted-foreground">
                      <ImageIcon className="h-5 w-5" />
                      <span className="text-xs">Add cover photo</span>
                      <span className="text-[10px] text-muted-foreground/60">
                        1200x400 recommended
                      </span>
                    </div>
                  }
                />
              </div>

              <div className="flex sm:flex-col items-center gap-3 sm:gap-2 sm:w-24">
                <Label className="text-xs text-muted-foreground sm:text-center">
                  Profile
                </Label>
                <ImageUpload
                  currentImageUrl={user?.profileImageUrl}
                  onUploaded={(storageId) =>
                    saveProfileImage({ storageId: storageId as never })
                  }
                  onRemove={() => removeProfileImage()}
                  maxSizeBytes={2 * 1024 * 1024}
                  maxSizeLabel="2 MB"
                  className="h-16 w-16 shrink-0"
                  placeholder={
                    <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-primary/20 to-pink-400/20">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={`https://api.dicebear.com/9.x/avataaars/svg?seed=${user?.username ?? "creator"}`}
                        alt="Avatar"
                        className="h-full w-full object-cover"
                      />
                    </div>
                  }
                />
              </div>
            </div>

            {/* Profile fields — horizontal on desktop */}
            <div className="grid sm:grid-cols-2 gap-5 px-5 py-5">
              <div className="space-y-2">
                <Label
                  htmlFor="edit-store-name"
                  className="text-xs text-muted-foreground"
                >
                  Store name
                </Label>
                <Input
                  id="edit-store-name"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  placeholder={user?.name ?? "Your store name"}
                />
                <p className="text-[10px] text-muted-foreground/70">
                  Public page display name
                </p>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="edit-name"
                  className="text-xs text-muted-foreground"
                >
                  Name
                </Label>
                <Input
                  id="edit-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your display name"
                />
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label
                  htmlFor="edit-bio"
                  className="text-xs text-muted-foreground"
                >
                  Bio
                </Label>
                <Textarea
                  id="edit-bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell people about yourself"
                  rows={2}
                  className="resize-none"
                />
              </div>

              <div className="space-y-3 rounded-xl border border-border/70 p-4 sm:col-span-2">
                <p className="text-xs font-medium text-muted-foreground">
                  Social links
                </p>
                <div className="grid sm:grid-cols-3 gap-3">
                  <div className="flex items-center gap-2">
                    <Instagram className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <Input
                      value={instagramUrl}
                      onChange={(e) => setInstagramUrl(e.target.value)}
                      placeholder="instagram.com/..."
                      className="h-9 text-sm"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Youtube className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <Input
                      value={youtubeUrl}
                      onChange={(e) => setYoutubeUrl(e.target.value)}
                      placeholder="youtube.com/..."
                      className="h-9 text-sm"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <Input
                      value={websiteUrl}
                      onChange={(e) => setWebsiteUrl(e.target.value)}
                      placeholder="yoursite.com"
                      className="h-9 text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Theme/accent — mobile only (desktop has it in the sidebar) */}
              <div className="flex gap-3 sm:col-span-2 lg:hidden">
                <div className="flex-1 space-y-3 rounded-xl border border-border/70 p-3">
                  <p className="text-xs font-medium text-muted-foreground">
                    Theme
                  </p>
                  <div className="grid grid-cols-3 gap-1.5">
                    {themeKeys.map((key) => {
                      const theme = themes[key];
                      const isSelected = selectedTheme === key;
                      return (
                        <button
                          key={key}
                          type="button"
                          onClick={() => handleThemeChange(key)}
                          className={`relative flex flex-col items-center gap-1 rounded-lg border-2 p-1.5 transition ${
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
                                backgroundColor: theme.vars["--store-card-bg"],
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

                <div className="flex-1 space-y-3 rounded-xl border border-border/70 p-3">
                  <p className="text-xs font-medium text-muted-foreground">
                    Accent color
                  </p>
                  <div className="grid grid-cols-4 gap-1.5">
                    {ACCENT_PRESETS.map((preset) => {
                      const isSelected = selectedAccent === preset.value;
                      return (
                        <button
                          key={preset.label}
                          type="button"
                          onClick={() =>
                            handleAccentChange(isSelected ? "" : preset.value)
                          }
                          className={`relative mx-auto h-7 w-7 rounded-full border-2 transition ${
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
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
