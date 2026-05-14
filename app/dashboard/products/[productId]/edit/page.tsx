"use client";

import { use, useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id, Doc } from "@/convex/_generated/dataModel";
import { useUser } from "@/features/auth/client/UserContext";
import { FadeIn } from "@/components/motion/FadeIn";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save } from "lucide-react";
import { ProductTypeIcon } from "@/features/products/components/ProductTypeIcon";
import {
  ProductDetail,
  type ProductDetailHandle,
} from "@/features/products/components/ProductDetail";
import { ProductItemsManager } from "@/features/products/components/ProductItemsManager";
import ProductsSkeleton from "@/components/products/ProductsSkeleton";
import {
  usePublishProduct,
  useArchiveProduct,
} from "@/features/products/hooks/useProduct";
import { cn } from "@/lib/utils";

export default function EditProduct({
  params,
}: {
  params: Promise<{ productId: Id<"products"> }>;
}) {
  const { productId } = use(params);
  const { user } = useUser();
  const product = useQuery(api.products.getById, { id: productId });
  const items = useQuery(api.productItems.listByProduct, {
    productId,
  });

  const router = useRouter();
  const detailRef = useRef<ProductDetailHandle>(null);
  const [saving, setSaving] = useState(false);
  const publishProduct = usePublishProduct();
  const archiveProduct = useArchiveProduct();

  const isLoading = product === undefined || items === undefined;
  const needsItems =
    product?.type === "affiliate" && (items?.length ?? 0) === 0;

  const handlePublish = async () => {
    if (needsItems) return;
    try {
      await publishProduct({ id: productId });
    } catch {
      // handled in future via toast
    }
  };

  const handleArchive = async () => {
    try {
      await archiveProduct({ id: productId });
    } catch {
      // handled in future via toast
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await detailRef.current?.save();
      router.push("/dashboard/products");
    } catch {
      // error shown inline in ProductDetail
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <FadeIn>
        <section className="p-5 sm:p-8 border-b">
          <div className="flex items-center justify-between">
            <div className="sm:flex items-center gap-3 hidden">
              <h1 className="app-title">
                {isLoading
                  ? "Loading..."
                  : (product?.name ?? "Product not found")}
              </h1>
              {product && (
                <ProductTypeIcon type={product.type} className="h-5 w-5 text-muted-foreground" />
              )}
            </div>
            {product && (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={handleSave}
                  disabled={saving}
                >
                  <Save className="h-4 w-4 mr-1.5" />
                  {saving ? "Saving..." : "Save"}
                </Button>
                {(product.status === "draft" ||
                  product.status === "archived") && (
                  <Button
                    variant="default"
                    onClick={handlePublish}
                    disabled={needsItems}
                    title={
                      needsItems
                        ? "Add at least one item before publishing"
                        : undefined
                    }
                  >
                    Publish
                  </Button>
                )}
                {product.status === "published" && (
                  <Button variant="secondary" onClick={handleArchive}>
                    Archive
                  </Button>
                )}
              </div>
            )}
          </div>
        </section>
      </FadeIn>

      <div className="p-5 sm:p-8">
        {isLoading ? (
          <ProductsSkeleton />
        ) : !product ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Product not found.</p>
            <Link href="/dashboard/products">
              <Button variant="outline" className="mt-4">
                Back to products
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-12">
            <ProductDetail
              ref={detailRef}
              username={user?.username ?? ""}
              product={
                product as Doc<"products"> & { coverImageUrl?: string | null }
              }
            />
            <ProductItemsManager
              productId={productId}
              items={items ?? []}
              productType={product.type}
            />
          </div>
        )}
      </div>
    </div>
  );
}
