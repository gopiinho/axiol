import type { Metadata } from "next";
import { DM_Sans, Manrope, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

const manrope = Manrope({
  weight: ["400", "500", "600", "700", "800"],
  subsets: ["latin"],
  variable: "--font-manrope",
});

const spaceGrotesk = Space_Grotesk({
  weight: ["500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-space-grotesk",
});

const dmSans = DM_Sans({
  weight: ["400", "500", "700"],
  subsets: ["latin"],
  variable: "--font-dm-sans",
});

const BASE_URL = "https://www.axiol.store";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "Axiol — Monetize Your Audience",
    template: "%s — Axiol",
  },
  description:
    "The all-in-one storefront for content creators. Sell digital products, courses, coaching, and bookings — directly from your link-in-bio.",
  keywords: [
    "creator storefront",
    "link in bio",
    "sell digital products",
    "sell courses online",
    "creator monetization",
    "coaching bookings",
    "digital downloads",
    "content creator store",
  ],
  authors: [{ name: "Axiol" }],
  creator: "Axiol",
  publisher: "Axiol",
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Axiol",
    title: "Axiol — Monetize Your Audience",
    description:
      "Your link-in-bio, built to earn. Sell digital products, courses, and coaching from one beautiful storefront.",
    images: [
      {
        url: "/og-default.png",
        width: 1200,
        height: 630,
        alt: "Axiol — Creator Storefront",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Axiol — Monetize Your Audience",
    description:
      "Sell digital products, courses, and coaching from your link-in-bio.",
    images: ["/og-default.png"],
  },
  alternates: {
    canonical: BASE_URL,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${manrope.variable} ${spaceGrotesk.variable} ${dmSans.variable} relative min-h-screen w-full antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
