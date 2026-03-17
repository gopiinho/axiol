"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { Id } from "@/convex/_generated/dataModel";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { requireSessionToken } from "@/features/auth/client/session";
import { useUser } from "@/features/auth/client/UserContext";
import DraftMappingCard from "@/features/instagram-mappings/components/DraftMappingCard";
import { useCachedQueryResult } from "@/lib/hooks/useCachedQueryResult";
import { Plus } from "lucide-react";
import { SuccessCheckmark } from "@/components/motion/SuccessCheckmark";
import { FadeIn } from "@/components/motion/FadeIn";
import {
  AnimatedList,
  AnimatedListItem,
} from "@/components/motion/AnimatedList";

export default function DraftsPage() {
  const { token } = useUser();
  const rawDrafts = useQuery(
    api.instagram.getDraftMappings,
    token ? { token } : "skip",
  );
  const drafts = useCachedQueryResult(
    `dashboard:drafts:${token ?? "anon"}`,
    rawDrafts,
  );
  const publishMapping = useMutation(api.instagram.publishReelMapping);
  const deleteMapping = useMutation(api.instagram.deleteReelMapping);
  const [publishTarget, setPublishTarget] = useState<Id<"reelMappings"> | null>(
    null,
  );
  const [deleteTarget, setDeleteTarget] = useState<Id<"reelMappings"> | null>(
    null,
  );
  const [isPublishing, setIsPublishing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [publishedOpen, setPublishedOpen] = useState(false);

  const handlePublish = async (id: Id<"reelMappings">) => {
    try {
      setIsPublishing(true);
      const authToken = requireSessionToken();
      await publishMapping({ token: authToken, id });
      setPublishedOpen(true);
    } finally {
      setPublishTarget(null);
      setIsPublishing(false);
    }
  };

  const handleDelete = async (id: Id<"reelMappings">) => {
    try {
      setIsDeleting(true);
      const authToken = requireSessionToken();
      await deleteMapping({ token: authToken, id });
    } finally {
      setDeleteTarget(null);
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <FadeIn>
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Draft Posts</h1>
          <p className="text-muted-foreground">
            Review and publish your reel mappings
          </p>
        </div>
        <Link href="/dashboard/create">
          <Button size="lg" className="gap-2 sm:self-start">
            <Plus className="h-4 w-4" />
            Create New
          </Button>
        </Link>
      </div>
      </FadeIn>

      {drafts && drafts.length > 0 ? (
        <AnimatedList className="grid grid-cols-1 gap-4">
          {drafts.map((draft) => (
            <AnimatedListItem key={draft._id}>
            <DraftMappingCard
              draft={draft}
              onPublish={setPublishTarget}
              onDelete={setDeleteTarget}
            />
            </AnimatedListItem>
          ))}
        </AnimatedList>
      ) : rawDrafts === undefined ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Loading drafts...
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No drafts yet. Create your first post!
          </CardContent>
        </Card>
      )}

      <AlertDialog
        open={publishTarget !== null}
        onOpenChange={(open) => !open && setPublishTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Publish this draft?</AlertDialogTitle>
            <AlertDialogDescription>
              Auto-DM will become active for comments matching this keyword.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPublishing}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => publishTarget && handlePublish(publishTarget)}
              disabled={isPublishing}
            >
              {isPublishing ? "Publishing..." : "Publish now"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this draft?</AlertDialogTitle>
            <AlertDialogDescription>
              This removes the draft mapping and cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-white hover:bg-destructive/90"
              onClick={() => deleteTarget && handleDelete(deleteTarget)}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete draft"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={publishedOpen} onOpenChange={setPublishedOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="items-center text-center">
            <SuccessCheckmark className="mb-2" />
            <DialogTitle>Draft published</DialogTitle>
            <DialogDescription>
              Auto-DM is now active for this reel mapping.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setPublishedOpen(false)}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
