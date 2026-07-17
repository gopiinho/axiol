import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Page Not Found",
  robots: { index: false },
};

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="text-primary text-7xl font-black">404</h1>
      <p className="text-muted-foreground text-base">This page doesn&apos;t exist.</p>
      <Link href="/" className="underline">
        Go home
      </Link>
    </main>
  );
}
