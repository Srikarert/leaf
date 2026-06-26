"use client";

import { useEffect, useState } from "react";
import { Bell, Search, Menu as MenuIcon, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAppStore } from "@/lib/store";
import { timeAgo } from "@/lib/format";

interface TopBarProps {
  onMenuClick?: () => void;
}

export function TopBar({ onMenuClick }: TopBarProps) {
  const [now, setNow] = useState<string>("");
  const activity = useAppStore((s) => s.activity);

  useEffect(() => {
    const tick = () =>
      setNow(
        new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      );
    tick();
    const id = setInterval(tick, 30000);
    return () => clearInterval(id);
  }, []);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b bg-background/80 px-4 backdrop-blur-md md:px-6">
      <Button variant="ghost" size="icon" className="md:hidden" onClick={onMenuClick}>
        <MenuIcon className="h-4 w-4" />
      </Button>

      <div className="relative max-w-md flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search orders, tables, menu..."
          className="h-9 w-full pl-9 md:w-72 lg:w-96"
        />
      </div>

      <div className="ml-auto flex items-center gap-2">
        <div className="hidden items-center gap-2 rounded-md border bg-card px-2.5 py-1 text-xs font-medium sm:flex">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
          </span>
          Service live
          <span className="text-muted-foreground">·</span>
          <span className="font-mono tabular-nums text-muted-foreground">{now}</span>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-4 w-4" />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-primary" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel className="flex items-center justify-between">
              <span>Activity</span>
              <span className="text-[10px] font-normal text-muted-foreground">last hour</span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {activity.slice(0, 6).map((a) => (
              <DropdownMenuItem key={a.id} className="flex flex-col items-start gap-0.5 py-2">
                <span className="text-xs">{a.message}</span>
                <span className="text-[10px] text-muted-foreground">{timeAgo(a.timestamp)}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <ThemeToggle />
      </div>
    </header>
  );
}
