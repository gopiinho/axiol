"use client";

import { useState, useCallback, useEffect } from "react";
import type { Id, Doc } from "@/convex/_generated/dataModel";
import type { DragEndEvent } from "@dnd-kit/core";
import {
  DndContext,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
  KeyboardSensor,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import {
  GripVertical,
  Plus,
  Pencil,
  Trash2,
  ExternalLink,
  ShoppingBag,
} from "lucide-react";
import { CreateProductItemModal } from "./CreateProductItemModal";
import { EditProductItemModal } from "./EditProductItemModal";
import {
  useDeleteProductItem,
  useReorderProductItems,
} from "../hooks/useProduct";
import { cn } from "@/lib/utils";

interface ProductItemsManagerProps {
  productId: Id<"products">;
  items: Doc<"productItems">[];
  productType: string;
}

function SortableItem({
  item,
  onEdit,
  onDelete,
}: {
  item: Doc<"productItems">;
  onEdit: (item: Doc<"productItems">) => void;
  onDelete: (item: Doc<"productItems">) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group relative flex flex-col cursor-pointer rounded-sm border border-border/60 bg-card overflow-hidden transition-all",
        isDragging && "opacity-50 ring-2 ring-primary/30 scale-[1.02] z-10",
        "hover:shadow-md hover:border-border",
      )}
    >
      <button
        type="button"
        className="absolute top-2 left-2 z-10 cursor-grab touch-none text-muted-foreground/40 hover:text-muted-foreground transition-colors"
        {...attributes}
        {...listeners}
        aria-label="Drag to reorder"
      >
        <GripVertical className="h-3.5 w-3.5" />
      </button>

      <div className="absolute top-2 right-2 z-10 flex items-center gap-0.5">
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 bg-background/60 backdrop-blur-xs hover:bg-background/90"
          onClick={() => window.open(item.affiliateLink, "_blank", "noopener")}
          title="Open link"
        >
          <ExternalLink className="h-3 w-3" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 bg-background/60 backdrop-blur-xs hover:bg-background/90"
          onClick={() => onEdit(item)}
          title="Edit item"
        >
          <Pencil className="h-3 w-3" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 bg-background/60 backdrop-blur-xs hover:bg-background/90 text-destructive hover:text-destructive"
          onClick={() => onDelete(item)}
          title="Delete item"
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>

      <div className="aspect-4/3 overflow-hidden bg-linear-to-br from-muted to-muted/50">
        {item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt={item.title || ""}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-300"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <ShoppingBag className="h-7 w-7 text-muted-foreground/25" />
          </div>
        )}
      </div>

      <div className="flex flex-col gap-1.5 p-3 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1.5 min-w-0">
            {item.platform && (
              <Badge
                variant="secondary"
                className="text-[10px] capitalize leading-none py-0.5"
              >
                {item.platform}
              </Badge>
            )}
            {item.price && (
              <span className="text-xs font-bold text-primary leading-none">
                {item.price}
              </span>
            )}
          </div>
        </div>
        <p className="text-sm font-semibold leading-snug line-clamp-2">
          {item.title || "Untitled item"}
        </p>
        <p className="text-[10px] text-muted-foreground truncate mt-auto leading-none">
          {item.affiliateLink}
        </p>
      </div>
    </div>
  );
}

export function ProductItemsManager({
  productId,
  items,
  productType,
}: ProductItemsManagerProps) {
  const [createOpen, setCreateOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Doc<"productItems"> | null>(
    null,
  );
  const [deletingItem, setDeletingItem] = useState<Doc<"productItems"> | null>(
    null,
  );
  const [localItems, setLocalItems] = useState(items);

  useEffect(() => {
    setLocalItems(items);
  }, [items]);

  const deleteItem = useDeleteProductItem();
  const reorderItems = useReorderProductItems();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const sortedItems = [...localItems].sort((a, b) => a.order - b.order);

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      const oldIndex = sortedItems.findIndex((i) => i._id === active.id);
      const newIndex = sortedItems.findIndex((i) => i._id === over.id);
      if (oldIndex === -1 || newIndex === -1) return;

      const reordered = [...sortedItems];
      const [moved] = reordered.splice(oldIndex, 1);
      reordered.splice(newIndex, 0, moved);

      const updated = reordered.map((item, idx) => ({
        ...item,
        order: idx,
      }));
      setLocalItems(updated);

      try {
        await reorderItems({
          items: updated.map((item) => ({ id: item._id, order: item.order })),
        });
      } catch {
        setLocalItems(items);
      }
    },
    [sortedItems, reorderItems, items],
  );

  const handleDeleteConfirm = async () => {
    if (!deletingItem) return;
    try {
      await deleteItem({ id: deletingItem._id });
      setLocalItems((prev) => prev.filter((i) => i._id !== deletingItem._id));
    } catch {
      // handled in future via toast
    }
    setDeletingItem(null);
  };

  if (productType !== "affiliate") {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Items</h2>
          <p className="text-sm text-muted-foreground">
            Affiliate links in this product
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>Add item</Button>
      </div>

      {sortedItems.length === 0 ? (
        <div className="border border-border/70 rounded-xs p-8 text-center">
          <p className="text-sm text-muted-foreground">
            No items yet. Add your first affiliate link.
          </p>
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={sortedItems.map((i) => i._id)}
            strategy={rectSortingStrategy}
          >
            <div className="grid grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              {sortedItems.map((item) => (
                <SortableItem
                  key={item._id}
                  item={item}
                  onEdit={setEditingItem}
                  onDelete={setDeletingItem}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      <CreateProductItemModal
        productId={productId}
        open={createOpen}
        onClose={() => setCreateOpen(false)}
      />

      {editingItem && (
        <EditProductItemModal
          item={editingItem}
          open={true}
          onClose={() => setEditingItem(null)}
        />
      )}

      <AlertDialog
        open={!!deletingItem}
        onOpenChange={(open) => !open && setDeletingItem(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete &ldquo;{deletingItem?.title || "this item"}&rdquo;?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove this affiliate link from your
              product. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDeleteConfirm}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
