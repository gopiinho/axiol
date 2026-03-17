"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import {
  AlertCircle,
  CheckCircle2,
  Clock3,
  Instagram,
  Pause,
  Play,
  Radar,
  TrendingUp,
} from "lucide-react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { requireSessionToken } from "@/features/auth/client/session";
import { useUser } from "@/features/auth/client/UserContext";
import { KpiRow, StatTile } from "@/features/dm-queue/components/Stats";
import { useCachedQueryResult } from "@/lib/hooks/useCachedQueryResult";
import { FadeIn } from "@/components/motion/FadeIn";

export default function AnalyticsPage() {
  const { token } = useUser();
  const rawQueueStats = useQuery(
    api.dmQueue.getQueueStats,
    token ? { token } : "skip",
  );
  const rawInstagramStats = useQuery(
    api.instagram.getStats,
    token ? { token } : "skip",
  );
  const queueStats = useCachedQueryResult(
    `analytics:queue:${token ?? "anon"}`,
    rawQueueStats,
  );
  const instagramStats = useCachedQueryResult(
    `analytics:instagram:${token ?? "anon"}`,
    rawInstagramStats,
  );
  const kickoffWorker = useMutation(api.dmQueue.kickoffWorker);

  const [startingWorker, setStartingWorker] = useState(false);

  const handleStartWorker = async () => {
    setStartingWorker(true);
    try {
      await kickoffWorker({ token: requireSessionToken() });
    } catch (error) {
      console.error("Failed to start worker:", error);
    } finally {
      setStartingWorker(false);
    }
  };

  const workerActive = Boolean(queueStats?.workerActive);

  return (
    <div className="space-y-5 md:space-y-6">
      <FadeIn>
        <div className="px-5 py-6 md:px-6 md:py-7">
          <h2 className="text-3xl font-bold">Analytics</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            DM queue performance and engagement metrics
          </p>
        </div>
      </FadeIn>

      <FadeIn delay={0.08}>
        <section className="grid gap-4 xl:grid-cols-[1.3fr_1fr]">
          <Card className="overflow-hidden">
            <CardHeader className="border-b border-border/70 bg-secondary/35">
              <div className="flex items-start gap-4">
                <div>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Instagram className="h-4 w-4 text-primary" />
                    DM Queue
                  </CardTitle>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Worker state and queue processing throughput
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Badge
                    className={cn(
                      "rounded-lg px-2 py-1 text-[11px]",
                      workerActive
                        ? "badge-success"
                        : "bg-muted text-muted-foreground",
                    )}
                  >
                    {workerActive ? (
                      <>
                        <span className="pulse-dot mr-1">&nbsp;&nbsp;</span>
                        Active
                      </>
                    ) : (
                      "Idle"
                    )}
                  </Badge>
                  {!workerActive && queueStats && queueStats.pending > 0 && (
                    <Button
                      onClick={handleStartWorker}
                      disabled={startingWorker}
                      size="sm"
                      className="gap-1.5"
                    >
                      <Play className="h-3.5 w-3.5" />
                      {startingWorker ? "Starting..." : "Start"}
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>

            <CardContent className="grid gap-3 pt-5 sm:grid-cols-2">
              <StatTile
                title="Worker"
                value={workerActive ? "Running" : "Stopped"}
                icon={workerActive ? Radar : Pause}
                tone={workerActive ? "ok" : "neutral"}
                description={`Sending ${queueStats?.dmsSentInLastHour || 0}/195 DMs this hour`}
              />
              <StatTile
                title="Pending"
                value={String(queueStats?.pending || 0)}
                icon={Clock3}
                tone="warn"
                description={
                  queueStats?.estimatedMinutesToClear
                    ? `Approx ${queueStats.estimatedMinutesToClear} min to clear`
                    : "Queue is clear"
                }
              />
              <StatTile
                title="Sent"
                value={String(queueStats?.sent || 0)}
                icon={CheckCircle2}
                tone="ok"
                description="Delivered successfully"
              />
              <StatTile
                title="Failed"
                value={String(queueStats?.failed || 0)}
                icon={AlertCircle}
                tone="danger"
                description="Require retry or review"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="border-b border-border/70 bg-secondary/35 pb-4">
              <CardTitle className="flex items-center gap-2 text-base">
                <TrendingUp className="h-4 w-4 text-primary" />
                Activity (24h)
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Recent engagement and DM delivery indicators
              </p>
            </CardHeader>
            <CardContent className="grid gap-3 pt-5">
              <KpiRow
                label="Comments"
                value={instagramStats?.commentsLast24h ?? 0}
                helper={`${instagramStats?.totalComments ?? 0} total`}
              />
              <KpiRow
                label="DMs Sent"
                value={instagramStats?.dmsLast24h ?? 0}
                helper={`${instagramStats?.totalDMs ?? 0} total`}
              />
              <KpiRow
                label="Success Rate"
                value={`${instagramStats?.dmSuccessRate ?? 0}%`}
                helper="Delivery success"
                highlight
              />
            </CardContent>
          </Card>
        </section>
      </FadeIn>
    </div>
  );
}
