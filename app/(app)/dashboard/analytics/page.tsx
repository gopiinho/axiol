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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useUser } from "@/features/auth/client/UserContext";
import { KpiRow, StatTile } from "@/features/dm-queue/components/Stats";
import { EarningsCard } from "@/features/analytics/components/EarningsCard";
import { RevenueChart } from "@/features/analytics/components/RevenueChart";
import { TopProductsTable } from "@/features/analytics/components/TopProductsTable";
import { useCachedQueryResult } from "@/lib/hooks/useCachedQueryResult";
import { useProducts } from "@/features/products/hooks/useProduct";

const TIME_PERIODS = [
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "this_month", label: "This month" },
  { value: "last_month", label: "Last month" },
  { value: "3m", label: "Last 3 months" },
  { value: "this_year", label: "This year" },
  { value: "last_year", label: "Last year" },
] as const;

const GRANULARITY_OPTIONS = [
  { value: "daily" as const, label: "Daily" },
  { value: "monthly" as const, label: "Monthly" },
];

type Granularity = "daily" | "monthly";

const MONTHLY_ONLY_PERIODS = new Set(["3m", "this_year", "last_year"]);

export default function AnalyticsPage() {
  useUser();

  const [timePeriod, setTimePeriod] = useState<string>("7d");
  const [granularity, setGranularity] = useState<Granularity>("daily");

  const visibleGranularities = MONTHLY_ONLY_PERIODS.has(timePeriod)
    ? GRANULARITY_OPTIONS
    : GRANULARITY_OPTIONS.filter((g) => g.value === "daily");

  const rawEarnings = useQuery(api.orders.getEarningsSummary);
  const earnings = useCachedQueryResult("analytics:earnings", rawEarnings);

  const rawTimeline = useQuery(api.orders.getRevenueTimeline, { timePeriod, granularity });
  const timeline = useCachedQueryResult("analytics:timeline", rawTimeline);

  const { products, isLoading: productsLoading } = useProducts();
  const topProducts = (products ?? [])
    .filter((p) => p.sales > 0)
    .sort((a, b) => b.revenueCents - a.revenueCents)
    .slice(0, 10);

  /*
  const rawQueueStats = useQuery(api.dmQueue.getQueueStats);
  const rawInstagramStats = useQuery(api.instagram.getStats);
  const queueStats = useCachedQueryResult("analytics:queue", rawQueueStats);
  const instagramStats = useCachedQueryResult("analytics:instagram", rawInstagramStats);

  const kickoffWorker = useMutation(api.dmQueue.kickoffWorker);
  const [startingWorker, setStartingWorker] = useState(false);

  const handleStartWorker = async () => {
    setStartingWorker(true);
    try {
      await kickoffWorker({});
    } catch {
      // handled by convex
    } finally {
      setStartingWorker(false);
    }
  };

  const workerActive = Boolean(queueStats?.workerActive);
  */

  return (
    <div className="mb-16">
      <section className="border-b p-5 sm:p-8">
        <div className="flex items-end justify-between">
          <div>
            <h1 className="app-title">Analytics</h1>
            <p className="app-subtitle mt-1">See how your store is performing.</p>
          </div>
          <div className="flex items-center gap-2">
            {visibleGranularities.length > 1 && (
              <Select
                value={granularity}
                onValueChange={(v) => setGranularity(v as Granularity)}
              >
                <SelectTrigger className="w-28">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {visibleGranularities.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <Select
              value={timePeriod}
              onValueChange={(v) => {
                setTimePeriod(v);
                if (!MONTHLY_ONLY_PERIODS.has(v)) setGranularity("daily");
              }}
            >
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TIME_PERIODS.map((period) => (
                  <SelectItem key={period.value} value={period.value}>
                    {period.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>

      <div className="space-y-8 p-5 pb-16 sm:p-8">
        <div className="grid gap-4 sm:grid-cols-3">
          <EarningsCard
            label="Sales"
            value={earnings?.totalSales ?? 0}
            loading={earnings === undefined}
            isCurrency={false}
            dotColor="var(--foreground)"
          />
          <EarningsCard
            label="Clicks"
            value={(products ?? []).reduce((sum, p) => sum + p.clicks, 0)}
            loading={productsLoading}
            isCurrency={false}
            dotColor="color-mix(in srgb, var(--foreground) 30%, transparent)"
          />
          <EarningsCard
            label="Total"
            value={earnings?.totalEarnings ?? 0}
            loading={earnings === undefined}
            dotColor="#ec4899"
          />
        </div>

        <RevenueChart data={timeline ?? []} loading={rawTimeline === undefined} />

        <TopProductsTable products={topProducts} loading={productsLoading} />

        {/*
        <section className="grid xl:grid-cols-[1.3fr_1fr] gap-4">
          <Card className="overflow-hidden">
            <CardHeader className="border-border/70 border-b">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Instagram className="text-primary h-4 w-4" />
                    DM Queue
                  </CardTitle>
                  <p className="text-muted-foreground mt-1 text-sm">
                    How your auto-DM queue is performing
                  </p>
                </div>

                <div className="flex items-end justify-end gap-2">
                  <Badge
                    className={cn(
                      "rounded-lg px-2 py-1 text-[11px]",
                      workerActive ? "badge-success" : "bg-muted text-muted-foreground"
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
                description="May need your attention"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="border-border/70 border-b pb-4">
              <CardTitle className="flex items-center gap-2 text-base">
                <TrendingUp className="text-primary h-4 w-4" />
                Activity (24h)
              </CardTitle>
              <p className="text-muted-foreground text-sm">Comments and DMs in the last 24 hours</p>
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
        */}
      </div>
    </div>
  );
}
