"use client";

import { useState, useCallback, useEffect } from "react";
import type { Id, Doc } from "@/convex/_generated/dataModel";
import type { DragEndEvent } from "@dnd-kit/core";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  KeyboardSensor,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
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
import { GripVertical, Plus, Pencil, Trash2, ExternalLink } from "lucide-react";
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
        "flex items-center gap-3 p-3 border border-border/60 rounded-xs bg-card transition-colors",
        isDragging && "opacity-50 shadow-lg border-primary/30",
      )}
    >
      <button
        type="button"
        className="cursor-grab touch-none text-muted-foreground hover:text-foreground transition-colors"
        {...attributes}
        {...listeners}
        aria-label="Drag to reorder"
      >
        <GripVertical className="h-4 w-4" />
      </button>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium truncate">
            {item.title || "Untitled item"}
          </p>
          {item.platform && (
            <Badge variant="secondary" className="text-[10px] capitalize shrink-0">
              {item.platform}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs text-muted-foreground truncate">
            {item.affiliateLink}
          </span>
          {item.price && (
            <>
              <span className="text-xs text-muted-foreground">·</span>
              <span className="text-xs font-medium">{item.price}</span>
            </>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1 shrink-0">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => window.open(item.affiliateLink, "_blank", "noopener")}
          title="Open link"
        >
          <ExternalLink className="h-3.5 w-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => onEdit(item)}
          title="Edit item"
        >
          <Pencil className="h-3.5 w-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-destructive hover:text-destructive"
          onClick={() => onDelete(item)}
          title="Delete item"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
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
  const [editingItem, setEditingItem] = useState<Doc<"productItems"> | null>(null);
  const [deletingItem, setDeletingItem] = useState<Doc<"productItems"> | null>(null);
  const [localItems, setLocalItems] = useState(items);

  useEffect(() => {
    setLocalItems(items);
  }, [items]);

  const deleteItem = useDeleteProductItem();
  const reorderItems = useReorderProductItems();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
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
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4 mr-1.5" />
          Add item
        </Button>
      </div>

      {sortedItems.length === 0 ? (
        <div className="border border-dashed border-border/70 rounded-xs p-8 text-center">
          <p className="text-sm text-muted-foreground">
            No items yet. Add your first affiliate link.
          </p>
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={sortedItems.map((i) => i._id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-2">
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
              This will permanently remove this affiliate link from your product.
              This action cannot be undone.
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
