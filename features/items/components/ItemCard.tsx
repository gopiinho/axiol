"use client";

import Image from "next/image";
import { ExternalLink, Pencil, Trash2 } from "lucide-react";
import { Id } from "@/convex/_generated/dataModel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";

interface ItemCardProps {
  item: {
    _id: Id<"items">;
    affiliateLink: string;
    price?: string;
    platform: string;
    itemTitle?: string;
    imageUrl?: string;
  };
  onEdit: () => void;
  onDelete: () => void;
}

const platformClass: Record<string, string> = {
  amazon: "badge-platform-amazon",
  flipkart: "badge-platform-flipkart",
  nykaa: "badge-platform-nykaa",
  meesho: "badge-platform-meesho",
  other: "badge-platform-other",
};

export default function ItemCard({ item, onEdit, onDelete }: ItemCardProps) {
  const capitalizedPlatform =
    item.platform.charAt(0).toUpperCase() + item.platform.slice(1);

  return (
    <Card className="overflow-hidden pt-0">
      {item.imageUrl ? (
        <div className="relative h-44 w-full overflow-hidden border-b border-border/70 bg-secondary/30">
          <Image
            src={item.imageUrl}
            alt={item.itemTitle || "Product"}
            fill
            className="object-cover transition duration-300 hover:scale-[1.03]"
          />
        </div>
      ) : (
        <div className="flex h-44 items-center justify-center border-b border-border/70 bg-secondary/45 px-4 text-sm text-muted-foreground">
          No image preview
        </div>
      )}

      <CardHeader className="pb-3">
        <h3 className="line-clamp-2 min-h-11 text-base font-semibold">
          {item.itemTitle || "Untitled product"}
        </h3>

        <div className="flex items-center justify-between gap-2">
          <Badge className={platformClass[item.platform] || platformClass.other}>
            {capitalizedPlatform}
          </Badge>

          {item.price && <span className="text-sm font-semibold text-primary">₹{item.price}</span>}
        </div>
      </CardHeader>

      <CardContent className="grow pb-3">
        <a
          href={item.affiliateLink}
          target="_blank"
          rel="nofollow noopener"
          className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
        >
          View product
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </CardContent>

      <CardFooter className="gap-2 border-t border-border/70 pt-4">
        <Button onClick={onEdit} variant="outline" size="sm" className="flex-1 gap-1.5">
          <Pencil className="h-3.5 w-3.5" />
          Edit
        </Button>

        <Button onClick={onDelete} variant="destructive" size="sm" aria-label="Delete item">
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </CardFooter>
    </Card>
  );
}
