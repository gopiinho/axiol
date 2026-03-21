import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Zap, Instagram, ShoppingBag } from "lucide-react";
import HomeNav from "@/components/HomeNav";

export default function Home() {
  return (
    <main className="home-font-primary bg-pink-100 min-h-screen relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 dot-grid opacity-40" />
      <div
        className="pointer-events-none absolute -top-40 -right-40 h-125 w-125 rounded-full"
        style={{
          background:
            "radial-gradient(circle, oklch(0.92 0.1 340 / 0.3) 0%, transparent 60%)",
        }}
      />
      <div
        className="pointer-events-none absolute -bottom-32 -left-32 h-100 w-100 rounded-full"
        style={{
          background:
            "radial-gradient(circle, oklch(0.9 0.12 250 / 0.25) 0%, transparent 60%)",
        }}
      />
      <HomeNav />

      <section className="relative min-h-[calc(100svh-80px)] flex items-end px-6 sm:px-16 lg:px-28 xl:px-32 pb-16 sm:pb-20 lg:pb-28 pt-28 sm:pt-40">
        <div className="w-full max-w-7xl mx-auto">
          <div className="max-w-2xl lg:max-w-3xl space-y-6 sm:space-y-8">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-extrabold tracking-tight text-primary leading-[0.95]">
              Your All-in-One Creator Store
            </h1>

            <p className="text-sm sm:text-lg lg:text-xl text-muted-foreground max-w-md sm:max-w-lg leading-relaxed">
              The easiest way to make money online. All of your courses, digital
              products, and bookings — hosted within your link-in-bio.
            </p>

            <div className="flex items-center gap-3 sm:gap-4 pt-2">
              <Button asChild className="py-7 px-12 text-xl sm:text-2xl">
                <Link href="/signup">Continue</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="relative px-6 sm:px-12 lg:px-20 xl:px-28 py-16 sm:py-24 lg:py-32">
        <div className="w-full max-w-7xl mx-auto">
          <div className="rounded-3xl border-2 border-border/80 bg-card/80 p-6 sm:p-8 lg:p-12 backdrop-blur-sm">
            <div className="text-center space-y-8 sm:space-y-10">
              <div className="space-y-2">
                <h2 className="heading-playful text-3xl text-primary sm:text-4xl">
                  How it works
                </h2>
                <p className="text-sm text-muted-foreground">
                  Three steps to automated affiliate income
                </p>
              </div>

              <div className="grid gap-8 sm:gap-10 md:grid-cols-3 text-left">
                <div className="space-y-3">
                  <div className="inline-flex items-center justify-center h-11 w-11 rounded-xl bg-primary/10 text-primary">
                    <ShoppingBag className="h-5 w-5" strokeWidth={2.5} />
                  </div>
                  <h3 className="text-lg font-bold">Create your store</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Sign up and get your own page at linkkit.com/yourname. Add
                    product collections with affiliate links.
                  </p>
                </div>
                <div className="space-y-3">
                  <div className="inline-flex items-center justify-center h-11 w-11 rounded-xl bg-pink-subtle text-pink">
                    <Instagram className="h-5 w-5" strokeWidth={2.5} />
                  </div>
                  <h3 className="text-lg font-bold">Connect Instagram</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Link your Instagram account and map reels to your
                    collections with trigger keywords.
                  </p>
                </div>
                <div className="space-y-3">
                  <div className="inline-flex items-center justify-center h-11 w-11 rounded-xl bg-accent text-accent-foreground">
                    <Zap className="h-5 w-5" strokeWidth={2.5} />
                  </div>
                  <h3 className="text-lg font-bold">Automatic replies</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    When followers comment your keyword on a reel, they
                    instantly get a DM with your product links.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="relative px-6 sm:px-12 lg:px-20 xl:px-28 pb-8 text-center text-xs text-muted-foreground">
        <Link href="/privacy" className="hover:underline">
          Privacy Policy
        </Link>
        <span className="mx-2">·</span>
        <Link href="/terms" className="hover:underline">
          Terms of Service
        </Link>
      </footer>
    </main>
  );
}
