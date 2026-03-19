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
import CreateSectionModal from "@/features/collections/components/CreateSectionModal";
import EditSectionModal from "@/features/collections/components/EditSectionModal";
import { useUser } from "@/features/auth/client/UserContext";
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
import { FadeIn } from "@/components/motion/FadeIn";
import {
  AnimatedList,
  AnimatedListItem,
} from "@/components/motion/AnimatedList";

export default function ListsPage() {
  useUser();
  const rawCollections = useQuery(api.collections.listByUser);
  const collections =
    useCachedQueryResult("dashboard:lists:collections", rawCollections) ?? [];
  const deleteCollection = useMutation(api.collections.remove);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingCollection, setEditingCollection] = useState<{
    id: Id<"collections">;
    title: string;
    description?: string;
  } | null>(null);
  const [deleteCollectionId, setDeleteCollectionId] =
    useState<Id<"collections"> | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async (id: Id<"collections">) => {
    try {
      setIsDeleting(true);
      await deleteCollection({ id });
    } finally {
      setDeleteCollectionId(null);
      setIsDeleting(false);
    }
  };

  if (rawCollections === undefined && collections.length === 0) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="app-panel px-6 py-5 text-sm text-muted-foreground">
          Loading collections...
        </div>
      </div>
    );
  }

  return (
    <div>
      <FadeIn>
        <section className="px-5 lg:px-6 py-6 lg:py-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="app-title">Collections</h1>
              <p className="app-subtitle mt-1">
                Group your products into collections, then link them to your
                reels for auto-DM.
              </p>
            </div>

            <Button
              onClick={() => setShowCreateModal(true)}
              size="lg"
              className="gap-2 sm:self-start"
            >
              <Plus className="h-4 w-4" />
              Create New
            </Button>
          </div>
        </section>
      </FadeIn>

      <div className="px-5 lg:px-6 pb-10">
        {collections.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="py-14 text-center">
              <FolderPlus className="mx-auto h-14 w-14 text-primary/40 animate-float" />
              <h3 className="mt-4 text-xl font-bold">No collections yet</h3>
              <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
                Group your affiliate products into a collection, then link it to
                a reel for automatic DM replies.
              </p>
              <Button
                onClick={() => setShowCreateModal(true)}
                size="lg"
                className="mt-6 gap-2"
              >
                <Plus className="h-4 w-4" />
                Create your first collection
              </Button>
            </CardContent>
          </Card>
        ) : (
          <AnimatedList className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {collections.map((collection) => (
              <AnimatedListItem key={collection._id}>
                <Card className="overflow-hidden">
                  <CardHeader className="border-b border-border/60">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <CardTitle className="truncate text-lg">
                          {collection.title}
                        </CardTitle>
                        {collection.description && (
                          <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                            {collection.description}
                          </p>
                        )}
                      </div>
                      <Badge
                        variant="secondary"
                        className="rounded-lg px-2.5 py-1"
                      >
                        <ShoppingBag className="h-3 w-3" />
                        Collection
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4 pt-5">
                    <p className="text-xs text-muted-foreground">
                      Created{" "}
                      {new Date(collection.createdAt).toLocaleDateString()}
                    </p>

                    <div className="flex gap-2">
                      <Button
                        asChild
                        variant="outline"
                        className="flex-1 gap-1.5"
                      >
                        <Link href={`/dashboard/lists/${collection._id}`}>
                          <ExternalLink className="h-3.5 w-3.5" />
                          Manage Items
                        </Link>
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() =>
                          setEditingCollection({
                            id: collection._id,
                            title: collection.title,
                            description: collection.description,
                          })
                        }
                        aria-label="Edit collection"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setDeleteCollectionId(collection._id)}
                        aria-label="Delete collection"
                        className="border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </AnimatedListItem>
            ))}
          </AnimatedList>
        )}
      </div>

      <CreateSectionModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />

      {editingCollection && (
        <EditSectionModal
          section={editingCollection}
          open={Boolean(editingCollection)}
          onClose={() => setEditingCollection(null)}
        />
      )}

      <AlertDialog
        open={deleteCollectionId !== null}
        onOpenChange={(open) => !open && setDeleteCollectionId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this collection?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes the collection and all items inside it.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-white hover:bg-destructive/90"
              onClick={() =>
                deleteCollectionId && handleDelete(deleteCollectionId)
              }
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete collection"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
