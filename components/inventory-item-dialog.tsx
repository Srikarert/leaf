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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAppStore } from "@/lib/store";
import type { Ingredient } from "@/lib/types";

interface InventoryItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editItem?: Ingredient;
}

export function InventoryItemDialog({
  open,
  onOpenChange,
  editItem,
}: InventoryItemDialogProps) {
  const { addIngredient, updateIngredient } = useAppStore();
  const [formData, setFormData] = useState({
    name: editItem?.name || "",
    category: editItem?.category || "produce",
    stock: editItem?.stock || 0,
    unit: editItem?.unit || "pcs",
    par: editItem?.par || 50,
    reorderLevel: editItem?.reorderLevel || 10,
    costPerUnit: editItem?.costPerUnit || 0,
    supplier: editItem?.supplier || "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editItem) {
      updateIngredient(editItem.id, formData);
    } else {
      addIngredient(formData);
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{editItem ? "Edit Ingredient" : "Add Ingredient"}</DialogTitle>
            <DialogDescription>
              {editItem
                ? "Update the ingredient details"
                : "Add a new ingredient to your inventory"}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2 col-span-2">
              <Label htmlFor="name">Ingredient Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="e.g. Chicken Breast"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value: any) =>
                    setFormData((prev) => ({ ...prev, category: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="produce">Produce</SelectItem>
                    <SelectItem value="meat">Meat & Seafood</SelectItem>
                    <SelectItem value="dairy">Dairy</SelectItem>
                    <SelectItem value="grains">Grains</SelectItem>
                    <SelectItem value="spices">Spices</SelectItem>
                    <SelectItem value="beverages">Beverages</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="supplier">Supplier</Label>
                <Input
                  id="supplier"
                  value={formData.supplier}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, supplier: e.target.value }))
                  }
                  placeholder="e.g. Fresh Foods Inc."
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="stock">Stock</Label>
                <Input
                  id="stock"
                  type="number"
                  min="0"
                  value={formData.stock}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      stock: parseFloat(e.target.value) || 0,
                    }))
                  }
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="unit">Unit</Label>
                <Input
                  id="unit"
                  value={formData.unit}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, unit: e.target.value }))
                  }
                  placeholder="e.g. lbs, pcs"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="costPerUnit">Cost per Unit ($)</Label>
                <Input
                  id="costPerUnit"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.costPerUnit}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      costPerUnit: parseFloat(e.target.value) || 0,
                    }))
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="par">Par Level</Label>
                <Input
                  id="par"
                  type="number"
                  min="0"
                  value={formData.par}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      par: parseFloat(e.target.value) || 0,
                    }))
                  }
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="reorderLevel">Reorder Level</Label>
                <Input
                  id="reorderLevel"
                  type="number"
                  min="0"
                  value={formData.reorderLevel}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      reorderLevel: parseFloat(e.target.value) || 0,
                    }))
                  }
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {editItem ? "Update Ingredient" : "Add Ingredient"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
