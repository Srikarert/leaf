"use client";

import { useState } from "react";
import { Bell, Building2, Globe, Lock, Save, Shield, User as UserIcon } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useAppStore } from "@/lib/store";

const sections = [
  { value: "profile", label: "Profile", icon: UserIcon },
  { value: "restaurant", label: "Restaurant", icon: Building2 },
  { value: "notifications", label: "Notifications", icon: Bell },
  { value: "security", label: "Security", icon: Shield },
  { value: "integrations", label: "Integrations", icon: Globe },
] as const;

export default function SettingsPage() {
  const user = useAppStore((s) => s.user);
  const [section, setSection] = useState<(typeof sections)[number]["value"]>("profile");
  const [saved, setSaved] = useState(false);

  const save = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <>
      <div className="flex flex-col gap-1 pb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Manage your account, restaurant, and preferences
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[200px_1fr]">
        <nav className="space-y-1">
          {sections.map((s) => (
            <button
              key={s.value}
              onClick={() => setSection(s.value)}
              className={`flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                section === s.value ? "bg-accent text-foreground" : "text-muted-foreground hover:bg-accent/50"
              }`}
            >
              <s.icon className="h-4 w-4" /> {s.label}
            </button>
          ))}
        </nav>

        <div className="space-y-6">
          {section === "profile" && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Profile</CardTitle>
                <CardDescription>How you appear in the system</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-xl font-semibold text-primary-foreground">
                    {user.name.split(" ").map((n) => n[0]).join("")}
                  </div>
                  <div className="space-y-1">
                    <Button variant="outline" size="sm">Upload photo</Button>
                    <p className="text-xs text-muted-foreground">JPG or PNG. 1MB max.</p>
                  </div>
                </div>
                <Separator />
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Full name</Label>
                    <Input defaultValue={user.name} />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input type="email" defaultValue={user.email} />
                  </div>
                  <div className="space-y-2">
                    <Label>Role</Label>
                    <Input defaultValue={user.role} disabled className="capitalize" />
                  </div>
                  <div className="space-y-2">
                    <Label>Phone</Label>
                    <Input type="tel" defaultValue="+1 555-0100" />
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button onClick={save}>
                    <Save className="h-4 w-4" /> {saved ? "Saved!" : "Save changes"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {section === "restaurant" && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Restaurant details</CardTitle>
                  <CardDescription>Public information about your business</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Restaurant name</Label>
                      <Input defaultValue={user.restaurant} />
                    </div>
                    <div className="space-y-2">
                      <Label>Cuisine</Label>
                      <Input defaultValue="Italian" />
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                      <Label>Address</Label>
                      <Input defaultValue="482 Broadway, New York, NY 10013" />
                    </div>
                    <div className="space-y-2">
                      <Label>Phone</Label>
                      <Input defaultValue="+1 555-0100" />
                    </div>
                    <div className="space-y-2">
                      <Label>Email</Label>
                      <Input defaultValue="hello@bellini.com" />
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                      <Label>Description</Label>
                      <Textarea
                        rows={3}
                        defaultValue="Authentic Italian cuisine in the heart of SoHo. Family-owned since 2019."
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Operating hours</CardTitle>
                  <CardDescription>When your restaurant is open</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d, i) => (
                    <div key={d} className="flex items-center gap-3">
                      <span className="w-12 text-sm font-medium">{d}</span>
                      <Switch defaultChecked={i < 6} />
                      <Input type="time" defaultValue="11:00" className="w-32" />
                      <span className="text-muted-foreground">to</span>
                      <Input type="time" defaultValue="23:00" className="w-32" />
                    </div>
                  ))}
                </CardContent>
              </Card>
            </>
          )}

          {section === "notifications" && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Notifications</CardTitle>
                <CardDescription>What we notify you about</CardDescription>
              </CardHeader>
              <CardContent className="divide-y">
                {[
                  { title: "New orders", desc: "When a new order is placed", def: true },
                  { title: "Order ready", desc: "When kitchen marks an order ready", def: true },
                  { title: "Low stock alerts", desc: "When ingredients hit reorder level", def: true },
                  { title: "Staff clock-in/out", desc: "When team members start or end shifts", def: false },
                  { title: "Customer reviews", desc: "New reviews on Google, Yelp, etc.", def: true },
                  { title: "Daily summary email", desc: "End-of-day revenue & activity recap", def: true },
                ].map((n) => (
                  <div key={n.title} className="flex items-center justify-between py-3">
                    <div>
                      <p className="text-sm font-medium">{n.title}</p>
                      <p className="text-xs text-muted-foreground">{n.desc}</p>
                    </div>
                    <Switch defaultChecked={n.def} />
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {section === "security" && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Security</CardTitle>
                <CardDescription>Protect your account</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Current password</Label>
                  <Input type="password" />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>New password</Label>
                    <Input type="password" />
                  </div>
                  <div className="space-y-2">
                    <Label>Confirm password</Label>
                    <Input type="password" />
                  </div>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Two-factor authentication</p>
                    <p className="text-xs text-muted-foreground">Add an extra layer of security</p>
                  </div>
                  <Switch />
                </div>
                <div className="flex justify-end">
                  <Button onClick={save}>
                    <Lock className="h-4 w-4" /> {saved ? "Updated!" : "Update password"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {section === "integrations" && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Integrations</CardTitle>
                <CardDescription>Connect your favorite tools</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-3 sm:grid-cols-2">
                {[
                  { name: "Square POS", desc: "Sync orders and inventory", connected: true },
                  { name: "DoorDash", desc: "Receive delivery orders", connected: true },
                  { name: "Uber Eats", desc: "Receive delivery orders", connected: false },
                  { name: "Mailchimp", desc: "Email marketing", connected: false },
                  { name: "QuickBooks", desc: "Accounting sync", connected: true },
                  { name: "Google Reviews", desc: "Reputation management", connected: false },
                ].map((i) => (
                  <div key={i.name} className="flex items-center justify-between rounded-lg border p-3">
                    <div>
                      <p className="text-sm font-medium">{i.name}</p>
                      <p className="text-xs text-muted-foreground">{i.desc}</p>
                    </div>
                    <Button size="sm" variant={i.connected ? "outline" : "default"}>
                      {i.connected ? "Manage" : "Connect"}
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </>
  );
}
