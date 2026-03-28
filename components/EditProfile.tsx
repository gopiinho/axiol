"use client";

import { Globe, ImageIcon, Instagram, Youtube, Check } from "lucide-react";
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
          <Button
            size="sm"
            onClick={onSave}
            disabled={saving}
            className="rounded-full px-5"
          >
            {saving ? "Saving..." : "Save"}
          </Button>
        </DialogHeader>

        <div className="max-h-[70vh] overflow-y-auto lg:max-h-none lg:overflow-visible">
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
                  <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-full bg-linear-to-br from-primary/20 to-pink-400/20">
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
