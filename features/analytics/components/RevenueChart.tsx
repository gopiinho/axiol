"use client";

import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

interface TimelineDataPoint {
  label: string;
  revenue: number;
  sales: number;
  clicks: number;
}

interface RevenueChartProps {
  data: TimelineDataPoint[];
  loading: boolean;
}

function formatINR(value: number): string {
  return value.toLocaleString("en-IN");
}

function fmt(n: number): string {
  return Number.isInteger(n) ? n.toString() : n.toFixed(1);
}

function formatRevenueTick(value: number): string {
  if (value >= 10_000_000) return `₹${fmt(value / 10_000_000)}Cr`;
  if (value >= 100_000) return `₹${fmt(value / 100_000)}L`;
  if (value >= 1_000) return `₹${fmt(value / 1_000)}K`;
  return `₹${value}`;
}

function formatCountTick(value: number): string {
  const v = Math.round(value);
  if (v >= 1_000) return `${fmt(v / 1_000)}K`;
  return v.toString();
}

const TICK_COUNT = 5;

export function RevenueChart({ data, loading }: RevenueChartProps) {
  return (
    <div className="border-border/70 bg-card rounded-xs border">
      <div className="py-8 sm:px-6 lg:py-8">
        {loading ? (
          <div className="bg-muted h-64 w-full animate-pulse rounded" />
        ) : data.length === 0 ? (
          <div className="text-muted-foreground flex h-64 items-center justify-center text-sm">
            No data yet
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={256}>
            <ComposedChart data={data} margin={{ top: 12, right: 0, bottom: 4, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
              <XAxis
                dataKey="label"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
              />
              <YAxis
                yAxisId="revenue"
                orientation="left"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
                tickFormatter={formatRevenueTick}
                tickCount={TICK_COUNT}
                domain={[0, "dataMax"]}
                width={50}
              />
              <YAxis
                yAxisId="count"
                orientation="right"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
                tickFormatter={formatCountTick}
                tickCount={TICK_COUNT}
                allowDecimals={false}
                domain={[0, "dataMax"]}
                width={38}
              />
              <RechartsTooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const row = payload[0].payload as TimelineDataPoint;
                  return (
                    <div className="bg-popover text-popover-foreground border-border/80 rounded-xs border px-3 py-2 text-sm shadow-xs">
                      <p className="text-muted-foreground mb-2">{row.label}</p>
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                          <span
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: "var(--primary)" }}
                          />
                          <span className="text-muted-foreground">Revenue:</span>
                          <span className="font-semibold tabular-nums">
                            ₹{formatINR(row.revenue)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: "var(--foreground)" }}
                          />
                          <span className="text-muted-foreground">Sales:</span>
                          <span className="font-semibold tabular-nums">{row.sales}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: "var(--foreground)", opacity: 0.3 }}
                          />
                          <span className="text-muted-foreground">Clicks:</span>
                          <span className="font-semibold tabular-nums">{row.clicks}</span>
                        </div>
                      </div>
                    </div>
                  );
                }}
              />
              <Bar
                yAxisId="count"
                stackId="engagement"
                dataKey="sales"
                fill="var(--foreground)"
                radius={[0, 0, 0, 0]}
                maxBarSize={40}
              />
              <Bar
                yAxisId="count"
                stackId="engagement"
                dataKey="clicks"
                fill="var(--foreground)"
                fillOpacity={0.3}
                radius={[2, 2, 0, 0]}
                maxBarSize={40}
              />
              <Line
                yAxisId="revenue"
                dataKey="revenue"
                stroke="var(--primary)"
                strokeWidth={2}
                dot={false}
                activeDot={{
                  r: 6,
                  fill: "var(--primary)",
                  strokeWidth: 2,
                  stroke: "var(--card)",
                }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
