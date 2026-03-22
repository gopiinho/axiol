"use client";

import { Heart } from "lucide-react";
import { buildThemeStyle } from "@/lib/themes";

type Collection = {
  _id: string;
  title: string;
  description?: string;
};

type StorePreviewProps = {
  displayName: string;
  bio?: string;
  profileImageUrl?: string | null;
  coverImageUrl?: string | null;
  publicUrl: string;
  username: string;
  theme?: string;
  accentColor?: string;
  collections?: Collection[] | null;
};

export function StorePreview({
  displayName,
  bio,
  profileImageUrl,
  coverImageUrl,
  publicUrl,
  username,
  theme,
  accentColor,
  collections,
}: StorePreviewProps) {
  return (
    <div className="flex h-[min(85vh,700px)] w-[min(45vh,340px)] flex-col">
      <div className="relative flex flex-1 flex-col rounded-[3rem] border-[6px] border-gray-900 bg-gray-900 shadow-lg">
        <div className="absolute left-1/2 top-2 z-20 h-5.5 w-22.5 -translate-x-1/2 rounded-full bg-black" />

        <div
          className="flex flex-1 flex-col overflow-hidden rounded-[2.5rem]"
          style={{
            ...buildThemeStyle(theme, accentColor),
            backgroundColor: "var(--store-bg, white)",
          }}
        >
          <div
            className="flex items-center justify-between px-6 pt-3 pb-1 text-[9px] font-semibold"
            style={{ color: "var(--store-text, #111)" }}
          >
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

          <div
            className="mx-3 mb-2 rounded-lg px-3 py-1 text-center text-[10px] truncate"
            style={{
              backgroundColor: "var(--store-surface, #f3f4f6)",
              color: "var(--store-text-muted, #6b7280)",
            }}
          >
            {publicUrl || `linkkit.com/${username}`}
          </div>

          <div className="flex-1 overflow-y-auto">
            <div className="home-font-primary px-3 pb-6">
              {coverImageUrl && (
                <div className="mx-[-0.75rem] mb-2 h-16 overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={coverImageUrl}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                </div>
              )}

              <div className="my-6 space-y-2 text-center">
                {profileImageUrl && (
                  <div
                    className="mx-auto mb-2 h-12 w-12 overflow-hidden rounded-full border-2"
                    style={{
                      borderColor: "var(--store-accent, oklch(0.65 0.2 340))",
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={profileImageUrl}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  </div>
                )}
                <div className="inline-flex items-center justify-center gap-1.5">
                  <h1
                    className="font-secondary text-2xl"
                    style={{
                      color: "var(--store-accent, oklch(0.52 0.2 254))",
                    }}
                  >
                    {displayName}
                  </h1>
                </div>

                {bio && (
                  <p
                    className="mx-auto max-w-50 text-xs"
                    style={{ color: "var(--store-text-muted, #6b7280)" }}
                  >
                    {bio}
                  </p>
                )}
              </div>

              <div
                className="p-3 backdrop-blur-sm"
                style={{
                  backgroundColor: "var(--store-card-bg, oklch(1 0 0 / 0.6))",
                  border:
                    "2px solid var(--store-border, oklch(0.85 0.06 340 / 0.6))",
                  borderRadius: "var(--store-radius, 0)",
                }}
              >
                <div className="mb-4 flex items-center justify-center gap-1.5 font-secondary">
                  <h5
                    className="font-secondary text-sm"
                    style={{ color: "var(--store-text, #111)" }}
                  >
                    my collections
                  </h5>
                </div>

                {!collections || collections.length === 0 ? (
                  <div className="py-8 text-center">
                    <Heart
                      className="mx-auto mb-2 h-8 w-8"
                      style={{
                        color: "var(--store-accent, oklch(0.85 0.06 340))",
                      }}
                    />
                    <p
                      className="text-xs"
                      style={{ color: "var(--store-text-muted, #6b7280)" }}
                    >
                      building my collection...
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-3">
                    {collections.map((collection) => (
                      <div
                        key={collection._id}
                        className="relative w-full p-3"
                        style={{
                          backgroundColor: "var(--store-surface, white)",
                          border:
                            "2px solid var(--store-border, oklch(0.85 0.06 340 / 0.6))",
                        }}
                      >
                        <h2
                          className="mb-1 pr-6 text-xs font-bold leading-tight"
                          style={{ color: "var(--store-text, #111)" }}
                        >
                          {collection.title}
                        </h2>

                        {collection.description && (
                          <p
                            className="line-clamp-2 text-[10px]"
                            style={{
                              color: "var(--store-text-muted, #6b7280)",
                            }}
                          >
                            {collection.description}
                          </p>
                        )}

                        <div
                          className="mt-2 flex items-center justify-between pt-1.5"
                          style={{
                            borderTop:
                              "1px solid var(--store-border, oklch(0.85 0.06 340 / 0.6))",
                          }}
                        >
                          <span
                            className="text-[9px] font-medium"
                            style={{
                              color: "var(--store-text-muted, #6b7280)",
                            }}
                          >
                            see collection
                          </span>
                          <svg
                            className="h-3 w-3"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            style={{
                              color: "var(--store-accent, oklch(0.65 0.2 340))",
                            }}
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
  );
}
