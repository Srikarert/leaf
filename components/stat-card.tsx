"use client";

import { type LucideIcon, ArrowDown, ArrowUp, Minus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { formatPercent } from "@/lib/format";

interface StatCardProps {
  title: string;
  value: string;
  change?: number;
  changeLabel?: string;
  icon: LucideIcon;
  trend?: "up" | "down" | "flat";
  description?: string;
  accent?: "default" | "primary" | "success" | "warning" | "info";
}

export function StatCard({ title, value, change, changeLabel, icon: Icon, trend, description, accent = "default" }: StatCardProps) {
  const TrendIcon = trend === "up" ? ArrowUp : trend === "down" ? ArrowDown : Minus;
  const trendColor = trend === "up" ? "text-success" : trend === "down" ? "text-destructive" : "text-muted-foreground";

  const accentBg = {
    default: "bg-muted text-muted-foreground",
    primary: "bg-primary/10 text-primary",
    success: "bg-success/10 text-success",
    warning: "bg-warning/10 text-warning",
    info: "bg-info/10 text-info",
  }[accent];

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{title}</p>
            <p className="text-2xl font-semibold tracking-tight">{value}</p>
            {(change !== undefined || description) && (
              <div className="flex items-center gap-2 pt-1">
                {change !== undefined && (
                  <span className={cn("inline-flex items-center gap-0.5 text-xs font-medium", trendColor)}>
                    <TrendIcon className="h-3 w-3" />
                    {formatPercent(Math.abs(change))}
                  </span>
                )}
                {(changeLabel || description) && (
                  <span className="text-xs text-muted-foreground">{changeLabel ?? description}</span>
                )}
              </div>
            )}
          </div>
          <div className={cn("flex h-9 w-9 items-center justify-center rounded-md", accentBg)}>
            <Icon className="h-4 w-4" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function StatGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{children}</div>;
}
