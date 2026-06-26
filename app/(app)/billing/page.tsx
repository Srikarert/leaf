"use client";

import { Check, CreditCard, Download, Receipt, Sparkles } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";

const invoices = [
  { id: "INV-2024-12", date: "Dec 1, 2024", amount: 149, status: "Paid" },
  { id: "INV-2024-11", date: "Nov 1, 2024", amount: 149, status: "Paid" },
  { id: "INV-2024-10", date: "Oct 1, 2024", amount: 149, status: "Paid" },
  { id: "INV-2024-09", date: "Sep 1, 2024", amount: 149, status: "Paid" },
];

export default function BillingPage() {
  return (
    <>
      <div className="flex flex-col gap-1 pb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Billing</h1>
        <p className="text-sm text-muted-foreground">
          Manage your subscription, payment methods, and invoices
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <Badge className="mb-2 gap-1">
                  <Sparkles className="h-3 w-3" /> Growth plan
                </Badge>
                <CardTitle className="text-xl">$149 / month</CardTitle>
                <CardDescription>Renews Jan 1, 2025 · Auto-renews via •••• 4242</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline">Change plan</Button>
                <Button variant="ghost">Cancel</Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="mb-1 flex justify-between text-sm">
                <span className="font-medium">Locations used</span>
                <span className="text-muted-foreground">1 of 3</span>
              </div>
              <Progress value={33} />
            </div>
            <div>
              <div className="mb-1 flex justify-between text-sm">
                <span className="font-medium">Staff seats</span>
                <span className="text-muted-foreground">12 of unlimited</span>
              </div>
              <Progress value={12} />
            </div>
            <div>
              <div className="mb-1 flex justify-between text-sm">
                <span className="font-medium">API calls (this month)</span>
                <span className="text-muted-foreground">24,182 of 100,000</span>
              </div>
              <Progress value={24} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Payment method</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3 rounded-lg border bg-muted/40 p-3">
              <div className="flex h-10 w-14 items-center justify-center rounded bg-gradient-to-br from-primary to-info text-[10px] font-bold text-white">
                VISA
              </div>
              <div>
                <p className="font-mono text-sm">•••• •••• •••• 4242</p>
                <p className="text-xs text-muted-foreground">Expires 12/26</p>
              </div>
            </div>
            <div className="mt-3 space-y-2">
              <Button variant="outline" className="w-full">
                <CreditCard className="h-4 w-4" /> Add new card
              </Button>
              <Button variant="outline" className="w-full">
                <Receipt className="h-4 w-4" /> Billing address
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-base">Invoices</CardTitle>
          <CardDescription>Your billing history</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y">
            {invoices.map((inv) => (
              <div key={inv.id} className="flex items-center justify-between p-4">
                <div>
                  <p className="font-mono text-sm font-medium">{inv.id}</p>
                  <p className="text-xs text-muted-foreground">{inv.date}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="success" className="gap-1">
                    <Check className="h-3 w-3" /> {inv.status}
                  </Badge>
                  <span className="font-mono text-sm font-medium">${inv.amount}</span>
                  <Button size="sm" variant="ghost">
                    <Download className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </>
  );
}
