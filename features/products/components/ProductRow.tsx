"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Doc, Id } from "@/convex/_generated/dataModel";
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
import { ProductTypeIcon, getProductTypeLabel } from "./ProductTypeIcon";

interface ProductRowProps {
  product: Doc<"products"> & { itemCount: number };
  onPublish: (id: Id<"products">) => void;
  onArchive: (id: Id<"products">) => void;
  onDelete: (id: Id<"products">) => void;
}

const statusStyles: Record<string, string> = {
  draft: "text-amber-700",
  published: "text-emerald-700",
  archived: "text-slate-500",
};

export function ProductRow({
  product,
  onPublish,
  onArchive,
  onDelete,
}: ProductRowProps) {
  const router = useRouter();
  const [deleteOpen, setDeleteOpen] = useState(false);

  const needsItems = product.type === "affiliate" && product.itemCount === 0;

  const handleClick = () => {
    router.push(`/dashboard/products/${product._id}/edit`);
  };

  return (
    <>
      <tr
        className="group border-b border-border/50 transition-colors hover:bg-muted/30 cursor-pointer"
        onClick={handleClick}
      >
        <td className="py-3.5 px-4">
          <div className="flex items-center gap-3">
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
            <div>
              <p className="font-semibold text-sm">{product.name}</p>
            </div>
          </div>
        </td>
        <td className="py-3.5 px-4 hidden sm:table-cell">
          <div className="flex items-center gap-1.5">
            <ProductTypeIcon type={product.type} className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-xs capitalize text-muted-foreground">
              {getProductTypeLabel(product.type)}
            </span>
          </div>
        </td>
        <td className="py-3.5 px-4 hidden md:table-cell">
          {product.price ? (
            <span className="text-sm font-medium">{product.price}</span>
          ) : (
            <span className="text-xs text-muted-foreground">—</span>
          )}
        </td>
        <td className="py-3.5 px-4">
          <span className={cn("text-[11px] font-semibold", statusStyles[product.status])}>
            {product.status.charAt(0).toUpperCase() + product.status.slice(1)}
          </span>
        </td>
        <td className="py-3.5 px-4 hidden lg:table-cell">
          {product.automationEnabled ? (
            <Badge variant="default" className="text-[11px]">
              Auto
            </Badge>
          ) : (
            <span className="text-xs text-muted-foreground">—</span>
          )}
        </td>
        <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
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
              <DropdownMenuItem
                variant="destructive"
                onClick={() => setDeleteOpen(true)}
              >
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
