"use client";

import { useState } from "react";
import { Clock, DollarSign, MoreHorizontal, Plus, Users, UtensilsCrossed } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TableStatusBadge } from "@/components/status-badges";
import { useAppStore } from "@/lib/store";
import { formatCurrency, minutesBetween } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { TableStatus } from "@/lib/types";

const sections = ["All", "Window", "Main", "Patio", "Private", "Bar"] as const;
type Section = (typeof sections)[number];

export default function TablesPage() {
  const tables = useAppStore((s) => s.tables);
  const orders = useAppStore((s) => s.orders);
  const setTableStatus = useAppStore((s) => s.setTableStatus);
  const [section, setSection] = useState<Section>("All");
  const [selected, setSelected] = useState<string | null>(null);

  const filtered = tables.filter((t) => (section === "All" ? true : t.section === section));

  const counts: Record<TableStatus, number> = {
    vacant: 0, occupied: 0, reserved: 0, billing: 0, cleaning: 0,
  };
  for (const t of tables) counts[t.status]++;

  const selectedTable = tables.find((t) => t.id === selected);
  const selectedOrder = selectedTable?.orderId ? orders.find((o) => o.id === selectedTable.orderId) : null;

  return (
    <>
      <div className="flex flex-col gap-1 pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Floor plan</h1>
          <p className="text-sm text-muted-foreground">
            {counts.occupied} occupied · {counts.reserved} reserved · {counts.vacant} vacant
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Plus className="h-4 w-4" /> Add table
          </Button>
          <Button>New reservation</Button>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <Tabs value={section} onValueChange={(v) => setSection(v as Section)}>
          <TabsList>
            {sections.map((s) => (
              <TabsTrigger key={s} value={s}>
                {s}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <div className="ml-auto flex flex-wrap items-center gap-2 text-xs">
          {(["vacant", "occupied", "reserved", "billing", "cleaning"] as TableStatus[]).map((s) => (
            <TableStatusBadge key={s} status={s} />
          ))}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {filtered.map((t) => {
          const isSelected = t.id === selected;
          const mins = t.occupiedSince ? minutesBetween(t.occupiedSince, new Date()) : null;
          const styleMap: Record<TableStatus, string> = {
            vacant: "border-border bg-card hover:border-foreground/30",
            occupied: "border-info/50 bg-info/5 hover:border-info",
            reserved: "border-primary/50 bg-primary/5 hover:border-primary",
            billing: "border-warning/50 bg-warning/5 hover:border-warning",
            cleaning: "border-muted-foreground/30 bg-muted/40",
          };
          return (
            <button
              key={t.id}
              onClick={() => setSelected(t.id)}
              className={cn(
                "group relative aspect-square rounded-lg border-2 p-3 text-left transition-all",
                styleMap[t.status],
                isSelected && "ring-2 ring-primary ring-offset-2 ring-offset-background"
              )}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-mono text-sm font-semibold">{t.number}</p>
                  <p className="text-[10px] text-muted-foreground">{t.section}</p>
                </div>
                <TableStatusBadge status={t.status} />
              </div>
              <div className="absolute bottom-3 left-3 right-3 space-y-1">
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Users className="h-3 w-3" /> {t.capacity}
                </div>
                {t.status === "occupied" && mins !== null && (
                  <div className="flex items-center gap-1 text-xs font-medium text-info">
                    <Clock className="h-3 w-3" /> {mins}m
                  </div>
                )}
                {t.status === "reserved" && t.reservedFor && (
                  <p className="truncate text-[10px] font-medium text-primary">{t.reservedFor}</p>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {selectedTable && (
        <Card className="mt-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">
                Table {selectedTable.number} · {selectedTable.section}
              </CardTitle>
              <Button variant="ghost" size="icon-sm" onClick={() => setSelected(null)}>
                ×
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
              <div>
                <p className="text-xs text-muted-foreground">Status</p>
                <TableStatusBadge status={selectedTable.status} className="mt-1" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Capacity</p>
                <p className="mt-1 font-medium">{selectedTable.capacity} guests</p>
              </div>
              {selectedTable.occupiedSince && (
                <div>
                  <p className="text-xs text-muted-foreground">Occupied for</p>
                  <p className="mt-1 font-medium">
                    {minutesBetween(selectedTable.occupiedSince, new Date())}m
                  </p>
                </div>
              )}
              {selectedOrder && (
                <div>
                  <p className="text-xs text-muted-foreground">Order total</p>
                  <p className="mt-1 font-mono font-medium">{formatCurrency(selectedOrder.total)}</p>
                </div>
              )}
            </div>

            {selectedOrder && (
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Current order #{selectedOrder.number}
                </p>
                <div className="space-y-1.5">
                  {selectedOrder.items.map((i) => (
                    <div key={i.id} className="flex justify-between text-sm">
                      <span>
                        {i.quantity}× {i.name}
                      </span>
                      <span className="font-mono text-muted-foreground">
                        {formatCurrency(i.price * i.quantity)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              {selectedTable.status === "occupied" && (
                <Button onClick={() => setTableStatus(selectedTable.id, "billing")}>
                  <DollarSign className="h-4 w-4" /> Send to bill
                </Button>
              )}
              {selectedTable.status === "billing" && (
                <Button onClick={() => setTableStatus(selectedTable.id, "cleaning")}>
                  Close bill
                </Button>
              )}
              {selectedTable.status === "cleaning" && (
                <Button onClick={() => setTableStatus(selectedTable.id, "vacant")}>
                  Mark ready
                </Button>
              )}
              {selectedTable.status === "vacant" && (
                <Button>
                  <UtensilsCrossed className="h-4 w-4" /> Seat guests
                </Button>
              )}
              <Button variant="outline">
                <MoreHorizontal className="h-4 w-4" /> More
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
}
