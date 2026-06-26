"use client";

import { useState } from "react";
import { AlertTriangle, Filter, Package, Plus, Search, ShoppingCart, Truck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAppStore } from "@/lib/store";
import { formatCurrency, timeAgo } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Ingredient } from "@/lib/types";
import { InventoryItemDialog } from "@/components/inventory-item-dialog";

const CATEGORIES = [
  { value: "all", label: "All" },
  { value: "produce", label: "Produce" },
  { value: "meat", label: "Meat & Seafood" },
  { value: "dairy", label: "Dairy" },
  { value: "grains", label: "Grains" },
  { value: "spices", label: "Spices" },
  { value: "beverages", label: "Beverages" },
  { value: "other", label: "Other" },
];

export default function InventoryPage() {
  const ingredients = useAppStore((s) => s.ingredients);
  const reorder = useAppStore((s) => s.reorderIngredient);
  const [tab, setTab] = useState("all");
  const [query, setQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  const filtered = ingredients.filter((i) => {
    if (tab !== "all" && i.category !== tab) return false;
    if (query && !i.name.toLowerCase().includes(query.toLowerCase())) return false;
    return true;
  });

  const lowStock = ingredients.filter((i) => i.stock <= i.reorderLevel);
  const totalValue = ingredients.reduce((s, i) => s + i.stock * i.costPerUnit, 0);

  return (
    <>
      <div className="flex flex-col gap-1 pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Inventory</h1>
          <p className="text-sm text-muted-foreground">
            {ingredients.length} items · {formatCurrency(totalValue)} in stock
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" /> Add item
          </Button>
          <Button>
            <ShoppingCart className="h-4 w-4 mr-2" /> Create PO
          </Button>
        </div>
      </div>

      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Total items</p>
            <p className="text-2xl font-semibold">{ingredients.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Low stock alerts</p>
            <p className="text-2xl font-semibold text-destructive">{lowStock.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Stock value</p>
            <p className="text-2xl font-semibold">{formatCurrency(totalValue)}</p>
          </CardContent>
        </Card>
      </div>

      {lowStock.length > 0 && (
        <Card className="mb-6 border-destructive/30 bg-destructive/5">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              <CardTitle className="text-sm">Low stock — reorder needed</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {lowStock.map((i) => (
                <div key={i.id} className="flex items-center justify-between rounded-md border bg-card p-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{i.name}</p>
                    <p className="font-mono text-xs text-destructive">
                      {i.stock} {i.unit} · par {i.par} {i.unit}
                    </p>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => reorder(i.id)}>
                    <Truck className="h-3.5 w-3.5 mr-1" /> Reorder
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search ingredients..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="flex-wrap">
            {CATEGORIES.map((c) => (
              <TabsTrigger key={c.value} value={c.value}>
                {c.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="divide-y">
            {filtered.map((i) => {
              const pct = Math.min((i.stock / i.par) * 100, 100);
              const low = i.stock <= i.reorderLevel;
              return (
                <div key={i.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
                  <div className="flex items-center gap-3 sm:w-72">
                    <div className="flex h-9 w-9 items-center justify-center rounded-md bg-muted">
                      <Package className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{i.name}</p>
                      <p className="text-xs text-muted-foreground">{i.supplier}</p>
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="mb-1 flex items-center justify-between text-xs">
                      <span className="font-mono">
                        <span className={cn("font-semibold", low ? "text-destructive" : "text-foreground")}>
                          {i.stock} {i.unit}
                        </span>
                        <span className="text-muted-foreground"> / {i.par} {i.unit}</span>
                      </span>
                      <span className="text-muted-foreground">
                        {formatCurrency(i.costPerUnit)} / {i.unit}
                      </span>
                    </div>
                    <Progress
                      value={pct}
                      className="h-1.5"
                      indicatorClassName={low ? "bg-destructive" : pct < 50 ? "bg-warning" : "bg-success"}
                    />
                  </div>
                  <div className="flex items-center gap-2 sm:w-44 sm:justify-end">
                    <Badge variant="muted" className="text-[10px] capitalize">
                      {i.category}
                    </Badge>
                    {low && <Badge variant="destructive">Low</Badge>}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <InventoryItemDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </>
  );
}
