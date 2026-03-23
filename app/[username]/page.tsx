import { notFound } from "next/navigation";
import { api } from "@/convex/_generated/api";
import { getServerConvexClient } from "@/server/convex/client";
import { buildThemeStyle, getTheme } from "@/lib/themes";
import { StoreContent } from "@/components/StoreContent";

export default async function UserStorePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const convex = getServerConvexClient();

  const result = await convex.query(api.users.getPublicStore, { username });

  if (!result) {
    notFound();
  }

  const { user, collections } = result;
  const displayName = user.storeName || user.name;
  const theme = getTheme(user.theme);
  const themeStyle = buildThemeStyle(user.theme, user.accentColor);
  const showDots = theme.vars["--store-show-dots"] === "1";
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

  return (
    <main className="flex min-h-screen justify-center">
      <div className="w-full max-w-xl">
        <StoreContent
          className="min-h-screen"
          displayName={displayName}
          bio={user.bio}
          profileImageUrl={profileSrc}
          coverImageUrl={user.coverImageUrl}
          socialLinks={socialLinks}
          collections={collections}
          themeStyle={themeStyle}
          showDots={showDots}
          interactive={true}
        />
      </div>
    </main>
  );
}
