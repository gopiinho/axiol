"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { useCachedQueryResult } from "@/lib/hooks/useCachedQueryResult";

export function useProduct(id: Id<"products">) {
  const product = useQuery(api.products.getById, { id });
  const items = useQuery(api.productItems.listByProduct, { productId: id });

  return {
    product,
    items,
    isLoading: product === undefined || items === undefined,
  };
}

export function useProducts() {
  const products = useQuery(api.products.listByUser);
  const cached = useCachedQueryResult("products", products);

  return {
    products: cached ?? [],
    isLoading: products === undefined && cached === undefined,
  };
}

export function useCreateProduct() {
  return useMutation(api.products.create);
}

export function useUpdateProduct() {
  return useMutation(api.products.update);
}

export function useDeleteProduct() {
  return useMutation(api.products.remove);
}

export function usePublishProduct() {
  return useMutation(api.products.publish);
}

export function useArchiveProduct() {
  return useMutation(api.products.archive);
}

export function useUnpublishProduct() {
  return useMutation(api.products.unpublish);
}

export function useCreateProductItem() {
  return useMutation(api.productItems.create);
}

export function useUpdateProductItem() {
  return useMutation(api.productItems.update);
}

export function useDeleteProductItem() {
  return useMutation(api.productItems.remove);
}

export function useReorderProductItems() {
  return useMutation(api.productItems.reorder);
}

export function useGenerateProductCoverUploadUrl() {
  return useMutation(api.storage.generateProductCoverUploadUrl);
}

export function useSaveProductCoverImage() {
  return useMutation(api.storage.saveProductCoverImage);
}

export function useRemoveProductCoverImage() {
  return useMutation(api.storage.removeProductCoverImage);
}

export function useUpdateThumbnailConfig() {
  return useMutation(api.products.updateThumbnailConfig);
}

export function useUpdateCheckoutConfig() {
  return useMutation(api.products.updateCheckoutConfig);
}

export function useUpdateContentConfig() {
  return useMutation(api.products.updateContentConfig);
}

export function useSaveThumbnailImage() {
  return useMutation(api.storage.saveThumbnailImage);
}

export function useRemoveThumbnailImage() {
  return useMutation(api.storage.removeThumbnailImage);
}

export function useDeleteContentFile() {
  return useMutation(api.contentStorage.deleteContentFile);
}
