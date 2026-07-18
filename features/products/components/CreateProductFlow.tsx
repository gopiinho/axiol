"use client";

import { useState, forwardRef, useImperativeHandle, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ProductTypeSelector } from "./ProductTypeSelector";
import { useCreateProduct } from "../hooks/useProduct";
import { PRODUCT_TYPES } from "../registry/productTypes";
import type { ProductTypeKey } from "../registry/productTypes";

export type CreateProductFlowHandle = {
  submit: () => void;
  loading: boolean;
};

export const CreateProductFlow = forwardRef<
  CreateProductFlowHandle,
  { onLoadingChange?: (loading: boolean) => void }
>(function CreateProductFlow({ onLoadingChange }, ref) {
  const router = useRouter();
  const createProduct = useCreateProduct();

  const [name, setName] = useState("");
  const [type, setType] = useState("digital");
  const [price, setPrice] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; price?: string }>({});

  const definition = PRODUCT_TYPES[type as ProductTypeKey];
  const showPrice = definition?.requiresPrice ?? false;

  const handleSubmit = async () => {
    const newErrors: { name?: string; price?: string } = {};

    if (!name.trim()) newErrors.name = "Name is required";
    if (showPrice && !price.trim()) newErrors.price = "Price is required";
    else if (showPrice && price.trim() && parseFloat(price.trim()) < 10) newErrors.price = "Minimum price is ₹10";

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0 || loading) return;

    setLoading(true);

    try {
      const productId = await createProduct({
        name: name.trim(),
        type: type as "affiliate" | "digital",
        price: showPrice ? price.trim() || undefined : undefined,
      });
      toast.success("Product created!");
      router.push(`/dashboard/products/${productId}/edit`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Couldn't create product");
    } finally {
      setLoading(false);
    }
  };

  useImperativeHandle(ref, () => ({
    submit: handleSubmit,
    get loading() {
      return loading;
    },
  }));

  useEffect(() => {
    onLoadingChange?.(loading);
  }, [loading, onLoadingChange]);

  return (
    <div className="space-y-10">
      <section className="grid gap-1">
        <Label htmlFor="product-name" className="font-bold">
          Name
        </Label>
        <Input
          id="product-name"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setErrors((prev) => ({ ...prev, name: undefined }));
          }}
          required
          autoFocus
          aria-invalid={!!errors.name}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleSubmit();
            }
          }}
        />
        {errors.name && <p className="text-destructive text-sm">{errors.name}</p>}
      </section>

      <section className="grid gap-3">
        <Label className="font-bold">Products</Label>
        <ProductTypeSelector
          value={type}
          onChange={(v) => {
            setType(v);
            setErrors((prev) => ({ ...prev, price: undefined }));
          }}
        />
      </section>

      {showPrice && (
        <section className="grid gap-1">
          <Label htmlFor="product-price" className="font-bold">
            Price
          </Label>
          <Input
            id="product-price"
            type="text"
            inputMode="decimal"
            value={price}
            onChange={(e) => {
              const val = e.target.value.replace(/[^0-9.]/g, "");
              const formatted = val.replace(/(\..*)\./g, "$1");
              setPrice(formatted);
              setErrors((prev) => ({ ...prev, price: undefined }));
            }}
            aria-invalid={!!errors.price}
          />
          {errors.price && <p className="text-destructive text-sm">{errors.price}</p>}
        </section>
      )}
    </div>
  );
});
