"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Minus, Trash2 } from "lucide-react";
import { useAppStore } from "@/lib/store";
import type { MenuItem, OrderItem } from "@/lib/types";
import { formatCurrency } from "@/lib/format";

interface OrderTakingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tableId: string;
}

export function OrderTakingDialog({ open, onOpenChange, tableId }: OrderTakingDialogProps) {
  const { menuItems, categories, addOrder } = useAppStore();
  const [selectedItems, setSelectedItems] = useState<OrderItem[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>(categories[0]?.id || "all");

  const addItem = (menuItem: MenuItem) => {
    setSelectedItems((prev) => {
      const existing = prev.find((item) => item.menuItemId === menuItem.id);
      if (existing) {
        return prev.map((item) =>
          item.menuItemId === menuItem.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [
        ...prev,
        {
          id: `temp-${Date.now()}-${menuItem.id}`,
          menuItemId: menuItem.id,
          name: menuItem.name,
          description: menuItem.description,
          price: menuItem.price,
          quantity: 1,
          status: "pending",
        },
      ];
    });
  };

  const removeItem = (menuItemId: string) => {
    setSelectedItems((prev) => {
      const existing = prev.find((item) => item.menuItemId === menuItemId);
      if (existing && existing.quantity > 1) {
        return prev.map((item) =>
          item.menuItemId === menuItemId
            ? { ...item, quantity: item.quantity - 1 }
            : item
        );
      }
      return prev.filter((item) => item.menuItemId !== menuItemId);
    });
  };

  const clearAll = () => {
    setSelectedItems([]);
  };

  const submitOrder = () => {
    if (selectedItems.length === 0) return;

    // Prepare items without temp ids
    const items = selectedItems.map(({ id, ...rest }) => rest);
    addOrder(tableId, items);
    setSelectedItems([]);
    onOpenChange(false);
  };

  const subtotal = selectedItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const tax = +(subtotal * 0.085).toFixed(2);
  const tip = +(subtotal * 0.2).toFixed(2);
  const total = subtotal + tax + tip;

  const filteredMenuItems = activeCategory === "all"
    ? menuItems
    : menuItems.filter(item => item.categoryId === activeCategory);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Take Order</DialogTitle>
          <DialogDescription>
            Add menu items and submit when ready
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-4">
            <div className="flex gap-2">
              <Tabs value={activeCategory} onValueChange={setActiveCategory} className="w-full">
                <ScrollArea className="h-10">
                  <TabsList className="h-9">
                    <TabsTrigger value="all">All</TabsTrigger>
                    {categories.map((cat) => (
                      <TabsTrigger key={cat.id} value={cat.id}>{cat.name}</TabsTrigger>
                    ))}
                  </TabsList>
                </ScrollArea>
              </Tabs>
            </div>

            <ScrollArea className="h-[50vh] border rounded-md p-2">
              <div className="grid grid-cols-2 gap-2">
                {filteredMenuItems.map((item) => (
                  <Card
                    key={item.id}
                    className="cursor-pointer hover:border-primary/50 transition-colors"
                    onClick={() => addItem(item)}
                  >
                    <CardContent className="p-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="text-sm font-medium line-clamp-1">{item.name}</h4>
                          <p className="text-xs text-muted-foreground line-clamp-1">{item.description}</p>
                        </div>
                        <span className="text-sm font-bold">{formatCurrency(item.price)}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Order Items</h3>
              {selectedItems.length > 0 && (
                <Button variant="outline" size="sm" onClick={clearAll}>
                  <Trash2 className="h-4 w-4 mr-1" />
                  Clear
                </Button>
              )}
            </div>

            <ScrollArea className="h-[40vh] border rounded-md p-2">
              {selectedItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground py-8">
                  <p>No items added yet</p>
                  <p className="text-xs">Click menu items to add</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {selectedItems.map((item) => (
                    <div key={item.menuItemId} className="flex items-center justify-between border rounded p-2">
                      <div>
                        <div className="font-medium text-sm">{item.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {formatCurrency(item.price)} each
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => removeItem(item.menuItemId)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-6 text-center font-mono font-semibold">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => addItem(menuItems.find(m => m.id === item.menuItemId)!)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                        <div className="ml-2 font-semibold text-sm">
                          {formatCurrency(item.price * item.quantity)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>

            <div className="border-t pt-2 space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-mono">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tax (8.5%)</span>
                <span className="font-mono">{formatCurrency(tax)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tip (20%)</span>
                <span className="font-mono">{formatCurrency(tip)}</span>
              </div>
              <div className="flex justify-between text-lg font-semibold border-t pt-1">
                <span>Total</span>
                <span className="font-mono">{formatCurrency(total)}</span>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={submitOrder} disabled={selectedItems.length === 0}>
            Submit Order
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
