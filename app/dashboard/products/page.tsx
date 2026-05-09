"use client";

import { api } from "@/convex/_generated/api";
import type { Doc } from "@/convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { FadeIn } from "@/components/motion/FadeIn";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import NoProducts from "@/components/products/NoProducts";
import ProductsSkeleton from "@/components/products/ProductsSkeleton";
import { useUser } from "@/features/auth/client/UserContext";

const productsCache = new Map<string, Doc<"products">[]>();

export default function Products() {
  const { user } = useUser();
  const products = useQuery(api.products.listByUser);
  const cachedProducts = user ? productsCache.get(user._id) : undefined;

  if (user && products !== undefined) {
    productsCache.set(user._id, products);
  }

  const resolvedProducts = products ?? cachedProducts;
  const isLoading = resolvedProducts === undefined;

  return (
    <div>
      <FadeIn>
        <section className="p-5 sm:p-8 border-b">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="app-title">Products</h1>
            </div>
            <Link href="/dashboard/products/new">
              <Button size="lg" className="gap-2 sm:self-start">
                New Product
              </Button>
            </Link>
          </div>
        </section>
      </FadeIn>
      {isLoading ? (
        <ProductsSkeleton />
      ) : (resolvedProducts?.length ?? 0) > 0 ? (
        <p>Has products</p>
      ) : (
        <NoProducts />
      )}
    </div>
  );
}
