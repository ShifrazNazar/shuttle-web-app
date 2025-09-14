"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { type PropsWithChildren } from "react";
import {
  BarChart3,
  Home,
  Route,
  Calendar,
  Users,
  Menu,
  LogOut,
  User,
  Car,
  Brain,
} from "lucide-react";

import { ModeToggle } from "~/components/theme-toggle";
import { Button } from "~/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "~/components/ui/sheet";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "~/components/ui/sidebar";
import { ProtectedRoute } from "~/components/protected-route";
import { useAuth } from "~/hooks/use-auth";

const menuItems = [
  { title: "Dashboard", href: "/admin", icon: Home },
  { title: "Routes", href: "/admin/routes", icon: Route },
  { title: "Analytics", href: "/admin/analytics", icon: BarChart3 },
  { title: "AI Analytics", href: "/admin/ai-analytics", icon: Brain },
  { title: "Users", href: "/admin/users", icon: Users },
  { title: "Shuttles", href: "/admin/shuttles", icon: Car },
];

function AppSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center justify-between px-4 py-2">
          <span className="text-lg font-semibold">Shuttle Admin</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu className="space-y-1 p-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <SidebarMenuItem key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted"
                  }`}
                >
                  <Icon className="size-4" />
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <div className="space-y-3 p-4">
          <div className="flex items-center gap-2 text-sm">
            <User className="size-4" />
            <span className="truncate">{user?.email ?? "Admin User"}</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={logout}
            className="w-full"
          >
            <LogOut className="mr-2 size-4" />
            Logout
          </Button>
          <div className="text-muted-foreground text-xs">
            Shuttle Management v1.0
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}

function MobileSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="md:hidden">
          <Menu className="size-4" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-64 p-0">
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between p-4">
            <span className="text-lg font-semibold">Shuttle Admin</span>
          </div>
          <nav className="flex-1 space-y-1 p-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted"
                  }`}
                >
                  <Icon className="size-4" />
                  {item.title}
                </Link>
              );
            })}
          </nav>
          <div className="space-y-3 p-4">
            <div className="flex items-center gap-2 text-sm">
              <User className="size-4" />
              <span className="truncate">{user?.email ?? "Admin User"}</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={logout}
              className="w-full"
            >
              <LogOut className="mr-2 size-4" />
              Logout
            </Button>
            <div className="text-muted-foreground text-xs">
              Shuttle Management v1.0
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export default function AdminLayout({ children }: PropsWithChildren) {
  return (
    <ProtectedRoute>
      <SidebarProvider>
        <div className="flex min-h-screen w-full">
          <AppSidebar />
          <div className="flex flex-1 flex-col">
            <header className="flex h-14 items-center gap-4 border-b px-4 md:px-6">
              <SidebarTrigger />
              <div className="md:hidden">
                <MobileSidebar />
              </div>
              <div className="flex-1" />
              <ModeToggle />
            </header>
            <main className="flex-1 p-4 md:p-6">
              <div className="mx-auto max-w-7xl">{children}</div>
            </main>
          </div>
        </div>
      </SidebarProvider>
    </ProtectedRoute>
  );
}
