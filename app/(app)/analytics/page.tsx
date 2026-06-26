"use client";

import { ArrowDown, ArrowUp, BarChart3, Download, ShoppingBag, Star, TrendingUp, Users, Wallet } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatCard } from "@/components/stat-card";
import { CategoryDonut, HourlyBarChart, RevenueAreaChart } from "@/components/charts";
import { useAppStore } from "@/lib/store";
import { formatCurrency, formatPercent } from "@/lib/format";
import { useState } from "react";

export default function AnalyticsPage() {
  const analytics = useAppStore((s) => s.analytics);
  const [period, setPeriod] = useState("7");

  const dineInOrders = useAppStore((s) => s.orders.filter(o => o.type === "dine-in").length);
  const takeawayOrders = useAppStore((s) => s.orders.filter(o => o.type === "takeaway").length);
  const deliveryOrders = useAppStore((s) => s.orders.filter(o => o.type === "delivery").length);

  return (
    <>
      <div className="flex flex-col gap-1 pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Analytics</h1>
          <p className="text-sm text-muted-foreground">
            Performance insights across your restaurant
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Tabs value={period} onValueChange={setPeriod}>
            <TabsList>
              <TabsTrigger value="7">7d</TabsTrigger>
              <TabsTrigger value="30">30d</TabsTrigger>
              <TabsTrigger value="90">90d</TabsTrigger>
            </TabsList>
          </Tabs>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4" /> Export
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Revenue"
          value={formatCurrency(analytics.revenueByDay.reduce((sum, d) => sum + d.revenue, 0))}
          icon={Wallet}
          trend="flat"
          accent="primary"
        />
        <StatCard
          title="Orders"
          value={String(analytics.totalOrders)}
          icon={ShoppingBag}
          trend="flat"
          accent="info"
        />
        <StatCard
          title="Avg. Ticket"
          value={formatCurrency(analytics.avgTicket)}
          icon={TrendingUp}
          trend="flat"
          accent="success"
        />
        <StatCard
          title="Menu Categories"
          value={String(analytics.categoryRevenue.length)}
          icon={Users}
          trend="flat"
          accent="warning"
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-base">Revenue trend</CardTitle>
                <CardDescription>Daily revenue across the period</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <RevenueAreaChart data={analytics.revenueByDay} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Revenue by category</CardTitle>
            <CardDescription>Where the money comes from</CardDescription>
          </CardHeader>
          <CardContent>
            <CategoryDonut data={analytics.categoryRevenue} />
            <div className="mt-4 space-y-2">
              {analytics.categoryRevenue.map((c) => (
                <div key={c.name} className="flex items-center gap-2 text-xs">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: c.color }} />
                  <span className="flex-1">{c.name}</span>
                  <span className="font-mono">{formatCurrency(c.value)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Hourly revenue</CardTitle>
            <CardDescription>Average revenue by hour</CardDescription>
          </CardHeader>
          <CardContent>
            <HourlyBarChart data={analytics.revenueByHour} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Top sellers</CardTitle>
            <CardDescription>Best performing dishes</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {analytics.topItems.slice(0, 5).map((item, i) => (
              <div key={item.id} className="flex items-center gap-3">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-[10px] font-bold">
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-medium">{item.name}</p>
                  <p className="text-xs text-muted-foreground">{item.soldToday} sold</p>
                </div>
                <p className="font-mono text-sm font-medium">{formatCurrency(item.price * item.soldToday)}</p>
              </div>
            ))}
            {analytics.topItems.length === 0 && (
              <div className="text-xs text-muted-foreground text-center py-4">No items sold yet</div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Order type breakdown</CardTitle>
            <CardDescription>How guests order</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { type: "Dine-in", count: dineInOrders },
                { type: "Takeaway", count: takeawayOrders },
                { type: "Delivery", count: deliveryOrders },
              ].map((o) => {
                const total = dineInOrders + takeawayOrders + deliveryOrders;
                const pct = total ? Math.round((o.count / total) * 100) : 0;
                return (
                  <div key={o.type}>
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{o.type}</span>
                      <span className="text-xs text-muted-foreground">
                        {o.count} · {pct}%
                      </span>
                    </div>
                    <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-muted">
                      <div className="h-full bg-primary" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Quick stats</CardTitle>
            <CardDescription>Key insights</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { label: "Total orders", value: analytics.totalOrders.toString(), detail: "all time" },
              { label: "Peak hour", value: "12-1 PM", detail: "lunch rush" },
              { label: "Top category", value: analytics.categoryRevenue[0]?.name || "—", detail: "best seller" },
            ].map((h) => (
              <div key={h.label} className="flex items-center justify-between border-b pb-2 last:border-0">
                <div>
                  <p className="text-xs text-muted-foreground">{h.label}</p>
                  <p className="text-sm font-medium">{h.value}</p>
                </div>
                <Badge variant="muted">{h.detail}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
