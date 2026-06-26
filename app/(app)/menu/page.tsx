"use client";

import { useState } from "react";
import { Edit, MoreVertical, Plus, Search, Star, TrendingUp, UtensilsCrossed, Vegan } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAppStore } from "@/lib/store";
import { formatCurrency, formatPercent } from "@/lib/format";
import { cn } from "@/lib/utils";
import { MenuItemDialog } from "@/components/menu-item-dialog";

const SPICY_LABELS = ["", "Mild", "Medium", "Hot"];

export default function MenuPage() {
  const menuItems = useAppStore((s) => s.menuItems);
  const categories = useAppStore((s) => s.categories);
  const toggle = useAppStore((s) => s.toggleMenuItemAvailability);
  const [tab, setTab] = useState("all");
  const [query, setQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  const filtered = menuItems.filter((m) => {
    if (tab !== "all" && m.categoryId !== tab) return false;
    if (query && !m.name.toLowerCase().includes(query.toLowerCase())) return false;
    return true;
  });

  return (
    <>
      <div className="flex flex-col gap-1 pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Menu</h1>
          <p className="text-sm text-muted-foreground">
            {menuItems.length} items across {categories.length} categories
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" /> Add item
        </Button>
      </div>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search menu..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            {categories.map((c) => (
              <TabsTrigger key={c.id} value={c.id}>
                {c.name}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filtered.map((item) => {
          const cat = categories.find((c) => c.id === item.categoryId);
          const margin = ((item.price - item.cost) / item.price) * 100;
          return (
            <Card key={item.id} className={cn("overflow-hidden", !item.available && "opacity-60")}>
              <div className="relative h-32 bg-gradient-to-br from-primary/10 via-info/5 to-success/10">
                <div className="absolute inset-0 flex items-center justify-center">
                  <UtensilsCrossed className="h-10 w-10 text-muted-foreground/30" />
                </div>
                <div className="absolute right-2 top-2 flex flex-col gap-1">
                  {item.popular && (
                    <Badge variant="default" className="gap-1 text-[10px]">
                      <Star className="h-2.5 w-2.5 fill-current" /> Popular
                    </Badge>
                  )}
                  {item.vegetarian && (
                    <Badge variant="success" className="gap-1 text-[10px]">
                      <Vegan className="h-2.5 w-2.5" /> Veg
                    </Badge>
                  )}
                  {item.spicy > 0 && (
                    <Badge variant="warning" className="gap-1 text-[10px]">
                      🌶 {SPICY_LABELS[item.spicy]}
                    </Badge>
                  )}
                </div>
                {!item.available && (
                  <div className="absolute inset-0 flex items-center justify-center bg-background/60">
                    <Badge variant="destructive">Sold out</Badge>
                  </div>
                )}
              </div>
              <CardContent className="p-3">
                <div className="mb-1 flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-sm font-semibold">{item.name}</h3>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{cat?.name}</p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon-sm">
                        <MoreVertical className="h-3.5 w-3.5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setDialogOpen(true)}>
                        <Edit className="h-3.5 w-3.5 mr-2" /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem>Duplicate</DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <p className="line-clamp-2 text-xs text-muted-foreground">{item.description}</p>
                <div className="mt-3 flex items-center justify-between border-t pt-2">
                  <div>
                    <p className="text-base font-semibold">{formatCurrency(item.price)}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {formatPercent(margin)} margin
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="flex items-center gap-1 text-xs font-medium">
                      <TrendingUp className="h-3 w-3 text-success" /> {item.soldToday} today
                    </p>
                    <p className="text-[10px] text-muted-foreground">{item.prepTime}m prep</p>
                  </div>
                </div>
                <div className="mt-2 flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Available</span>
                  <Switch checked={item.available} onCheckedChange={() => toggle(item.id)} />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <MenuItemDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </>
  );
}
