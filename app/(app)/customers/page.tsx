"use client";

import { useState } from "react";
import { Award, Mail, Phone, Search, Star, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useAppStore } from "@/lib/store";
import { formatCurrency, timeAgo } from "@/lib/format";
import { menuItems } from "@/lib/mock-data";

export default function CustomersPage() {
  const customers = useAppStore((s) => s.customers);
  const [query, setQuery] = useState("");

  const filtered = customers
    .filter(
      (c) =>
        !query ||
        c.name.toLowerCase().includes(query.toLowerCase()) ||
        c.email.toLowerCase().includes(query.toLowerCase())
    )
    .sort((a, b) => b.totalSpent - a.totalSpent);

  const topSpender = customers.length > 0 ? customers[0] : null;
  const totalRevenue = customers.reduce((s, c) => s + c.totalSpent, 0);
  const repeatRate = customers.length > 0
    ? (customers.filter((c) => c.visits > 1).length / customers.length) * 100
    : 0;

  return (
    <>
      <div className="flex flex-col gap-1 pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Customers</h1>
          <p className="text-sm text-muted-foreground">
            {customers.length} customers · {formatCurrency(totalRevenue)} lifetime value
          </p>
        </div>
        <Button>
          <Mail className="h-4 w-4" /> Send campaign
        </Button>
      </div>

      <div className="mb-6 grid gap-3 sm:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Total customers</p>
            <p className="text-2xl font-semibold">{customers.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Lifetime revenue</p>
            <p className="text-2xl font-semibold">{formatCurrency(totalRevenue)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Repeat rate</p>
            <p className="text-2xl font-semibold">{repeatRate.toFixed(0)}%</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Top spender</p>
            <p className="truncate text-lg font-semibold">{topSpender ? topSpender.name : "-"}</p>
          </CardContent>
        </Card>
      </div>

      <div className="mb-4 relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search customers..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      <Card>
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Users className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold">No customers yet</h3>
              <p className="text-sm text-muted-foreground">Customers will appear here as they place orders</p>
            </div>
          ) : (
            <div className="divide-y">
              {filtered.map((c, i) => {
                const favs = c.favoriteItems.map((id) => menuItems.find((m) => m.id === id)?.name).filter(Boolean);
                const tier =
                  c.totalSpent > 2000 ? "VIP" : c.totalSpent > 1000 ? "Gold" : c.totalSpent > 500 ? "Silver" : "Standard";
                return (
                  <div key={c.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
                    <div className="flex items-center gap-3 sm:w-64">
                      <span className="w-5 text-xs font-mono text-muted-foreground">#{i + 1}</span>
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                        {c.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{c.name}</p>
                        <p className="truncate text-xs text-muted-foreground">{c.email}</p>
                      </div>
                    </div>
                    <div className="grid flex-1 grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-4 text-xs">
                      <div>
                        <p className="text-muted-foreground">Visits</p>
                        <p className="font-semibold">{c.visits}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Spent</p>
                        <p className="font-mono font-semibold">{formatCurrency(c.totalSpent)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Last visit</p>
                        <p className="font-medium">{timeAgo(c.lastVisit)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Tier</p>
                        <Badge
                          variant={
                            tier === "VIP" ? "default" : tier === "Gold" ? "warning" : tier === "Silver" ? "muted" : "outline"
                          }
                          className="text-[10px]"
                        >
                          {tier === "VIP" && <Award className="h-2.5 w-2.5" />}
                          {tier}
                        </Badge>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}
