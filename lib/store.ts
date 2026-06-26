"use client";

import { create } from "zustand";
import { db } from "./firebase";
import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  onSnapshot,
  Unsubscribe,
} from "firebase/firestore";
import type {
  Activity,
  Category,
  Customer,
  Delivery,
  Ingredient,
  MenuItem,
  Order,
  OrderItem,
  OrderStatus,
  Reservation,
  RevenuePoint,
  Staff,
  Table,
  TableStatus,
} from "./types";
import { initializeFirebase } from "./init-firebase";

export interface User {
  id: string;
  name: string;
  email: string;
  role: "owner" | "manager" | "chef" | "waiter" | "delivery" | "host";
  restaurant: string;
}

interface AnalyticsData {
  revenueByDay: RevenuePoint[];
  revenueByHour: { hour: string; revenue: number }[];
  categoryRevenue: { name: string; value: number; color: string }[];
  topItems: (MenuItem & { soldToday: number; soldWeek: number })[];
  todayRevenue: number;
  totalOrders: number;
  avgTicket: number;
}

interface AppState {
  hydrated: boolean;
  user: User;
  orders: Order[];
  tables: Table[];
  menuItems: MenuItem[];
  categories: Category[];
  staff: Staff[];
  customers: Customer[];
  ingredients: Ingredient[];
  deliveries: Delivery[];
  activity: Activity[];
  reservations: Reservation[];
  revenueByDay: RevenuePoint[];
  analytics: AnalyticsData;
  unsubscribes: Record<string, Unsubscribe | null>;

  setHydrated: () => void;
  loadDataFromFirebase: () => Promise<void>;
  setUser: (user: Partial<User>) => void;
  advanceOrderItem: (orderId: string, itemId: string) => void;
  setOrderStatus: (orderId: string, status: OrderStatus) => void;
  setTableStatus: (tableId: string, status: TableStatus) => void;
  toggleMenuItemAvailability: (id: string) => void;
  addActivity: (a: Omit<Activity, "id" | "timestamp">) => void;
  setDeliveryStatus: (id: string, status: Delivery["status"]) => void;
  toggleStaffStatus: (id: string) => void;
  reorderIngredient: (id: string) => void;
  addOrder: (
    tableId: string,
    items: Omit<OrderItem, "id" | "status">[],
    orderType?: Order["type"]
  ) => void;
  addMenuItem: (item: Omit<MenuItem, "id" | "soldToday" | "soldWeek">) => void;
  removeMenuItem: (id: string) => void;
  addReservation: (r: Omit<Reservation, "id" | "status">) => void;
  setReservationStatus: (id: string, status: Reservation["status"]) => void;
  updateMenuItem: (id: string, patch: Partial<MenuItem>) => void;
  updateIngredient: (id: string, patch: Partial<Ingredient>) => void;
  addIngredient: (i: Omit<Ingredient, "id">) => void;
  addStaff: (s: Omit<Staff, "id">) => void;
  removeStaff: (id: string) => void;
  calculateAnalytics: () => void;
  cleanupListeners: () => void;
}

const ORDER_FLOW: OrderStatus[] = ["pending", "preparing", "ready", "served", "completed"];

const initialAnalytics: AnalyticsData = {
  revenueByDay: [],
  revenueByHour: [],
  categoryRevenue: [],
  topItems: [],
  todayRevenue: 0,
  totalOrders: 0,
  avgTicket: 0,
};

export const useAppStore = create<AppState>((set, get) => ({
  hydrated: false,
  user: {
    id: "s-manager",
    name: "Manager",
    email: "manager@restaurant.com",
    role: "manager",
    restaurant: "My Restaurant",
  },
  orders: [],
  tables: [],
  menuItems: [],
  categories: [],
  staff: [],
  customers: [],
  ingredients: [],
  deliveries: [],
  activity: [],
  reservations: [],
  revenueByDay: [],
  analytics: initialAnalytics,
  unsubscribes: {
    categories: null,
    menuItems: null,
    tables: null,
    staff: null,
    orders: null,
    ingredients: null,
    reservations: null,
    customers: null,
    activity: null,
    deliveries: null,
  },

  setHydrated: () => set({ hydrated: true }),

  cleanupListeners: () => {
    const { unsubscribes } = get();
    Object.values(unsubscribes).forEach((unsubscribe) => {
      if (unsubscribe) unsubscribe();
    });
  },

  calculateAnalytics: () => {
    const { orders, menuItems, categories } = get();

    // Calculate today's revenue
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayRevenue = orders
      .filter((o) => new Date(o.createdAt) >= today)
      .reduce((sum, o) => sum + o.total, 0);

    // Calculate revenue by day (last 7 days)
    const revenueByDay: RevenuePoint[] = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dayStart = new Date(date);
      const dayEnd = new Date(date);
      dayEnd.setHours(23, 59, 59, 999);
      const dayOrders = orders.filter(
        (o) => new Date(o.createdAt) >= dayStart && new Date(o.createdAt) <= dayEnd
      );
      revenueByDay.push({
        date: date.toLocaleDateString("en-US", { weekday: "short" }),
        revenue: dayOrders.reduce((sum, o) => sum + o.total, 0),
        orders: dayOrders.length,
        avgTicket: dayOrders.length
          ? dayOrders.reduce((sum, o) => sum + o.total, 0) / dayOrders.length
          : 0,
      });
    }

    // Calculate revenue by hour (11 AM - 10 PM)
    const revenueByHour = [];
    for (let hour = 11; hour <= 22; hour++) {
      const hourStart = new Date(today);
      hourStart.setHours(hour, 0, 0, 0);
      const hourEnd = new Date(today);
      hourEnd.setHours(hour, 59, 59, 999);
      const hourOrders = orders.filter(
        (o) => new Date(o.createdAt) >= hourStart && new Date(o.createdAt) <= hourEnd
      );
      revenueByHour.push({
        hour: hour.toString(),
        revenue: hourOrders.reduce((sum, o) => sum + o.total, 0),
      });
    }

    // Calculate category revenue
    const categoryMap = new Map<string, number>();
    orders.forEach((order) => {
      order.items.forEach((item) => {
        const menuItem = menuItems.find((m) => m.name === item.name);
        if (menuItem) {
          const category = categories.find((c) => c.id === menuItem.categoryId);
          if (category) {
            const current = categoryMap.get(category.name) || 0;
            categoryMap.set(category.name, current + item.price * item.quantity);
          }
        }
      });
    });
    const categoryColors = [
      "hsl(16 90% 53%)",
      "hsl(217 91% 60%)",
      "hsl(142 76% 36%)",
      "hsl(48 96% 53%)",
      "hsl(262 83% 58%)",
    ];
    const categoryRevenue = Array.from(categoryMap.entries())
      .map(([name, value], i) => ({
        name,
        value,
        color: categoryColors[i % categoryColors.length],
      }))
      .sort((a, b) => b.value - a.value);

    // Calculate top items
    const itemSales = new Map<string, { soldToday: number; soldWeek: number }>();
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);
    orders.forEach((order) => {
      const orderDate = new Date(order.createdAt);
      order.items.forEach((item) => {
        const current = itemSales.get(item.name) || { soldToday: 0, soldWeek: 0 };
        if (orderDate >= today) {
          current.soldToday += item.quantity;
        }
        if (orderDate >= weekAgo) {
          current.soldWeek += item.quantity;
        }
        itemSales.set(item.name, current);
      });
    });
    const topItems = menuItems
      .map((item) => {
        const sales = itemSales.get(item.name) || { soldToday: 0, soldWeek: 0 };
        return { ...item, soldToday: sales.soldToday, soldWeek: sales.soldWeek };
      })
      .sort((a, b) => b.soldToday - a.soldToday)
      .slice(0, 10);

    const totalOrders = orders.length;
    const avgTicket = totalOrders
      ? orders.reduce((sum, o) => sum + o.total, 0) / totalOrders
      : 0;

    set({
      analytics: {
        revenueByDay,
        revenueByHour,
        categoryRevenue,
        topItems,
        todayRevenue,
        totalOrders,
        avgTicket,
      },
      revenueByDay,
    });
  },

  loadDataFromFirebase: async () => {
    try {
      await initializeFirebase();
      
      // Clean up existing listeners first
      get().cleanupListeners();

      // Real-time listener for categories
      const unsubCategories = onSnapshot(collection(db, "categories"), (snapshot) => {
        const data = snapshot.docs.map((doc) => doc.data() as Category);
        set({ categories: data });
      });

      // Real-time listener for menu items
      const unsubMenuItems = onSnapshot(collection(db, "menuItems"), (snapshot) => {
        const data = snapshot.docs.map((doc) => doc.data() as MenuItem);
        set({ menuItems: data });
      });

      // Real-time listener for tables
      const unsubTables = onSnapshot(collection(db, "tables"), (snapshot) => {
        const data = snapshot.docs.map((doc) => doc.data() as Table);
        set({ tables: data });
      });

      // Real-time listener for staff
      const unsubStaff = onSnapshot(collection(db, "staff"), (snapshot) => {
        const data = snapshot.docs.map((doc) => doc.data() as Staff);
        set({ staff: data });
      });

      // Real-time listener for orders
      const unsubOrders = onSnapshot(query(collection(db, "orders"), orderBy("createdAt", "desc")), (snapshot) => {
        const data = snapshot.docs.map((doc) => doc.data() as Order);
        set({ orders: data });
        // Recalculate analytics when orders change
        get().calculateAnalytics();
      });

      // Real-time listener for ingredients
      const unsubIngredients = onSnapshot(collection(db, "ingredients"), (snapshot) => {
        const data = snapshot.docs.map((doc) => doc.data() as Ingredient);
        set({ ingredients: data });
      });

      // Real-time listener for reservations
      const unsubReservations = onSnapshot(collection(db, "reservations"), (snapshot) => {
        const data = snapshot.docs.map((doc) => doc.data() as Reservation);
        set({ reservations: data });
      });

      // Real-time listener for customers
      const unsubCustomers = onSnapshot(collection(db, "customers"), (snapshot) => {
        const data = snapshot.docs.map((doc) => doc.data() as Customer);
        set({ customers: data });
      });

      // Real-time listener for activity
      const unsubActivity = onSnapshot(query(collection(db, "activity"), orderBy("timestamp", "desc")), (snapshot) => {
        const data = snapshot.docs.map((doc) => doc.data() as Activity).slice(0, 50);
        set({ activity: data });
      });

      // Real-time listener for deliveries
      const unsubDeliveries = onSnapshot(collection(db, "deliveries"), (snapshot) => {
        const data = snapshot.docs.map((doc) => doc.data() as Delivery);
        set({ deliveries: data });
      });

      set({
        unsubscribes: {
          categories: unsubCategories,
          menuItems: unsubMenuItems,
          tables: unsubTables,
          staff: unsubStaff,
          orders: unsubOrders,
          ingredients: unsubIngredients,
          reservations: unsubReservations,
          customers: unsubCustomers,
          activity: unsubActivity,
          deliveries: unsubDeliveries,
        },
        hydrated: true,
      });

      console.log("✅ Real-time listeners set up successfully!");
    } catch (error) {
      console.error("Error setting up real-time listeners:", error);
    }
  },

  setUser: (user) => set((state) => ({ user: { ...state.user, ...user } })),

  advanceOrderItem: async (orderId, itemId) => {
    const state = get();
    const order = state.orders.find((o) => o.id === orderId);
    if (!order) return;

    const updatedItems = order.items.map((item) => {
      if (item.id !== itemId) return item;
      const idx = ORDER_FLOW.indexOf(item.status);
      const next = ORDER_FLOW[Math.min(idx + 1, ORDER_FLOW.length - 1)];
      return { ...item, status: next };
    });

    try {
      await updateDoc(doc(db, "orders", orderId), {
        items: updatedItems,
        updatedAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error updating order item:", error);
    }
  },

  setOrderStatus: async (orderId, status) => {
    try {
      await updateDoc(doc(db, "orders", orderId), {
        status,
        updatedAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error updating order status:", error);
    }
  },

  setTableStatus: async (tableId, status) => {
    try {
      await updateDoc(doc(db, "tables", tableId), { status });
    } catch (error) {
      console.error("Error updating table status:", error);
    }
  },

  toggleMenuItemAvailability: async (id) => {
    const state = get();
    const item = state.menuItems.find((m) => m.id === id);
    if (!item) return;

    try {
      await updateDoc(doc(db, "menuItems", id), { available: !item.available });
    } catch (error) {
      console.error("Error updating menu item:", error);
    }
  },

  addActivity: async (a) => {
    const newActivity: Activity = {
      ...a,
      id: `a-${Date.now()}`,
      timestamp: new Date().toISOString(),
    };

    try {
      await setDoc(doc(db, "activity", newActivity.id), newActivity);
    } catch (error) {
      console.error("Error adding activity:", error);
    }
  },

  setDeliveryStatus: async (id, status) => {
    try {
      await updateDoc(doc(db, "deliveries", id), { status });
    } catch (error) {
      console.error("Error updating delivery:", error);
    }
  },

  toggleStaffStatus: async (id) => {
    const state = get();
    const staff = state.staff.find((s) => s.id === id);
    if (!staff) return;

    const next: Staff["status"] =
      staff.status === "active" ? "on-break" : staff.status === "on-break" ? "off-duty" : "active";

    try {
      await updateDoc(doc(db, "staff", id), { status: next });
    } catch (error) {
      console.error("Error updating staff status:", error);
    }
  },

  reorderIngredient: async (id) => {
    const state = get();
    const ingredient = state.ingredients.find((i) => i.id === id);
    if (!ingredient) return;

    try {
      await updateDoc(doc(db, "ingredients", id), {
        stock: ingredient.par,
        lastRestocked: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error reordering ingredient:", error);
    }
  },

  addOrder: async (tableId, items, orderType = "dine-in") => {
    const state = get();
    const orderId = `o-${Date.now()}`;
    const number = Math.max(...state.orders.map((o) => o.number), 0) + 1;
    const subtotal = items.reduce((s, it) => s + it.price * it.quantity, 0);
    const tax = +(subtotal * 0.085).toFixed(2);
    const tip = +(subtotal * 0.2).toFixed(2);

    const newOrder: Order = {
      id: orderId,
      number,
      type: orderType,
      status: "pending",
      tableId,
      serverId: state.user.id,
      items: items.map((it, idx) => ({
        ...it, id: `oi-${Date.now()}-${idx}`, status: "pending" })),
      subtotal,
      tax,
      tip,
      total: +(subtotal + tax + tip).toFixed(2),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      await setDoc(doc(db, "orders", orderId), newOrder);

      // Only set table occupied if it's dine-in
      if (orderType === "dine-in" && tableId) {
        await updateDoc(doc(db, "tables", tableId), {
          status: "occupied",
          orderId,
          occupiedSince: new Date().toISOString(),
        });
      }

      // Add activity
      const newActivity: Activity = {
        id: `a-${Date.now()}`,
        type: "order",
        message: `Order #${number} created`,
        actor: state.user.name,
        timestamp: new Date().toISOString(),
      };
      await setDoc(doc(db, "activity", newActivity.id), newActivity);
    } catch (error) {
      console.error("Error adding order:", error);
    }
  },

  addMenuItem: async (item) => {
    const newItem: MenuItem = {
      ...item,
      id: `m-${Date.now()}`,
      soldToday: 0,
      soldWeek: 0,
    };

    try {
      await setDoc(doc(db, "menuItems", newItem.id), newItem);
    } catch (error) {
      console.error("Error adding menu item:", error);
    }
  },

  removeMenuItem: async (id) => {
    try {
      await deleteDoc(doc(db, "menuItems", id));
    } catch (error) {
      console.error("Error removing menu item:", error);
    }
  },

  addReservation: async (r) => {
    const newReservation: Reservation = {
      ...r,
      id: `r-${Date.now()}`,
      status: "confirmed",
    };

    try {
      await setDoc(doc(db, "reservations", newReservation.id), newReservation);

      // Mark table as reserved if needed
      if (r.tableId) {
        await updateDoc(doc(db, "tables", r.tableId), {
          status: "reserved",
          reservedFor: r.customerName,
          reservedAt: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error("Error adding reservation:", error);
    }
  },

  setReservationStatus: async (id, status) => {
    try {
      await updateDoc(doc(db, "reservations", id), { status });
    } catch (error) {
      console.error("Error updating reservation status:", error);
    }
  },

  updateMenuItem: async (id, patch) => {
    try {
      await updateDoc(doc(db, "menuItems", id), patch);
    } catch (error) {
      console.error("Error updating menu item:", error);
    }
  },

  updateIngredient: async (id, patch) => {
    try {
      await updateDoc(doc(db, "ingredients", id), patch);
    } catch (error) {
      console.error("Error updating ingredient:", error);
    }
  },

  addIngredient: async (i) => {
    const newIngredient: Ingredient = {
      ...i,
      id: `ing-${Date.now()}`,
    };

    try {
      await setDoc(doc(db, "ingredients", newIngredient.id), newIngredient);
    } catch (error) {
      console.error("Error adding ingredient:", error);
    }
  },

  addStaff: async (s) => {
    const newStaff: Staff = {
      ...s,
      id: `s-${Date.now()}`,
    };

    try {
      await setDoc(doc(db, "staff", newStaff.id), newStaff);
    } catch (error) {
      console.error("Error adding staff:", error);
    }
  },

  removeStaff: async (id) => {
    try {
      await deleteDoc(doc(db, "staff", id));
    } catch (error) {
      console.error("Error removing staff:", error);
    }
  },
}));
