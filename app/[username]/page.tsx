import Image from "next/image";
import { notFound } from "next/navigation";
import { Heart } from "lucide-react";
import { api } from "@/convex/_generated/api";
import CollectionsCard from "@/components/CollectionCard";
import heartPixel from "@/public/icons/heart.png";
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
  const profileSrc =
    user.profileImageUrl ?? user.avatarUrl ?? null;

  return (
    <main
      className="home-font-primary min-h-screen flex justify-center p-4 relative overflow-hidden"
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
        className="pointer-events-none absolute -top-32 right-0 h-[400px] w-[400px] rounded-full"
        style={{
          background:
            `radial-gradient(circle, var(--store-accent, oklch(0.92 0.08 340)) 0%, transparent 60%)`,
          opacity: 0.2,
        }}
      />

      <div className="relative w-full max-w-3xl">
        {user.coverImageUrl && (
          <div className="mb-6 overflow-hidden rounded-2xl sm:rounded-3xl" style={{ borderRadius: "var(--store-radius)" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={user.coverImageUrl}
              alt=""
              className="h-32 w-full object-cover sm:h-48"
            />
          </div>
        )}

        <div className="text-center max-sm:my-14 max-sm:mb-28 sm:my-20 space-y-4">
          {profileSrc && (
            <div
              className="mx-auto mb-4 h-24 w-24 overflow-hidden rounded-full border-3 sm:h-28 sm:w-28"
              style={{ borderColor: "var(--store-accent)" }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={profileSrc}
                alt={displayName}
                className="h-full w-full object-cover"
              />
            </div>
          )}

          <div className="inline-flex justify-center items-center gap-3 mb-2">
            <Image
              src={heartPixel.src}
              alt="heart pixel"
              width={32}
              height={32}
              className="w-6 h-6 sm:w-8 sm:h-8"
            />
            <h1
              className="heading-playful text-6xl sm:text-8xl leading-[0.95]"
              style={{ color: "var(--store-accent)" }}
            >
              {displayName}
            </h1>
            <Image
              src={heartPixel.src}
              alt="heart pixel"
              width={32}
              height={32}
              className="w-6 h-6 sm:w-8 sm:h-8"
            />
          </div>

          {user.bio && (
            <p
              className="text-base max-w-md mx-auto leading-relaxed sm:text-lg"
              style={{ color: "var(--store-text-muted)" }}
            >
              {user.bio}
            </p>
          )}
        </div>

        <div
          className="relative p-5 lg:p-8 backdrop-blur-sm"
          style={{
            backgroundColor: "var(--store-surface)",
            border: "2px solid var(--store-border)",
            borderRadius: "var(--store-radius)",
          }}
        >
          <div className="flex items-center justify-center gap-2 mb-10">
            <p className="heading-playful text-lg" style={{ color: "var(--store-accent)" }}>&#x22c6;&#xff61;&#x02da; &#x2727;</p>
            <h5 className="heading-playful text-2xl sm:text-3xl">my collections</h5>
            <p className="heading-playful text-lg" style={{ color: "var(--store-accent)" }}>&#x2727; &#x22c6;&#xff61;&#x02da;</p>
          </div>

          {collections.length === 0 ? (
            <div className="text-center py-20">
              <Heart
                className="w-16 h-16 mx-auto mb-4 animate-float"
                style={{ color: "var(--store-accent)" }}
              />
              <p style={{ color: "var(--store-text-muted)" }} className="text-lg">
                building my collection... check back soon!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {collections.map((collection, index) => (
                <CollectionsCard
                  key={collection._id}
                  collection={collection}
                  index={index}
                />
              ))}
            </div>
          )}

          <div className="w-full">
            <div
              className="text-center flex flex-col items-center justify-center mt-10 text-[0.65rem] opacity-70"
              style={{ color: "var(--store-text)" }}
            >
              <p>
                If you purchase from any of these links, I may receive a small
                commission.
              </p>
              <div className="flex gap-1 items-center justify-center">
                Thank youuu for the support
                <Image
                  src={heartPixel.src}
                  alt="heart pixel"
                  width={5}
                  height={5}
                  className="w-2 h-2 sm:w-2 sm:h-2"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
