"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useMutation, useQuery } from "convex/react";
import { ArrowLeft, Plus, ShoppingBasket } from "lucide-react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import ItemCard from "@/features/items/components/ItemCard";
import CreateItemModal from "@/features/items/components/CreateItemModal";
import EditItemModal from "@/features/items/components/EditItemModal";
import { requireAdminSessionToken } from "@/features/auth/client/session";
import { useCachedQueryResult } from "@/lib/hooks/useCachedQueryResult";
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
import { Card, CardContent } from "@/components/ui/card";

export default function SectionItemsPage({
  params,
}: {
  params: Promise<{ id: Id<"sections"> }>;
}) {
  const { id } = use(params);

  const rawSection = useQuery(api.sections.getById, { id });
  const rawItems = useQuery(api.items.listBySection, {
    sectionId: id,
  });
  const section = useCachedQueryResult(
    `dashboard:list:${id}:section`,
    rawSection,
  );
  const items = useCachedQueryResult(`dashboard:list:${id}:items`, rawItems);
  const deleteItem = useMutation(api.items.remove);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingItem, setEditingItem] = useState<{
    id: Id<"items">;
    affiliateLink: string;
    price?: string;
    platform: string;
    itemTitle?: string;
    imageUrl?: string;
  } | null>(null);
  const [deleteItemId, setDeleteItemId] = useState<Id<"items"> | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async (itemId: Id<"items">) => {
    try {
      setIsDeleting(true);
      const token = requireAdminSessionToken();
      await deleteItem({ token, id: itemId });
    } finally {
      setDeleteItemId(null);
      setIsDeleting(false);
    }
  };

  if (
    (rawSection === undefined && section === undefined) ||
    (rawItems === undefined && items === undefined)
  ) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="app-panel px-6 py-5 text-sm text-muted-foreground">
          Loading list details...
        </div>
      </div>
    );
  }

  if (section === null) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <h2 className="text-2xl font-semibold">List not found</h2>
          <Button asChild className="mt-4">
            <Link href="/dashboard/lists">Back to lists</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-5">
      <section className="app-panel px-5 py-6 md:px-6 md:py-7">
        <Button asChild variant="ghost" size="sm" className="mb-4 gap-1.5">
          <Link href="/dashboard/lists">
            <ArrowLeft className="h-4 w-4" />
            Back to lists
          </Link>
        </Button>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
              List Details
            </p>
            <h1 className="app-title mt-2 flex items-center gap-2">
              <ShoppingBasket className="h-7 w-7 text-primary" />
              {section!.title}
            </h1>
            {section!.description && (
              <p className="app-subtitle mt-2 max-w-xl">
                {section!.description}
              </p>
            )}
          </div>

          <Button
            onClick={() => setShowCreateModal(true)}
            className="gap-2 sm:self-start"
          >
            <Plus className="h-4 w-4" />
            Add Item
          </Button>
        </div>
      </section>

      {(items ?? []).length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <ShoppingBasket className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">No items yet</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Add your first affiliate product to this list.
            </p>
            <Button
              onClick={() => setShowCreateModal(true)}
              className="mt-5 gap-2"
            >
              <Plus className="h-4 w-4" />
              Add first item
            </Button>
          </CardContent>
        </Card>
      ) : (
        <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {(items ?? []).map((item) => (
            <ItemCard
              key={item._id}
              item={item}
              onEdit={() =>
                setEditingItem({
                  id: item._id,
                  affiliateLink: item.affiliateLink,
                  price: item.price,
                  platform: item.platform,
                  itemTitle: item.itemTitle,
                  imageUrl: item.imageUrl,
                })
              }
              onDelete={() => setDeleteItemId(item._id)}
            />
          ))}
        </section>
      )}

      <CreateItemModal
        sectionId={id}
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />

      {editingItem && (
        <EditItemModal
          item={editingItem}
          open={Boolean(editingItem)}
          onClose={() => setEditingItem(null)}
        />
      )}

      <AlertDialog
        open={deleteItemId !== null}
        onOpenChange={(open) => !open && setDeleteItemId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this item?</AlertDialogTitle>
            <AlertDialogDescription>
              This action is permanent and removes the product from this list.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-white hover:bg-destructive/90"
              onClick={() => deleteItemId && handleDelete(deleteItemId)}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete item"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
