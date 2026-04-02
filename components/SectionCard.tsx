"use client";

import { useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2, Package } from "lucide-react";

interface SectionCardProps {
  section: {
    _id: Id<"collections">;
    title: string;
    description?: string;
    createdAt: number;
  };
  onEdit: () => void;
  onDelete: () => void;
}

export default function SectionCard({
  section,
  onEdit,
  onDelete,
}: SectionCardProps) {
  const router = useRouter();
  const items = useQuery(api.items.listByCollection, {
    collectionId: section._id,
  });

  const itemCount = items?.length ?? 0;

  return (
    <Card className="hover:shadow-(--shadow-card-hover) transition-shadow justify-between">
      <CardHeader>
        <CardTitle className="text-xl">{section.title}</CardTitle>
        {section.description && (
          <CardDescription>{section.description}</CardDescription>
        )}
      </CardHeader>
      <CardFooter className="flex gap-2">
        <div className="grid w-full gap-2">
          <Badge variant="secondary" className="gap-1">
            <Package className="h-3 w-3" />
            {itemCount} {itemCount === 1 ? "item" : "items"}
          </Badge>
          <div className="w-full flex gap-2">
            <Button
              onClick={() => router.push(`/dashboard/lists/${section._id}`)}
              className="flex-1"
            >
              Manage Items
            </Button>
            <Button onClick={onEdit} variant="outline" size="icon">
              <Pencil className="h-4 w-4" />
            </Button>
            <Button onClick={onDelete} variant="destructive" size="icon">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
