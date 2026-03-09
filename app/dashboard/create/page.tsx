"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ExternalLink, Eye } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

export default function CreatePostPage() {
  type Reel = {
    id: string;
    url: string;
    caption: string;
    thumbnailUrl: string;
    timestamp: string;
  };

  const router = useRouter();
  const [selectedReel, setSelectedReel] = useState<Reel | null>(null);
  const [selectedSection, setSelectedSection] = useState<Id<"sections"> | "">(
    ""
  );
  const [keyword, setKeyword] = useState("link");
  const [maxItemsInDM, setMaxItemsInDM] = useState(10);
  const [includeWebsiteLink, setIncludeWebsiteLink] = useState(true);
  const [loading, setLoading] = useState(false);
  const [reels, setReels] = useState<Reel[]>([]);

  const sections = useQuery(api.sections.list);
  const fetchReels = useAction(api.instagram.fetchRecentReels);
  const createMapping = useMutation(api.instagram.createReelMapping);
  const generatePreview = useQuery(
    api.instagram.generateDMMessage,
    selectedSection
      ? {
          sectionId: selectedSection,
          maxItems: maxItemsInDM,
          includeWebsiteLink,
        }
      : "skip"
  );

  useEffect(() => {
    const loadReels = async () => {
      try {
        const fetchedReels = await fetchReels({});
        setReels(fetchedReels);
      } catch (err) {
        console.error("Failed to fetch reels", err);
      }
    };

    loadReels();
  }, [fetchReels]);

  const handleSaveDraft = async () => {
    if (!selectedReel || !selectedSection) return;

    setLoading(true);
    try {
      await createMapping({
        reelId: selectedReel.id,
        reelUrl: selectedReel.url,
        thumbnailUrl: selectedReel.thumbnailUrl,
        caption: selectedReel.caption,
        sectionId: selectedSection,
        keyword: keyword.toLowerCase(),
        maxItemsInDM,
        includeWebsiteLink,
      });
      router.push("/dashboard/drafts");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to save draft";
      alert("Error: " + message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="mt-3 w-full text-center items-center justify-center">
        <h1 className="text-xl font-bold tracking-tight gap-2">
          Create New Post
        </h1>
        <p className="text-muted-foreground text-xs">
          Link an Instagram reel to a collection and configure auto-DM
        </p>
      </div>

      <div className="space-y-2 mt-4 sm:mt-10">
        <p className="py-2 font-xl text-center font-semibold">1. Select Reel</p>
        <div className="space-y-4">
          {reels.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {reels.map((reel) => (
                <div
                  key={reel.id}
                  onClick={() => setSelectedReel(reel)}
                  className={`cursor-pointer relative overflow-hidden border-2 rounded-lg transition-all ${
                    selectedReel?.id === reel.id
                      ? "border-pink-500 bg-pink-50"
                      : "border-gray-200 hover:border-pink-300"
                  }`}
                >
                  <div className="flex flex-col">
                    {reel.thumbnailUrl && (
                      <div className="w-full aspect-4/5 overflow-hidden bg-gray-100">
                        <img
                          src={reel.thumbnailUrl}
                          alt="Reel"
                          className="w-full h-full object-cover object-center"
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0 p-2">
                      <p className="text-sm font-semibold truncate">
                        {reel.caption}
                      </p>
                      <a
                        href={reel.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-primary hover:underline flex items-center gap-1 mt-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        View
                        <ExternalLink className="h-3 w-3" />
                      </a>
                      <div className="absolute top-2 right-3">
                        <div
                          className={`h-5 w-5 rounded-full border-2 flex items-center justify-center transition-all
      ${selectedReel?.id === reel.id ? "border-pink-500" : "border-gray-300"}
    `}
                        >
                          {selectedReel?.id === reel.id && (
                            <div className="h-2.5 w-2.5 rounded-full bg-pink-500" />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {selectedReel && (
        <div className="space-y-2 mt-4 sm:mt-10">
          <p className="py-2 font-xl text-center font-semibold">
            Step 2: Select Collection
          </p>
          <div className="space-y-4">
            <div>
              <Label>Collection</Label>
              <Select
                value={selectedSection}
                onValueChange={(value) =>
                  setSelectedSection(value as Id<"sections">)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose collection..." />
                </SelectTrigger>
                <SelectContent>
                  {sections?.map((section) => (
                    <SelectItem key={section._id} value={section._id}>
                      {section.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Trigger Keyword</Label>
              <Input
                value={keyword}
                onChange={(e) => setKeyword(e.target.value.toLowerCase())}
                placeholder="link"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Users will comment this to trigger the DM
              </p>
            </div>
          </div>
        </div>
      )}

      {selectedSection && (
        <div className="space-y-2 mt-4 sm:mt-10">
          <p className="py-2 font-xl text-center font-semibold">
            Step 3: Configure DM Message
          </p>
          <div className="space-y-4">
            <div>
              <Label>Max Items in DM</Label>
              <Input
                type="number"
                min={1}
                max={20}
                value={maxItemsInDM}
                onChange={(e) => setMaxItemsInDM(parseInt(e.target.value))}
              />
              <p className="text-xs text-muted-foreground mt-1">
                How many items to include (1-20)
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="include-link"
                checked={includeWebsiteLink}
                onCheckedChange={(checked) =>
                  setIncludeWebsiteLink(checked as boolean)
                }
              />
              <Label htmlFor="include-link" className="cursor-pointer">
                Include website link in DM
              </Label>
            </div>

            {generatePreview && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Eye className="h-4 w-4" />
                  <Label>Message Preview</Label>
                </div>
                <Textarea
                  value={generatePreview.message}
                  readOnly
                  rows={15}
                  className="font-mono text-xs"
                />
                <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                  <span>Items: {generatePreview.itemCount}</span>
                  <span>Characters: {generatePreview.characterCount}/1000</span>
                  {generatePreview.characterCount > 1000 && (
                    <span className="text-red-600 font-medium">
                      ⚠️ Too long! Will be truncated
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {selectedReel && selectedSection && (
        <div className="flex gap-4">
          <Button
            onClick={handleSaveDraft}
            disabled={loading}
            className="flex-1"
            variant="outline"
          >
            {loading ? "Saving..." : "Save as Draft"}
          </Button>
        </div>
      )}
    </div>
  );
}
