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
import { Switch } from "@/components/ui/switch";
import { useAppStore } from "@/lib/store";
import type { MenuItem } from "@/lib/types";

type MenuItemFormData = Omit<MenuItem, "id" | "soldToday" | "soldWeek">;

interface MenuItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editItem?: MenuItem;
}

export function MenuItemDialog({
  open,
  onOpenChange,
  editItem,
}: MenuItemDialogProps) {
  const { categories, addMenuItem, updateMenuItem } = useAppStore();
  const [formData, setFormData] = useState<MenuItemFormData>({
    name: editItem?.name || "",
    description: editItem?.description || "",
    categoryId: editItem?.categoryId || categories[0]?.id || "",
    price: editItem?.price || 0,
    cost: editItem?.cost || 0,
    prepTime: editItem?.prepTime || 10,
    available: editItem?.available ?? true,
    vegetarian: editItem?.vegetarian || false,
    spicy: editItem?.spicy || 0,
    popular: editItem?.popular || false,
    ingredients: editItem?.ingredients || [],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editItem) {
      updateMenuItem(editItem.id, formData);
    } else {
      addMenuItem(formData);
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{editItem ? "Edit Menu Item" : "Add Menu Item"}</DialogTitle>
            <DialogDescription>
              {editItem
                ? "Update the details of this menu item"
                : "Add a new item to your menu"}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2 col-span-2">
                <Label htmlFor="name">Item Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="e.g. Grilled Chicken"
                  required
                />
              </div>

              <div className="grid gap-2 col-span-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, description: e.target.value }))
                  }
                  placeholder="Brief description of the item"
                  rows={2}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formData.categoryId}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, categoryId: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="price">Price ($)</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      price: parseFloat(e.target.value) || 0,
                    }))
                  }
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="cost">Cost ($)</Label>
                <Input
                  id="cost"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.cost}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      cost: parseFloat(e.target.value) || 0,
                    }))
                  }
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="prepTime">Prep Time (min)</Label>
                <Input
                  id="prepTime"
                  type="number"
                  min="0"
                  value={formData.prepTime}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      prepTime: parseInt(e.target.value) || 0,
                    }))
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="available">Available</Label>
                <Switch
                  id="available"
                  checked={formData.available}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({ ...prev, available: checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="vegetarian">Vegetarian</Label>
                <Switch
                  id="vegetarian"
                  checked={formData.vegetarian}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({ ...prev, vegetarian: checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="popular">Popular Item</Label>
                <Switch
                  id="popular"
                  checked={formData.popular}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({ ...prev, popular: checked }))
                  }
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="spicy">Spiciness (0-3)</Label>
                <Input
                  id="spicy"
                  type="number"
                  min="0"
                  max="3"
                  value={formData.spicy}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      spicy: Math.min(
                        3,
                        Math.max(0, parseInt(e.target.value, 10) || 0)
                      ) as MenuItem["spicy"],
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
              {editItem ? "Update Item" : "Add Item"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
