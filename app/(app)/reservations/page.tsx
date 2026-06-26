"use client";

import { useState } from "react";
import { Calendar, Clock, Phone, Plus, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAppStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { ReservationDialog } from "@/components/reservation-dialog";
import type { Reservation } from "@/lib/types";

const TABS: { value: Reservation["status"]; label: string }[] = [
  { value: "confirmed", label: "Upcoming" },
  { value: "seated", label: "Seated" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

export default function ReservationsPage() {
  const reservations = useAppStore((s) => s.reservations);
  const tables = useAppStore((s) => s.tables);
  const setReservationStatus = useAppStore((s) => s.setReservationStatus);
  const setTableStatus = useAppStore((s) => s.setTableStatus);
  const [tab, setTab] = useState<Reservation["status"]>("confirmed");
  const [dialogOpen, setDialogOpen] = useState(false);

  const filtered = reservations.filter((r) => r.status === tab);
  const upcoming = reservations.filter((r) => r.status === "confirmed");
  const seatedNow = reservations.filter((r) => r.status === "seated");

  const handleSeat = (reservation: Reservation) => {
    setReservationStatus(reservation.id, "seated");
    if (reservation.tableId) {
      setTableStatus(reservation.tableId, "occupied");
    }
  };

  const handleCancel = (reservation: Reservation) => {
    setReservationStatus(reservation.id, "cancelled");
    if (reservation.tableId) {
      setTableStatus(reservation.tableId, "vacant");
    }
  };

  const handleComplete = (reservation: Reservation) => {
    setReservationStatus(reservation.id, "completed");
  };

  return (
    <>
      <div className="flex flex-col gap-1 pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
            <Calendar className="h-6 w-6 text-primary" />
            Reservations
          </h1>
          <p className="text-sm text-muted-foreground">
            {upcoming.length} upcoming · {seatedNow.length} seated right now
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-1" />
          New Reservation
        </Button>
      </div>

      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Tonight's covers</p>
            <p className="text-2xl font-semibold">
              {upcoming.reduce((s, r) => s + r.partySize, 0)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Bookings today</p>
            <p className="text-2xl font-semibold">{upcoming.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Avg party size</p>
            <p className="text-2xl font-semibold">
              {upcoming.length > 0
                ? (upcoming.reduce((s, r) => s + r.partySize, 0) / upcoming.length).toFixed(1)
                : "0"}
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as Reservation["status"])} className="mb-4">
        <TabsList>
          {TABS.map((t) => (
            <TabsTrigger key={t.value} value={t.value}>
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {filtered.length === 0 ? (
          <Card className="md:col-span-3">
            <CardContent className="py-12 text-center">
              <Calendar className="mx-auto h-10 w-10 text-muted-foreground/40" />
              <p className="mt-3 text-sm font-medium">No reservations in this view</p>
            </CardContent>
          </Card>
        ) : (
          filtered.map((reservation) => {
            const table = reservation.tableId
              ? tables.find((t) => t.id === reservation.tableId)
              : null;
            return (
              <Card key={reservation.id} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-sm font-semibold">{reservation.customerName}</h4>
                      <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                        <Phone className="h-3 w-3" /> {reservation.customerPhone}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-mono text-lg font-semibold">{reservation.time}</p>
                      <p className="text-xs capitalize text-muted-foreground">{reservation.date}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <Badge variant="muted" className="gap-1">
                      <Users className="h-3 w-3" /> {reservation.partySize} {reservation.partySize === 1 ? "guest" : "guests"}
                    </Badge>
                    {table && <Badge variant="outline">Table {table.number}</Badge>}
                    {reservation.notes && (
                      <Badge variant="warning" className="text-[10px]">
                        {reservation.notes}
                      </Badge>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {reservation.status === "confirmed" && (
                      <>
                        <Button
                          size="sm"
                          className="flex-1"
                          onClick={() => handleSeat(reservation)}
                        >
                          Seat Guests
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-destructive"
                          onClick={() => handleCancel(reservation)}
                        >
                          Cancel
                        </Button>
                      </>
                    )}
                    {reservation.status === "seated" && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1"
                        onClick={() => handleComplete(reservation)}
                      >
                        Complete
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      <ReservationDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </>
  );
}
