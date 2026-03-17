import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Zap, Instagram, ShoppingBag } from "lucide-react";

export default function Home() {
  return (
    <main className="home-font-primary min-h-screen flex justify-center p-4 relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 dot-grid opacity-40" />
      <div
        className="pointer-events-none absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full"
        style={{
          background:
            "radial-gradient(circle, oklch(0.92 0.1 340 / 0.3) 0%, transparent 60%)",
        }}
      />
      <div
        className="pointer-events-none absolute -bottom-32 -left-32 h-[400px] w-[400px] rounded-full"
        style={{
          background:
            "radial-gradient(circle, oklch(0.9 0.12 250 / 0.25) 0%, transparent 60%)",
        }}
      />

      <div className="relative w-full max-w-3xl">
        <div className="text-center max-sm:my-14 max-sm:mb-28 sm:my-20 space-y-8">
          <div className="space-y-4">
            <p className="heading-playful text-lg text-pink tracking-wider">
              your creator toolkit
            </p>
            <h1 className="text-6xl font-extrabold tracking-tight text-primary sm:text-8xl leading-[0.95]">
              linkkit
            </h1>
          </div>

          <p className="text-lg text-muted-foreground max-w-lg mx-auto leading-relaxed sm:text-xl">
            Your affiliate store + Instagram DM automation, all in one place.
            Curate collections, auto-reply to reel comments with product links.
          </p>

          <div className="flex items-center justify-center gap-3 sm:gap-4">
            <Button asChild size="lg" className="px-8 text-base h-12">
              <Link href="/signup">Get Started Free</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-12">
              <Link href="/login">Sign In</Link>
            </Button>
          </div>
        </div>

        <div className="relative rounded-3xl border-2 border-border/80 bg-card/80 p-6 lg:p-10 backdrop-blur-sm">
          <div className="text-center space-y-8">
            <div className="space-y-2">
              <h2 className="heading-playful text-3xl text-primary sm:text-4xl">
                How it works
              </h2>
              <p className="text-sm text-muted-foreground">
                Three steps to automated affiliate income
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-3 text-left">
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
                  Link your Instagram account and map reels to your collections
                  with trigger keywords.
                </p>
              </div>
              <div className="space-y-3">
                <div className="inline-flex items-center justify-center h-11 w-11 rounded-xl bg-accent text-accent-foreground">
                  <Zap className="h-5 w-5" strokeWidth={2.5} />
                </div>
                <h3 className="text-lg font-bold">Auto-DM magic</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  When followers comment your keyword on a reel, they
                  automatically get a DM with your curated product links.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
