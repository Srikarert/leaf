"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Eye, EyeOff, Loader2, Lock, Mail, ShieldCheck, Sparkles, UtensilsCrossed } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ThemeToggle } from "@/components/theme-toggle";
import { useAppStore } from "@/lib/store";

export default function LoginPage() {
  const router = useRouter();
  const setUser = useAppStore((s) => s.setUser);
  const [email, setEmail] = useState("elena@bellini.com");
  const [password, setPassword] = useState("demo1234");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please enter your email and password.");
      return;
    }
    setError(null);
    setLoading(true);
    await new Promise((r) => setTimeout(r, 700));
    const name = email.split("@")[0].split(".")[0];
    setUser({ email, name: name.charAt(0).toUpperCase() + name.slice(1) });
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
            <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
            <p className="text-sm text-muted-foreground">
              Sign in to your restaurant dashboard. This is a demo — any credentials work.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@restaurant.com"
                  className="pl-9"
                />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <button type="button" className="text-xs font-medium text-primary hover:underline">
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="px-9"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Sign in <ArrowRight className="h-4 w-4" /></>}
            </Button>
          </form>

          <div className="rounded-lg border bg-muted/40 p-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5 font-medium text-foreground">
              <Sparkles className="h-3 w-3 text-primary" />
              Demo credentials are pre-filled
            </div>
            <p className="mt-1">Just press Sign in to enter the dashboard.</p>
          </div>

          <p className="text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link href="/signup" className="font-medium text-primary hover:underline">
              Create one
            </Link>
          </p>
        </div>
      </div>

      <div className="relative hidden overflow-hidden border-l bg-muted/30 lg:block">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,hsl(var(--primary)/0.15),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,hsl(var(--info)/0.15),transparent_50%)]" />
        <div className="relative flex h-full flex-col justify-between p-12">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium">SOC 2 · 99.99% uptime</span>
          </div>

          <div className="space-y-6">
            <blockquote className="text-2xl font-medium leading-snug">
              "Bellini replaced four different apps. Our food cost dropped 6% in the first month."
            </blockquote>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                MB
              </div>
              <div>
                <p className="text-sm font-semibold">Marco Bellini</p>
                <p className="text-xs text-muted-foreground">Owner, Bellini Restaurant</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 text-center">
            {[
              { v: "1,200+", l: "restaurants" },
              { v: "22%", l: "faster service" },
              { v: "4.9", l: "avg. rating" },
            ].map((m) => (
              <div key={m.l} className="rounded-lg border bg-card/60 p-3 backdrop-blur-sm">
                <p className="text-xl font-semibold">{m.v}</p>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{m.l}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
