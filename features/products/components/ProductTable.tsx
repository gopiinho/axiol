"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Id, Doc } from "@/convex/_generated/dataModel";
import {
  useProducts,
  usePublishProduct,
  useArchiveProduct,
  useDeleteProduct,
} from "../hooks/useProduct";
import { ProductRow } from "./ProductRow";
import { ProductTypeIcon, getProductTypeLabel } from "./ProductTypeIcon";
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

const statusLabels: Record<string, string> = {
  draft: "Unpublished",
  published: "Published",
  archived: "Archived",
};

function ProductMobileCard({
  product,
  onPublish,
  onArchive,
  onDelete,
}: {
  product: Doc<"products"> & {
    itemCount: number;
    coverImageUrl?: string | null;
    thumbnailImageUrl?: string | null;
    username?: string;
    sales: number;
    revenueCents: number;
    clicks: number;
  };
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
        className="app-panel active:bg-muted/30 cursor-pointer p-4"
        onClick={() => router.push(`/dashboard/products/${product._id}/edit`)}
      >
        <div className="flex items-start gap-3">
          {product.thumbnailImageUrl || product.coverImageUrl ? (
            <div className="bg-muted h-10 w-10 shrink-0 overflow-hidden rounded-xs">
              <img
                src={product.thumbnailImageUrl ?? product.coverImageUrl ?? ""}
                alt=""
                className="h-full w-full object-cover"
              />
            </div>
          ) : (
            <div className="bg-muted flex h-10 w-10 shrink-0 items-center justify-center rounded-xs">
              <span className="text-muted-foreground text-sm font-medium">
                {product.name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">{product.name}</p>
            {product.username && product.status !== "draft" && (
              <a
                href={`${typeof window !== "undefined" ? window.location.origin : ""}/${product.username}/p/${product.productUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="text-primary mt-0.5 block truncate text-[10px] hover:underline"
              >
                {typeof window !== "undefined" ? window.location.host : ""}/{product.username}/p/
                {product.productUrl}
              </a>
            )}
            <div className="mt-0.5 flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1">
                <ProductTypeIcon type={product.type} className="text-muted-foreground h-3 w-3" />
                <span className="text-muted-foreground text-sm">
                  {getProductTypeLabel(product.type)}
                </span>
              </div>
              {product.price && (
                <>
                  <span className="text-muted-foreground/40">·</span>
                  <span className="text-sm font-medium">{product.price}</span>
                </>
              )}
            </div>
            <div className="mt-1 flex items-center gap-2">
              <span className={cn("text-[11px] font-semibold", statusStyles[product.status])}>
                {statusLabels[product.status]}
              </span>
            </div>
            <div className="text-muted-foreground mt-1.5 flex gap-3 text-[11px]">
              <span>{product.sales} sales</span>
              {product.revenueCents > 0 && (
                <span>₹{product.revenueCents.toLocaleString("en-IN")} revenue</span>
              )}
              <span>{product.clicks} clicks</span>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="-mr-1 h-8 w-8 shrink-0"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Actions</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuItem
                onClick={() => router.push(`/dashboard/products/${product._id}/edit`)}
              >
                <Edit className="h-4 w-4" />
                Edit
              </DropdownMenuItem>
              {product.status !== "published" && (
                <DropdownMenuItem
                  onClick={() => onPublish(product._id)}
                  disabled={needsItems}
                  title={needsItems ? "Add at least one item before publishing" : undefined}
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
              This will permanently delete this product and all its items. This action cannot be
              undone.
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
    try {
      await publishProduct({ id });
    } catch {
      /* handled by toast */
    }
  };
  const handleArchive = async (id: Id<"products">) => {
    try {
      await archiveProduct({ id });
    } catch {
      /* handled by toast */
    }
  };
  const handleDelete = async (id: Id<"products">) => {
    try {
      await deleteProduct({ id });
    } catch {
      /* handled by toast */
    }
  };

  if (isLoading) {
    return <ProductsSkeleton />;
  }

  if (products.length === 0) {
    return <NoProducts />;
  }

  const totalSales = products.reduce((sum, p) => sum + p.sales, 0);
  const totalRevenueCents = products.reduce((sum, p) => sum + p.revenueCents, 0);
  const totalClicks = products.reduce((sum, p) => sum + p.clicks, 0);

  return (
    <div className="p-5 sm:p-8">
      {/* Mobile cards */}
      <div className="flex flex-col gap-3 sm:hidden">
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
      <div className="bg-card hidden overflow-hidden rounded-xs sm:block">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr className="border-border/50 border-b">
              <th className="text-muted-foreground px-4 py-3 text-left text-sm font-black">
                Product
              </th>
              <th className="text-muted-foreground hidden px-4 py-3 text-left text-sm font-black md:table-cell">
                Price
              </th>
              <th className="text-muted-foreground hidden px-4 py-3 text-left text-sm font-black sm:table-cell">
                Sales
              </th>
              <th className="text-muted-foreground hidden px-4 py-3 text-left text-sm font-black md:table-cell">
                Revenue
              </th>
              <th className="text-muted-foreground hidden px-4 py-3 text-left text-sm font-black lg:table-cell">
                Clicks
              </th>
              <th className="text-muted-foreground px-4 py-3 text-left text-sm font-black">
                Status
              </th>

              <th className="w-10 px-4 py-3" />
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
          <tfoot className="bg-muted/50">
            <tr className="border-border/50 border-t">
              <td className="text-muted-foreground px-4 py-3 text-sm font-black">Totals</td>
              <td className="hidden px-4 py-3 md:table-cell" />
              <td className="hidden px-4 py-3 text-sm font-semibold sm:table-cell">{totalSales}</td>
              <td className="hidden px-4 py-3 md:table-cell">
                <span className="text-sm font-semibold">
                  {totalRevenueCents > 0 ? `₹${totalRevenueCents.toLocaleString("en-IN")}` : "—"}
                </span>
              </td>
              <td className="hidden px-4 py-3 text-sm font-semibold lg:table-cell">
                {totalClicks}
              </td>
              <td className="px-4 py-3" />
              <td className="px-4 py-3" />
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
