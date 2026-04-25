import { FadeIn } from "@/components/motion/FadeIn";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function Products() {
  return (
    <div>
      <FadeIn>
        <section className="px-5 lg:px-6 py-6 lg:py-8 border border-b">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="app-title">Products</h1>
              {/* <p className="app-subtitle mt-1">
                Review and publish your auto-DM posts
              </p> */}
            </div>
            <Link href="/dashboard/products/new">
              <Button size="lg" className="gap-2 sm:self-start">
                New Product
              </Button>
            </Link>
          </div>
        </section>
      </FadeIn>
    </div>
  );
}
