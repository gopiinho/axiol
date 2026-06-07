"use client";

import { useState, useRef } from "react";
import { Globe, Instagram, Youtube, Check, Plus, Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ImageUpload } from "@/components/ImageUpload";
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

type EditProfileProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: {
    name?: string;
    storeName?: string;
    bio?: string;
    username?: string;
    instagramUrl?: string;
    youtubeUrl?: string;
    websiteUrl?: string;
    coverImageUrl?: string | null;
    profileImageUrl?: string | null;
    theme?: string;
    accentColor?: string;
  } | null;
  // Form state
  storeName: string;
  setStoreName: (v: string) => void;
  name: string;
  setName: (v: string) => void;
  bio: string;
  setBio: (v: string) => void;
  instagramUrl: string;
  setInstagramUrl: (v: string) => void;
  youtubeUrl: string;
  setYoutubeUrl: (v: string) => void;
  websiteUrl: string;
  setWebsiteUrl: (v: string) => void;
  saving: boolean;
  onSave: () => void;
  // Theme state
  selectedTheme: ThemeKey;
  selectedAccent: string;
  onThemeChange: (key: ThemeKey) => void;
  onAccentChange: (value: string) => void;
};

const extractUsername = (value: string) =>
  value
    .replace(/^https?:\/\//, "")
    .replace(/^(www\.)?(instagram\.com|youtube\.com)\/?@?/, "")
    .replace(/\/$/, "");

export function EditProfile({
  open,
  onOpenChange,
  user,
  storeName,
  setStoreName,
  name,
  setName,
  bio,
  setBio,
  instagramUrl,
  setInstagramUrl,
  youtubeUrl,
  setYoutubeUrl,
  websiteUrl,
  setWebsiteUrl,
  saving,
  onSave,
  selectedTheme,
  selectedAccent,
  onThemeChange,
  onAccentChange,
}: EditProfileProps) {
  const saveProfileImage = useMutation(api.storage.saveProfileImage);
  const saveCoverImage = useMutation(api.storage.saveCoverImage);
  const removeProfileImage = useMutation(api.storage.removeProfileImage);
  const removeCoverImage = useMutation(api.storage.removeCoverImage);
  const generateUploadUrl = useMutation(api.storage.generateUploadUrl);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const [coverUploading, setCoverUploading] = useState(false);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);

  const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

  const handleCoverSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!ALLOWED_TYPES.includes(file.type)) return;
    if (file.size > 4 * 1024 * 1024) return;

    setCoverUploading(true);
    setCoverPreview(URL.createObjectURL(file));

    try {
      const uploadUrl = await generateUploadUrl();
      const result = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });
      if (!result.ok) throw new Error("Upload failed");
      const { storageId } = await result.json();
      await saveCoverImage({ storageId: storageId as never });
    } catch {
      setCoverPreview(null);
    } finally {
      setCoverUploading(false);
      if (coverInputRef.current) coverInputRef.current.value = "";
    }
  };

  const handleRemoveCover = async () => {
    setCoverPreview(null);
    try {
      await removeCoverImage();
    } catch {}
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="max-w-2xl gap-0 overflow-hidden p-0"
      >
        <DialogHeader className="flex-row items-center justify-between border-b border-border/70 px-5 py-3.5">
          <DialogTitle className="text-lg font-semibold">
            Edit store
          </DialogTitle>
          <Button size="sm" onClick={onSave} disabled={saving} className="px-5">
            {saving ? "Saving..." : "Save"}
          </Button>
        </DialogHeader>

        <div className="max-h-[70vh] overflow-y-auto lg:max-h-none lg:overflow-visible">
          <div className="flex flex-row gap-5 border-b border-border/50 px-5 py-5">
            <div className="flex flex-col items-center gap-3 sm:gap-2 sm:w-24">
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
                className="h-20 w-20 shrink-0 sm:h-full sm:w-full"
                placeholder={
                  <div className="flex h-full w-full items-center justify-center overflow-hidden bg-linear-to-br from-primary/20 to-pink-400/20">
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

            <div className="flex-1 space-y-2">
              <Label className="text-xs text-muted-foreground">
                Cover photo
              </Label>
              {coverPreview || user?.coverImageUrl ? (
                <div className="flex flex-col items-start gap-3">
                  <div className="flex items-center gap-3">
                    <div className="relative h-14 w-24 rounded-xs overflow-hidden border border-border/60 shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={coverPreview || user?.coverImageUrl || ""}
                        alt="Cover"
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => !coverUploading && coverInputRef.current?.click()}
                      disabled={coverUploading}
                      className="inline-flex items-center gap-1.5 rounded-xs border border-border/60 bg-card px-3 py-1.5 text-xs font-medium text-foreground shadow-sm transition-colors hover:bg-accent disabled:opacity-50"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      {coverUploading ? "Uploading..." : "Replace"}
                    </button>
                    <button
                      type="button"
                      onClick={handleRemoveCover}
                      disabled={coverUploading}
                      className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground transition-colors hover:text-destructive disabled:opacity-50"
                    >
                      <X className="h-3.5 w-3.5" />
                      Remove
                    </button>
                  </div>
                  <div className="relative w-full rounded-xs overflow-hidden border border-border/60">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={coverPreview || user?.coverImageUrl || ""}
                      alt="Cover preview"
                      className="w-full h-auto max-h-[200px] object-cover"
                    />
                    {coverUploading && (
                      <div className="absolute inset-0 flex items-center justify-center bg-background/60 backdrop-blur-sm">
                        <Loader2 className="h-5 w-5 animate-spin text-primary" />
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center gap-3 rounded-xs border border-dashed border-border/70 bg-card/50 p-5 h-[136px]">
                  {coverUploading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin text-primary" />
                      <span className="text-xs text-muted-foreground">Uploading...</span>
                    </>
                  ) : (
                    <>
                      <span
                        onClick={() => !coverUploading && coverInputRef.current?.click()}
                        className={cn(
                          "inline-flex items-center gap-2 rounded-xs bg-card px-4 py-2",
                          "text-sm font-semibold text-foreground shadow-sm border border-border/60",
                          "transition-all duration-200",
                          "hover:bg-accent hover:text-accent-foreground",
                          "cursor-pointer",
                        )}
                      >
                        <Plus className="h-4 w-4" strokeWidth={2} />
                        Upload photo
                      </span>
                      <span className="text-xs text-muted-foreground">
                        1200x400 recommended
                      </span>
                    </>
                  )}
                </div>
              )}
              <input
                ref={coverInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleCoverSelect}
                className="hidden"
              />
            </div>
          </div>

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
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label
                    htmlFor="edit-instagram"
                    className="flex items-center gap-1.5 text-xs text-muted-foreground"
                  >
                    <Instagram className="h-3.5 w-3.5" />
                    Instagram username
                  </Label>
                  <div className="relative">
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground/60">
                      @
                    </span>
                    <Input
                      id="edit-instagram"
                      value={instagramUrl}
                      onChange={(e) =>
                        setInstagramUrl(
                          extractUsername(
                            e.target.value.replace(/^@/, "").trim(),
                          ),
                        )
                      }
                      placeholder="username"
                      className="h-9 pl-7 text-sm"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label
                    htmlFor="edit-youtube"
                    className="flex items-center gap-1.5 text-xs text-muted-foreground"
                  >
                    <Youtube className="h-3.5 w-3.5" />
                    YouTube username
                  </Label>
                  <div className="relative">
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground/60">
                      @
                    </span>
                    <Input
                      id="edit-youtube"
                      value={youtubeUrl}
                      onChange={(e) =>
                        setYoutubeUrl(
                          extractUsername(
                            e.target.value.replace(/^@/, "").trim(),
                          ),
                        )
                      }
                      placeholder="channel"
                      className="h-9 pl-7 text-sm"
                    />
                  </div>
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <Label
                    htmlFor="edit-website"
                    className="flex items-center gap-1.5 text-xs text-muted-foreground"
                  >
                    <Globe className="h-3.5 w-3.5" />
                    Website URL
                  </Label>
                  <Input
                    id="edit-website"
                    value={websiteUrl}
                    onChange={(e) => setWebsiteUrl(e.target.value)}
                    placeholder="https://yoursite.com"
                    className="h-9 text-sm"
                  />
                </div>
              </div>
            </div>

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
                        onClick={() => onThemeChange(key)}
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
                          onAccentChange(isSelected ? "" : preset.value)
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
  );
}
