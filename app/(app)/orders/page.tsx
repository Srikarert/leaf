"use client";

import { useMemo, useState } from "react";
import {
  Check,
  ChefHat,
  ChevronRight,
  Clock,
  CreditCard,
  Filter,
  Plus,
  Receipt,
  Search,
  UtensilsCrossed,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { PageHeader } from "@/components/page-header";
import { OrderStatusBadge, OrderTypeBadge, PaymentBadge } from "@/components/status-badges";
import { useAppStore } from "@/lib/store";
import { formatCurrency, timeAgo } from "@/lib/format";
import type { Order, OrderStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

const TABS: { value: OrderStatus | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "preparing", label: "Preparing" },
  { value: "ready", label: "Ready" },
  { value: "served", label: "Served" },
  { value: "completed", label: "Completed" },
];

export default function OrdersPage() {
  const orders = useAppStore((s) => s.orders);
  const tables = useAppStore((s) => s.tables);
  const setOrderStatus = useAppStore((s) => s.setOrderStatus);
  const [tab, setTab] = useState<OrderStatus | "all">("all");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Order | null>(null);

  const filtered = useMemo(() => {
    return orders
      .filter((o) => (tab === "all" ? true : o.status === tab))
      .filter((o) => {
        if (!query) return true;
        const q = query.toLowerCase();
        return (
          o.number.toString().includes(q) ||
          o.customerName?.toLowerCase().includes(q) ||
          o.items.some((i) => i.name.toLowerCase().includes(q))
        );
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [orders, tab, query]);

  const counts = useMemo(() => {
    const m: Record<string, number> = { all: orders.length };
    for (const o of orders) m[o.status] = (m[o.status] || 0) + 1;
    return m;
  }, [orders]);

  const advance = (o: Order) => {
    const flow: OrderStatus[] = ["pending", "preparing", "ready", "served", "completed"];
    const idx = flow.indexOf(o.status);
    if (idx < 0 || idx === flow.length - 1) return;
    setOrderStatus(o.id, flow[idx + 1]);
    if (selected?.id === o.id) setSelected({ ...o, status: flow[idx + 1] });
  };

  return (
    <>
      <PageHeader
        title="Live orders"
        description="Manage every order from kitchen to table."
        actions={
          <Button>
            <Plus className="h-4 w-4" /> New order
          </Button>
        }
      />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by order #, customer, or item..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4" /> Filters
          </Button>
        </div>
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as OrderStatus | "all")}>
        <TabsList>
          {TABS.map((t) => (
            <TabsTrigger key={t.value} value={t.value} className="gap-1.5">
              {t.label}
              <Badge variant="muted" className="h-4 px-1.5 text-[10px]">
                {counts[t.value] || 0}
              </Badge>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="mt-6 grid gap-3">
        {filtered.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <Receipt className="h-10 w-10 text-muted-foreground/40" />
              <p className="mt-3 text-sm font-medium">No orders match your filter</p>
              <p className="mt-1 text-xs text-muted-foreground">Try clearing filters or search.</p>
            </CardContent>
          </Card>
        ) : (
          filtered.map((o) => {
            const table = tables.find((t) => t.id === o.tableId);
            const isActive = ["pending", "preparing", "ready"].includes(o.status);
            return (
              <Card
                key={o.id}
                className={cn(
                  "cursor-pointer transition-all hover:border-primary/40",
                  isActive && "border-l-4 border-l-primary"
                )}
                onClick={() => setSelected(o)}
              >
                <CardContent className="p-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex flex-col items-center justify-center rounded-md bg-muted px-3 py-1.5 text-center">
                      <span className="text-[10px] uppercase text-muted-foreground">Order</span>
                      <span className="font-mono text-base font-semibold">#{o.number}</span>
                    </div>
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <OrderTypeBadge type={o.type} />
                        <OrderStatusBadge status={o.status} />
                        {o.paymentMethod && <PaymentBadge method={o.paymentMethod} />}
                        {table && (
                          <Badge variant="outline" className="gap-1">
                            <UtensilsCrossed className="h-3 w-3" /> Table {table.number}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm">
                        {o.items.map((i) => `${i.quantity}× ${i.name}`).join(", ")}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {o.customerName && <span>{o.customerName} · </span>}
                        <span>{timeAgo(o.createdAt)}</span>
                        <span> · </span>
                        <span className="font-mono">{formatCurrency(o.total)}</span>
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      {isActive && (
                        <Button size="sm" onClick={(e) => { e.stopPropagation(); advance(o); }}>
                          {o.status === "pending" && <>Start <ChefHat className="h-3.5 w-3.5" /></>}
                          {o.status === "preparing" && <>Ready <Check className="h-3.5 w-3.5" /></>}
                          {o.status === "ready" && <>Serve <ChevronRight className="h-3.5 w-3.5" /></>}
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-w-2xl">
          {selected && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-lg font-semibold">#{selected.number}</span>
                  <OrderStatusBadge status={selected.status} />
                  <OrderTypeBadge type={selected.type} />
                </div>
                <DialogTitle>Order details</DialogTitle>
                <DialogDescription>
                  Placed {timeAgo(selected.createdAt)}
                  {selected.customerName && <> · {selected.customerName}</>}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div>
                  <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Items</h4>
                  <div className="space-y-2">
                    {selected.items.map((i) => (
                      <div key={i.id} className="flex items-center justify-between rounded-md border bg-card p-3">
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-sm text-muted-foreground">{i.quantity}×</span>
                          <div>
                            <p className="text-sm font-medium">{i.name}</p>
                            {i.notes && <p className="text-xs text-muted-foreground">{i.notes}</p>}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <OrderStatusBadge status={i.status} />
                          <span className="font-mono text-sm tabular-nums">{formatCurrency(i.price * i.quantity)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                <div className="space-y-1.5 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-mono">{formatCurrency(selected.subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tax</span>
                    <span className="font-mono">{formatCurrency(selected.tax)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tip</span>
                    <span className="font-mono">{formatCurrency(selected.tip)}</span>
                  </div>
                  <div className="flex justify-between pt-1 text-base font-semibold">
                    <span>Total</span>
                    <span className="font-mono">{formatCurrency(selected.total)}</span>
                  </div>
                </div>

                {selected.deliveryAddress && (
                  <>
                    <Separator />
                    <div>
                      <h4 className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Delivery address
                      </h4>
                      <p className="text-sm">{selected.deliveryAddress}</p>
                    </div>
                  </>
                )}
              </div>

              <DialogFooter className="gap-2">
                {selected.status !== "completed" && selected.status !== "cancelled" && (
                  <Button onClick={() => advance(selected)}>
                    Advance status <ChevronRight className="h-3.5 w-3.5" />
                  </Button>
                )}
                <Button variant="outline">
                  <CreditCard className="h-3.5 w-3.5" /> Print receipt
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
