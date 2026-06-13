import { notFound } from "next/navigation";
import { api } from "@/convex/_generated/api";
import { getServerConvexClient } from "@/server/convex/client";
import { buildThemeStyle, migrateOldTheme, type PaletteConfig, type LayoutConfig } from "@/lib/themes";
import { resolvePalette } from "@/lib/colorUtils";
import { StoreContent } from "@/components/StoreContent";

export default async function UserStorePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const convex = getServerConvexClient();

  const result = await convex.query(api.users.getPublicStore, { username });

  if (!result) {
    notFound();
  }

  const { user, products: rawProducts } = result;
  const products = rawProducts.map(
    (p: {
      _id: string;
      name: string;
      productUrl: string;
      type?: string;
      price?: string | null;
      coverImageUrl?: string | null;
      thumbnailImageUrl?: string | null;
      config?: Record<string, unknown>;
      items?: unknown[];
    }) => ({
      _id: p._id,
      name: p.name,
      productUrl: p.productUrl,
      type: p.type,
      price: p.price,
      coverImageUrl: p.coverImageUrl,
      thumbnailImageUrl: p.thumbnailImageUrl,
      config: p.config,
      itemCount: p.items?.length ?? 0,
    })
  );
  const displayName = user.storeName || user.name;

  let palette = user.palette as PaletteConfig | undefined;
  let layout = user.layout as LayoutConfig | undefined;
  if (!palette && user.theme) {
    const migrated = migrateOldTheme(user.theme);
    if (migrated) {
      palette = migrated.palette;
      layout = migrated.layout;
    }
  }
  if (palette) {
    palette = resolvePalette(palette);
  }
  const themeStyle = palette
    ? buildThemeStyle(palette, layout ?? {})
    : ({} as React.CSSProperties);

  const profileSrc = user.profileImageUrl ?? user.avatarUrl ?? null;

  const formatDisplayUrl = (url: string) => {
    return url.replace(/^https?:\/\//, "").replace(/\/+$/, "");
  };

  const socialLinks = [
    user.instagramUrl
      ? {
          url: user.instagramUrl.startsWith("http")
            ? user.instagramUrl
            : `https://instagram.com/${user.instagramUrl}`,
          icon: "instagram" as const,
          label: "Instagram",
          display: `@${user.instagramUrl
            .replace(/^@/, "")
            .replace(/^https?:\/\/(www\.)?instagram\.com\//, "")
            .replace(/\/+$/, "")}`,
        }
      : null,
    user.youtubeUrl
      ? {
          url: user.youtubeUrl.startsWith("http")
            ? user.youtubeUrl
            : `https://youtube.com/@${user.youtubeUrl}`,
          icon: "youtube" as const,
          label: "YouTube",
          display: `@${user.youtubeUrl
            .replace(/^@/, "")
            .replace(/^https?:\/\/(www\.)?youtube\.com\/@?/, "")
            .replace(/\/+$/, "")}`,
        }
      : null,
    user.websiteUrl
      ? {
          url: user.websiteUrl.startsWith("http") ? user.websiteUrl : `https://${user.websiteUrl}`,
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

  return (
    <main
      className="flex min-h-screen justify-center"
      style={{ backgroundColor: "var(--store-bg)", ...themeStyle }}
    >
      <div className="mx-auto h-full w-full lg:max-w-[90%]">
        <StoreContent
          className="min-h-screen"
          displayName={displayName}
          bio={user.bio}
          profileImageUrl={profileSrc}
          socialLinks={socialLinks}
          products={products}
          themeStyle={themeStyle}
          interactive={true}
          username={username}
          headerLayout={layout?.headerLayout}
        />
      </div>
    </main>
  );
}
