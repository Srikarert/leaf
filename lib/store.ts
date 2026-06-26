"use client";

import { create } from "zustand";
import { db } from "./firebase";
import {
  collection,
  getDocs,
  doc,
  setDoc,
  updateDoc,
  addDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
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
}

const ORDER_FLOW: OrderStatus[] = ["pending", "preparing", "ready", "served", "completed"];

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

  setHydrated: () => set({ hydrated: true }),

  loadDataFromFirebase: async () => {
    try {
      await initializeFirebase();

      // Load data from Firestore
      const [
        categoriesSnapshot,
        menuItemsSnapshot,
        tablesSnapshot,
        staffSnapshot,
        ordersSnapshot,
        ingredientsSnapshot,
        reservationsSnapshot,
      ] = await Promise.all([
        getDocs(collection(db, "categories")),
        getDocs(collection(db, "menuItems")),
        getDocs(collection(db, "tables")),
        getDocs(collection(db, "staff")),
        getDocs(query(collection(db, "orders"), orderBy("createdAt", "desc"))),
        getDocs(collection(db, "ingredients")),
        getDocs(collection(db, "reservations")),
      ]);

      set({
        categories: categoriesSnapshot.docs.map((doc) => doc.data() as Category),
        menuItems: menuItemsSnapshot.docs.map((doc) => doc.data() as MenuItem),
        tables: tablesSnapshot.docs.map((doc) => doc.data() as Table),
        staff: staffSnapshot.docs.map((doc) => doc.data() as Staff),
        orders: ordersSnapshot.docs.map((doc) => doc.data() as Order),
        ingredients: ingredientsSnapshot.docs.map((doc) => doc.data() as Ingredient),
        reservations: reservationsSnapshot.docs.map((doc) => doc.data() as Reservation),
        hydrated: true,
      });

      console.log("✅ Data loaded from Firebase successfully!");
    } catch (error) {
      console.error("Error loading data from Firebase:", error);
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

      // Update local state
      set((prev) => ({
        orders: prev.orders.map((o) =>
          o.id === orderId
            ? { ...o, items: updatedItems, updatedAt: new Date().toISOString() }
            : o
        ),
      }));
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

      set((state) => ({
        orders: state.orders.map((o) =>
          o.id === orderId ? { ...o, status, updatedAt: new Date().toISOString() } : o
        ),
      }));
    } catch (error) {
      console.error("Error updating order status:", error);
    }
  },

  setTableStatus: async (tableId, status) => {
    try {
      await updateDoc(doc(db, "tables", tableId), { status });

      set((state) => ({
        tables: state.tables.map((t) => (t.id === tableId ? { ...t, status } : t)),
      }));
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

      set((state) => ({
        menuItems: state.menuItems.map((m) => (m.id === id ? { ...m, available: !m.available } : m)),
      }));
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

      set((state) => ({
        activity: [newActivity, ...state.activity].slice(0, 50),
      }));
    } catch (error) {
      console.error("Error adding activity:", error);
    }
  },

  setDeliveryStatus: async (id, status) => {
    try {
      await updateDoc(doc(db, "deliveries", id), { status });

      set((state) => ({
        deliveries: state.deliveries.map((d) => (d.id === id ? { ...d, status } : d)),
      }));
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

      set((state) => ({
        staff: state.staff.map((s) => (s.id === id ? { ...s, status: next } : s)),
      }));
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

      set((state) => ({
        ingredients: state.ingredients.map((i) =>
          i.id === id ? { ...i, stock: i.par, lastRestocked: new Date().toISOString() } : i
        ),
      }));
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
      items: items.map((it, idx) => ({ ...it, id: `oi-${Date.now()}-${idx}`, status: "pending" })),
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

      set((prev) => ({
        orders: [newOrder, ...prev.orders],
        tables:
          orderType === "dine-in"
            ? prev.tables.map((t) =>
                t.id === tableId
                  ? { ...t, status: "occupied", orderId, occupiedSince: new Date().toISOString() }
                  : t
              )
            : prev.tables,
        activity: [newActivity, ...prev.activity].slice(0, 50),
      }));
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

      set((state) => ({
        menuItems: [...state.menuItems, newItem],
      }));
    } catch (error) {
      console.error("Error adding menu item:", error);
    }
  },

  removeMenuItem: async (id) => {
    try {
      await deleteDoc(doc(db, "menuItems", id));

      set((state) => ({
        menuItems: state.menuItems.filter((m) => m.id !== id),
      }));
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

      set((state) => ({
        reservations: [...state.reservations, newReservation],
        tables: r.tableId
          ? state.tables.map((t) =>
              t.id === r.tableId
                ? { ...t, status: "reserved", reservedFor: r.customerName, reservedAt: new Date().toISOString() }
                : t
            )
          : state.tables,
      }));
    } catch (error) {
      console.error("Error adding reservation:", error);
    }
  },

  setReservationStatus: async (id, status) => {
    try {
      await updateDoc(doc(db, "reservations", id), { status });

      set((state) => ({
        reservations: state.reservations.map((r) => (r.id === id ? { ...r, status } : r)),
      }));
    } catch (error) {
      console.error("Error updating reservation:", error);
    }
  },

  updateMenuItem: async (id, patch) => {
    try {
      await updateDoc(doc(db, "menuItems", id), patch);

      set((state) => ({
        menuItems: state.menuItems.map((m) => (m.id === id ? { ...m, ...patch } : m)),
      }));
    } catch (error) {
      console.error("Error updating menu item:", error);
    }
  },

  updateIngredient: async (id, patch) => {
    try {
      await updateDoc(doc(db, "ingredients", id), patch);

      set((state) => ({
        ingredients: state.ingredients.map((i) => (i.id === id ? { ...i, ...patch } : i)),
      }));
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

      set((state) => ({
        ingredients: [...state.ingredients, newIngredient],
      }));
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

      set((state) => ({
        staff: [...state.staff, newStaff],
      }));
    } catch (error) {
      console.error("Error adding staff:", error);
    }
  },

  removeStaff: async (id) => {
    try {
      await deleteDoc(doc(db, "staff", id));

      set((state) => ({
        staff: state.staff.filter((s) => s.id !== id),
      }));
    } catch (error) {
      console.error("Error removing staff:", error);
    }
  },
}));
