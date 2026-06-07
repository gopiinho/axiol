import Link from "next/link";
import { Button } from "@/components/ui/button";

export function FinalCta() {
  return (
    <section className="relative px-6 py-16 sm:px-12 sm:py-24 lg:px-20 xl:px-28">
      <div className="mx-auto w-full max-w-5xl">
        <div className="border-primary/20 bg-primary/5 space-y-6 rounded-3xl border-2 p-8 text-center backdrop-blur-sm sm:p-12 lg:p-16">
          <h2 className="heading-playful text-primary text-3xl sm:text-4xl lg:text-5xl">
            Ready to automate your affiliate game?
          </h2>
          <p className="text-muted-foreground mx-auto max-w-md text-sm sm:text-base">
            Start your 14-day free trial. No credit card required.
          </p>
          <div className="pt-2">
            <Button asChild className="px-10 py-6 text-lg sm:text-xl">
              <Link href="/signup">Get Started Free</Link>
            </Button>
          </div>
          <p className="text-muted-foreground text-xs">Setup takes less than 5 minutes</p>
        </div>
      </div>
    </section>
  );
}
