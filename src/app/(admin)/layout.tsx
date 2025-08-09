import Link from "next/link";
import { type PropsWithChildren } from "react";

export default function AdminLayout({ children }: PropsWithChildren) {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <aside className="fixed inset-y-0 left-0 w-64 border-r bg-white">
        <div className="px-6 py-5 text-xl font-semibold">Shuttle Admin</div>
        <nav className="mt-4 space-y-1 px-2">
          <Link
            className="block rounded px-3 py-2 hover:bg-gray-100"
            href="/admin"
          >
            Dashboard
          </Link>
          <Link
            className="block rounded px-3 py-2 hover:bg-gray-100"
            href="/admin/schedules"
          >
            Schedules
          </Link>
          <Link
            className="block rounded px-3 py-2 hover:bg-gray-100"
            href="/admin/routes"
          >
            Routes
          </Link>
          <Link
            className="block rounded px-3 py-2 hover:bg-gray-100"
            href="/admin/analytics"
          >
            Analytics
          </Link>
          <Link
            className="block rounded px-3 py-2 hover:bg-gray-100"
            href="/admin/users"
          >
            Users
          </Link>
        </nav>
      </aside>
      <main className="ml-64 min-h-screen p-6">
        <div className="mx-auto max-w-7xl">{children}</div>
      </main>
    </div>
  );
}
