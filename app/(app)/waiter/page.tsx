"use client";

import { useState } from "react";
import { Plus, Search, UtensilsCrossed, Users, DollarSign, ChefHat } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TableStatusBadge, OrderStatusBadge } from "@/components/status-badges";
import { useAppStore } from "@/lib/store";
import { formatCurrency, minutesBetween } from "@/lib/format";
import { cn } from "@/lib/utils";
import { OrderTakingDialog } from "@/components/order-taking-dialog";
import { BillingDialog } from "@/components/billing-dialog";
import type { TableStatus, Order } from "@/lib/types";

const statusFilters: { value: TableStatus | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "vacant", label: "Vacant" },
  { value: "occupied", label: "Occupied" },
  { value: "reserved", label: "Reserved" },
  { value: "cleaning", label: "Cleaning" },
];

export default function WaiterPage() {
  const tables = useAppStore((s) => s.tables);
  const orders = useAppStore((s) => s.orders);
  const setTableStatus = useAppStore((s) => s.setTableStatus);
  const [status, setStatus] = useState<TableStatus | "all">("all");
  const [query, setQuery] = useState("");
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [orderDialogOpen, setOrderDialogOpen] = useState(false);
  const [billingOrder, setBillingOrder] = useState<Order | null>(null);

  const filtered = tables.filter((t) => {
    if (status !== "all" && t.status !== status) return false;
    if (query) {
      return t.number.toLowerCase().includes(query.toLowerCase()) ||
        t.section.toLowerCase().includes(query.toLowerCase());
    }
    return true;
  });

  const stats = {
    tables: tables.length,
    seated: tables.filter((t) => t.status === "occupied").length,
    preparing: orders.filter(o => ["pending", "preparing"].includes(o.status)).length,
    ready: orders.filter(o => o.status === "ready").length,
  };

  const handleTakeOrder = (tableId: string) => {
    setSelectedTable(tableId);
    setOrderDialogOpen(true);
  };

  const handleBill = (order: Order) => {
    setBillingOrder(order);
  };

  const handleCollectOrder = (orderId: string) => {
    // Mark items as served
    const order = orders.find(o => o.id === orderId);
    if (order) {
      const updatedItems = order.items.map(item =>
        item.status === "ready" ? { ...item, status: "served" } : item
      );
      // In a real app, we'd update the store and firebase here
    }
  };

  return (
    <>
      <div className="flex flex-col gap-1 pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
            <UtensilsCrossed className="h-6 w-6 text-primary" />
            Floor & Orders
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage tables and orders
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Find table..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-40 pl-9"
            />
          </div>
        </div>
      </div>

      <div className="grid gap-3 mb-6 sm:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1 text-xs text-muted-foreground">
              <UtensilsCrossed className="h-3.5 w-3.5" />
              Total Tables
            </div>
            <p className="text-2xl font-semibold">{stats.tables}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1 text-xs text-muted-foreground">
              <Users className="h-3.5 w-3.5" />
              Occupied
            </div>
            <p className="text-2xl font-semibold">{stats.seated}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1 text-xs text-muted-foreground">
              <ChefHat className="h-3.5 w-3.5" />
              In Kitchen
            </div>
            <p className="text-2xl font-semibold text-orange-500">{stats.preparing}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1 text-xs text-muted-foreground">
              <UtensilsCrossed className="h-3.5 w-3.5" />
              Ready to Serve
            </div>
            <p className="text-2xl font-semibold text-green-500">{stats.ready}</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={status} onValueChange={(v) => setStatus(v as TableStatus | "all")} className="mb-4">
        <TabsList>
          {statusFilters.map((s) => (
            <TabsTrigger key={s.value} value={s.value}>
              {s.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filtered.map((table) => {
          const order = orders.find((o) => o.id === table.orderId);
          const mins = table.occupiedSince ? minutesBetween(table.occupiedSince, new Date()) : null;
          const hasReadyItems = order?.items.some(item => item.status === "ready");
          return (
            <Card
              key={table.id}
              className={cn(
                "overflow-hidden transition-all hover:border-primary/40",
                table.status === "occupied" && "border-info/40",
                table.status === "reserved" && "border-primary/40"
              )}
            >
              <CardHeader
                className={cn(
                  "pb-3",
                  table.status === "occupied" && "bg-info/5",
                  table.status === "reserved" && "bg-primary/5"
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-base font-semibold">Table {table.number}</span>
                    <span className="text-[10px] text-muted-foreground">{table.section}</span>
                  </div>
                  <TableStatusBadge status={table.status} />
                </div>
              </CardHeader>
              <CardContent className="p-3">
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                  <span className="flex items-center gap-1">
                    <Users className="h-3 w-3" /> {table.capacity} guests
                  </span>
                  {mins !== null && <span className="font-mono">{mins} min</span>}
                </div>

                {order && (
                  <div className="mb-3 space-y-1.5 rounded-md border bg-card p-2">
                    <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                      <span>Order #{order.number}</span>
                      <span className="font-mono">{formatCurrency(order.total)}</span>
                      <OrderStatusBadge status={order.status} />
                    </div>
                    <ul className="space-y-0.5 text-xs">
                      {order.items.slice(0, 3).map((item) => (
                        <li key={item.id} className="flex items-center justify-between">
                          <span className="truncate">
                            {item.quantity}× {item.name}
                          </span>
                          <OrderStatusBadge status={item.status} className="h-4 px-1 text-[9px]" />
                        </li>
                      ))}
                      {order.items.length > 3 && (
                        <li className="text-[10px] text-muted-foreground">
                          +{order.items.length - 3} more
                        </li>
                      )}
                    </ul>
                  </div>
                )}

                {table.status === "reserved" && table.reservedFor && (
                  <div className="mb-3 rounded-md border border-primary/20 bg-primary/5 p-2 text-xs">
                    <p className="font-medium text-primary">{table.reservedFor}</p>
                    {table.reservedAt && (
                      <p className="text-muted-foreground">
                        {new Date(table.reservedAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    )}
                  </div>
                )}

                <div className="flex gap-1.5">
                  {table.status === "vacant" && (
                    <Button size="sm" className="flex-1" onClick={() => handleTakeOrder(table.id)}>
                      <Plus className="h-3.5 w-3.5 mr-1" />
                      Take Order
                    </Button>
                  )}
                  {table.status === "occupied" && (
                    <>
                      <Button size="sm" variant="outline" className="flex-1" onClick={() => handleTakeOrder(table.id)}>
                        <Plus className="h-3.5 w-3.5 mr-1" />
                        Add Items
                      </Button>
                      {hasReadyItems && (
                        <Button size="sm" variant="default" className="flex-1 bg-green-600 hover:bg-green-700">
                          <ChefHat className="h-3.5 w-3.5 mr-1" />
                          Collect
                        </Button>
                      )}
                      {order && (
                        <Button size="sm" className="flex-1" onClick={() => handleBill(order)}>
                          <DollarSign className="h-3.5 w-3.5 mr-1" />
                          Bill
                        </Button>
                      )}
                    </>
                  )}
                  {table.status === "reserved" && (
                    <>
                      <Button size="sm" className="flex-1" onClick={() => setTableStatus(table.id, "occupied")}>
                        <Users className="h-3.5 w-3.5 mr-1" />
                        Seat Guests
                      </Button>
                    </>
                  )}
                  {table.status === "cleaning" && (
                    <Button size="sm" className="flex-1" onClick={() => setTableStatus(table.id, "vacant")}>
                      Done
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {selectedTable && (
        <OrderTakingDialog
          open={orderDialogOpen}
          onOpenChange={setOrderDialogOpen}
          tableId={selectedTable}
        />
      )}

      {billingOrder && (
        <BillingDialog
          open={!!billingOrder}
          onOpenChange={(open) => !open && setBillingOrder(null)}
          order={billingOrder}
        />
      )}
    </>
  );
}
