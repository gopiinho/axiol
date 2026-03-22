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

  const socialLinks = [
    {
      url: user.instagramUrl
        ? `https://instagram.com/${user.instagramUrl}`
        : undefined,
      icon: Instagram,
      label: "Instagram",
    },
    {
      url: user.youtubeUrl
        ? `https://youtube.com/@${user.youtubeUrl}`
        : undefined,
      icon: Youtube,
      label: "YouTube",
    },
    { url: user.websiteUrl, icon: Globe, label: "Website" },
  ].filter((link) => link.url);

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
        {user.coverImageUrl && (
          <div className="w-full overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={user.coverImageUrl}
              alt=""
              className="h-40 w-full object-cover sm:h-52"
            />
          </div>
        )}

        <div
          className={`px-5 sm:px-8 ${user.coverImageUrl ? "-mt-14" : "pt-12 sm:pt-16"}`}
        >
          {profileSrc && (
            <div
              className="h-24 w-24 overflow-hidden rounded-full border-4 sm:h-28 sm:w-28"
              style={{
                borderColor: "var(--store-bg, white)",
                boxShadow: "0 4px 20px -4px oklch(0 0 0 / 0.15)",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={profileSrc}
                alt={displayName}
                className="h-full w-full object-cover"
              />
            </div>
          )}

          <div className={`${profileSrc ? "mt-4" : ""} space-y-3`}>
            <h1
              className="font-accent text-2xl font-bold sm:text-3xl leading-tight"
              style={{ color: "var(--store-accent)" }}
            >
              {displayName}
            </h1>

            {user.bio && (
              <p
                className="text-sm max-w-md leading-relaxed sm:text-base"
                style={{ color: "var(--store-text-muted)" }}
              >
                {user.bio}
              </p>
            )}

            {socialLinks.length > 0 && (
              <div className="flex items-center gap-2 pt-1">
                {socialLinks.map((link) => {
                  const Icon = link.icon;
                  return (
                    <a
                      key={link.label}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center rounded-full p-2 transition hover:opacity-70"
                      style={{
                        backgroundColor: "var(--store-surface)",
                        color: "var(--store-text)",
                        border: "1px solid var(--store-border)",
                      }}
                      aria-label={link.label}
                    >
                      <Icon className="h-4 w-4" />
                    </a>
                  );
                })}
              </div>
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
