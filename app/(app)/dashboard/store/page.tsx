"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useQueryParam } from "@/lib/hooks/useQueryParam";
import Link from "next/link";
import { useQuery, useMutation } from "convex/react";
import { ExternalLink, Package, Pencil, Settings, Store, Palette } from "lucide-react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { useUser } from "@/features/auth/client/UserContext";
import { useCachedQueryResult } from "@/lib/hooks/useCachedQueryResult";
import { StorePreview } from "@/components/StorePreview";
import { EditProfile } from "@/components/EditProfile";
import { ProductCard } from "@/features/products/components/ProductCard";
import { ThemeEditor } from "@/components/dashboard/ThemeEditor";
import {
  buildThemeStyle,
  migrateOldTheme,
  type PaletteConfig,
  type LayoutConfig,
} from "@/lib/themes";
import { resolvePalette } from "@/lib/colorUtils";

const DEFAULT_PALETTE: PaletteConfig = resolvePalette({
  bg: "oklch(0.97 0.015 340)",
  accent: "oklch(0.65 0.2 340)",
});

const DEFAULT_LAYOUT: LayoutConfig = {
  preset: "playful",
  borderRadius: "pill",
  cardStyle: "layered",
  spacing: "loose",
  headerLayout: "centered",
  typeScale: "large",
  backgroundPattern: "dots",
};

export default function MyStorePage() {
  const { user } = useUser();

  const rawProducts = useQuery(api.products.listByUser);
  const products = useCachedQueryResult("store:products", rawProducts);
  const publishedProducts = products?.filter((p) => p.status === "published") ?? [];
  const updateProfile = useMutation(api.users.updateProfile);

  const [editOpen, setEditOpen] = useState(false);
  const [storeName, setStoreName] = useState("");
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [instagramUrl, setInstagramUrl] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);

  const [activeTab, setActiveTab] = useQueryParam("tab", "store");

  const [palette, setPalette] = useState<PaletteConfig>(() => {
    if (user?.palette && typeof user.palette === "object") {
      const p = user.palette as unknown as PaletteConfig;
      if (p.bg && p.accent) return resolvePalette(p);
    }
    if (user?.theme) {
      const migrated = migrateOldTheme(user.theme);
      if (migrated?.palette) return migrated.palette;
    }
    return DEFAULT_PALETTE;
  });

  const [layout, setLayout] = useState<LayoutConfig>(() => {
    const storedLayout = user?.layout as LayoutConfig | undefined;
    if (storedLayout) return storedLayout;
    if (user?.theme) {
      const migrated = migrateOldTheme(user.theme);
      if (migrated?.layout) return migrated.layout;
    }
    return DEFAULT_LAYOUT;
  });

  const themeInitialized = useRef(false);

  useEffect(() => {
    if (!user || themeInitialized.current) return;
    themeInitialized.current = true;

    const storedPalette = user.palette as PaletteConfig | undefined;
    if (storedPalette?.bg && storedPalette?.accent) {
      setPalette(resolvePalette(storedPalette));
    } else if (user.theme) {
      const migrated = migrateOldTheme(user.theme);
      if (migrated) setPalette(migrated.palette);
    }

    const storedLayout = user.layout as LayoutConfig | undefined;
    if (storedLayout) {
      setLayout(storedLayout);
    } else if (user.theme) {
      const migrated = migrateOldTheme(user.theme);
      if (migrated) setLayout(migrated.layout);
    }
  }, [user]);

  const [themeDirty, setThemeDirty] = useState(false);
  const [themeSaving, setThemeSaving] = useState(false);

  const handlePaletteChange = useCallback((p: PaletteConfig) => {
    setPalette(p);
    setThemeDirty(true);
  }, []);

  const handleLayoutChange = useCallback((l: LayoutConfig) => {
    setLayout(l);
    setThemeDirty(true);
  }, []);

  const handleThemeCancel = useCallback(() => {
    const storedPalette = user?.palette as PaletteConfig | undefined;
    if (storedPalette?.bg && storedPalette?.accent) {
      setPalette(resolvePalette(storedPalette));
    } else {
      setPalette(DEFAULT_PALETTE);
    }

    const storedLayout = user?.layout as LayoutConfig | undefined;
    if (storedLayout) {
      setLayout(storedLayout);
    } else {
      setLayout(DEFAULT_LAYOUT);
    }

    setThemeDirty(false);
  }, [user]);

  if (!user) return null;

  const profileImageUrl = user?.profileImageUrl ?? user?.avatarUrl ?? null;

  const openEditModal = () => {
    setStoreName(user?.storeName ?? "");
    setName(user?.name ?? "");
    setBio(user?.bio ?? "");
    setInstagramUrl(user?.instagramUrl ?? "");
    setYoutubeUrl(user?.youtubeUrl ?? "");
    setWebsiteUrl(user?.websiteUrl ?? "");
    setEditOpen(true);
  };

  const handleProfileSave = async () => {
    setSavingProfile(true);
    try {
      await updateProfile({
        name,
        bio,
        instagramUrl,
        youtubeUrl,
        websiteUrl,
        storeName,
      });
      setEditOpen(false);
    } catch (error) {
      console.error("Failed to save profile:", error);
    } finally {
      setSavingProfile(false);
    }
  };

  const handleThemeSave = async () => {
    setThemeSaving(true);
    try {
      await updateProfile({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        palette: palette as any,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        layout: layout as any,
      });
      setThemeDirty(false);
    } catch (error) {
      console.error("Failed to save theme:", error);
    } finally {
      setThemeSaving(false);
    }
  };

  const publicUrl = user?.username
    ? `${typeof window !== "undefined" ? window.location.origin : ""}/${user.username}`
    : "";

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
          url: user.websiteUrl.startsWith("http") ? user.websiteUrl : `https://${user.websiteUrl}`,
          icon: "globe" as const,
          label: "Website",
          display: user.websiteUrl.replace(/^https?:\/\//, "").replace(/\/+$/, ""),
        }
      : null,
  ].filter(Boolean) as {
    url: string;
    icon: "instagram" | "youtube" | "globe";
    label: string;
    display: string;
  }[];

  const displayName = user?.storeName || user?.name || "";
  const fullTheme = buildThemeStyle(palette, layout);
  const editorTheme = { ...fullTheme };
  delete (editorTheme as Record<string, unknown>).backgroundImage;
  delete (editorTheme as Record<string, unknown>).backgroundSize;

  return (
    <>
      <div className="flex min-h-screen w-full">
        <div
          className="border-border/70 w-full flex-1 lg:border-r"
          style={editorTheme as React.CSSProperties}
        >
          <div className="flex items-center justify-center gap-4 px-5 py-4 max-lg:flex-col max-sm:gap-3 lg:flex lg:items-start lg:px-6 lg:py-8">
            <div className="h-24 w-24 overflow-hidden rounded-xs border-2 p-0.5 max-sm:h-16 max-sm:w-16">
              <div className="h-full w-full overflow-hidden">
                <img
                  src={
                    profileImageUrl ??
                    `https://api.dicebear.com/9.x/avataaars/svg?seed=${user?.username ?? "creator"}`
                  }
                  alt="Avatar"
                  className="h-full w-full rounded-xs object-cover"
                />
              </div>
            </div>

            <div className="grid w-full items-center justify-center lg:flex lg:items-start lg:justify-between">
              <div className="flex flex-col items-center justify-center lg:items-start">
                <h1 className="font-accent text-xl font-extrabold tracking-tight">{displayName}</h1>
                <p className="text-muted-foreground text-xs">@{user?.username}</p>
                {user?.bio && (
                  <p className="text-muted-foreground mt-2 max-w-sm text-start text-sm max-sm:text-xs">
                    {user.bio}
                  </p>
                )}
              </div>
              <div className="flex h-full items-start justify-center gap-2 max-lg:mt-6">
                {publicUrl && (
                  <Button variant="outline" size="sm" className="gap-1.5" asChild>
                    <Link href={`/${user?.username}`} target="_blank">
                      <ExternalLink className="h-3 w-3" />
                      Visit
                    </Link>
                  </Button>
                )}
                <Button size="sm" onClick={openEditModal} className="gap-1.5">
                  <Pencil className="h-3 w-3" />
                  Edit
                </Button>
              </div>
            </div>
          </div>

          <div className="border-border/70 border-t" />

          <div className="border-border/70 flex items-center gap-2 border-b px-5 py-3">
            <button
              type="button"
              onClick={() => setActiveTab("store")}
              className={`flex cursor-pointer items-center gap-2 rounded-full px-5 py-2 text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === "store"
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:bg-card/30"
              }`}
            >
              <Store className="h-4 w-4" />
              Store
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("design")}
              className={`flex cursor-pointer items-center gap-2 rounded-full px-5 py-2 text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === "design"
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:bg-card/30"
              }`}
            >
              <Palette className="h-4 w-4" />
              Edit Design
            </button>
            <div className="flex-1" />
            {activeTab === "store" && (
              <Button variant="ghost" size="sm" className="gap-1.5" asChild>
                <Link href="/dashboard/products">
                  <Settings className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Manage</span>
                </Link>
              </Button>
            )}
          </div>

          <div className="min-h-[50vh] px-5 pt-6 lg:px-6 lg:pt-8">
            {activeTab === "store" ? (
              publishedProducts.length > 0 ? (
                <div className="columns-1 gap-6 sm:columns-2">
                  {publishedProducts.map((product, index) => (
                    <div key={product._id} className="mb-6 break-inside-avoid">
                      <ProductCard
                        product={{
                          _id: product._id,
                          name: product.name,
                          productUrl: product.productUrl,
                          type: product.type,
                          price: product.price,
                          coverImageUrl: product.coverImageUrl ?? null,
                          thumbnailImageUrl: product.thumbnailImageUrl ?? null,
                          config: product.config as Record<string, unknown>,
                          itemCount: 0,
                        }}
                        index={index}
                        interactive={true}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-1 flex-col items-center justify-center py-20 text-center">
                  <Package className="mx-auto h-10 w-10" style={{ color: "var(--store-accent)" }} />
                  <p className="text-muted-foreground mt-4 text-sm">
                    No published products yet. Publish one to get started.
                  </p>
                  <Button className="mt-5" asChild>
                    <Link href="/dashboard/products/new">Create a product</Link>
                  </Button>
                </div>
              )
            ) : (
              <ThemeEditor
                palette={palette}
                onPaletteChange={handlePaletteChange}
                layout={layout}
                onLayoutChange={handleLayoutChange}
                onSave={handleThemeSave}
                onCancel={handleThemeCancel}
                saving={themeSaving}
                dirty={themeDirty}
              />
            )}
          </div>
        </div>

        <div className="sticky top-0 hidden h-screen flex-col items-center justify-center overflow-hidden lg:flex lg:w-[420px]">
          <StorePreview
            displayName={displayName}
            bio={user?.bio}
            profileImageUrl={user?.profileImageUrl}
            username={user?.username ?? ""}
            palette={palette}
            layout={layout}
            products={publishedProducts.map((p) => ({
              _id: p._id,
              name: p.name,
              productUrl: p.productUrl,
              type: p.type,
              price: p.price,
              coverImageUrl: p.coverImageUrl ?? null,
              thumbnailImageUrl: p.thumbnailImageUrl ?? null,
              config: p.config as Record<string, unknown>,
              itemCount: 0,
            }))}
            socialLinks={storeSocialLinks}
          />
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
        saving={savingProfile}
        onSave={handleProfileSave}
      />
    </>
  );
}
