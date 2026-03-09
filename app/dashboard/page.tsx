"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Instagram,
  MessageCircle,
  AlertCircle,
  CheckCircle,
  Clock,
  TrendingUp,
  Play,
  Pause,
  List,
} from "lucide-react";

export default function DashboardPage() {
  const sections = useQuery(api.sections.list);
  const queueStats = useQuery(api.dmQueue.getQueueStats);
  const instagramStats = useQuery(api.instagram.getStats);
  const publishedMappings = useQuery(api.instagram.getPublishedMappings);
  const kickoffWorker = useMutation(api.dmQueue.kickoffWorker);

  const [startingWorker, setStartingWorker] = useState(false);

  const handleStartWorker = async () => {
    setStartingWorker(true);
    try {
      await kickoffWorker();
    } catch (error) {
      console.error("Failed to start worker:", error);
    } finally {
      setStartingWorker(false);
    }
  };

  const isLoading =
    sections === undefined ||
    queueStats === undefined ||
    instagramStats === undefined;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage your Instagram affiliate automation
          </p>
        </div>
        <div className="flex gap-3 flex-wrap max-sm:hidden">
          <Link href="/dashboard/create">
            <Button size="lg" className="gap-2">
              <Plus className="h-4 w-4" />
              New Post
            </Button>
          </Link>
          <Link href="/dashboard/lists">
            <Button size="lg" className="gap-2" variant="outline">
              <List className="h-4 w-4" />
              Your Lists
            </Button>
          </Link>
          <Link href="/dashboard/drafts">
            <Button size="lg" className="gap-2" variant="outline">
              Drafts
            </Button>
          </Link>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Instagram className="h-5 w-5" />
            DM Queue Status
          </h2>

          {queueStats && !queueStats.workerActive && queueStats.pending > 0 && (
            <Button
              onClick={handleStartWorker}
              disabled={startingWorker}
              size="sm"
              className="gap-2"
            >
              <Play className="h-4 w-4" />
              {startingWorker ? "Starting..." : "Start Worker"}
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center justify-between">
                Worker Status
                {queueStats?.workerActive ? (
                  <Badge className="bg-green-500">
                    <div className="flex items-center gap-1">
                      <div className="h-2 w-2 bg-white rounded-full animate-pulse" />
                      Active
                    </div>
                  </Badge>
                ) : (
                  <Badge variant="secondary">
                    <Pause className="h-3 w-3 mr-1" />
                    Idle
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {queueStats?.workerActive ? "Running" : "Stopped"}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Sending {queueStats?.dmsSentInLastHour || 0}/195 DMs this hour
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Clock className="h-4 w-4 text-yellow-500" />
                Pending
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {queueStats?.pending || 0}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {queueStats?.estimatedMinutesToClear
                  ? `~${queueStats.estimatedMinutesToClear} min to clear`
                  : "Queue empty"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Sent
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {queueStats?.sent || 0}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Total DMs delivered successfully
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-red-500" />
                Failed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {queueStats?.failed || 0}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                DMs that couldn&apos;t be delivered
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {instagramStats && (
        <div>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Activity Overview
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">
                  Comments (24h)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {instagramStats.commentsLast24h}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {instagramStats.totalComments} total
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">
                  DMs Sent (24h)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {instagramStats.dmsLast24h}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {instagramStats.totalDMs} total
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">
                  Success Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {instagramStats.dmSuccessRate}%
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  DM delivery success
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      <div>
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          Active Instagram Posts
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {publishedMappings?.slice(0, 6).map((mapping) => (
            <Card
              key={mapping._id}
              className="hover:shadow-lg transition-shadow"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-sm font-medium truncate">
                      {mapping.sectionTitle}
                    </CardTitle>
                    <p className="text-xs text-muted-foreground mt-1 truncate">
                      Keyword: &quot;{mapping.keyword}&quot;
                    </p>
                  </div>
                  <Badge className="bg-green-500 ml-2">Live</Badge>
                </div>
              </CardHeader>

              <CardContent>
                {mapping.thumbnailUrl && (
                  <div className="aspect-video rounded-lg overflow-hidden mb-3">
                    <img
                      src={mapping.thumbnailUrl}
                      alt="Reel thumbnail"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Max items: {mapping.maxItemsInDM}</span>
                  <a
                    href={mapping.reelUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    View Reel →
                  </a>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
