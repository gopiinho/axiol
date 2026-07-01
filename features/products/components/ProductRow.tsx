"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Doc, Id } from "@/convex/_generated/dataModel";
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
import { ProductTypeIcon } from "./ProductTypeIcon";

interface ProductRowProps {
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
}

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

export function ProductRow({ product, onPublish, onArchive, onDelete }: ProductRowProps) {
  const router = useRouter();
  const [deleteOpen, setDeleteOpen] = useState(false);

  const needsItems = product.type === "affiliate" && product.itemCount === 0;

  const handleClick = () => {
    router.push(`/dashboard/products/${product._id}/edit`);
  };

  return (
    <>
      <tr
        className="group border-border/50 hover:bg-muted/30 cursor-pointer border-b transition-colors"
        onClick={handleClick}
      >
        <td className="px-4 py-3.5">
          <div className="flex items-center gap-3">
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
                <span className="text-muted-foreground text-xs font-medium">
                  {product.name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <ProductTypeIcon
                  type={product.type}
                  className="text-muted-foreground h-3.5 w-3.5"
                />
                <p className="max-w-52 truncate text-sm font-semibold">{product.name}</p>
              </div>
              {product.username && product.status !== "draft" && (
                <a
                  href={`${typeof window !== "undefined" ? window.location.origin : ""}/${product.username}/p/${product.productUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="text-primary block max-w-52 truncate text-[11px] hover:underline"
                >
                  {typeof window !== "undefined" ? window.location.host : ""}/{product.username}/p/
                  {product.productUrl}
                </a>
              )}
            </div>
          </div>
        </td>
        <td className="hidden px-4 py-3.5 md:table-cell">
          {product.price ? (
            <span className="text-sm font-medium">₹{product.price}</span>
          ) : (
            <span className="text-muted-foreground text-xs">—</span>
          )}
        </td>
        <td className="hidden px-4 py-3.5 sm:table-cell">
          <span className="text-sm font-medium">{product.sales}</span>
        </td>
        <td className="hidden px-4 py-3.5 md:table-cell">
          <span className="text-sm font-medium">
            {product.revenueCents > 0 ? `₹${product.revenueCents.toLocaleString("en-IN")}` : "₹0"}
          </span>
        </td>
        <td className="hidden px-4 py-3.5 lg:table-cell">
          <span className="text-sm font-medium">{product.clicks}</span>
        </td>
        <td className="px-4 py-3.5">
          <span className={cn("text-sm font-medium", statusStyles[product.status])}>
            {statusLabels[product.status]}
          </span>
        </td>
        <td className="px-4 py-3.5 text-right" onClick={(e) => e.stopPropagation()}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Actions</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuItem onClick={handleClick}>
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
        </td>
      </tr>

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
