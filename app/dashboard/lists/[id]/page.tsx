"use client";

import { use, useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus } from "lucide-react";
import Link from "next/link";
import ItemCard from "@/components/ItemCard";
import CreateItemModal from "@/components/CreateItemModal";
import EditItemModal from "@/components/EditItemModal";

export default function SectionItemsPage({
  params,
}: {
  params: Promise<{ id: Id<"sections"> }>;
}) {
  const { id } = use(params);

  const section = useQuery(api.sections.getById, { id: id });
  const items = useQuery(api.items.listBySection, {
    sectionId: id,
  });
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

  const handleDelete = async (id: Id<"items">) => {
    if (confirm("Are you sure you want to delete this item?")) {
      await deleteItem({ id });
    }
  };

  if (section === undefined || items === undefined) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (section === null) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-4">Section not found</h2>
        <Link href="/dashboard">
          <Button>Back to Dashboard</Button>
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <Link href="/dashboard">
          <Button variant="ghost" className="gap-2 mb-4">
            <ArrowLeft className="h-4 w-4" />
            Back to Sections
          </Button>
        </Link>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">
              {section.title}
            </h2>
            {section.description && (
              <p className="text-muted-foreground mt-1">
                {section.description}
              </p>
            )}
          </div>
          <Button onClick={() => setShowCreateModal(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Item
          </Button>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="border-2 border-dashed rounded-lg p-12 text-center">
          <h3 className="text-lg font-semibold mb-2">No items yet</h3>
          <p className="text-muted-foreground mb-4">
            Add your first affiliate product to this section.
          </p>
          <Button onClick={() => setShowCreateModal(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Item
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
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
              onDelete={() => handleDelete(item._id)}
            />
          ))}
        </div>
      )}

      <CreateItemModal
        sectionId={id}
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />

      {editingItem && (
        <EditItemModal
          item={editingItem}
          open={!!editingItem}
          onClose={() => setEditingItem(null)}
        />
      )}
    </div>
  );
}
