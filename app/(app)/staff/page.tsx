"use client";

import { useState } from "react";
import { Calendar, MoreVertical, Plus, UserPlus, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { StaffStatusBadge } from "@/components/status-badges";
import { useAppStore } from "@/lib/store";
import { formatCurrency } from "@/lib/format";
import type { Staff, StaffRole } from "@/lib/types";

const ROLES: { value: StaffRole | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "owner", label: "Owners" },
  { value: "manager", label: "Managers" },
  { value: "chef", label: "Chefs" },
  { value: "waiter", label: "Waiters" },
  { value: "delivery", label: "Delivery" },
  { value: "host", label: "Hosts" },
];

const roleColors: Record<StaffRole, string> = {
  owner: "bg-primary/10 text-primary",
  manager: "bg-info/10 text-info",
  chef: "bg-warning/10 text-warning",
  waiter: "bg-success/10 text-success",
  delivery: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
  host: "bg-pink-500/10 text-pink-600 dark:text-pink-400",
};

export default function StaffPage() {
  const staff = useAppStore((s) => s.staff);
  const toggleStatus = useAppStore((s) => s.toggleStaffStatus);
  const [role, setRole] = useState<StaffRole | "all">("all");

  const filtered = staff.filter((s) => (role === "all" ? true : s.role === role));
  const active = staff.filter((s) => s.status === "active").length;
  const onBreak = staff.filter((s) => s.status === "on-break").length;
  const laborCost = staff.reduce((s, m) => s + m.hourlyRate * 40, 0);

  return (
    <>
      <div className="flex flex-col gap-1 pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Team</h1>
          <p className="text-sm text-muted-foreground">
            {staff.length} members · {active} on shift · {onBreak} on break
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Calendar className="h-4 w-4" /> Schedule
          </Button>
          <Button>
            <UserPlus className="h-4 w-4" /> Invite member
          </Button>
        </div>
      </div>

      <div className="mb-6 grid gap-3 sm:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Total team</p>
            <p className="text-2xl font-semibold">{staff.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Active</p>
            <p className="text-2xl font-semibold text-success">{active}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">On break</p>
            <p className="text-2xl font-semibold text-warning">{onBreak}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Weekly labor cost</p>
            <p className="text-2xl font-semibold">{formatCurrency(laborCost)}</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={role} onValueChange={(v) => setRole(v as StaffRole | "all")} className="mb-4">
        <TabsList>
          {ROLES.map((r) => (
            <TabsTrigger key={r.value} value={r.value}>
              {r.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((s) => (
          <Card key={s.id} className="overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                    {s.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{s.name}</p>
                    <Badge variant="muted" className={roleColors[s.role] + " text-[10px] capitalize"}>
                      {s.role}
                    </Badge>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon-sm">
                      <MoreVertical className="h-3.5 w-3.5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>View profile</DropdownMenuItem>
                    <DropdownMenuItem>Edit</DropdownMenuItem>
                    <DropdownMenuItem>Time off</DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive">Remove</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <p className="text-muted-foreground">Email</p>
                  <p className="truncate font-medium">{s.email}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Phone</p>
                  <p className="truncate font-medium">{s.phone}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Shift</p>
                  <p className="capitalize font-medium">{s.shift}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Rate</p>
                  <p className="font-mono font-medium">{s.hourlyRate > 0 ? `${formatCurrency(s.hourlyRate)}/hr` : "—"}</p>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between border-t pt-3">
                <StaffStatusBadge status={s.status} />
                <Button size="sm" variant="outline" onClick={() => toggleStatus(s.id)}>
                  Change status
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}
