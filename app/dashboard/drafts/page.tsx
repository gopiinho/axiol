"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trash2, Send, Eye } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
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

export default function DraftsPage() {
  const drafts = useQuery(api.instagram.getDraftMappings);
  const publishMapping = useMutation(api.instagram.publishReelMapping);
  const deleteMapping = useMutation(api.instagram.deleteReelMapping);
  const [publishTarget, setPublishTarget] = useState<Id<"reelMappings"> | null>(
    null
  );
  const [deleteTarget, setDeleteTarget] = useState<Id<"reelMappings"> | null>(
    null
  );
  const [isPublishing, setIsPublishing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [publishedOpen, setPublishedOpen] = useState(false);

  const handlePublish = async (id: Id<"reelMappings">) => {
    try {
      setIsPublishing(true);
      await publishMapping({ id });
      setPublishedOpen(true);
    } finally {
      setPublishTarget(null);
      setIsPublishing(false);
    }
  };

  const handleDelete = async (id: Id<"reelMappings">) => {
    try {
      setIsDeleting(true);
      await deleteMapping({ id });
    } finally {
      setDeleteTarget(null);
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Draft Posts</h1>
          <p className="text-muted-foreground">
            Review and publish your reel mappings
          </p>
        </div>
        <Link href="/dashboard/create">
          <Button>Create New Post</Button>
        </Link>
      </div>

      {drafts && drafts.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {drafts.map((draft) => (
            <Card key={draft._id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex gap-4">
                    {draft.thumbnailUrl && (
                      <Image
                        src={draft.thumbnailUrl}
                        alt="Reel"
                        width={96}
                        height={96}
                        className="w-24 h-24 object-cover rounded"
                      />
                    )}
                    <div>
                      <CardTitle className="text-lg">{draft.caption}</CardTitle>
                      <div className="flex gap-2 mt-2">
                        <Badge variant="secondary">{draft.keyword}</Badge>
                        <Badge variant="outline">{draft.itemCount} items</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">
                        Collection: {draft.sectionTitle}
                      </p>
                    </div>
                  </div>
                  <Badge>Draft</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Button
                    onClick={() => setPublishTarget(draft._id)}
                    className="gap-2"
                  >
                    <Send className="h-4 w-4" />
                    Publish
                  </Button>
                  <Button variant="outline" className="gap-2">
                    <Eye className="h-4 w-4" />
                    Preview DM
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => setDeleteTarget(draft._id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
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
            <AlertDialogCancel disabled={isPublishing}>Cancel</AlertDialogCancel>
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
          <DialogHeader>
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
