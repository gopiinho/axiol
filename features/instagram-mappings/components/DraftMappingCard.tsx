"use client";

import Image from "next/image";
import { Send, Trash2, Eye } from "lucide-react";
import { Id } from "@/convex/_generated/dataModel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export interface DraftMappingCardData {
  _id: Id<"reelMappings">;
  thumbnailUrl?: string;
  caption?: string;
  keyword: string;
  itemCount?: number;
  productName: string;
}

interface DraftMappingCardProps {
  draft: DraftMappingCardData;
  onPublish: (id: Id<"reelMappings">) => void;
  onDelete: (id: Id<"reelMappings">) => void;
}

export default function DraftMappingCard({
  draft,
  onPublish,
  onDelete,
}: DraftMappingCardProps) {
  return (
    <Card>
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
                Product: {draft.productName}
              </p>
            </div>
          </div>
          <Badge>Draft</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2">
          <Button onClick={() => onPublish(draft._id)} className="gap-2">
            <Send className="h-4 w-4" />
            Publish
          </Button>
          <Button variant="outline" className="gap-2">
            <Eye className="h-4 w-4" />
            Preview DM
          </Button>
          <Button variant="destructive" onClick={() => onDelete(draft._id)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
