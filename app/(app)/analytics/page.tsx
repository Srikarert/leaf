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
  const orders = useAppStore((s) => s.orders);
  const menuItems = useAppStore((s) => s.menuItems);
  const [period, setPeriod] = useState("7");

  // Calculate total revenue from all orders
  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
  
  // Calculate top selling items
  const itemSales: Record<string, { name: string; sold: number; price: number }> = {};
  orders.forEach((order) => {
    order.items.forEach((item) => {
      if (!itemSales[item.id]) {
        const menuItem = menuItems.find((m) => m.id === item.id);
        itemSales[item.id] = {
          name: item.name,
          sold: 0,
          price: menuItem?.price || item.price,
        };
      }
      itemSales[item.id].sold += item.quantity;
    });
  });
  const topItems = Object.values(itemSales).sort((a, b) => b.sold - a.sold).slice(0, 5);

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
          title="Revenue"
          value={formatCurrency(totalRevenue)}
          change={0}
          changeLabel="vs. last period"
          icon={Wallet}
          trend="flat"
          accent="primary"
        />
        <StatCard
          title="Orders"
          value={String(orders.length)}
          change={0}
          changeLabel="vs. last period"
          icon={ShoppingBag}
          trend="flat"
          accent="info"
        />
        <StatCard
          title="Avg. ticket"
          value={orders.length > 0 ? formatCurrency(totalRevenue / orders.length) : formatCurrency(0)}
          change={0}
          changeLabel="vs. last period"
          icon={TrendingUp}
          trend="flat"
          accent="success"
        />
        <StatCard
          title="Labor cost %"
          value="-"
          change={0}
          changeLabel="vs. last period"
          icon={Users}
          trend="flat"
          accent="warning"
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">Revenue trend</CardTitle>
                <CardDescription>Daily revenue over the period</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <RevenueAreaChart />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Revenue by category</CardTitle>
            <CardDescription>Where the money comes from</CardDescription>
          </CardHeader>
          <CardContent>
            <CategoryDonut />
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
            <HourlyBarChart />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Top sellers</CardTitle>
            <CardDescription>Best performing dishes</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {topItems.length === 0 ? (
              <div className="text-center text-sm text-muted-foreground py-8">No sales yet</div>
            ) : (
              topItems.map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-[10px] font-bold">
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm font-medium">{item.name}</p>
                    <p className="text-xs text-muted-foreground">{item.sold} sold</p>
                  </div>
                  <p className="font-mono text-sm font-medium">{formatCurrency(item.price * item.sold)}</p>
                </div>
              ))
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
              {orders.length === 0 ? (
                <div className="text-center text-sm text-muted-foreground py-8">No orders yet</div>
              ) : (
                [
                  { type: "Dine-in", count: orders.filter((o) => o.type === "dine-in").length },
                  { type: "Takeaway", count: orders.filter((o) => o.type === "takeaway").length },
                  { type: "Delivery", count: orders.filter((o) => o.type === "delivery").length },
                ].map((o) => {
                  const pct = orders.length > 0 ? Math.round((o.count / orders.length) * 100) : 0;
                  return (
                    <div key={o.type}>
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">{o.type}</span>
                        <span className="text-xs text-muted-foreground">
                          {o.count} · {pct}%
                        </span>
                      </div>
                      <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-muted">
                        <div 
                          className={`h-full ${
                            o.type === "Dine-in" ? "bg-info" : 
                            o.type === "Takeaway" ? "bg-primary" : 
                            "bg-success"
                          }`} 
                          style={{ width: `${pct}%` }} 
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Performance highlights</CardTitle>
            <CardDescription>Key insights this period</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { label: "Highest revenue day", value: "-", detail: "-" },
              { label: "Peak hr", value: "-", detail: "-" },
              { label: "Best-selling item", value: topItems[0]?.name || "-", detail: `${topItems[0]?.sold || 0} sold` },
              { label: "Repeat customer rate", value: "-", detail: "-" },
              { label: "Avg. table time", value: "-", detail: "-" },
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
