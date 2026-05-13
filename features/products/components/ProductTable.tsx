"use client";

import type { Id } from "@/convex/_generated/dataModel";
import { useProducts } from "../hooks/useProduct";
import { ProductRow } from "./ProductRow";
import { usePublishProduct, useArchiveProduct, useDeleteProduct } from "../hooks/useProduct";
import ProductsSkeleton from "@/components/products/ProductsSkeleton";
import NoProducts from "@/components/products/NoProducts";

export function ProductTable() {
  const { products, isLoading } = useProducts();
  const publishProduct = usePublishProduct();
  const archiveProduct = useArchiveProduct();
  const deleteProduct = useDeleteProduct();

  if (isLoading) {
    return <ProductsSkeleton />;
  }

  if (products.length === 0) {
    return <NoProducts />;
  }

  return (
    <div className="p-5 sm:p-8">
      <div className="app-panel overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border/50">
              <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Product
              </th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden sm:table-cell">
                Type
              </th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden md:table-cell">
                Price
              </th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Status
              </th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden lg:table-cell">
                Automation
              </th>
              <th className="py-3 px-4 w-10" />
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <ProductRow
                key={product._id}
                product={product}
                onPublish={async (id: Id<"products">) => {
                  try {
                    await publishProduct({ id });
                  } catch {
                    // handled by toast in the future
                  }
                }}
                onArchive={async (id: Id<"products">) => {
                  try {
                    await archiveProduct({ id });
                  } catch {
                    // handled by toast in the future
                  }
                }}
                onDelete={async (id: Id<"products">) => {
                  try {
                    await deleteProduct({ id });
                  } catch {
                    // handled by toast in the future
                  }
                }}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
