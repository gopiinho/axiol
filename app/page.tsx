import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Zap, Instagram, ShoppingBag } from "lucide-react";
import HomeNav from "@/components/HomeNav";

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
      <HomeNav />
      <div className="relative w-full max-w-3xl my-12">
        <div className="text-start flex flex-col justify-start items-start max-sm:my-14 max-sm:mb-28 sm:my-20 space-y-8">
          <div className="space-y-4">
            <h1 className="text-5xl font-extrabold tracking-tight text-primary sm:text-8xl leading-[0.95]">
              Your All-in-One Creator Store
            </h1>
          </div>

          <p className="text-sm text-muted-foreground max-sm:max-w-60 max-w-lg leading-relaxed sm:text-lg">
            Stan is the easiest way to make money online. All of your courses,
            digital products, and bookings are now hosted within your
            link-in-bio.
          </p>

          <div className="flex max-sm:w-full items-center justify-center gap-3 sm:gap-4">
            <Button asChild className="py-7 px-12 text-xl sm:text-2xl">
              <Link href="/signup">Continue</Link>
            </Button>
            {/* <Button asChild size="lg" variant="outline" className="h-12">
              <Link href="/login">Sign In</Link>
            </Button> */}
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
                <h3 className="text-lg font-bold">Automatic replies</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  When followers comment your keyword on a reel, they instantly
                  get a DM with your product links.
                </p>
              </div>
            </div>
          </div>
        </div>

        <footer className="mt-12 pb-4 text-center text-xs text-muted-foreground">
          <Link href="/privacy" className="hover:underline">
            Privacy Policy
          </Link>
          <span className="mx-2">·</span>
          <Link href="/terms" className="hover:underline">
            Terms of Service
          </Link>
        </footer>
      </div>
    </main>
  );
}
