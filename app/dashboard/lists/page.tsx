"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Package,
  Edit,
  Trash2,
  ExternalLink,
  ShoppingBag,
} from "lucide-react";
import CreateSectionModal from "@/components/CreateSectionModal";
import EditSectionModal from "@/components/EditSectionModal";

export default function ListsPage() {
  const sections = useQuery(api.sections.list);
  const deleteSection = useMutation(api.sections.remove);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingSection, setEditingSection] = useState<{
    id: Id<"sections">;
    title: string;
    description?: string;
  } | null>(null);

  const handleDelete = async (id: Id<"sections">) => {
    if (confirm("Are you sure? This will delete the list and all its items.")) {
      await deleteSection({ id });
    }
  };

  if (sections === undefined) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading lists...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Package className="h-8 w-8" />
            Your Lists
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage your affiliate product collections
          </p>
        </div>
        <Button
          onClick={() => setShowCreateModal(true)}
          size="lg"
          className="gap-2 hidden sm:flex"
        >
          <Plus className="h-4 w-4" />
          Create New List
        </Button>
        <Button
          onClick={() => setShowCreateModal(true)}
          size="lg"
          className="gap-2 block sm:hidden"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {sections.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-16 text-center">
            <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No lists yet</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Create your first product list to organize affiliate items. You
              can then link these lists to Instagram reels.
            </p>
            <Button
              onClick={() => setShowCreateModal(true)}
              size="lg"
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Create Your First List
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sections.map((section) => (
            <Card
              key={section._id}
              className="hover:shadow-lg transition-all group"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg font-semibold truncate">
                      {section.title}
                    </CardTitle>
                    {section.description && (
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {section.description}
                      </p>
                    )}
                  </div>
                  <Badge variant="outline" className="ml-2">
                    <ShoppingBag className="h-3 w-3 mr-1" />
                    List
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-3">
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>
                    Created {new Date(section.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <div className="flex gap-2">
                  <Link
                    href={`/dashboard/lists/${section._id}`}
                    className="flex-1"
                  >
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full gap-2"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Manage Items
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setEditingSection({
                        id: section._id,
                        title: section.title,
                        description: section.description,
                      })
                    }
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(section._id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <CreateSectionModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />

      {editingSection && (
        <EditSectionModal
          section={editingSection}
          open={!!editingSection}
          onClose={() => setEditingSection(null)}
        />
      )}
    </div>
  );
}
