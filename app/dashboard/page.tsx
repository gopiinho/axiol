"use client";

import { useState, type ComponentType } from "react";
import Link from "next/link";
import Image from "next/image";
import { useMutation, useQuery } from "convex/react";
import {
  AlertCircle,
  ArrowUpRight,
  CheckCircle2,
  Clock3,
  Instagram,
  List,
  Pause,
  Play,
  Plus,
  Radar,
  Send,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { getAuthToken } from "@/lib/auth";

export default function DashboardPage() {
  const token = getAuthToken();
  const sections = useQuery(api.sections.list);
  const queueStats = useQuery(
    api.dmQueue.getQueueStats,
    token ? { token } : "skip",
  );
  const instagramStats = useQuery(
    api.instagram.getStats,
    token ? { token } : "skip",
  );
  const publishedMappings = useQuery(
    api.instagram.getPublishedMappings,
    token ? { token } : "skip",
  );
  const kickoffWorker = useMutation(api.dmQueue.kickoffWorker);

  const [startingWorker, setStartingWorker] = useState(false);

  const handleStartWorker = async () => {
    if (!token) {
      return;
    }

    setStartingWorker(true);
    try {
      await kickoffWorker({ token });
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
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="app-panel px-6 py-5 text-sm text-muted-foreground">
          Loading dashboard metrics...
        </div>
      </div>
    );
  }

  const workerActive = Boolean(queueStats?.workerActive);

  return (
    <div className="space-y-5 md:space-y-6">
      <section className="app-panel overflow-hidden">
        <div className="grid gap-5 px-5 py-6 md:grid-cols-[minmax(0,1fr)_auto] md:px-6 md:py-7">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
              Overview
            </p>
            <h1 className="app-title mt-2">Instagram automation command center</h1>
            <p className="app-subtitle mt-2 max-w-2xl">
              Monitor queue health, track activity, and jump directly into content and list management.
            </p>
          </div>

          <div className="hidden gap-2 sm:flex md:self-start">
            <Button asChild size="lg" className="gap-2">
              <Link href="/dashboard/create">
                <Plus className="h-4 w-4" />
                New Post
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="gap-2">
              <Link href="/dashboard/lists">
                <List className="h-4 w-4" />
                Lists
              </Link>
            </Button>
          </div>

          <div className="flex gap-2 sm:hidden">
            <Button asChild className="flex-1 gap-2">
              <Link href="/dashboard/create">
                <Plus className="h-4 w-4" />
                New Post
              </Link>
            </Button>
            <Button asChild variant="outline" className="flex-1 gap-2">
              <Link href="/dashboard/lists">
                <List className="h-4 w-4" />
                Lists
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.3fr_1fr]">
        <Card className="overflow-hidden">
          <CardHeader className="border-b border-border/70 bg-secondary/35 pb-4">
            <div className="flex items-start justify-between gap-4">
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
                    workerActive ? "bg-emerald-500 text-white" : "bg-muted text-muted-foreground"
                  )}
                >
                  {workerActive ? "Active" : "Idle"}
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
            <p className="text-sm text-muted-foreground">Recent engagement and DM delivery indicators</p>
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

      <section>
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h2 className="font-accent text-xl font-semibold tracking-tight">Active Reel Mappings</h2>
            <p className="app-subtitle mt-1">Live posts currently responding to matching comments</p>
          </div>
          <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
            <Link href="/dashboard/drafts">
              View drafts
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        {publishedMappings && publishedMappings.length > 0 ? (
          <div className="grid gap-3 md:grid-cols-2 2xl:grid-cols-3">
            {publishedMappings.slice(0, 6).map((mapping) => (
              <Card key={mapping._id} className="overflow-hidden">
                {mapping.thumbnailUrl && (
                  <div className="aspect-video overflow-hidden border-b border-border/70 bg-secondary/40">
                    <Image
                      src={mapping.thumbnailUrl}
                      alt="Reel thumbnail"
                      width={640}
                      height={360}
                      className="h-full w-full object-cover transition duration-300 hover:scale-[1.03]"
                    />
                  </div>
                )}

                <CardContent className="space-y-3 pt-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">{mapping.sectionTitle}</p>
                      <p className="mt-1 truncate text-xs text-muted-foreground">
                        Keyword: &quot;{mapping.keyword}&quot;
                      </p>
                    </div>
                    <Badge className="rounded-lg bg-emerald-500 text-white">Live</Badge>
                  </div>

                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Max items: {mapping.maxItemsInDM}</span>
                    <a
                      href={mapping.reelUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-primary hover:underline"
                    >
                      Open reel
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </a>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <Sparkles className="mx-auto h-10 w-10 text-muted-foreground" />
              <p className="mt-3 text-sm text-muted-foreground">
                No active mappings yet. Publish a draft to start auto-replies.
              </p>
              <Button asChild className="mt-5 gap-2">
                <Link href="/dashboard/create">
                  <Send className="h-4 w-4" />
                  Create mapping
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </section>
    </div>
  );
}

type Tone = "ok" | "warn" | "danger" | "neutral";

function StatTile({
  title,
  value,
  description,
  tone,
  icon: Icon,
}: {
  title: string;
  value: string;
  description: string;
  tone: Tone;
  icon: ComponentType<{ className?: string }>;
}) {
  const toneStyles = {
    ok: "bg-emerald-100 text-emerald-700",
    warn: "bg-amber-100 text-amber-700",
    danger: "bg-rose-100 text-rose-700",
    neutral: "bg-slate-100 text-slate-700",
  };

  return (
    <div className="app-panel-soft p-4">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <span className={cn("rounded-lg p-2", toneStyles[tone])}>
          <Icon className="h-3.5 w-3.5" />
        </span>
      </div>
      <p className="mt-3 text-2xl font-semibold tracking-tight">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{description}</p>
    </div>
  );
}

function KpiRow({
  label,
  value,
  helper,
  highlight = false,
}: {
  label: string;
  value: number | string;
  helper: string;
  highlight?: boolean;
}) {
  return (
    <div className="app-panel-soft flex items-center justify-between gap-3 px-4 py-3">
      <div>
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">{helper}</p>
      </div>
      <p className={cn("text-xl font-semibold", highlight && "text-emerald-600")}>{value}</p>
    </div>
  );
}
