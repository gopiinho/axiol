import Link from "next/link";
import { Button } from "@/components/ui/button";

export function FinalCta() {
  return (
    <section className="relative px-6 sm:px-12 lg:px-20 xl:px-28 py-16 sm:py-24">
      <div className="w-full max-w-5xl mx-auto">
        <div className="rounded-3xl border-2 border-primary/20 bg-primary/5 backdrop-blur-sm p-8 sm:p-12 lg:p-16 text-center space-y-6">
          <h2 className="heading-playful text-3xl sm:text-4xl lg:text-5xl text-primary">
            Ready to automate your affiliate game?
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground max-w-md mx-auto">
            Start your 14-day free trial. No credit card required.
          </p>
          <div className="pt-2">
            <Button asChild className="py-6 px-10 text-lg sm:text-xl">
              <Link href="/signup">Get Started Free</Link>
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Setup takes less than 5 minutes
          </p>
        </div>
      </div>
    </section>
  );
}
