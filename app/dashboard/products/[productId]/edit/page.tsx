"use client";

import { use, useState, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Save, ArrowRight } from "lucide-react";
import { ProductTypeIcon } from "@/features/products/components/ProductTypeIcon";
import { ProductItemsManager } from "@/features/products/components/ProductItemsManager";
import ProductsSkeleton from "@/components/products/ProductsSkeleton";
import { useUser } from "@/features/auth/client/UserContext";
import {
  usePublishProduct,
  useArchiveProduct,
} from "@/features/products/hooks/useProduct";
import { getProductTypeDefinition } from "@/features/products/registry/productTypes";
import type { ProductTypeKey } from "@/features/products/registry/productTypes";
import { ProductBuilderLayout } from "@/features/products/builder/ProductBuilderLayout";
import { STEP_COMPONENTS } from "@/features/products/builder/steps/StepRegistry";

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
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const saveFnsRef = useRef<Map<number, () => Promise<void>>>(new Map());

  const publishProduct = usePublishProduct();
  const archiveProduct = useArchiveProduct();

  const isLoading = product === undefined || items === undefined;
  const needsItems =
    product?.type === "affiliate" && (items?.length ?? 0) === 0;

  const definition = product ? getProductTypeDefinition(product.type as ProductTypeKey) : null;
  const isLastStep = definition ? currentStepIndex === definition.steps.length - 1 : false;

  const handleRegisterSave = useCallback((stepIndex: number, fn: () => Promise<void>) => {
    saveFnsRef.current.set(stepIndex, fn);
  }, []);

  const handleNext = async () => {
    if (!definition || saving) return;
    setSaving(true);
    try {
      await saveFnsRef.current.get(currentStepIndex)?.();
      if (isLastStep) {
        setPublishing(true);
        try {
          await publishProduct({ id: productId });
          router.push("/dashboard/products");
        } catch {} finally {
          setPublishing(false);
        }
      } else {
        setCurrentStepIndex((prev) => Math.min(prev + 1, definition.steps.length - 1));
      }
    } catch {
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveFnsRef.current.get(currentStepIndex)?.();
      router.push("/dashboard/products");
    } catch {
    } finally {
      setSaving(false);
    }
  };

  const handleArchive = async () => {
    try {
      await archiveProduct({ id: productId });
    } catch {}
  };

  return (
    <div>
      <section className="p-5 sm:p-8 border-b">
          <div className="flex items-center justify-between">
            <div className="sm:flex items-center gap-3 hidden">
              <h1 className="app-title">
                {isLoading
                  ? "Loading..."
                  : (product?.name ?? "Product not found")}
              </h1>
              {product && (
                <ProductTypeIcon
                  type={product.type}
                  className="h-5 w-5 text-muted-foreground"
                />
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
                    onClick={handleNext}
                    disabled={saving || publishing || needsItems}
                    title={
                      needsItems
                        ? "Add at least one item before publishing"
                        : undefined
                    }
                  >
                    {isLastStep
                      ? (publishing ? "Publishing..." : "Publish")
                      : (saving ? "Saving..." : "Next")}
                    {!isLastStep && !saving && <ArrowRight className="h-4 w-4 ml-1.5" />}
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

      <div className="p-5 sm:p-8">
        {isLoading ? (
          <ProductsSkeleton />
        ) : !product || !definition ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Product not found.</p>
            <Link href="/dashboard/products">
              <Button variant="outline" className="mt-4">
                Back to products
              </Button>
            </Link>
          </div>
        ) : product.type === "affiliate" ? (
          <div className="space-y-12">
            <div className="pt-4 border-t border-border/70">
              <ProductItemsManager
                productId={productId}
                items={items ?? []}
                productType={product.type}
              />
            </div>
          </div>
        ) : (
          <ProductBuilderLayout
            product={product}
            definition={definition}
            currentStepKey={definition.steps[currentStepIndex]}
            currentStepIndex={currentStepIndex}
            totalSteps={definition.steps.length}
            onStepClick={setCurrentStepIndex}
          >
            {definition.steps.map((stepKey, index) => {
              const Step = STEP_COMPONENTS[stepKey];
              if (!Step) return null;
              return (
                <div key={stepKey} className={index === currentStepIndex ? "" : "hidden"}>
                  <Step
                    productId={product._id}
                    product={{
                      _id: product._id,
                      name: product.name,
                      description: product.description,
                      productUrl: product.productUrl,
                      price: product.price,
                      priceCents: product.priceCents,
                      coverImageUrl: product.coverImageUrl,
                      coverImageId: product.coverImageId,
                      thumbnailImageUrl: product.thumbnailImageUrl ?? null,
                      username: user?.username,
                      type: product.type,
                      status: product.status,
                      config: product.config as Record<string, unknown>,
                    }}
                    onRegisterSave={(fn) => handleRegisterSave(index, fn)}
                    visible={index === currentStepIndex}
                  />
                </div>
              );
            })}
          </ProductBuilderLayout>
        )}
      </div>
    </div>
  );
}
