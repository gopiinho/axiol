"use client";

import { useState } from "react";
import Image from "next/image";
import { Id } from "@/convex/_generated/dataModel";
import {
  useReelMappings,
  useToggleMapping,
  useDeleteMapping,
} from "@/features/automations/hooks/useAutomations";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { Trash2, ToggleLeft, ToggleRight, MessageSquareQuote } from "lucide-react";

function KeywordBadges({ keyword }: { keyword: string }) {
  const keywords = keyword.split(",");
  const shown = keywords.slice(0, 3);
  const remaining = keywords.length - 3;
  return (
    <div className="flex flex-wrap gap-1">
      {shown.map((kw) => (
        <Badge key={kw} variant="secondary" className="text-[10px]">
          {kw.trim()}
        </Badge>
      ))}
      {remaining > 0 && (
        <Badge variant="outline" className="text-[10px]">
          +{remaining}
        </Badge>
      )}
    </div>
  );
}

export default function AutomationsList() {
  const { mappings, isLoading } = useReelMappings();
  const toggleMapping = useToggleMapping();
  const deleteMapping = useDeleteMapping();
  const [deleteTarget, setDeleteTarget] = useState<Id<"reelMappings"> | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const handleDelete = async (id: Id<"reelMappings">) => {
    try {
      setDeleteLoading(true);
      await deleteMapping({ id });
    } finally {
      setDeleteTarget(null);
      setDeleteLoading(false);
    }
  };

  const reelThumbnail = (mapping: { thumbnailUrl?: string; caption?: string }) => {
    if (mapping.thumbnailUrl) {
      return (
        <Image
          src={mapping.thumbnailUrl}
          alt="Reel"
          width={40}
          height={40}
          className="h-10 w-10 shrink-0 rounded object-cover"
        />
      );
    }
    return (
      <div className="bg-muted flex h-10 w-10 shrink-0 items-center justify-center rounded">
        <span className="text-muted-foreground text-xs font-medium">
          {(mapping.caption ?? "R").charAt(0).toUpperCase()}
        </span>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="p-5 sm:p-8">
        {/* Mobile skeleton */}
        <div className="flex flex-col gap-3 sm:hidden">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="app-panel p-4">
              <div className="flex items-start gap-3">
                <div className="bg-muted h-10 w-10 shrink-0 animate-pulse rounded" />
                <div className="flex-1 space-y-2">
                  <div className="bg-muted h-4 w-32 animate-pulse rounded" />
                  <div className="bg-muted h-3 w-24 animate-pulse rounded" />
                  <div className="flex gap-1">
                    <div className="bg-muted h-4 w-12 animate-pulse rounded" />
                    <div className="bg-muted h-4 w-12 animate-pulse rounded" />
                  </div>
                </div>
                <div className="bg-muted h-8 w-8 shrink-0 animate-pulse rounded" />
              </div>
            </div>
          ))}
        </div>
        {/* Desktop skeleton */}
        <div className="app-panel hidden overflow-hidden sm:block">
          <table className="w-full">
            <thead>
              <tr className="border-border/50 border-b">
                <th className="text-muted-foreground px-4 py-3 text-left text-xs font-semibold tracking-wider uppercase">
                  Reel
                </th>
                <th className="text-muted-foreground hidden px-4 py-3 text-left text-xs font-semibold tracking-wider uppercase sm:table-cell">
                  Product
                </th>
                <th className="text-muted-foreground hidden px-4 py-3 text-left text-xs font-semibold tracking-wider uppercase md:table-cell">
                  Keywords
                </th>
                <th className="text-muted-foreground px-4 py-3 text-left text-xs font-semibold tracking-wider uppercase">
                  Status
                </th>
                <th className="w-10 px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 3 }).map((_, i) => (
                <tr key={i} className="border-border/50 border-b">
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="bg-muted h-10 w-10 animate-pulse rounded" />
                      <div className="bg-muted h-4 w-32 animate-pulse rounded" />
                    </div>
                  </td>
                  <td className="hidden px-4 py-3.5 sm:table-cell">
                    <div className="bg-muted h-4 w-24 animate-pulse rounded" />
                  </td>
                  <td className="hidden px-4 py-3.5 md:table-cell">
                    <div className="bg-muted h-4 w-20 animate-pulse rounded" />
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="bg-muted h-5 w-14 animate-pulse rounded" />
                  </td>
                  <td className="px-4 py-3.5" />
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  if (mappings.length === 0) {
    return (
      <div className="p-5 sm:p-8">
        <div className="app-panel flex flex-col items-center py-20 text-center">
          <MessageSquareQuote className="text-muted-foreground/30 h-10 w-10" />
          <p className="mt-4 text-sm font-medium">No automations yet</p>
          <p className="text-muted-foreground mt-1 max-w-xs text-xs">
            Create your first automation to auto-DM followers who comment on your reels.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="p-5 sm:p-8">
        {/* Mobile cards */}
        <div className="flex flex-col gap-3 sm:hidden">
          {mappings.map((mapping) => {
            const keywords = mapping.keyword.split(",");
            return (
              <div key={mapping._id} className="app-panel p-4">
                <div className="flex items-start gap-3">
                  {reelThumbnail(mapping)}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {mapping.caption ?? "Untitled reel"}
                    </p>
                    <p className="text-muted-foreground mt-0.5 text-xs">{mapping.productName}</p>
                    <div className="mt-1.5 flex flex-wrap gap-1">
                      {keywords.slice(0, 3).map((kw) => (
                        <Badge key={kw} variant="secondary" className="text-[10px]">
                          {kw.trim()}
                        </Badge>
                      ))}
                      {keywords.length > 3 && (
                        <Badge variant="outline" className="text-[10px]">
                          +{keywords.length - 3}
                        </Badge>
                      )}
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <Badge
                        variant={mapping.active ? "default" : "outline"}
                        className="text-[11px] font-semibold"
                      >
                        {mapping.active ? "Active" : "Draft"}
                      </Badge>
                      <div className="ml-auto flex items-center gap-0.5">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          title={mapping.active ? "Deactivate" : "Activate"}
                          onClick={async () => {
                            try {
                              await toggleMapping({ id: mapping._id });
                            } catch {
                              /* silent */
                            }
                          }}
                        >
                          {mapping.active ? (
                            <ToggleRight className="text-primary h-4 w-4" />
                          ) : (
                            <ToggleLeft className="text-muted-foreground h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-muted-foreground hover:text-destructive h-7 w-7"
                          title="Delete"
                          onClick={() => setDeleteTarget(mapping._id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Desktop table */}
        <div className="app-panel hidden overflow-hidden sm:block">
          <table className="w-full">
            <thead>
              <tr className="border-border/50 border-b">
                <th className="text-muted-foreground px-4 py-3 text-left text-xs font-semibold tracking-wider uppercase">
                  Reel
                </th>
                <th className="text-muted-foreground hidden px-4 py-3 text-left text-xs font-semibold tracking-wider uppercase sm:table-cell">
                  Product
                </th>
                <th className="text-muted-foreground hidden px-4 py-3 text-left text-xs font-semibold tracking-wider uppercase md:table-cell">
                  Keywords
                </th>
                <th className="text-muted-foreground px-4 py-3 text-left text-xs font-semibold tracking-wider uppercase">
                  Status
                </th>
                <th className="w-10 px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {mappings.map((mapping) => (
                <tr
                  key={mapping._id}
                  className="border-border/50 hover:bg-muted/30 border-b transition-colors"
                >
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      {reelThumbnail(mapping)}
                      <div className="min-w-0">
                        <p className="max-w-40 truncate text-sm font-medium">
                          {mapping.caption ?? "Untitled reel"}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="hidden px-4 py-3.5 sm:table-cell">
                    <span className="text-muted-foreground text-sm">{mapping.productName}</span>
                  </td>
                  <td className="hidden px-4 py-3.5 md:table-cell">
                    <KeywordBadges keyword={mapping.keyword} />
                  </td>
                  <td className="px-4 py-3.5">
                    <Badge
                      variant={mapping.active ? "default" : "outline"}
                      className="text-[11px] font-semibold"
                    >
                      {mapping.active ? "Active" : "Draft"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        title={mapping.active ? "Deactivate" : "Activate"}
                        onClick={async () => {
                          try {
                            await toggleMapping({ id: mapping._id });
                          } catch {
                            /* silent */
                          }
                        }}
                      >
                        {mapping.active ? (
                          <ToggleRight className="text-primary h-4 w-4" />
                        ) : (
                          <ToggleLeft className="text-muted-foreground h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground hover:text-destructive h-8 w-8"
                        title="Delete"
                        onClick={() => setDeleteTarget(mapping._id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AlertDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this automation?</AlertDialogTitle>
            <AlertDialogDescription>
              This removes the reel mapping and stops auto-DMs. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteLoading}
              onClick={() => deleteTarget && handleDelete(deleteTarget)}
            >
              {deleteLoading ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
