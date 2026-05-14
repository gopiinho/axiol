"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery, useMutation } from "convex/react";
import {
  Check,
  ExternalLink,
  Globe,
  Instagram,
  Package,
  Pencil,
  Youtube,
} from "lucide-react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { useUser } from "@/features/auth/client/UserContext";
import { useCachedQueryResult } from "@/lib/hooks/useCachedQueryResult";
import { FadeIn } from "@/components/motion/FadeIn";
import {
  AnimatedList,
  AnimatedListItem,
} from "@/components/motion/AnimatedList";
import { StorePreview } from "@/components/StorePreview";
import { EditProfile } from "@/components/EditProfile";
import { ProductCard } from "@/features/products/components/ProductCard";
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
  const rawProducts = useQuery(api.products.listByUser);
  const products = useCachedQueryResult("store:products", rawProducts);

  const publishedProducts =
    products?.filter((p) => p.status === "published") ?? [];

  const updateProfile = useMutation(api.users.updateProfile);

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
            {publishedProducts.length > 0 ? (
              <div className="px-5 py-6">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-sm font-semibold text-foreground">
                    Published Products
                  </h2>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href="/dashboard/products">Manage</Link>
                  </Button>
                </div>
                <AnimatedList className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {publishedProducts.map((product, index) => (
                    <AnimatedListItem key={product._id}>
                      <ProductCard
                        product={{
                          _id: product._id,
                          name: product.name,
                          slug: product.slug,
                          type: product.type,
                          price: product.price,
                          coverImageUrl: null,
                          itemCount: 0,
                        }}
                        index={index}
                        interactive={false}
                      />
                    </AnimatedListItem>
                  ))}
                </AnimatedList>
              </div>
            ) : (
              <div className="flex flex-1 flex-col items-center justify-center py-20 text-center">
                <Package className="mx-auto h-10 w-10 text-primary" />
                <p className="mt-4 text-sm text-muted-foreground">
                  No published products yet. Publish one to get started.
                </p>
                <Button className="mt-5" asChild>
                  <Link href="/dashboard/products/new">Create a product</Link>
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
                  <Button
                    size="sm"
                    onClick={handleThemeSave}
                    disabled={themeSaving || !themeDirty}
                    className="shrink-0"
                  >
                    {themeSaving ? "Saving..." : "Save theme"}
                  </Button>
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
                products={publishedProducts.map((p) => ({
                  _id: p._id,
                  name: p.name,
                  slug: p.slug,
                  price: p.price,
                  coverImageUrl: null,
                  itemCount: 0,
                }))}
                socialLinks={storeSocialLinks}
              />
            </div>
          </FadeIn>
        </div>
      </div>

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
