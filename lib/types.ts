export type OrderStatus = "pending" | "preparing" | "ready" | "served" | "completed" | "cancelled";
export type OrderType = "dine-in" | "takeaway" | "delivery";
export type TableStatus = "vacant" | "occupied" | "reserved" | "billing" | "cleaning";
export type StaffRole = "owner" | "manager" | "chef" | "waiter" | "delivery" | "host";
export type StaffStatus = "active" | "on-break" | "off-duty";
export type PaymentMethod = "cash" | "card" | "wallet" | "online";
export type IngredientUnit = "kg" | "g" | "l" | "ml" | "pcs" | "pack";

export interface Category {
  id: string;
  name: string;
  description?: string;
  itemCount: number;
  active: boolean;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  categoryId: string;
  price: number;
  cost: number;
  image?: string;
  prepTime: number;
  available: boolean;
  vegetarian: boolean;
  spicy: 0 | 1 | 2 | 3;
  popular: boolean;
  soldToday: number;
  soldWeek: number;
  ingredients: { ingredientId: string; qty: number }[];
}

export interface OrderItem {
  id: string;
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  modifiers?: string[];
  notes?: string;
  status: OrderStatus;
}

export interface Order {
  id: string;
  number: number;
  type: OrderType;
  status: OrderStatus;
  tableId?: string;
  customerName?: string;
  customerPhone?: string;
  deliveryAddress?: string;
  serverId?: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  tip: number;
  total: number;
  paymentMethod?: PaymentMethod;
  createdAt: string;
  updatedAt: string;
  notes?: string;
}

export interface Table {
  id: string;
  number: string;
  capacity: number;
  status: TableStatus;
  section: string;
  orderId?: string;
  occupiedSince?: string;
  reservedFor?: string;
  reservedAt?: string;
}

export interface Ingredient {
  id: string;
  name: string;
  unit: IngredientUnit;
  stock: number;
  par: number;
  reorderLevel: number;
  costPerUnit: number;
  supplier: string;
  category: "produce" | "meat" | "dairy" | "grains" | "spices" | "beverages" | "other";
  lastRestocked: string;
}

export interface Staff {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: StaffRole;
  status: StaffStatus;
  shift: "morning" | "afternoon" | "evening" | "night";
  hourlyRate: number;
  hiredAt: string;
  avatar?: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  visits: number;
  totalSpent: number;
  lastVisit: string;
  favoriteItems: string[];
}

export interface Delivery {
  id: string;
  orderId: string;
  driverId?: string;
  status: "pending" | "picked-up" | "in-transit" | "delivered";
  customerName: string;
  customerPhone: string;
  address: string;
  distance: number;
  estimatedTime: number;
  placedAt: string;
}

export interface Activity {
  id: string;
  type: "order" | "table" | "inventory" | "staff" | "system";
  message: string;
  actor?: string;
  timestamp: string;
}

export interface Reservation {
  id: string;
  customerName: string;
  customerPhone: string;
  partySize: number;
  date: string;
  time: string;
  tableId?: string;
  notes?: string;
  status: "confirmed" | "seated" | "cancelled" | "no-show";
}

export interface RevenuePoint {
  date: string;
  revenue: number;
  orders: number;
  avgTicket: number;
}
