"use client";

import { Globe, Instagram, Youtube } from "lucide-react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ImageUpload } from "@/components/ImageUpload";


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
}: EditProfileProps) {
  const saveProfileImage = useMutation(api.storage.saveProfileImage);
  const removeProfileImage = useMutation(api.storage.removeProfileImage);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false} className="max-w-2xl gap-0 overflow-hidden p-0">
        <DialogHeader className="border-border/70 flex-row items-center justify-between border-b px-5 py-3.5">
          <DialogTitle className="text-lg font-semibold">Edit store</DialogTitle>
          <Button size="sm" onClick={onSave} disabled={saving} className="px-5">
            {saving ? "Saving..." : "Save"}
          </Button>
        </DialogHeader>

        <div className="max-h-[70vh] overflow-y-auto lg:max-h-none lg:overflow-visible">
          <div className="border-border/50 flex flex-row items-center justify-center gap-5 border-b px-5 py-5 sm:justify-start">
            <div className="flex items-center justify-center sm:w-24 sm:items-start">
              <ImageUpload
                currentImageUrl={user?.profileImageUrl}
                onUploaded={(storageId) => saveProfileImage({ storageId: storageId as never })}
                onRemove={() => removeProfileImage()}
                maxSizeBytes={2 * 1024 * 1024}
                maxSizeLabel="2 MB"
                className="h-20 w-20 shrink-0 sm:h-24 sm:w-24"
                placeholder={
                  <div className="from-primary/20 flex h-full w-full items-center justify-center overflow-hidden bg-linear-to-br to-pink-400/20">
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

          <div className="grid gap-5 px-5 py-5 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="edit-store-name" className="text-foreground text-sm font-semibold">
                Store name
              </Label>
              <Input
                id="edit-store-name"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                placeholder={user?.name ?? "Your store name"}
              />
              <p className="text-muted-foreground/70 text-[10px]">Public page display name</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-name" className="text-foreground text-sm font-semibold">
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
              <Label htmlFor="edit-bio" className="text-foreground text-sm font-semibold">
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

            <div className="space-y-3 sm:col-span-2">
              <p className="text-foreground text-sm font-semibold">Social links</p>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label
                    htmlFor="edit-instagram"
                    className="text-muted-foreground flex items-center gap-1.5 text-xs"
                  >
                    <Instagram className="h-3.5 w-3.5" />
                    Instagram username
                  </Label>
                  <div className="relative">
                    <span className="text-muted-foreground/60 pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-sm">
                      @
                    </span>
                    <Input
                      id="edit-instagram"
                      value={instagramUrl}
                      onChange={(e) =>
                        setInstagramUrl(extractUsername(e.target.value.replace(/^@/, "").trim()))
                      }
                      placeholder="username"
                      className="h-9 pl-7 text-sm"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label
                    htmlFor="edit-youtube"
                    className="text-muted-foreground flex items-center gap-1.5 text-xs"
                  >
                    <Youtube className="h-3.5 w-3.5" />
                    YouTube username
                  </Label>
                  <div className="relative">
                    <span className="text-muted-foreground/60 pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-sm">
                      @
                    </span>
                    <Input
                      id="edit-youtube"
                      value={youtubeUrl}
                      onChange={(e) =>
                        setYoutubeUrl(extractUsername(e.target.value.replace(/^@/, "").trim()))
                      }
                      placeholder="channel"
                      className="h-9 pl-7 text-sm"
                    />
                  </div>
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <Label
                    htmlFor="edit-website"
                    className="text-muted-foreground flex items-center gap-1.5 text-xs"
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


          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
