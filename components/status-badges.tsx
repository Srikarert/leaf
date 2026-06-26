import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { OrderStatus, TableStatus, OrderType, StaffStatus, Delivery, PaymentMethod } from "@/lib/types";

const orderMap: Record<OrderStatus, { label: string; cls: string }> = {
  pending: { label: "Pending", cls: "bg-muted text-muted-foreground" },
  preparing: { label: "Preparing", cls: "bg-warning/10 text-warning" },
  ready: { label: "Ready", cls: "bg-info/10 text-info" },
  served: { label: "Served", cls: "bg-primary/10 text-primary" },
  completed: { label: "Completed", cls: "bg-success/10 text-success" },
  cancelled: { label: "Cancelled", cls: "bg-destructive/10 text-destructive" },
};

const tableMap: Record<TableStatus, { label: string; cls: string; dot: string }> = {
  vacant: { label: "Vacant", cls: "bg-muted text-muted-foreground", dot: "bg-muted-foreground" },
  occupied: { label: "Occupied", cls: "bg-info/10 text-info", dot: "bg-info" },
  reserved: { label: "Reserved", cls: "bg-primary/10 text-primary", dot: "bg-primary" },
  billing: { label: "Billing", cls: "bg-warning/10 text-warning", dot: "bg-warning" },
  cleaning: { label: "Cleaning", cls: "bg-muted text-muted-foreground", dot: "bg-muted-foreground" },
};

const typeMap: Record<OrderType, { label: string; cls: string }> = {
  "dine-in": { label: "Dine-in", cls: "bg-info/10 text-info" },
  takeaway: { label: "Takeaway", cls: "bg-primary/10 text-primary" },
  delivery: { label: "Delivery", cls: "bg-success/10 text-success" },
};

const staffMap: Record<StaffStatus, { label: string; cls: string; dot: string }> = {
  active: { label: "Active", cls: "bg-success/10 text-success", dot: "bg-success" },
  "on-break": { label: "On break", cls: "bg-warning/10 text-warning", dot: "bg-warning" },
  "off-duty": { label: "Off duty", cls: "bg-muted text-muted-foreground", dot: "bg-muted-foreground" },
};

const deliveryMap: Record<Delivery["status"], { label: string; cls: string }> = {
  pending: { label: "Awaiting driver", cls: "bg-muted text-muted-foreground" },
  "picked-up": { label: "Picked up", cls: "bg-info/10 text-info" },
  "in-transit": { label: "In transit", cls: "bg-primary/10 text-primary" },
  delivered: { label: "Delivered", cls: "bg-success/10 text-success" },
};

const paymentMap: Record<PaymentMethod, { label: string; cls: string }> = {
  cash: { label: "Cash", cls: "bg-muted text-muted-foreground" },
  card: { label: "Card", cls: "bg-info/10 text-info" },
  wallet: { label: "Wallet", cls: "bg-primary/10 text-primary" },
  online: { label: "Online", cls: "bg-success/10 text-success" },
};

export function OrderStatusBadge({ status, className }: { status: OrderStatus; className?: string }) {
  const s = orderMap[status];
  return <Badge className={cn(s.cls, "border-transparent", className)}>{s.label}</Badge>;
}

export function TableStatusBadge({ status, className }: { status: TableStatus; className?: string }) {
  const s = tableMap[status];
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-xs font-medium", s.cls.split(" ")[1], className)}>
      <span className={cn("h-1.5 w-1.5 rounded-full", s.dot)} />
      {s.label}
    </span>
  );
}

export function OrderTypeBadge({ type, className }: { type: OrderType; className?: string }) {
  const s = typeMap[type];
  return <Badge className={cn(s.cls, "border-transparent", className)}>{s.label}</Badge>;
}

export function StaffStatusBadge({ status, className }: { status: StaffStatus; className?: string }) {
  const s = staffMap[status];
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-xs font-medium", s.cls.split(" ")[1], className)}>
      <span className={cn("h-1.5 w-1.5 rounded-full", s.dot, status === "active" && "animate-pulse-dot")} />
      {s.label}
    </span>
  );
}

export function DeliveryStatusBadge({ status, className }: { status: Delivery["status"]; className?: string }) {
  const s = deliveryMap[status];
  return <Badge className={cn(s.cls, "border-transparent", className)}>{s.label}</Badge>;
}

export function PaymentBadge({ method, className }: { method: PaymentMethod; className?: string }) {
  const s = paymentMap[method];
  return <Badge variant="outline" className={cn(s.cls, "border-transparent", className)}>{s.label}</Badge>;
}
