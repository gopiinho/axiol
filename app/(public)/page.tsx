import Link from "next/link";
import { Zap, Instagram, ShoppingBag } from "lucide-react";
import { WaitlistForm } from "@/components/WaitlistForm";
import HomeNav from "@/components/HomeNav";
import { SocialProofBar } from "@/components/landing/SocialProofBar";
import { AutoDmShowcase } from "@/components/landing/AutoDmShowcase";
import { StorefrontShowcase } from "@/components/landing/StorefrontShowcase";
import { FeatureGrid } from "@/components/landing/FeatureGrid";
import { FinalCta } from "@/components/landing/FinalCta";
import { CloudBackground } from "@/components/landing/CloudBackground";

export default function Home() {
  return (
    <main className="home-font-primary bg-background relative overflow-hidden">
      <div className="dot-grid pointer-events-none absolute inset-0 opacity-40" />
      <HomeNav />

      <section className="relative flex min-h-screen items-end px-6 pt-28 pb-16 sm:px-16 sm:pt-40 sm:pb-20 lg:px-28 lg:pb-28 xl:px-32">
        <CloudBackground />
        <div className="relative z-10 mx-auto w-full max-w-7xl">
          <div className="max-w-2xl space-y-6 sm:space-y-8 lg:max-w-3xl">
            <h1 className="text-primary text-outline-black text-5xl leading-[0.95] font-extrabold tracking-tight sm:text-6xl lg:text-7xl xl:text-8xl">
              Turn your content into <span className="marker-stroke">income.</span>
            </h1>

            <p className="max-w-md text-sm leading-relaxed sm:max-w-lg sm:text-lg lg:text-xl">
              The easiest way to make money online. All of your digital products, affiliate links
              and bookings — hosted within your link-in-bio.
            </p>

            <WaitlistForm />
          </div>
        </div>
      </section>

      {/* <StorefrontShowcase />

      <SocialProofBar />

      <AutoDmShowcase /> */}

      {/* How it works */}
      {/* <section className="relative px-6 sm:px-12 lg:px-20 xl:px-28 py-16 sm:py-24 lg:py-32">
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
                  <h3 className="text-lg font-bold">1. Create your store</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Sign up and get your own page at axiol.com/yourname. Add
                    product collections with affiliate links.
                  </p>
                </div>
                <div className="space-y-3">
                  <div className="inline-flex items-center justify-center h-11 w-11 rounded-xl bg-pink-subtle text-pink">
                    <Instagram className="h-5 w-5" strokeWidth={2.5} />
                  </div>
                  <h3 className="text-lg font-bold">2. Connect Instagram</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Link your Instagram account and map reels to your
                    collections with trigger keywords.
                  </p>
                </div>
                <div className="space-y-3">
                  <div className="inline-flex items-center justify-center h-11 w-11 rounded-xl bg-accent text-accent-foreground">
                    <Zap className="h-5 w-5" strokeWidth={2.5} />
                  </div>
                  <h3 className="text-lg font-bold">3. Automatic replies</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    When followers comment your keyword on a reel, they
                    instantly get a DM with your product links.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section> */}

      {/* <section className="relative px-6 sm:px-12 lg:px-20 xl:px-28 py-12 sm:py-16">
        <div className="w-full max-w-3xl mx-auto text-center space-y-6">
          <h2 className="heading-playful text-3xl sm:text-4xl text-primary">
            All your favorite platforms, one link
          </h2>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {[
              { name: "Amazon", cls: "badge-platform-amazon" },
              { name: "Flipkart", cls: "badge-platform-flipkart" },
              { name: "Nykaa", cls: "badge-platform-nykaa" },
              { name: "Meesho", cls: "badge-platform-meesho" },
              { name: "+Custom", cls: "badge-platform-other" },
            ].map((p) => (
              <span
                key={p.name}
                className={`inline-flex items-center rounded-full px-4 py-2 text-sm font-semibold ${p.cls}`}
              >
                {p.name}
              </span>
            ))}
          </div>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Add affiliate links from any platform. Your followers get one clean
            page with everything.
          </p>
        </div>
      </section>

      <FeatureGrid />

      <FinalCta /> */}

      {/* <footer className="relative px-6 sm:px-12 lg:px-20 xl:px-28 py-8 sm:py-10">
        <div className="w-full max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <span className="text-lg font-black text-primary">Axiol</span>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="hover:underline">
              Privacy Policy
            </Link>
            <span>·</span>
            <Link href="/terms" className="hover:underline">
              Terms of Service
            </Link>
          </div>
        </div>
      </footer> */}
    </main>
  );
}
