"use client";

import { use, useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Save, ArrowRight, EyeOff, Upload, Loader2 } from "lucide-react";
import { ProductTypeIcon } from "@/features/products/components/ProductTypeIcon";
import { ProductItemsManager } from "@/features/products/components/ProductItemsManager";
import ProductsSkeleton from "@/components/products/ProductsSkeleton";
import { useUser } from "@/features/auth/client/UserContext";
import { usePublishProduct, useUnpublishProduct } from "@/features/products/hooks/useProduct";
import { getProductTypeDefinition } from "@/features/products/registry/productTypes";
import type { ProductTypeKey } from "@/features/products/registry/productTypes";
import { ProductBuilderLayout } from "@/features/products/builder/ProductBuilderLayout";
import { STEP_COMPONENTS } from "@/features/products/builder/steps/StepRegistry";
import { ProductStepPreview } from "@/features/products/builder/previews/ProductStepPreview";
import type {
  ThumbnailLiveState,
  CheckoutLiveState,
} from "@/features/products/components/cards/types";

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
  const [busyAction, setBusyAction] = useState<"save" | "next" | null>(null);
  const [publishing, setPublishing] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [thumbnailLiveState, setThumbnailLiveState] = useState<ThumbnailLiveState>({
    style: "button",
    title: "",
    buttonText: "Download Now",
  });
  const [checkoutLiveState, setCheckoutLiveState] = useState<CheckoutLiveState>({
    name: "",
    description: "",
    price: "",
    coverImageUrl: null,
    phoneEnabled: false,
    username: "",
    type: "",
    checkoutButtonText: "Buy Now",
  });
  const saveFnsRef = useRef<Map<number, () => Promise<void>>>(new Map());

  const publishProduct = usePublishProduct();
  const unpublishProduct = useUnpublishProduct();

  const isLoading = product === undefined || items === undefined;
  const needsItems = product?.type === "affiliate" && (items?.length ?? 0) === 0;

  const definition = product ? getProductTypeDefinition(product.type as ProductTypeKey) : null;
  const isLastStep = definition ? currentStepIndex === definition.steps.length - 1 : false;

  useEffect(() => {
    if (product && definition) {
      const saved = product.config?.thumbnail as
        | { style?: string; title?: string; subtitle?: string; buttonText?: string }
        | undefined;
      setThumbnailLiveState({
        style:
          saved?.style === "button" || saved?.style === "callout"
            ? saved.style
            : definition.defaultThumbnailStyle === "preview"
              ? "button"
              : (definition.defaultThumbnailStyle as "button" | "callout"),
        title: saved?.title || product.name,
        subtitle: saved?.subtitle,
        buttonText: saved?.buttonText || definition.defaultButtonText,
        imageUrl: product.thumbnailImageUrl ?? null,
        price: product.price,
      });
      const checkoutConfig = product.config?.checkout as
        | {
            buttonText?: string;
            collectFields?: Array<{ key: string; enabled: boolean }>;
          }
        | undefined;
      const phoneField = checkoutConfig?.collectFields?.find((f) => f.key === "phone");
      setCheckoutLiveState({
        name: product.name,
        description: product.description || "",
        price: product.price || "",
        coverImageUrl: product.coverImageUrl ?? null,
        phoneEnabled: phoneField?.enabled ?? false,
        username: user?.username || "",
        type: product.type,
        checkoutButtonText: checkoutConfig?.buttonText || "Buy Now",
      });
    }
  }, [product, definition, user?.username]);

  const handleRegisterSave = useCallback((stepIndex: number, fn: () => Promise<void>) => {
    saveFnsRef.current.set(stepIndex, fn);
  }, []);

  const handleNext = async () => {
    if (!definition || busyAction) return;
    setBusyAction("next");
    try {
      await saveFnsRef.current.get(currentStepIndex)?.();
      if (isLastStep) {
        setPublishing(true);
        try {
          await publishProduct({ id: productId });
          router.push("/dashboard/products");
        } catch {
        } finally {
          setPublishing(false);
        }
      } else {
        setCurrentStepIndex((prev) => Math.min(prev + 1, definition.steps.length - 1));
      }
    } catch {
    } finally {
      setBusyAction(null);
    }
  };

  const handleSave = async () => {
    setBusyAction("save");
    try {
      await saveFnsRef.current.get(currentStepIndex)?.();
      router.push("/dashboard/products");
    } catch {
    } finally {
      setBusyAction(null);
    }
  };

  const handleUnpublish = async () => {
    try {
      await unpublishProduct({ id: productId });
    } catch {}
  };

  const handleSaveStay = async () => {
    setBusyAction("save");
    try {
      await saveFnsRef.current.get(currentStepIndex)?.();
    } catch {
    } finally {
      setBusyAction(null);
    }
  };

  const handleNextForPublished = async () => {
    if (!definition || busyAction) return;
    setBusyAction("next");
    try {
      await saveFnsRef.current.get(currentStepIndex)?.();
      if (!isLastStep) {
        setCurrentStepIndex((prev) => Math.min(prev + 1, definition.steps.length - 1));
      }
    } catch {
    } finally {
      setBusyAction(null);
    }
  };

  return (
    <div>
      <section className="border-b p-5 sm:p-8">
        <div className="flex items-center justify-between">
          <div className="hidden items-center gap-3 sm:flex">
            <h1 className="app-title">
              {isLoading ? "Loading..." : (product?.name ?? "Product not found")}
            </h1>
            {product && (
              <ProductTypeIcon type={product.type} className="text-muted-foreground h-5 w-5" />
            )}
          </div>
          {product && (
            <div className="flex gap-2">
              {(product.status === "draft" || product.status === "archived") && (
                <>
                  <Button variant="outline" onClick={handleSave} disabled={!!busyAction}>
                    {busyAction === "save" ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    Save
                  </Button>
                  <Button
                    variant="default"
                    onClick={handleNext}
                    disabled={!!busyAction || publishing || needsItems}
                    title={needsItems ? "Add at least one item before publishing" : undefined}
                  >
                    {isLastStep ? (
                      <>
                        {publishing ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Upload className="h-4 w-4" />
                        )}
                        Publish
                      </>
                    ) : (
                      <>
                        Next
                        {busyAction === "next" ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <ArrowRight className="h-4 w-4" />
                        )}
                      </>
                    )}
                  </Button>
                </>
              )}

              {product.status === "published" && (
                <>
                  <Button variant="outline" onClick={handleUnpublish}>
                    <EyeOff className="h-4 w-4" />
                    Unpublish
                  </Button>
                  <Button
                    variant={isLastStep ? "default" : "outline"}
                    onClick={handleSaveStay}
                    disabled={!!busyAction}
                  >
                    {busyAction === "save" ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    Save
                  </Button>
                  {!isLastStep && (
                    <Button
                      variant="default"
                      onClick={handleNextForPublished}
                      disabled={!!busyAction}
                    >
                      Next
                      {busyAction === "next" ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <ArrowRight className="h-4 w-4" />
                      )}
                    </Button>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </section>

      <div className="p-5 sm:p-8">
        {isLoading ? (
          <ProductsSkeleton />
        ) : !product || !definition ? (
          <div className="py-12 text-center">
            <p className="text-muted-foreground">Product not found.</p>
            <Link href="/dashboard/products">
              <Button variant="outline" className="mt-4">
                Back to products
              </Button>
            </Link>
          </div>
        ) : product.type === "affiliate" ? (
          <div className="space-y-12">
            <div className="border-border/70 border-t pt-4">
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
            preview={
              <ProductStepPreview
                stepKey={definition.steps[currentStepIndex]}
                liveState={
                  definition.steps[currentStepIndex] === "checkout"
                    ? checkoutLiveState
                    : thumbnailLiveState
                }
              />
            }
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
                    {...(stepKey === "thumbnail"
                      ? ({ onLiveChange: setThumbnailLiveState } as Record<string, unknown>)
                      : stepKey === "checkout"
                        ? ({ onLiveChange: setCheckoutLiveState } as Record<string, unknown>)
                        : {})}
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
