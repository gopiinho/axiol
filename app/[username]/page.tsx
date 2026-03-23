import { notFound } from "next/navigation";
import { Globe, Heart, Instagram, Youtube } from "lucide-react";
import { api } from "@/convex/_generated/api";
import CollectionsCard from "@/components/CollectionCard";
import { getServerConvexClient } from "@/server/convex/client";
import { buildThemeStyle, getTheme } from "@/lib/themes";

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
          icon: Instagram,
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
          icon: Youtube,
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
          icon: Globe,
          label: "Website",
          display: formatDisplayUrl(user.websiteUrl),
        }
      : null,
  ].filter(Boolean) as {
    url: string;
    icon: typeof Instagram;
    label: string;
    display: string;
  }[];

  return (
    <main
      className="home-font-primary min-h-screen flex justify-center relative overflow-hidden"
      style={{
        ...themeStyle,
        backgroundColor: "var(--store-bg)",
        color: "var(--store-text)",
      }}
    >
      {showDots && (
        <div className="pointer-events-none absolute inset-0 dot-grid opacity-30" />
      )}
      <div
        className="pointer-events-none absolute -top-32 right-0 h-100 w-100"
        style={{
          background:
            "radial-gradient(circle, var(--store-accent, oklch(0.92 0.08 340)) 0%, transparent 60%)",
          opacity: 0.15,
        }}
      />

      <div className="relative w-full max-w-xl">
        {user.coverImageUrl ? (
          <div className="w-full overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={user.coverImageUrl}
              alt=""
              className="h-32 w-full object-cover sm:h-44"
            />
          </div>
        ) : (
          <div
            className="h-32 w-full sm:h-44"
            style={{
              backgroundColor: "var(--store-accent, oklch(0.52 0.2 254))",
              opacity: 0.35,
            }}
          />
        )}

        <div className="px-5 sm:px-8 -mt-14">
          <div
            className="h-24 w-24 overflow-hidden rounded-full border-4 sm:h-28 sm:w-28"
            style={{
              borderColor: "var(--store-bg, white)",
              boxShadow: "0 4px 20px -4px oklch(0 0 0 / 0.15)",
            }}
          >
            {profileSrc ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={profileSrc}
                alt={displayName}
                className="h-full w-full object-cover"
              />
            ) : (
              <div
                className="flex h-full w-full items-center justify-center"
                style={{
                  backgroundColor: "var(--store-accent, oklch(0.52 0.2 254))",
                }}
              >
                <span className="text-3xl font-bold text-white sm:text-4xl">
                  {displayName.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>

          <div className="mt-4 space-y-1">
            <h1
              className="font-accent text-2xl font-bold sm:text-3xl leading-tight"
              style={{ color: "var(--store-accent)" }}
            >
              {displayName}
            </h1>

            {socialLinks.length > 0 && (
              <div className="grid gap-1.5 pt-1">
                {socialLinks.map((link) => {
                  const Icon = link.icon;
                  return (
                    <a
                      key={link.label}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-xs transition hover:opacity-70 w-fit"
                      style={{ color: "var(--store-text-muted)" }}
                    >
                      <Icon className="h-3.5 w-3.5 shrink-0" />
                      <span>{link.display}</span>
                    </a>
                  );
                })}
              </div>
            )}

            {user.bio && (
              <p
                className="text-sm max-w-md leading-relaxed sm:text-base"
                style={{ color: "var(--store-text-muted)" }}
              >
                {user.bio}
              </p>
            )}
          </div>
        </div>

        <div>
          <div className="relative p-5 lg:p-8 backdrop-blur-sm">
            <h2
              className="font-accent text-lg font-bold mb-6 sm:text-xl"
              style={{ color: "var(--store-text)" }}
            >
              My store
            </h2>

            {collections.length === 0 ? (
              <div className="text-center py-16">
                <Heart
                  className="w-12 h-12 mx-auto mb-3 animate-float"
                  style={{ color: "var(--store-accent)" }}
                />
                <p
                  style={{ color: "var(--store-text-muted)" }}
                  className="text-base"
                >
                  building my collection... check back soon!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-5">
                {collections.map((collection, index) => (
                  <CollectionsCard
                    key={collection._id}
                    collection={collection}
                    index={index}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
