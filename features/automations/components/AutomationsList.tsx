"use client";

import { useState } from "react";
import Image from "next/image";
import { Id } from "@/convex/_generated/dataModel";
import { useReelMappings, useToggleMapping, useDeleteMapping } from "@/features/automations/hooks/useAutomations";
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
        <Badge key={kw} variant="secondary" className="text-[10px]">{kw.trim()}</Badge>
      ))}
      {remaining > 0 && (
        <Badge variant="outline" className="text-[10px]">+{remaining}</Badge>
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
          className="h-10 w-10 rounded object-cover shrink-0"
        />
      );
    }
    return (
      <div className="h-10 w-10 rounded bg-muted flex items-center justify-center shrink-0">
        <span className="text-xs text-muted-foreground font-medium">
          {(mapping.caption ?? "R").charAt(0).toUpperCase()}
        </span>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="p-5 sm:p-8">
        {/* Mobile skeleton */}
        <div className="sm:hidden flex flex-col gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="app-panel p-4">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded bg-muted animate-pulse shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-32 rounded bg-muted animate-pulse" />
                  <div className="h-3 w-24 rounded bg-muted animate-pulse" />
                  <div className="flex gap-1">
                    <div className="h-4 w-12 rounded bg-muted animate-pulse" />
                    <div className="h-4 w-12 rounded bg-muted animate-pulse" />
                  </div>
                </div>
                <div className="h-8 w-8 rounded bg-muted animate-pulse shrink-0" />
              </div>
            </div>
          ))}
        </div>
        {/* Desktop skeleton */}
        <div className="hidden sm:block app-panel overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/50">
                <th className="py-3 px-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Reel</th>
                <th className="py-3 px-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden sm:table-cell">Product</th>
                <th className="py-3 px-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden md:table-cell">Keywords</th>
                <th className="py-3 px-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                <th className="py-3 px-4 w-10" />
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 3 }).map((_, i) => (
                <tr key={i} className="border-b border-border/50">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded bg-muted animate-pulse" />
                      <div className="h-4 w-32 rounded bg-muted animate-pulse" />
                    </div>
                  </td>
                  <td className="py-3.5 px-4 hidden sm:table-cell"><div className="h-4 w-24 rounded bg-muted animate-pulse" /></td>
                  <td className="py-3.5 px-4 hidden md:table-cell"><div className="h-4 w-20 rounded bg-muted animate-pulse" /></td>
                  <td className="py-3.5 px-4"><div className="h-5 w-14 rounded bg-muted animate-pulse" /></td>
                  <td className="py-3.5 px-4" />
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
          <MessageSquareQuote className="h-10 w-10 text-muted-foreground/30" />
          <p className="mt-4 text-sm font-medium">No automations yet</p>
          <p className="mt-1 max-w-xs text-xs text-muted-foreground">
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
        <div className="sm:hidden flex flex-col gap-3">
          {mappings.map((mapping) => {
            const keywords = mapping.keyword.split(",");
            return (
              <div key={mapping._id} className="app-panel p-4">
                <div className="flex items-start gap-3">
                  {reelThumbnail(mapping)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {mapping.caption ?? "Untitled reel"}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {mapping.productName}
                    </p>
                    <div className="mt-1.5 flex flex-wrap gap-1">
                      {keywords.slice(0, 3).map((kw) => (
                        <Badge key={kw} variant="secondary" className="text-[10px]">{kw.trim()}</Badge>
                      ))}
                      {keywords.length > 3 && (
                        <Badge variant="outline" className="text-[10px]">+{keywords.length - 3}</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge
                        variant={mapping.active ? "default" : "outline"}
                        className="text-[11px] font-semibold"
                      >
                        {mapping.active ? "Active" : "Draft"}
                      </Badge>
                      <div className="flex items-center gap-0.5 ml-auto">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          title={mapping.active ? "Deactivate" : "Activate"}
                          onClick={async () => {
                            try { await toggleMapping({ id: mapping._id }); } catch { /* silent */ }
                          }}
                        >
                          {mapping.active ? (
                            <ToggleRight className="h-4 w-4 text-primary" />
                          ) : (
                            <ToggleLeft className="h-4 w-4 text-muted-foreground" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-muted-foreground hover:text-destructive"
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
        <div className="hidden sm:block app-panel overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/50">
                <th className="py-3 px-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Reel</th>
                <th className="py-3 px-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden sm:table-cell">Product</th>
                <th className="py-3 px-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden md:table-cell">Keywords</th>
                <th className="py-3 px-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                <th className="py-3 px-4 w-10" />
              </tr>
            </thead>
            <tbody>
              {mappings.map((mapping) => (
                <tr
                  key={mapping._id}
                  className="border-b border-border/50 transition-colors hover:bg-muted/30"
                >
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      {reelThumbnail(mapping)}
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate max-w-40">
                          {mapping.caption ?? "Untitled reel"}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 hidden sm:table-cell">
                    <span className="text-sm text-muted-foreground">
                      {mapping.productName}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 hidden md:table-cell">
                    <KeywordBadges keyword={mapping.keyword} />
                  </td>
                  <td className="py-3.5 px-4">
                    <Badge
                      variant={mapping.active ? "default" : "outline"}
                      className="text-[11px] font-semibold"
                    >
                      {mapping.active ? "Active" : "Draft"}
                    </Badge>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        title={mapping.active ? "Deactivate" : "Activate"}
                        onClick={async () => {
                          try { await toggleMapping({ id: mapping._id }); } catch { /* silent */ }
                        }}
                      >
                        {mapping.active ? (
                          <ToggleRight className="h-4 w-4 text-primary" />
                        ) : (
                          <ToggleLeft className="h-4 w-4 text-muted-foreground" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
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
