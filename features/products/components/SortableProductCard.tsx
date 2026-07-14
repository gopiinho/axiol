"use client";

import { useSortable } from "@dnd-kit/sortable";
import { cn } from "@/lib/utils";
import { ProductCard } from "./ProductCard";

interface SortableProductCardProps {
  product: {
    _id: string;
    name: string;
    productUrl: string;
    type?: string;
    price?: string | null;
    coverImageUrl?: string | null;
    thumbnailImageUrl?: string | null;
    config?: Record<string, unknown>;
    itemCount?: number;
  };
  username?: string;
  index?: number;
}

export function SortableProductCard({
  product,
  username,
  index,
}: SortableProductCardProps) {
  const { setNodeRef, listeners, attributes, isDragging } =
    useSortable({ id: product._id });

  const style: React.CSSProperties = {
    touchAction: "none",
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        "relative [&_*]:!cursor-move",
        isDragging && "opacity-20"
      )}
    >
      <ProductCard
        product={product}
        username={username}
        index={index}
        interactive
      />
    </div>
  );
}
