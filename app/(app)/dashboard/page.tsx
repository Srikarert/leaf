"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ChefHat,
  CircleDollarSign,
  Clock,
  Flame,
  ShoppingBag,
  TrendingUp,
  Users,
  UtensilsCrossed,
  Wallet,
  TableProperties,
  ListOrdered,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { CategoryDonut, HourlyBarChart, RevenueAreaChart } from "@/components/charts";
import { OrderStatusBadge, OrderTypeBadge, TableStatusBadge, StaffStatusBadge } from "@/components/status-badges";
import { useAppStore } from "@/lib/store";
import { formatCurrency, formatPercent, timeAgo } from "@/lib/format";

export default function DashboardPage() {
  const orders = useAppStore((s) => s.orders);
  const tables = useAppStore((s) => s.tables);
  const staff = useAppStore((s) => s.staff);
  const ingredients = useAppStore((s) => s.ingredients);
  const activity = useAppStore((s) => s.activity);
  const analytics = useAppStore((s) => s.analytics);

  const [clock, setClock] = useState("");

  useEffect(() => {
    const tick = () =>
      setClock(
        new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })
      );
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const activeOrders = orders.filter((o) => o.status === "pending" || o.status === "preparing").length;
  const occupiedTables = tables.filter((t) => t.status === "occupied" || t.status === "billing").length;
  const activeStaffCount = staff.filter((s) => s.status === "active").length;
  const lowStock = ingredients.filter((i) => i.stock <= i.reorderLevel).length;
  const lowStockItems = ingredients.filter((i) => i.stock <= i.reorderLevel).slice(0, 4);
  const recentOrders = orders.slice(0, 6);

  return (
    <>
      <PageHeader
        title="Operations hub"
        description="Real-time overview of your restaurant. Welcome back."
        actions={
          <>
            <Badge variant="muted" className="gap-1.5 px-2.5 py-1">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-success" />
              </span>
              Service live · {clock}
            </Badge>
            <Button asChild>
              <Link href="/orders">
                View live orders <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </>
        }
      />

      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Button asChild variant="outline" className="h-auto flex-col gap-1.5 py-4 text-center">
          <Link href="/waiter">
            <UtensilsCrossed className="h-5 w-5" />
            <span className="text-xs font-medium">Waiter View</span>
          </Link>
        </Button>
        <Button asChild variant="outline" className="h-auto flex-col gap-1.5 py-4 text-center">
          <Link href="/kitchen">
            <ChefHat className="h-5 w-5" />
            <span className="text-xs font-medium">Kitchen</span>
          </Link>
        </Button>
        <Button asChild variant="outline" className="h-auto flex-col gap-1.5 py-4 text-center">
          <Link href="/orders">
            <ListOrdered className="h-5 w-5" />
            <span className="text-xs font-medium">Orders</span>
          </Link>
        </Button>
        <Button asChild variant="outline" className="h-auto flex-col gap-1.5 py-4 text-center">
          <Link href="/tables">
            <TableProperties className="h-5 w-5" />
            <span className="text-xs font-medium">Tables</span>
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Revenue today"
          value={formatCurrency(analytics.todayRevenue)}
          icon={CircleDollarSign}
          trend="flat"
          accent="primary"
        />
        <StatCard
          title="Active orders"
          value={String(activeOrders)}
          changeLabel="live"
          icon={ShoppingBag}
          trend="flat"
          accent="info"
        />
        <StatCard
          title="Tables occupied"
          value={`${occupiedTables}/${tables.length}`}
          changeLabel={`${tables.length ? Math.round((occupiedTables / tables.length) * 100) : 0}% capacity`}
          icon={UtensilsCrossed}
          trend="flat"
          accent="warning"
        />
        <StatCard
          title="Staff on shift"
          value={`${activeStaffCount}/${staff.length}`}
          icon={Users}
          trend="flat"
          accent="success"
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-base">Revenue this week</CardTitle>
                <CardDescription>Daily revenue across the last 7 days</CardDescription>
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
            <CardDescription>From current menu items</CardDescription>
          </CardHeader>
          <CardContent>
            <CategoryDonut data={analytics.categoryRevenue} />
            <div className="mt-4 space-y-2">
              {analytics.categoryRevenue.slice(0, 4).map((c) => (
                <div key={c.name} className="flex items-center gap-2 text-xs">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: c.color }} />
                  <span className="flex-1">{c.name}</span>
                  <span className="font-mono text-muted-foreground">{formatCurrency(c.value)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="text-base">Live orders</CardTitle>
              <CardDescription>Active across the restaurant</CardDescription>
            </div>
            <Button asChild variant="ghost" size="sm">
              <Link href="/orders">
                View all <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentOrders.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
                No orders yet
              </div>
            ) : (
              recentOrders.map((o) => {
                const table = tables.find((t) => t.id === o.tableId);
                return (
                  <Link
                    key={o.id}
                    href="/orders"
                    className="flex items-center gap-3 rounded-lg border bg-card p-3 transition-colors hover:bg-accent/50"
                  >
                    <div className="flex flex-col items-center justify-center rounded-md bg-muted px-2 py-1 text-center">
                      <span className="font-mono text-[10px] text-muted-foreground">#</span>
                      <span className="font-mono text-sm font-semibold">{o.number}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate text-sm font-medium">
                          {o.items.map((i) => `${i.quantity}× ${i.name}`).join(", ")}
                        </p>
                      </div>
                      <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                        <OrderTypeBadge type={o.type} />
                        {table && <span>Table {table.number}</span>}
                        <span>·</span>
                        <span>{formatCurrency(o.total)}</span>
                        <span>·</span>
                        <span>{timeAgo(o.createdAt)}</span>
                      </div>
                    </div>
                    <OrderStatusBadge status={o.status} />
                  </Link>
                );
              })
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Live activity</CardTitle>
            <CardDescription>What just happened</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative space-y-4 pl-4">
              <span className="absolute left-[5px] top-1 bottom-1 w-px bg-border" />
              {activity.slice(0, 7).map((a) => (
                <div key={a.id} className="relative">
                  <span
                    className={`absolute -left-[14px] top-1.5 h-2.5 w-2.5 rounded-full border-2 border-background ${
                      a.type === "order"
                        ? "bg-primary"
                        : a.type === "table"
                          ? "bg-info"
                          : a.type === "inventory"
                            ? "bg-warning"
                            : a.type === "staff"
                              ? "bg-success"
                              : "bg-muted-foreground"
                    }`}
                  />
                  <p className="text-xs">{a.message}</p>
                  <p className="mt-0.5 text-[10px] text-muted-foreground">{timeAgo(a.timestamp)}</p>
                </div>
              ))}
              {activity.length === 0 && (
                <div className="text-xs text-muted-foreground">No recent activity</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Floor at a glance</CardTitle>
            <CardDescription>Tables in service</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-2">
              {tables.slice(0, 8).map((t) => (
                <div
                  key={t.id}
                  className={`flex aspect-square flex-col items-center justify-center rounded-md border text-xs ${
                    t.status === "occupied"
                      ? "border-info/40 bg-info/5"
                      : t.status === "billing"
                        ? "border-warning/40 bg-warning/5"
                        : t.status === "reserved"
                          ? "border-primary/40 bg-primary/5"
                          : "border-border"
                  }`}
                >
                  <span className="font-mono font-semibold">{t.number}</span>
                  <TableStatusBadge status={t.status} />
                </div>
              ))}
            </div>
            <Button asChild variant="outline" className="mt-4 w-full">
              <Link href="/tables">
                Open floor plan <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Kitchen load</CardTitle>
            <CardDescription>Active tickets</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-end justify-between">
                <span className="text-3xl font-semibold">{activeOrders}</span>
                <span className="text-xs text-muted-foreground">tickets in queue</span>
              </div>
              <Progress value={Math.min((activeOrders / 12) * 100, 100)} className="mt-2" />
            </div>
            <Separator />
            <div className="grid grid-cols-3 gap-3 text-center">
              {[
                { label: "Pending", value: orders.filter(o => o.status === "pending").length, icon: Clock, color: "text-warning" },
                { label: "Preparing", value: orders.filter(o => o.status === "preparing").length, icon: Flame, color: "text-orange-500" },
                { label: "Ready", value: orders.filter(o => o.status === "ready").length, icon: TrendingUp, color: "text-success" },
              ].map((m) => (
                <div key={m.label}>
                  <m.icon className={`mx-auto h-4 w-4 ${m.color}`} />
                  <p className="mt-1 text-sm font-semibold">{m.value}</p>
                  <p className="text-[10px] text-muted-foreground">{m.label}</p>
                </div>
              ))}
            </div>
            <Button asChild variant="outline" className="w-full">
              <Link href="/kitchen">
                Open KDS <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Inventory alerts</CardTitle>
            <CardDescription>{lowStock} item{lowStock === 1 ? "" : "s"} at or below reorder level</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {lowStockItems.map((i) => {
              const pct = Math.min((i.stock / i.par) * 100, 100);
              const isLow = i.stock <= i.reorderLevel;
              return (
                <div key={i.id}>
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium">{i.name}</span>
                    <span className={`font-mono ${isLow ? "text-destructive" : "text-warning"}`}>
                      {i.stock.toFixed(i.stock < 10 ? 1 : 0)}
                      {i.unit} / {i.par}
                      {i.unit}
                    </span>
                  </div>
                  <Progress
                    value={pct}
                    className="mt-1.5 h-1"
                    indicatorClassName={isLow ? "bg-destructive" : "bg-warning"}
                  />
                </div>
              );
            })}
            {lowStock === 0 && (
              <div className="text-xs text-muted-foreground text-center py-4">All stock levels good</div>
            )}
            <Button asChild variant="outline" className="mt-2 w-full">
              <Link href="/inventory">
                Manage inventory <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Top-selling dishes today</CardTitle>
            <CardDescription>Best performers of the day</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.topItems.slice(0, 5).map((item, i) => (
                <div key={item.id} className="flex items-center gap-3">
                  <span className="w-5 text-sm font-semibold text-muted-foreground">#{i + 1}</span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{item.name}</span>
                      <span className="font-mono tabular-nums text-muted-foreground">
                        {item.soldToday} sold
                      </span>
                    </div>
                    <Progress
                      value={analytics.topItems[0] ? (item.soldToday / analytics.topItems[0].soldToday) * 100 : 0}
                      className="mt-1.5 h-1"
                    />
                  </div>
                </div>
              ))}
              {analytics.topItems.length === 0 && (
                <div className="text-xs text-muted-foreground text-center py-4">No items sold yet today</div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Team on shift</CardTitle>
            <CardDescription>
              {activeStaffCount} of {staff.length} active
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {staff.slice(0, 5).map((s) => (
              <div key={s.id} className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground">
                  {s.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{s.name}</p>
                  <p className="text-xs capitalize text-muted-foreground">{s.role} · {s.shift}</p>
                </div>
                <StaffStatusBadge status={s.status} />
              </div>
            ))}
            <Button asChild variant="outline" className="mt-2 w-full">
              <Link href="/staff">
                View all <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
