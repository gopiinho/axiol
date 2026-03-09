"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trash2, Send, Eye } from "lucide-react";
import Link from "next/link";
import { Id } from "@/convex/_generated/dataModel";

export default function DraftsPage() {
  const drafts = useQuery(api.instagram.getDraftMappings);
  const publishMapping = useMutation(api.instagram.publishReelMapping);
  const deleteMapping = useMutation(api.instagram.deleteReelMapping);

  const handlePublish = async (id: Id<"reelMappings">) => {
    if (confirm("Publish this post? Auto-DM will be activated.")) {
      await publishMapping({ id });
      alert("Published! Auto-DM is now active.");
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
                      <img
                        src={draft.thumbnailUrl}
                        alt="Reel"
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
                    onClick={() => handlePublish(draft._id)}
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
                    onClick={() => {
                      if (confirm("Delete this draft?")) {
                        deleteMapping({ id: draft._id });
                      }
                    }}
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
    </div>
  );
}
