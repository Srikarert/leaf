"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  CalendarDays,
  ChefHat,
  CreditCard,
  Home,
  LayoutDashboard,
  LogOut,
  Menu as MenuIcon,
  Settings,
  ShoppingBag,
  TableProperties,
  Truck,
  Users,
  UtensilsCrossed,
  Wallet,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/lib/store";
import { Badge } from "@/components/ui/badge";

const items = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, role: ["owner", "manager"] },
  { href: "/orders", label: "Live Orders", icon: ShoppingBag, role: ["owner", "manager", "waiter"] },
  { href: "/tables", label: "Floor Plan", icon: TableProperties, role: ["owner", "manager", "waiter"] },
  { href: "/kitchen", label: "Kitchen Display", icon: ChefHat, role: ["owner", "manager", "chef"] },
  { href: "/waiter", label: "Waiter View", icon: UtensilsCrossed, role: ["owner", "manager", "waiter"] },
  { href: "/delivery", label: "Delivery", icon: Truck, role: ["owner", "manager", "delivery"] },
  { href: "/menu", label: "Menu", icon: MenuIcon, role: ["owner", "manager", "chef"] },
  { href: "/inventory", label: "Inventory", icon: Wallet, role: ["owner", "manager", "chef"] },
  { href: "/staff", label: "Staff", icon: Users, role: ["owner", "manager"] },
  { href: "/reservations", label: "Reservations", icon: CalendarDays, role: ["owner", "manager", "host"] },
  { href: "/customers", label: "Customers", icon: Home, role: ["owner", "manager"] },
  { href: "/analytics", label: "Analytics", icon: BarChart3, role: ["owner", "manager"] },
];

const bottomItems = [
  { href: "/billing", label: "Billing", icon: CreditCard },
  { href: "/settings", label: "Settings", icon: Settings },
];

interface SidebarNavProps {
  pendingOrders?: number;
  variant?: "desktop" | "mobile";
}

export function SidebarNav({ pendingOrders = 0, variant = "desktop" }: SidebarNavProps) {
  const pathname = usePathname();
  const user = useAppStore((s) => s.user);
  const allowedRoles = (item: typeof items[number]) => item.role?.includes(user.role) ?? true;

  return (
    <aside className={variant === "mobile" ? "flex w-64 flex-col bg-sidebar text-sidebar-foreground" : "hidden w-60 shrink-0 flex-col border-r bg-sidebar text-sidebar-foreground md:flex"}>
      <div className="flex h-16 items-center gap-2 border-b border-sidebar-border px-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
          <UtensilsCrossed className="h-4 w-4" />
        </div>
        <div>
          <p className="text-sm font-semibold leading-none">Bellini</p>
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Restaurant OS</p>
        </div>
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto p-3 scrollbar-thin">
        <p className="px-2 pb-2 pt-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Operations
        </p>
        {items.filter(allowedRoles).map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-sm font-medium transition-colors",
                active
                  ? "bg-sidebar-accent text-foreground"
                  : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-foreground"
              )}
            >
              <item.icon className="h-4 w-4" />
              <span className="flex-1">{item.label}</span>
              {item.href === "/orders" && pendingOrders > 0 && (
                <Badge variant="default" className="h-5 px-1.5 text-[10px]">
                  {pendingOrders}
                </Badge>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-sidebar-border p-3">
        <p className="px-2 pb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Account
        </p>
        {bottomItems.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-sm font-medium transition-colors",
                active
                  ? "bg-sidebar-accent text-foreground"
                  : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-foreground"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
        <div className="mt-3 flex items-center gap-2 rounded-md border border-sidebar-border p-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground">
            {user.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-semibold">{user.name}</p>
            <p className="truncate text-[10px] capitalize text-muted-foreground">{user.role}</p>
          </div>
          <Link
            href="/login"
            className="text-muted-foreground hover:text-foreground"
            aria-label="Sign out"
          >
            <LogOut className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </aside>
  );
}
