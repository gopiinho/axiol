"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useQuery, useMutation } from "convex/react";
import {
  ArrowUpRight,
  ExternalLink,
  Globe,
  Heart,
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
import { requireSessionToken } from "@/features/auth/client/session";
import { useCachedQueryResult } from "@/lib/hooks/useCachedQueryResult";
import { FadeIn } from "@/components/motion/FadeIn";
import {
  AnimatedList,
  AnimatedListItem,
} from "@/components/motion/AnimatedList";
import heartPixel from "@/public/icons/heart.png";

export default function MyStorePage() {
  const { user, token } = useUser();
  const rawMappings = useQuery(
    api.instagram.getPublishedMappings,
    token ? { token, limit: 24 } : "skip",
  );
  const publishedMappings = useCachedQueryResult(
    `store:mappings:${token ?? "anon"}`,
    rawMappings,
  );
  const rawCollections = useQuery(
    api.collections.listByUser,
    token ? { token } : "skip",
  );
  const collections = useCachedQueryResult(
    `store:collections:${token ?? "anon"}`,
    rawCollections,
  );
  const updateProfile = useMutation(api.users.updateProfile);

  const [editOpen, setEditOpen] = useState(false);
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [instagramUrl, setInstagramUrl] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [saving, setSaving] = useState(false);

  const openEditModal = () => {
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
        token: requireSessionToken(),
        name,
        bio,
        instagramUrl,
        youtubeUrl,
        websiteUrl,
      });
      setEditOpen(false);
    } catch (error) {
      console.error("Failed to save profile:", error);
    } finally {
      setSaving(false);
    }
  };

  const publicUrl = user?.username
    ? `${typeof window !== "undefined" ? window.location.origin : ""}/${user.username}`
    : "";

  const socialLinks = [
    { url: user?.instagramUrl, icon: Instagram, label: "Instagram" },
    { url: user?.youtubeUrl, icon: Youtube, label: "YouTube" },
    { url: user?.websiteUrl, icon: Globe, label: "Website" },
  ].filter((link) => link.url);

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
                    src={`https://api.dicebear.com/9.x/avataaars/svg?seed=${user?.username ?? "creator"}`}
                    alt="Avatar"
                    className="h-full w-full object-cover"
                  />
                </div>
              </div>

              <div className="grid lg:flex justify-center lg:justify-between items-center lg:items-start w-full">
                <div className="flex flex-col items-center justify-center lg:items-start">
                  <h1 className="font-accent text-xl font-extrabold tracking-tight">
                    {user?.name ?? ""}
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
                    <>
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
                    </>
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
                  No active posts yet. Publish a draft to see it here.
                </p>
                <Button asChild variant="outline" size="sm" className="mt-5">
                  <Link href="/dashboard/create">Create a post</Link>
                </Button>
              </div>
            )}
          </FadeIn>
        </div>

        <div className="hidden lg:flex items-center justify-center sticky top-0 w-full h-screen">
          <FadeIn delay={0.15}>
            <div className="flex h-[min(85vh,700px)] w-[min(45vh,340px)] flex-col">
              <div className="relative flex flex-1 flex-col rounded-[3rem] border-[6px] border-gray-900 bg-gray-900 shadow-lg">
                <div className="absolute left-1/2 top-2 z-20 h-[22px] w-[90px] -translate-x-1/2 rounded-full bg-black" />

                <div className="flex flex-1 flex-col overflow-hidden rounded-[2.5rem] bg-white">
                  <div className="flex items-center justify-between px-6 pt-3 pb-1 text-[9px] font-semibold text-gray-900">
                    <span>9:41</span>
                    <div className="flex items-center gap-1">
                      <svg
                        className="h-2.5 w-2.5"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M1 9l2 2c5.52-5.52 14.45-5.52 19.97 0l2-2C18.27 2.27 5.74 2.27 1 9zm8 8l3 3 3-3c-1.65-1.66-4.34-1.66-6 0zm-4-4l2 2c2.76-2.76 7.24-2.76 10 0l2-2C15.14 9.14 8.87 9.14 5 13z" />
                      </svg>
                      <svg
                        className="h-2.5 w-2.5"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M15.67 4H14V2h-4v2H8.33C7.6 4 7 4.6 7 5.33v15.34C7 21.4 7.6 22 8.33 22h7.34c.74 0 1.33-.6 1.33-1.33V5.33C17 4.6 16.4 4 15.67 4z" />
                      </svg>
                    </div>
                  </div>

                  <div className="mx-3 mb-2 rounded-lg bg-gray-100/80 px-3 py-1 text-center text-[10px] text-muted-foreground truncate">
                    {publicUrl || `linkkit.com/${user?.username ?? ""}`}
                  </div>

                  <div className="flex-1 overflow-y-auto">
                    <div className="home-font-primary px-3 pb-6">
                      <div className="my-8 space-y-3 text-center">
                        <div className="inline-flex items-center justify-center gap-1.5">
                          <Image
                            src={heartPixel.src}
                            alt=""
                            width={16}
                            height={16}
                            className="h-3 w-3"
                          />
                          <h1 className="font-secondary text-2xl text-primary">
                            {user?.name ?? ""}
                          </h1>
                          <Image
                            src={heartPixel.src}
                            alt=""
                            width={16}
                            height={16}
                            className="h-3 w-3"
                          />
                        </div>

                        {user?.bio && (
                          <p className="mx-auto max-w-[200px] text-xs text-muted-foreground">
                            {user.bio}
                          </p>
                        )}
                      </div>

                      <div className="border-2 border-pink-100 bg-white/60 p-3 backdrop-blur-sm">
                        <div className="mb-4 flex items-center justify-center gap-1.5 font-secondary">
                          <p className="text-xs text-primary">
                            &#x22c6;&#xff61;&#x02da; &#x2727;
                          </p>
                          <h5 className="font-secondary text-sm">
                            my collections
                          </h5>
                          <p className="text-xs text-primary">
                            &#x2727; &#x22c6;&#xff61;&#x02da;
                          </p>
                        </div>

                        {!collections || collections.length === 0 ? (
                          <div className="py-8 text-center">
                            <Heart className="mx-auto mb-2 h-8 w-8 text-pink-300" />
                            <p className="text-xs text-gray-500">
                              building my collection...
                            </p>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 gap-3">
                            {collections.map((collection) => (
                              <div
                                key={collection._id}
                                className="relative w-full border-2 border-pink-200 bg-white p-3"
                              >
                                <div className="absolute right-2 top-2">
                                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-pink-200">
                                    <Image
                                      src={heartPixel.src}
                                      alt=""
                                      width={6}
                                      height={6}
                                    />
                                  </div>
                                </div>

                                <h2 className="mb-1 pr-6 text-xs font-bold leading-tight text-gray-800">
                                  {collection.title}
                                </h2>

                                {collection.description && (
                                  <p className="line-clamp-2 text-[10px] text-gray-600">
                                    {collection.description}
                                  </p>
                                )}

                                <div className="mt-2 flex items-center justify-between border-t border-pink-100 pt-1.5">
                                  <span className="text-[9px] font-medium text-gray-500">
                                    see collection
                                  </span>
                                  <svg
                                    className="h-3 w-3 text-pink-500"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M9 5l7 7-7 7"
                                    />
                                  </svg>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-center py-1.5">
                  <div className="h-1 w-24 rounded-full bg-gray-600" />
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </div>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent
          showCloseButton={false}
          className="max-w-md gap-0 overflow-hidden p-0"
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

          <div className="max-h-[70vh] overflow-y-auto">
            <div className="flex items-center gap-4 border-b border-border/50 px-5 py-5">
              <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl border-2 border-primary/20 bg-gradient-to-br from-primary/20 to-pink-400/20 p-0.5">
                <div className="h-full w-full overflow-hidden rounded-full">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`https://api.dicebear.com/9.x/avataaars/svg?seed=${user?.username ?? "creator"}`}
                    alt="Avatar"
                    className="h-full w-full object-cover"
                  />
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">{user?.name}</p>
                <p className="text-xs text-muted-foreground">
                  @{user?.username}
                </p>
              </div>
            </div>

            <div className="space-y-5 px-5 py-5">
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

              <div className="space-y-2">
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
                  rows={3}
                  className="resize-none"
                />
              </div>

              <div className="space-y-3 rounded-xl border border-border/70 p-4">
                <p className="text-xs font-medium text-muted-foreground">
                  Social links
                </p>

                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Instagram className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <Input
                      value={instagramUrl}
                      onChange={(e) => setInstagramUrl(e.target.value)}
                      placeholder="https://instagram.com/..."
                      className="h-9 text-sm"
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <Youtube className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <Input
                      value={youtubeUrl}
                      onChange={(e) => setYoutubeUrl(e.target.value)}
                      placeholder="https://youtube.com/..."
                      className="h-9 text-sm"
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <Globe className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <Input
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
    </>
  );
}
