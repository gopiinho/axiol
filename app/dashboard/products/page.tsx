"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ProductTable } from "@/features/products/components/ProductTable";

export default function Products() {
  return (
    <div>
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
      <ProductTable />
    </div>
  );
}
