"use client";

import { useState, forwardRef, useImperativeHandle } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ProductTypeSelector } from "./ProductTypeSelector";
import { useCreateProduct } from "../hooks/useProduct";
import { PRODUCT_TYPES } from "../registry/productTypes";
import type { ProductTypeKey } from "../registry/productTypes";

export type CreateProductFlowHandle = {
  submit: () => void;
};

export const CreateProductFlow = forwardRef<CreateProductFlowHandle>(function CreateProductFlow(_props, ref) {
  const router = useRouter();
  const createProduct = useCreateProduct();

  const [name, setName] = useState("");
  const [type, setType] = useState("affiliate");
  const [price, setPrice] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const definition = PRODUCT_TYPES[type as ProductTypeKey];
  const showPrice = definition?.requiresPrice ?? false;

  const handleSubmit = async () => {
    if (!name.trim() || loading) return;

    setLoading(true);
    setErrorMessage(null);

    try {
      const productId = await createProduct({
        name: name.trim(),
        type: type as "affiliate" | "digital",
        price: showPrice ? price.trim() || undefined : undefined,
      });
      router.push(`/dashboard/products/${productId}/edit`);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Couldn't create this product. Check your connection and try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  useImperativeHandle(ref, () => ({
    submit: handleSubmit,
  }));

  return (
    <div className="space-y-10">
      {errorMessage && (
        <Alert variant="destructive">
          <AlertTitle>Couldn&apos;t create product</AlertTitle>
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}

      <section className="grid gap-1">
        <Label htmlFor="product-name" className="font-bold">
          Name
        </Label>
        <Input
          id="product-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., Summer Style Picks"
          required
          autoFocus
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleSubmit();
            }
          }}
        />
      </section>

      <section className="grid gap-3">
        <Label className="font-bold">Products</Label>
        <ProductTypeSelector value={type} onChange={setType} />
      </section>

      {showPrice && (
        <section className="grid gap-1">
          <Label htmlFor="product-price" className="font-bold">
            Price
          </Label>
          <Input
            id="product-price"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="e.g., $29, ₹999"
          />
          <p className="text-xs text-muted-foreground">
            Display price for your store page.
          </p>
        </section>
      )}
    </div>
  );
});
