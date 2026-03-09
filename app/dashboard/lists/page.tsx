"use client";

import { useState } from "react";
import Link from "next/link";
import { useMutation, useQuery } from "convex/react";
import {
  Edit,
  ExternalLink,
  FolderPlus,
  Package,
  Plus,
  ShoppingBag,
  Trash2,
} from "lucide-react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import CreateSectionModal from "@/components/CreateSectionModal";
import EditSectionModal from "@/components/EditSectionModal";
import { getAuthToken } from "@/lib/auth";
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

export default function ListsPage() {
  const sections = useQuery(api.sections.list);
  const deleteSection = useMutation(api.sections.remove);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingSection, setEditingSection] = useState<{
    id: Id<"sections">;
    title: string;
    description?: string;
  } | null>(null);
  const [deleteSectionId, setDeleteSectionId] = useState<Id<"sections"> | null>(
    null
  );
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async (id: Id<"sections">) => {
    try {
      setIsDeleting(true);
      const token = getAuthToken();
      if (!token) throw new Error("Unauthorized");
      await deleteSection({ token, id });
    } finally {
      setDeleteSectionId(null);
      setIsDeleting(false);
    }
  };

  if (sections === undefined) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="app-panel px-6 py-5 text-sm text-muted-foreground">Loading lists...</div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <section className="app-panel px-5 py-6 md:px-6 md:py-7">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
              Lists
            </p>
            <h1 className="app-title mt-2 flex items-center gap-2">
              <Package className="h-7 w-7 text-primary" />
              Product collections
            </h1>
            <p className="app-subtitle mt-2 max-w-xl">
              Organize affiliate items into reusable lists for your reel mappings.
            </p>
          </div>

          <Button onClick={() => setShowCreateModal(true)} size="lg" className="gap-2 sm:self-start">
            <Plus className="h-4 w-4" />
            Create List
          </Button>
        </div>
      </section>

      {sections.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-14 text-center">
            <FolderPlus className="mx-auto h-14 w-14 text-muted-foreground" />
            <h3 className="mt-4 text-xl font-semibold">No lists yet</h3>
            <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
              Create your first collection to start attaching products to Instagram reel replies.
            </p>
            <Button onClick={() => setShowCreateModal(true)} size="lg" className="mt-6 gap-2">
              <Plus className="h-4 w-4" />
              Create your first list
            </Button>
          </CardContent>
        </Card>
      ) : (
        <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {sections.map((section) => (
            <Card key={section._id} className="overflow-hidden">
              <CardHeader className="border-b border-border/70 bg-secondary/35 pb-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <CardTitle className="truncate text-lg">{section.title}</CardTitle>
                    {section.description && (
                      <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{section.description}</p>
                    )}
                  </div>
                  <Badge variant="secondary" className="rounded-lg px-2.5 py-1">
                    <ShoppingBag className="h-3 w-3" />
                    List
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-4 pt-5">
                <p className="text-xs text-muted-foreground">
                  Created {new Date(section.createdAt).toLocaleDateString()}
                </p>

                <div className="flex gap-2">
                  <Button asChild variant="outline" className="flex-1 gap-1.5">
                    <Link href={`/dashboard/lists/${section._id}`}>
                      <ExternalLink className="h-3.5 w-3.5" />
                      Manage Items
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() =>
                      setEditingSection({
                        id: section._id,
                        title: section.title,
                        description: section.description,
                      })
                    }
                    aria-label="Edit list"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setDeleteSectionId(section._id)}
                    aria-label="Delete list"
                    className="border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </section>
      )}

      <CreateSectionModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />

      {editingSection && (
        <EditSectionModal
          section={editingSection}
          open={Boolean(editingSection)}
          onClose={() => setEditingSection(null)}
        />
      )}

      <AlertDialog
        open={deleteSectionId !== null}
        onOpenChange={(open) => !open && setDeleteSectionId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this list?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes the list and all items inside it.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-white hover:bg-destructive/90"
              onClick={() => deleteSectionId && handleDelete(deleteSectionId)}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete list"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
