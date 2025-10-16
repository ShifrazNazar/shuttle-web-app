"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Route,
  BarChart3,
  Brain,
  QrCode,
  Smartphone,
  Car,
  Navigation,
  CheckCircle,
} from "lucide-react";

import { Button } from "~/components/ui/button";
import { useAuth } from "~/hooks/use-auth";

export default function HomePage() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && isAuthenticated) {
      router.push("/admin");
    }
  }, [isAuthenticated, loading, router]);

  if (loading) {
    return (
      <main className="bg-background flex min-h-screen flex-col items-center justify-center">
        <div className="space-y-4 text-center">
          <div className="border-primary mx-auto h-12 w-12 animate-spin rounded-full border-b-2"></div>
          <p className="text-muted-foreground text-lg">Loading...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="bg-background flex min-h-screen flex-col">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Route className="text-primary h-8 w-8" />
              <span className="text-xl font-bold">Shuttle Admin</span>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" asChild>
                <Link href="/login">Sign In</Link>
              </Button>
              <Button asChild>
                <Link href="/signup">Get Started</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="flex flex-1 items-center justify-center py-16">
        <div className="container mx-auto space-y-12 px-4 text-center">
          <div className="space-y-6">
            <h1 className="text-5xl font-bold tracking-tight sm:text-7xl">
              Smart Shuttle Management
            </h1>
            <p className="text-muted-foreground mx-auto max-w-3xl text-xl">
              Complete fleet management solution with AI-powered analytics,
              real-time tracking, and mobile apps for seamless shuttle
              operations.
            </p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <Button size="lg" asChild>
                <Link href="/signup">Get Started Free</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/login">Sign In</Link>
              </Button>
            </div>
          </div>

          {/* Core Features Grid */}
          <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div className="bg-card space-y-4 rounded-lg border p-6 text-center transition-shadow hover:shadow-md">
              <Navigation className="mx-auto h-10 w-10 text-blue-600" />
              <h3 className="text-lg font-semibold">Real-time Tracking</h3>
              <p className="text-muted-foreground text-sm">
                Live GPS tracking of all shuttles with driver location sharing
                and route monitoring
              </p>
            </div>
            <div className="bg-card space-y-4 rounded-lg border p-6 text-center transition-shadow hover:shadow-md">
              <Brain className="mx-auto h-10 w-10 text-purple-600" />
              <h3 className="text-lg font-semibold">AI Analytics</h3>
              <p className="text-muted-foreground text-sm">
                AI-powered demand forecasting, schedule optimization, and
                intelligent recommendations
              </p>
            </div>
            <div className="bg-card space-y-4 rounded-lg border p-6 text-center transition-shadow hover:shadow-md">
              <QrCode className="mx-auto h-10 w-10 text-green-600" />
              <h3 className="text-lg font-semibold">Digital Travel Cards</h3>
              <p className="text-muted-foreground text-sm">
                QR code-based boarding system for seamless passenger experience
              </p>
            </div>
            <div className="bg-card space-y-4 rounded-lg border p-6 text-center transition-shadow hover:shadow-md">
              <Route className="mx-auto h-10 w-10 text-orange-600" />
              <h3 className="text-lg font-semibold">Route Management</h3>
              <p className="text-muted-foreground text-sm">
                Complete route planning, scheduling, and assignment management
              </p>
            </div>
            <div className="bg-card space-y-4 rounded-lg border p-6 text-center transition-shadow hover:shadow-md">
              <Car className="mx-auto h-10 w-10 text-indigo-600" />
              <h3 className="text-lg font-semibold">Fleet Management</h3>
              <p className="text-muted-foreground text-sm">
                Comprehensive shuttle fleet tracking and driver assignment
              </p>
            </div>
            <div className="bg-card space-y-4 rounded-lg border p-6 text-center transition-shadow hover:shadow-md">
              <BarChart3 className="mx-auto h-10 w-10 text-cyan-600" />
              <h3 className="text-lg font-semibold">Analytics Dashboard</h3>
              <p className="text-muted-foreground text-sm">
                Comprehensive reporting and performance analytics
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Mobile Apps Section */}
      <section className="bg-muted/50 py-16">
        <div className="container mx-auto px-4">
          <div className="space-y-8 text-center">
            <div className="space-y-4">
              <h2 className="text-3xl font-bold">Mobile Applications</h2>
              <p className="text-muted-foreground mx-auto max-w-2xl text-lg">
                Dedicated mobile apps for students and drivers with real-time
                features
              </p>
            </div>

            <div className="mx-auto grid max-w-4xl gap-8 md:grid-cols-2">
              {/* Student App */}
              <div className="bg-card rounded-lg border p-8 text-center">
                <Smartphone className="mx-auto mb-4 h-12 w-12 text-blue-600" />
                <h3 className="mb-4 text-xl font-semibold">Student App</h3>
                <div className="space-y-3 text-left">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">
                      Digital travel card with QR code
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Real-time shuttle tracking</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">
                      Route information and schedules
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">
                      Boarding history and usage stats
                    </span>
                  </div>
                </div>
              </div>

              {/* Driver App */}
              <div className="bg-card rounded-lg border p-8 text-center">
                <Car className="mx-auto mb-4 h-12 w-12 text-green-600" />
                <h3 className="mb-4 text-xl font-semibold">Driver App</h3>
                <div className="space-y-3 text-left">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">
                      QR code scanner for boarding
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">
                      Location tracking and sharing
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">
                      Route assignments and navigation
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">
                      Passenger boarding management
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12">
        <div className="container mx-auto px-4">
          <div className="mb-8 grid gap-8 md:grid-cols-4">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Route className="text-primary h-6 w-6" />
                <span className="text-lg font-bold">Shuttle Management</span>
              </div>
              <p className="text-muted-foreground text-sm">
                Complete fleet management solution with AI-powered analytics and
                real-time tracking.
              </p>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold">Features</h4>
              <ul className="text-muted-foreground space-y-2 text-sm">
                <li>Real-time Tracking</li>
                <li>AI Analytics</li>
                <li>Digital Travel Cards</li>
                <li>Route Management</li>
              </ul>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold">Mobile Apps</h4>
              <ul className="text-muted-foreground space-y-2 text-sm">
                <li>Student App</li>
                <li>Driver App</li>
                <li>QR Code Scanner</li>
                <li>Live Tracking</li>
              </ul>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold">Support</h4>
              <ul className="text-muted-foreground space-y-2 text-sm">
                <li>Documentation</li>
                <li>Help Center</li>
                <li>Contact Support</li>
                <li>System Status</li>
              </ul>
            </div>
          </div>

          <div className="border-t pt-8 text-center">
            <p className="text-muted-foreground text-sm">
              © 2025 Shuttle Management System. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
