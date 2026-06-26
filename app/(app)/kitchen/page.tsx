"use client";

import { useEffect, useState } from "react";
import { Check, ChefHat, Clock, Flame, Timer, UtensilsCrossed } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAppStore } from "@/lib/store";
import { OrderStatusBadge, OrderTypeBadge } from "@/components/status-badges";
import { cn } from "@/lib/utils";
import { minutesBetween } from "@/lib/format";

const STATIONS = ["All", "Grill", "Pasta", "Pizza", "Cold", "Pastry"] as const;
type Station = (typeof STATIONS)[number];

const stationMap: Record<string, Station> = {
  "Truffle Burrata": "Cold",
  "Tuna Tartare": "Cold",
  "Crispy Calamari": "Cold",
  "Wagyu Sliders": "Grill",
  "Pan-Seared Salmon": "Grill",
  "Filet Mignon": "Grill",
  "Roasted Chicken": "Grill",
  "Lamb Shank": "Grill",
  "Mushroom Risotto": "Pasta",
  "Spaghetti Carbonara": "Pasta",
  "Margherita Pizza": "Pizza",
  "Diavola Pizza": "Pizza",
  "Truffle Pizza": "Pizza",
  "Caesar Salad": "Cold",
  "Tiramisu": "Pastry",
  "Chocolate Lava Cake": "Pastry",
  "Espresso Martini": "Cold",
  "House Negroni": "Cold",
  "Sparkling Water": "Cold",
  "Cacio e Pepe": "Pasta",
};

export default function KitchenPage() {
  const orders = useAppStore((s) => s.orders);
  const advanceItem = useAppStore((s) => s.advanceOrderItem);
  const setOrderStatus = useAppStore((s) => s.setOrderStatus);
  const [station, setStation] = useState<Station>("All");
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const activeOrders = orders
    .filter((o) => o.status === "pending" || o.status === "preparing")
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  const filtered = activeOrders.filter((o) => {
    if (station === "All") return true;
    return o.items.some((i) => stationMap[i.name] === station);
  });

  return (
    <>
      <div className="flex flex-col gap-1 pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
            <ChefHat className="h-6 w-6 text-primary" />
            Kitchen display
          </h1>
          <p className="text-sm text-muted-foreground">
            {filtered.length} active ticket{filtered.length === 1 ? "" : "s"} · Tap to advance
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {STATIONS.map((s) => (
            <Button
              key={s}
              size="sm"
              variant={station === s ? "default" : "outline"}
              onClick={() => setStation(s)}
            >
              {s}
            </Button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-20 text-center">
            <UtensilsCrossed className="h-10 w-10 text-muted-foreground/40" />
            <p className="mt-3 text-sm font-medium">All caught up</p>
            <p className="mt-1 text-xs text-muted-foreground">No active tickets. Take a breath.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((o) => {
            const mins = Math.max(0, minutesBetween(o.createdAt, now));
            const isOverdue = mins > 15;
            return (
              <Card
                key={o.id}
                className={cn(
                  "transition-all",
                  isOverdue && "border-destructive/50 bg-destructive/5",
                  o.status === "preparing" && "border-warning/50",
                  o.status === "pending" && "border-info/50"
                )}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-base font-semibold">#{o.number}</span>
                      <OrderTypeBadge type={o.type} />
                    </div>
                    <Badge
                      variant={isOverdue ? "destructive" : mins > 10 ? "warning" : "muted"}
                      className="gap-1"
                    >
                      <Timer className="h-3 w-3" /> {mins}m
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  {o.items
                    .filter((it) => (station === "All" ? true : stationMap[it.name] === station))
                    .map((it) => (
                      <button
                        key={it.id}
                        onClick={() => advanceItem(o.id, it.id)}
                        className={cn(
                          "flex w-full items-center justify-between gap-2 rounded-md border bg-card p-2.5 text-left text-sm transition-colors",
                          it.status === "preparing" && "border-warning/40 bg-warning/5",
                          it.status === "ready" && "border-success/40 bg-success/5 line-through opacity-60",
                          it.status === "served" && "opacity-40"
                        )}
                      >
                        <span className="flex items-center gap-2">
                          <span className="font-mono font-semibold">{it.quantity}×</span>
                          <span className="font-medium">{it.name}</span>
                        </span>
                        <OrderStatusBadge status={it.status} />
                      </button>
                    ))}
                  {o.status === "pending" && (
                    <Button
                      className="mt-2 w-full"
                      size="sm"
                      onClick={() => setOrderStatus(o.id, "preparing")}
                    >
                      <Flame className="h-3.5 w-3.5" /> Start cooking
                    </Button>
                  )}
                  {o.status === "preparing" && o.items.every((i) => i.status === "ready" || i.status === "served") && (
                    <Button
                      className="mt-2 w-full"
                      size="sm"
                      onClick={() => setOrderStatus(o.id, "ready")}
                    >
                      <Check className="h-3.5 w-3.5" /> Mark all ready
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </>
  );
}
