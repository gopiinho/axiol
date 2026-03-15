import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="home-font-primary min-h-screen flex justify-center p-4">
      <div className="w-full max-w-3xl">
        <div className="text-center max-sm:my-12 max-sm:mb-24 sm:my-16 space-y-6">
          <h1 className="font-secondary text-5xl text-primary sm:text-7xl">
            linkkit
          </h1>

          <p className="text-lg text-muted-foreground max-w-md mx-auto">
            Your affiliate store + Instagram DM automation, all in one place.
            Curate collections, auto-reply to reel comments with product links.
          </p>

          <div className="flex items-center justify-center gap-4">
            <Button asChild size="lg">
              <Link href="/signup">Get Started</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/login">Sign In</Link>
            </Button>
          </div>
        </div>

        <div className="relative backdrop-blur-sm bg-card/60 border-2 border-border p-6 lg:p-8">
          <div className="text-center space-y-4">
            <h2 className="font-secondary text-2xl text-primary">
              How it works
            </h2>
            <div className="grid gap-6 md:grid-cols-3 text-left">
              <div className="space-y-2">
                <h3 className="font-semibold">1. Create your store</h3>
                <p className="text-sm text-muted-foreground">
                  Sign up and get your own page at linkkit.com/yourname. Add
                  product collections with affiliate links.
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold">2. Connect Instagram</h3>
                <p className="text-sm text-muted-foreground">
                  Link your Instagram account and map reels to your collections
                  with trigger keywords.
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold">3. Auto-DM magic</h3>
                <p className="text-sm text-muted-foreground">
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
