"use client";

import { Bike, CheckCircle2, Clock, MapPin, Navigation, Phone, Truck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function DeliveryPage() {
  return (
    <>
      <div className="flex flex-col gap-1 pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
            <Truck className="h-6 w-6 text-primary" />
            Delivery Hub
          </h1>
          <p className="text-sm text-muted-foreground">
            Delivery management interface
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">View map</Button>
          <Button>Dispatch new</Button>
        </div>
      </div>

      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="text-info rounded-md bg-muted p-2">
              <Truck className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Active deliveries</p>
              <p className="text-2xl font-semibold">0</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="text-primary rounded-md bg-muted p-2">
              <Bike className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Drivers available</p>
              <p className="text-2xl font-semibold">0</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="text-success rounded-md bg-muted p-2">
              <Clock className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Avg. delivery time</p>
              <p className="text-2xl font-semibold">0m</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all" className="mb-4">
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="pending">Awaiting</TabsTrigger>
          <TabsTrigger value="picked-up">Picked up</TabsTrigger>
          <TabsTrigger value="in-transit">In transit</TabsTrigger>
          <TabsTrigger value="delivered">Delivered</TabsTrigger>
        </TabsList>
      </Tabs>

      <Card className="md:col-span-2">
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <Truck className="mx-auto h-10 w-10 text-muted-foreground/40" />
          <h3 className="mt-3 text-sm font-medium">No deliveries yet</h3>
          <p className="mt-1 text-xs text-muted-foreground">Delivery orders will appear here</p>
        </CardContent>
      </Card>
    </>
  );
}
