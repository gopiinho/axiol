"use client";

import { buildThemeStyle, type PaletteConfig, type LayoutConfig } from "@/lib/themes";
import { StoreContent, type StoreContentProps } from "@/components/StoreContent";

type StorePreviewProps = Omit<StoreContentProps, "themeStyle" | "interactive" | "headerLayout"> & {
  username: string;
  palette?: PaletteConfig;
  layout?: LayoutConfig;
};

export function StorePreview({ username, palette, layout, ...contentProps }: StorePreviewProps) {
  const themeStyle = palette
    ? buildThemeStyle(palette, layout ?? {})
    : ({} as React.CSSProperties);

  return (
    <div className="flex h-[min(85vh,700px)] w-full flex-col items-center">
      <div className="relative flex h-full w-[min(45vh,340px)] flex-col">
        <div className="relative flex h-full flex-col rounded-[3rem] border-[6px] border-gray-900 bg-gray-900 shadow-lg">
          <div className="absolute top-2 left-1/2 z-20 h-5.5 w-22.5 -translate-x-1/2 rounded-full bg-black" />

          <div
            className="flex h-full flex-col overflow-hidden rounded-[2.5rem]"
            style={{
              backgroundColor: "var(--store-bg, white)",
              ...themeStyle,
            }}
          >
            <div
              className="flex shrink-0 items-center justify-between px-6 pt-3 pb-2 text-[9px] font-semibold"
              style={{ color: "var(--store-text, #111)" }}
            >
              <span>9:41</span>
              <div className="flex items-center gap-1">
                <svg className="h-2.5 w-2.5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M1 9l2 2c5.52-5.52 14.45-5.52 19.97 0l2-2C18.27 2.27 5.74 2.27 1 9zm8 8l3 3 3-3c-1.65-1.66-4.34-1.66-6 0zm-4-4l2 2c2.76-2.76 7.24-2.76 10 0l2-2C15.14 9.14 8.87 9.14 5 13z" />
                </svg>
                <svg className="h-2.5 w-2.5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M15.67 4H14V2h-4v2H8.33C7.6 4 7 4.6 7 5.33v15.34C7 21.4 7.6 22 8.33 22h7.34c.74 0 1.33-.6 1.33-1.33V5.33C17 4.6 16.4 4 15.67 4z" />
                </svg>
              </div>
            </div>

            <div
              className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto [&::-webkit-scrollbar]:hidden"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              <StoreContent
                {...contentProps}
                username={username}
                themeStyle={themeStyle}
                interactive={false}
                compact
                headerLayout={layout?.headerLayout}
              />
            </div>
          </div>

          <div className="relative flex justify-center py-1.5">
            <div className="absolute bottom-4 h-1 w-24 rounded-full bg-gray-600" />
          </div>
        </div>
      </div>
    </div>
  );
}
