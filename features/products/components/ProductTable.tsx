"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Id, Doc } from "@/convex/_generated/dataModel";
import { useProducts, usePublishProduct, useArchiveProduct, useDeleteProduct } from "../hooks/useProduct";
import { ProductRow } from "./ProductRow";
import { ProductTypeIcon, getProductTypeLabel } from "./ProductTypeIcon";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { MoreHorizontal, Archive, Trash2, Send, Edit } from "lucide-react";
import { cn } from "@/lib/utils";
import ProductsSkeleton from "@/components/products/ProductsSkeleton";
import NoProducts from "@/components/products/NoProducts";

const statusStyles: Record<string, string> = {
  draft: "text-amber-700",
  published: "text-emerald-700",
  archived: "text-slate-500",
};

function ProductMobileCard({
  product,
  onPublish,
  onArchive,
  onDelete,
}: {
  product: Doc<"products"> & { itemCount: number };
  onPublish: (id: Id<"products">) => void;
  onArchive: (id: Id<"products">) => void;
  onDelete: (id: Id<"products">) => void;
}) {
  const router = useRouter();
  const [deleteOpen, setDeleteOpen] = useState(false);

  const needsItems = product.type === "affiliate" && product.itemCount === 0;

  return (
    <>
      <div
        className="app-panel p-4 cursor-pointer active:bg-muted/30"
        onClick={() => router.push(`/dashboard/products/${product._id}/edit`)}
      >
        <div className="flex items-start gap-3">
          {product.coverImageId ? (
            <div className="h-10 w-10 rounded-xs bg-muted overflow-hidden shrink-0">
              <img
                src={product.coverImageId}
                alt=""
                className="h-full w-full object-cover"
              />
            </div>
          ) : (
            <div className="h-10 w-10 rounded-xs bg-muted flex items-center justify-center shrink-0">
              <span className="text-xs text-muted-foreground font-medium">
                {product.name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm truncate">{product.name}</p>
            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
              <div className="flex items-center gap-1">
                <ProductTypeIcon type={product.type} className="h-3 w-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">{getProductTypeLabel(product.type)}</span>
              </div>
              {product.price && (
                <>
                  <span className="text-muted-foreground/40">·</span>
                  <span className="text-xs font-medium">{product.price}</span>
                </>
              )}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className={cn("text-[11px] font-semibold", statusStyles[product.status])}>
                {product.status.charAt(0).toUpperCase() + product.status.slice(1)}
              </span>
              {product.automationEnabled && (
                <>
                  <span className="text-muted-foreground/40">·</span>
                  <Badge variant="default" className="text-[10px] px-1.5 py-0">Auto</Badge>
                </>
              )}
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0 -mr-1"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Actions</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuItem onClick={() => router.push(`/dashboard/products/${product._id}/edit`)}>
                <Edit className="h-4 w-4" />
                Edit
              </DropdownMenuItem>
              {product.status !== "published" && (
                <DropdownMenuItem
                  onClick={() => onPublish(product._id)}
                  disabled={needsItems}
                  title={
                    needsItems
                      ? "Add at least one item before publishing"
                      : undefined
                  }
                >
                  <Send className="h-4 w-4" />
                  Publish
                </DropdownMenuItem>
              )}
              {product.status !== "archived" && (
                <DropdownMenuItem onClick={() => onArchive(product._id)}>
                  <Archive className="h-4 w-4" />
                  Archive
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive" onClick={() => setDeleteOpen(true)}>
                <Trash2 className="h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete &ldquo;{product.name}&rdquo;?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this product and all its items.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                setDeleteOpen(false);
                onDelete(product._id);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export function ProductTable() {
  const { products, isLoading } = useProducts();
  const publishProduct = usePublishProduct();
  const archiveProduct = useArchiveProduct();
  const deleteProduct = useDeleteProduct();

  const handlePublish = async (id: Id<"products">) => {
    try { await publishProduct({ id }); } catch { /* handled by toast */ }
  };
  const handleArchive = async (id: Id<"products">) => {
    try { await archiveProduct({ id }); } catch { /* handled by toast */ }
  };
  const handleDelete = async (id: Id<"products">) => {
    try { await deleteProduct({ id }); } catch { /* handled by toast */ }
  };

  if (isLoading) {
    return <ProductsSkeleton />;
  }

  if (products.length === 0) {
    return <NoProducts />;
  }

  return (
    <div className="p-5 sm:p-8">
      {/* Mobile cards */}
      <div className="sm:hidden flex flex-col gap-3">
        {products.map((product) => (
          <ProductMobileCard
            key={product._id}
            product={product}
            onPublish={handlePublish}
            onArchive={handleArchive}
            onDelete={handleDelete}
          />
        ))}
      </div>

      {/* Desktop table */}
      <div className="hidden sm:block app-panel overflow-hidden">
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
                onPublish={handlePublish}
                onArchive={handleArchive}
                onDelete={handleDelete}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
