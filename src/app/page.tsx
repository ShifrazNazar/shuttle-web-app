"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Home, Route, Calendar, BarChart3 } from "lucide-react";

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
        <div className="container mx-auto space-y-8 px-4 text-center">
          <div className="space-y-4">
            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
              Manage Your Shuttle Service
            </h1>
            <p className="text-muted-foreground mx-auto max-w-2xl text-xl">
              Streamline operations with our comprehensive admin dashboard for
              scheduling, route management, and real-time tracking.
            </p>
          </div>

          {/* Feature Grid */}
          <div className="mx-auto grid max-w-4xl grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            <div className="bg-card space-y-3 rounded-lg border p-6 text-center">
              <Home className="text-primary mx-auto h-8 w-8" />
              <h3 className="font-semibold">Dashboard</h3>
              <p className="text-muted-foreground text-sm">
                Real-time overview of your shuttle operations
              </p>
            </div>
            <div className="bg-card space-y-3 rounded-lg border p-6 text-center">
              <Calendar className="text-primary mx-auto h-8 w-8" />
              <h3 className="font-semibold">Scheduling</h3>
              <p className="text-muted-foreground text-sm">
                Manage routes and timetables efficiently
              </p>
            </div>
            <div className="bg-card space-y-3 rounded-lg border p-6 text-center">
              <Route className="text-primary mx-auto h-8 w-8" />
              <h3 className="font-semibold">Routes</h3>
              <p className="text-muted-foreground text-sm">
                Optimize and track shuttle routes
              </p>
            </div>
            <div className="bg-card space-y-3 rounded-lg border p-6 text-center">
              <BarChart3 className="text-primary mx-auto h-8 w-8" />
              <h3 className="font-semibold">Analytics</h3>
              <p className="text-muted-foreground text-sm">
                Data-driven insights for better decisions
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-muted-foreground text-sm">
            © 2025 Shuttle Admin.
          </p>
        </div>
      </footer>
    </main>
  );
}
