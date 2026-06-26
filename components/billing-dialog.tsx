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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAppStore } from "@/lib/store";
import { formatCurrency } from "@/lib/format";
import type { Order } from "@/lib/types";

interface BillingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: Order;
}

export function BillingDialog({ open, onOpenChange, order }: BillingDialogProps) {
  const { setTableStatus, setOrderStatus } = useAppStore();
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [tipAmount, setTipAmount] = useState(order.tip);
  const [customTip, setCustomTip] = useState<number | null>(null);

  const subtotal = order.subtotal;
  const tax = order.tax;
  const finalTip = customTip ?? tipAmount;
  const total = +(subtotal + tax + finalTip).toFixed(2);

  const handleCompletePayment = () => {
    setOrderStatus(order.id, "completed");
    if (order.tableId) {
      setTableStatus(order.tableId, "cleaning");
    }
    onOpenChange(false);
  };

  const tipOptions = [
    { label: "15%", value: +(subtotal * 0.15).toFixed(2) },
    { label: "18%", value: +(subtotal * 0.18).toFixed(2) },
    { label: "20%", value: +(subtotal * 0.2).toFixed(2) },
    { label: "25%", value: +(subtotal * 0.25).toFixed(2) },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Checkout</DialogTitle>
          <DialogDescription>
            Order #{order.number} - Review and complete payment
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="border rounded-md p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-mono">{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Tax (8.5%)</span>
              <span className="font-mono">{formatCurrency(tax)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Tip</span>
              <span className="font-mono">{formatCurrency(finalTip)}</span>
            </div>
            <div className="flex justify-between text-lg font-semibold border-t pt-2">
              <span>Total</span>
              <span className="font-mono">{formatCurrency(total)}</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Tip</Label>
            <div className="grid grid-cols-4 gap-2">
              {tipOptions.map((opt) => (
                <Button
                  key={opt.value}
                  variant={tipAmount === opt.value && !customTip ? "default" : "outline"}
                  onClick={() => {
                    setTipAmount(opt.value);
                    setCustomTip(null);
                  }}
                  size="sm"
                >
                  {opt.label}
                </Button>
              ))}
            </div>
            <div className="flex items-center gap-2 pt-1">
              <Label className="text-xs text-muted-foreground">Custom Tip:</Label>
              <Input
                type="number"
                min={0}
                step={0.01}
                placeholder="Custom amount"
                className="h-8"
                value={customTip ?? ""}
                onChange={(e) => setCustomTip(parseFloat(e.target.value) || null)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Payment Method</Label>
            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
              <SelectTrigger>
                <SelectValue placeholder="Select payment method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="card">Credit / Debit Card</SelectItem>
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem value="paypal">PayPal</SelectItem>
                <SelectItem value="venmo">Venmo</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter className="flex gap-2 sm:gap-0">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" onClick={handleCompletePayment}>
            Complete Payment
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
