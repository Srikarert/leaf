import type { MenuItem } from "./types";

export const revenueByDay = [
  { date: "Mon", revenue: 0, orders: 0, avgTicket: 0 },
  { date: "Tue", revenue: 0, orders: 0, avgTicket: 0 },
  { date: "Wed", revenue: 0, orders: 0, avgTicket: 0 },
  { date: "Thu", revenue: 0, orders: 0, avgTicket: 0 },
  { date: "Fri", revenue: 0, orders: 0, avgTicket: 0 },
  { date: "Sat", revenue: 0, orders: 0, avgTicket: 0 },
  { date: "Sun", revenue: 0, orders: 0, avgTicket: 0 },
];

export const revenueByHour = [
  { hour: "11", revenue: 0 },
  { hour: "12", revenue: 0 },
  { hour: "13", revenue: 0 },
  { hour: "14", revenue: 0 },
  { hour: "15", revenue: 0 },
  { hour: "16", revenue: 0 },
  { hour: "17", revenue: 0 },
  { hour: "18", revenue: 0 },
  { hour: "19", revenue: 0 },
  { hour: "20", revenue: 0 },
  { hour: "21", revenue: 0 },
  { hour: "22", revenue: 0 },
];

export const categoryRevenue = [
  { name: "Mains", value: 0, color: "hsl(16 90% 53%)" },
  { name: "Beverages", value: 0, color: "hsl(217 91% 60%)" },
];

export const topItems: MenuItem[] = [];
