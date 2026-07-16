"use client";

import { useState } from "react";
import { toast } from "sonner";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Trash2, Edit, Send, MoreHorizontal, MessageSquareQuote, ExternalLink, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import EditAutomationDialog from "./EditAutomationDialog";

function KeywordBadges({ keyword }: { keyword: string }) {
  const keywords = keyword.split(",");
  const shown = keywords.slice(0, 3);
  const remaining = keywords.length - 3;
  return (
    <div className="flex flex-wrap gap-1">
      {shown.map((kw) => (
        <Badge key={kw} className="bg-foreground text-background rounded-xs">
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
  const [editTarget, setEditTarget] = useState<Id<"reelMappings"> | null>(null);

  const handleDelete = async (id: Id<"reelMappings">) => {
    try {
      setDeleteLoading(true);
      await deleteMapping({ id });
      toast.success("Automation deleted!");
    } catch {
      toast.error("Failed to delete automation", { description: "Please try again." });
    } finally {
      setDeleteTarget(null);
      setDeleteLoading(false);
    }
  };

  const handleToggle = async (id: Id<"reelMappings">) => {
    try {
      await toggleMapping({ id });
      toast.success("Automation status updated!");
    } catch {
      toast.error("Failed to update automation", { description: "Please try again." });
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
        <div className="bg-card hidden overflow-hidden rounded-xs sm:block">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr className="border-border/50 border-b">
                <th className="text-muted-foreground px-4 py-3 text-left text-sm font-black">
                  Reel
                </th>
                <th className="text-muted-foreground hidden px-4 py-3 text-left text-sm font-black sm:table-cell">
                  Product
                </th>
                <th className="text-muted-foreground hidden px-4 py-3 text-left text-sm font-black md:table-cell">
                  Keywords
                </th>
                <th className="text-muted-foreground px-4 py-3 text-left text-sm font-black">
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
        <div className="bg-card flex flex-col items-center rounded-xs border py-20 text-center">
          <MessageSquareQuote className="text-muted-foreground/30 h-10 w-10" />
          <p className="mt-4 text-sm font-medium">No automations yet</p>
          <p className="text-muted-foreground mt-1 max-w-xs text-xs">
            Create your first automation to auto-DM followers who comment on your reels.
          </p>
        </div>
      </div>
    );
  }

  const resolvedMapping = mappings.find((m) => m._id === editTarget) ?? null;

  return (
    <>
      <div className="p-5 sm:p-8">
        {/* Mobile cards */}
        <div className="flex flex-col gap-3 sm:hidden">
          {mappings.map((mapping) => {
            const keywords = mapping.keyword.split(",");
            return (
              <div
                key={mapping._id}
                className="app-panel hover:bg-muted/30 cursor-pointer p-4 transition-colors"
                onClick={() => setEditTarget(mapping._id)}
              >
                <div className="flex items-start gap-3">
                  {reelThumbnail(mapping)}
                  <div className="min-w-0 flex-1">
                    <a
                      href={mapping.reelUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="text-primary block max-w-52 truncate text-sm font-medium hover:underline"
                    >
                      {mapping.caption ?? "Untitled reel"}
                      <ExternalLink className="ml-1 inline h-3 w-3" />
                    </a>
                    <a
                      href={`/dashboard/products/${mapping.productId}/edit`}
                      onClick={(e) => e.stopPropagation()}
                      className="text-muted-foreground mt-0.5 block truncate text-xs hover:underline"
                    >
                      {mapping.productName}
                    </a>
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
                      <span
                        className={cn(
                          "text-[11px] font-semibold",
                          mapping.active ? "text-emerald-700" : "text-amber-700"
                        )}
                      >
                        {mapping.active ? "Active" : "Draft"}
                      </span>
                      <div className="ml-auto">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Actions</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-44">
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditTarget(mapping._id);
                              }}
                            >
                              <Edit className="h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                handleToggle(mapping._id);
                              }}
                            >
                              <Send className="h-4 w-4" />
                              {mapping.active ? "Unpublish" : "Publish"}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              variant="destructive"
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeleteTarget(mapping._id);
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Desktop table */}
        <div className="bg-card hidden overflow-hidden rounded-xs sm:block">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr className="border-border/50 border-b">
                <th className="text-muted-foreground px-4 py-3 text-left text-sm font-black">
                  Reel
                </th>
                <th className="text-muted-foreground hidden px-4 py-3 text-left text-sm font-black sm:table-cell">
                  Product
                </th>
                <th className="text-muted-foreground hidden px-4 py-3 text-left text-sm font-black md:table-cell">
                  Keywords
                </th>
                <th className="text-muted-foreground px-4 py-3 text-left text-sm font-black">
                  Status
                </th>
                <th className="w-10 px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {mappings.map((mapping) => (
                <tr
                  key={mapping._id}
                  className="group border-border/50 hover:bg-muted/30 cursor-pointer border-b transition-colors"
                  onClick={() => setEditTarget(mapping._id)}
                >
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      {reelThumbnail(mapping)}
                      <div className="min-w-0">
                        <a
                          href={mapping.reelUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="text-primary block max-w-40 truncate text-sm font-medium hover:underline"
                        >
                          {mapping.caption ?? "Untitled reel"}
                          <ExternalLink className="ml-1 inline h-3 w-3" />
                        </a>
                      </div>
                    </div>
                  </td>
                  <td className="hidden px-4 py-3.5 sm:table-cell">
                    <div className="max-w-35">
                      <a
                        href={`/dashboard/products/${mapping.productId}/edit`}
                        onClick={(e) => e.stopPropagation()}
                        className="block truncate text-sm hover:underline"
                      >
                        {mapping.productName}
                      </a>
                    </div>
                  </td>
                  <td className="hidden px-4 py-3.5 md:table-cell">
                    <KeywordBadges keyword={mapping.keyword} />
                  </td>
                  <td className="px-4 py-3.5">
                    <span
                      className={cn(
                        "text-sm font-medium",
                        mapping.active ? "text-emerald-700" : "text-amber-700"
                      )}
                    >
                      {mapping.active ? "Active" : "Draft"}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Actions</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-44">
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditTarget(mapping._id);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggle(mapping._id);
                          }}
                        >
                          <Send className="h-4 w-4" />
                          {mapping.active ? "Unpublish" : "Publish"}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          variant="destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteTarget(mapping._id);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
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
            <Button
              variant="destructive"
              disabled={deleteLoading}
              onClick={() => deleteTarget && handleDelete(deleteTarget)}
            >
              {deleteLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Delete"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <EditAutomationDialog
        mapping={resolvedMapping}
        open={editTarget !== null}
        onOpenChange={(open) => !open && setEditTarget(null)}
      />
    </>
  );
}
