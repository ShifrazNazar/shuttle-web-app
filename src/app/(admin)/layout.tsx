import Link from "next/link";
import { type PropsWithChildren } from "react";

import { ModeToggle } from "~/components/theme-toggle";

export default function AdminLayout({ children }: PropsWithChildren) {
  return (
    <div className="bg-background text-foreground min-h-screen">
      <aside className="border-border bg-card fixed inset-y-0 left-0 w-64 border-r">
        <div className="flex items-center justify-between px-6 py-5">
          <span className="text-xl font-semibold">Shuttle Admin</span>
          <ModeToggle />
        </div>
        <nav className="mt-4 space-y-1 px-2">
          <Link
            className="hover:bg-muted block rounded px-3 py-2"
            href="/admin"
          >
            Dashboard
          </Link>
          <Link
            className="hover:bg-muted block rounded px-3 py-2"
            href="/admin/schedules"
          >
            Schedules
          </Link>
          <Link
            className="hover:bg-muted block rounded px-3 py-2"
            href="/admin/routes"
          >
            Routes
          </Link>
          <Link
            className="hover:bg-muted block rounded px-3 py-2"
            href="/admin/analytics"
          >
            Analytics
          </Link>
          <Link
            className="hover:bg-muted block rounded px-3 py-2"
            href="/admin/users"
          >
            Users
          </Link>
        </nav>
      </aside>
      <main className="ml-64 min-h-screen p-6">
        <div className="mx-auto max-w-7xl space-y-4">{children}</div>
      </main>
    </div>
  );
}
