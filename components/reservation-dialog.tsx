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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAppStore } from "@/lib/store";

interface ReservationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ReservationDialog({ open, onOpenChange }: ReservationDialogProps) {
  const { tables, addReservation } = useAppStore();
  const [formData, setFormData] = useState({
    customerName: "",
    customerPhone: "",
    partySize: 2,
    date: new Date().toISOString().split("T")[0],
    time: "18:00",
    notes: "",
    tableId: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addReservation({
      customerName: formData.customerName,
      customerPhone: formData.customerPhone,
      partySize: formData.partySize,
      date: formData.date,
      time: formData.time,
      notes: formData.notes,
      tableId: formData.tableId || undefined,
    });
    onOpenChange(false);
    // Reset form
    setFormData({
      customerName: "",
      customerPhone: "",
      partySize: 2,
      date: new Date().toISOString().split("T")[0],
      time: "18:00",
      notes: "",
      tableId: "",
    });
  };

  const availableTables = tables.filter(t => t.status === "vacant");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>New Reservation</DialogTitle>
            <DialogDescription>
              Create a new reservation for a customer
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Customer Name</Label>
              <Input
                id="name"
                value={formData.customerName}
                onChange={(e) => setFormData(prev => ({ ...prev, customerName: e.target.value }))}
                placeholder="Enter customer name"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                value={formData.customerPhone}
                onChange={(e) => setFormData(prev => ({ ...prev, customerPhone: e.target.value }))}
                placeholder="Enter phone number"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="time">Time</Label>
                <Input
                  id="time"
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="partySize">Party Size</Label>
                <Input
                  id="partySize"
                  type="number"
                  min={1}
                  max={20}
                  value={formData.partySize}
                  onChange={(e) => setFormData(prev => ({ ...prev, partySize: parseInt(e.target.value) || 2 }))}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="tableId">Table (Optional)</Label>
                <Select
                  value={formData.tableId}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, tableId: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a table" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableTables.map((table) => (
                      <SelectItem key={table.id} value={table.id}>
                        Table {table.number} ({table.capacity} guests)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Any special requests or notes..."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Save Reservation</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
