"use client";

import { useId, useState } from "react";

import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Bar,
  Customized,
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

function computeNiceMax(dataMax: number, tickCount: number): number {
  if (dataMax <= 0) return tickCount;
  const step = dataMax / (tickCount - 1);
  const magnitude = Math.pow(10, Math.floor(Math.log10(step)));
  const residual = step / magnitude;
  const niceStep =
    residual <= 1.5 ? magnitude : residual <= 3.5 ? 2 * magnitude : residual <= 7.5 ? 5 * magnitude : 10 * magnitude;
  return Math.ceil(dataMax / niceStep) * niceStep + niceStep;
}

const TICK_COUNT = 5;

export function RevenueChart({ data, loading }: RevenueChartProps) {
  const gradientId = useId();
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const isEmpty = data.every((d) => d.revenue === 0 && d.sales === 0 && d.clicks === 0);

  return (
    <div className="border-border/70 bg-card rounded-xs border">
      <div className="py-8 sm:px-6 lg:py-8">
        {loading ? (
          <div className="bg-muted h-64 w-full animate-pulse rounded" />
        ) : isEmpty ? (
          <div className="text-muted-foreground flex h-64 items-center justify-center text-sm">
            No sales yet.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={256}>
            <ComposedChart
                data={data}
                margin={{ top: 12, right: 0, bottom: 4, left: 0 }}
                onMouseMove={(state) => {
                  if (typeof state.activeTooltipIndex === "number") setActiveIndex(state.activeTooltipIndex);
                }}
                onMouseLeave={() => setActiveIndex(null)}>
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
              <XAxis
                dataKey="label"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
              />
              <YAxis
                yAxisId="revenue"
                orientation="left"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
                tickFormatter={formatRevenueTick}
                tickCount={TICK_COUNT}
                domain={[0, (dataMax: number) => computeNiceMax(dataMax, TICK_COUNT)]}
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
                domain={[0, (dataMax: number) => Math.ceil(computeNiceMax(dataMax, TICK_COUNT))]}
                width={38}
              />
              <RechartsTooltip
                cursor={false}
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
              <Customized
                component={({ width, height, offset }: Record<string, any>) => {
                  if (activeIndex == null) return null;
                  const plotWidth = width - offset.left - offset.right;
                  const barWidth = plotWidth / data.length;
                  const cx = offset.left + barWidth * activeIndex + barWidth / 2;
                  const cy = height - offset.bottom;
                  return (
                    <line x1={cx} y1={cy} x2={cx} y2={cy + 6} stroke="var(--border)" strokeWidth={2} strokeDasharray="2 2" />
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
              <Area
                type="monotone"
                yAxisId="revenue"
                dataKey="revenue"
                stroke="var(--primary)"
                strokeWidth={2}
                fill={`url(#${gradientId})`}
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
