"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatCurrency } from "@/lib/format";
import { categoryRevenue, revenueByDay, revenueByHour } from "@/lib/mock-data";

const tooltipStyle = {
  backgroundColor: "hsl(var(--popover))",
  border: "1px solid hsl(var(--border))",
  borderRadius: "var(--radius)",
  fontSize: "12px",
  color: "hsl(var(--popover-foreground))",
  padding: "8px 12px",
  boxShadow: "0 4px 12px rgb(0 0 0 / 0.1)",
};

export function RevenueAreaChart() {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart data={revenueByDay} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
        <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
        <YAxis
          stroke="hsl(var(--muted-foreground))"
          fontSize={11}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
        />
        <Tooltip
          contentStyle={tooltipStyle}
          formatter={(value: number) => [formatCurrency(value), "Revenue"]}
        />
        <Area
          type="monotone"
          dataKey="revenue"
          stroke="hsl(var(--primary))"
          strokeWidth={2}
          fill="url(#rev)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function HourlyBarChart() {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={revenueByHour} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
        <XAxis dataKey="hour" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
        <YAxis
          stroke="hsl(var(--muted-foreground))"
          fontSize={11}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v) => `$${v}`}
        />
        <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => formatCurrency(v)} />
        <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function CategoryDonut() {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => formatCurrency(v)} />
        <Pie
          data={categoryRevenue}
          dataKey="value"
          nameKey="name"
          innerRadius={55}
          outerRadius={85}
          paddingAngle={2}
          strokeWidth={0}
        >
          {categoryRevenue.map((entry) => (
            <Cell key={entry.name} fill={entry.color} />
          ))}
        </Pie>
      </PieChart>
    </ResponsiveContainer>
  );
}
