"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Check, Loader2, Lock, Mail, Store, User, UtensilsCrossed } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ThemeToggle } from "@/components/theme-toggle";
import { useAppStore } from "@/lib/store";

export default function SignupPage() {
  const router = useRouter();
  const setUser = useAppStore((s) => s.setUser);
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    restaurant: "",
    cuisine: "Italian",
    tables: "10",
  });
  const [loading, setLoading] = useState(false);

  const update = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1) {
      if (!form.name || !form.email || !form.password) return;
      setStep(2);
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 700));
    setUser({ name: form.name, email: form.email, restaurant: form.restaurant || "My Restaurant" });
    router.push("/dashboard");
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="flex flex-1 items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="absolute right-4 top-4">
          <ThemeToggle />
        </div>
        <div className="w-full max-w-sm space-y-8">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <UtensilsCrossed className="h-4 w-4" />
            </span>
            Bellini
          </Link>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
              <span className={step >= 1 ? "text-primary" : ""}>1. Account</span>
              <span>→</span>
              <span className={step >= 2 ? "text-primary" : ""}>2. Restaurant</span>
            </div>
            <h1 className="text-2xl font-semibold tracking-tight">
              {step === 1 ? "Create your account" : "Tell us about your restaurant"}
            </h1>
            <p className="text-sm text-muted-foreground">
              14-day free trial. No credit card required.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {step === 1 ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="name">Full name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input id="name" value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="Marco Bellini" className="pl-9" required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input id="email" type="email" value={form.email} onChange={(e) => update("email", e.target.value)} placeholder="marco@bellini.com" className="pl-9" required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input id="password" type="password" value={form.password} onChange={(e) => update("password", e.target.value)} placeholder="At least 8 characters" className="pl-9" required minLength={8} />
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="restaurant">Restaurant name</Label>
                  <div className="relative">
                    <Store className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input id="restaurant" value={form.restaurant} onChange={(e) => update("restaurant", e.target.value)} placeholder="Bellini" className="pl-9" required />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="cuisine">Cuisine</Label>
                    <select
                      id="cuisine"
                      value={form.cuisine}
                      onChange={(e) => update("cuisine", e.target.value)}
                      className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    >
                      {["Italian", "French", "Japanese", "American", "Mexican", "Indian", "Mediterranean", "Other"].map((c) => (
                        <option key={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tables">Number of tables</Label>
                    <Input id="tables" type="number" min={1} value={form.tables} onChange={(e) => update("tables", e.target.value)} required />
                  </div>
                </div>
                <div className="rounded-md border bg-muted/40 p-3 text-xs text-muted-foreground">
                  You can change all of this later in Settings.
                </div>
              </>
            )}

            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : step === 1 ? (
                <>Continue <ArrowRight className="h-4 w-4" /></>
              ) : (
                <>Create my restaurant <ArrowRight className="h-4 w-4" /></>
              )}
            </Button>
            {step === 2 && (
              <Button type="button" variant="ghost" className="w-full" onClick={() => setStep(1)}>
                Back
              </Button>
            )}
          </form>

          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>

      <div className="relative hidden overflow-hidden border-l bg-muted/30 lg:block">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,hsl(var(--primary)/0.15),transparent_50%)]" />
        <div className="relative flex h-full flex-col p-12">
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold">What you get on day one</h2>
            {[
              "Beautiful menu builder with photos & modifiers",
              "Drag-and-drop floor plan for your tables",
              "Kitchen display that survives the dinner rush",
              "Inventory tracking with low-stock alerts",
              "Real-time revenue & labor dashboards",
            ].map((b) => (
              <div key={b} className="flex items-start gap-2 text-sm">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                {b}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
