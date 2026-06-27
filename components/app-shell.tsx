"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Menu, X, Loader2 } from "lucide-react";
import { SidebarNav } from "@/components/sidebar-nav";
import { TopBar } from "@/components/top-bar";
import { useAppStore } from "@/lib/store";
import { Button } from "@/components/ui/button";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const orders = useAppStore((s) => s.orders);
  const hydrated = useAppStore((s) => s.hydrated);
  const loadDataFromFirebase = useAppStore((s) => s.loadDataFromFirebase);
  const pendingOrders = orders.filter((o) => o.status === "pending" || o.status === "preparing").length;

  useEffect(() => {
    if (!hydrated) {
      loadDataFromFirebase();
    }
  }, [hydrated, loadDataFromFirebase]);

  if (!hydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      <SidebarNav pendingOrders={pendingOrders} />
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setMobileOpen(false)}
            aria-hidden
          />
          <div className="absolute inset-y-0 left-0 flex w-64 flex-col border-r bg-background">
            <div className="flex h-16 items-center justify-between border-b px-4">
              <Link href="/dashboard" className="font-semibold" onClick={() => setMobileOpen(false)}>
                Bellini
              </Link>
              <Button variant="ghost" size="icon" onClick={() => setMobileOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <SidebarNav pendingOrders={pendingOrders} variant="mobile" />
          </div>
        </div>
      )}
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar onMenuClick={() => setMobileOpen(true)} />
        <main className="flex-1 px-4 pb-12 pt-6 md:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
