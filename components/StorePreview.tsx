"use client";

import { buildThemeStyle, getTheme } from "@/lib/themes";
import { StoreContent, type StoreContentProps } from "@/components/StoreContent";

type StorePreviewProps = Omit<StoreContentProps, "themeStyle" | "showDots" | "interactive"> & {
  publicUrl: string;
  username: string;
  theme?: string;
  accentColor?: string;
};

const PHONE_WIDTH = 340;
const BORDER_WIDTH = 6;
const INNER_WIDTH = PHONE_WIDTH - BORDER_WIDTH * 2;
const CONTENT_WIDTH = 375;
const ZOOM_FACTOR = INNER_WIDTH / CONTENT_WIDTH;

export function StorePreview({
  publicUrl,
  username,
  theme,
  accentColor,
  ...contentProps
}: StorePreviewProps) {
  const themeStyle = buildThemeStyle(theme, accentColor);
  const showDots = getTheme(theme).vars["--store-show-dots"] === "1";

  return (
    <div className="flex h-[min(85vh,700px)] w-[min(45vh,340px)] flex-col">
      <div className="relative flex flex-1 flex-col rounded-[3rem] border-[6px] border-gray-900 bg-gray-900 shadow-lg">
        <div className="absolute left-1/2 top-2 z-20 h-5.5 w-22.5 -translate-x-1/2 rounded-full bg-black" />

        <div
          className="flex flex-1 flex-col overflow-hidden rounded-[2.5rem]"
          style={{
            backgroundColor: "var(--store-bg, white)",
            ...buildThemeStyle(theme, accentColor),
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
            <div
              style={{
                width: CONTENT_WIDTH,
                transformOrigin: "top left",
                transform: `scale(${ZOOM_FACTOR})`,
              }}
            >
              <StoreContent
                {...contentProps}
                themeStyle={themeStyle}
                showDots={showDots}
                interactive={false}
              />
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
