import Image from "next/image";
import Link from "next/link";
import { getSession } from "@/lib/session";
import { logout } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default async function DashboardLayout({ children }) {
  const session = await getSession();

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50">
      {/* Top nav */}
      <header className="sticky top-0 z-50 border-b bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-6 flex h-14 items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="flex items-center gap-2">
              <Image src="/Play Port.svg" alt="Play Port" width={28} height={28} />
              <span className="font-bold text-zinc-900">Play Port</span>
            </Link>

            <nav className="hidden md:flex items-center gap-1">
              <Link
                href="/dashboard"
                className="rounded-lg px-3 py-1.5 text-sm font-medium text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 transition-colors"
              >
                Dashboard
              </Link>
              <Link
                href="/dashboard/bookings"
                className="rounded-lg px-3 py-1.5 text-sm font-medium text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 transition-colors"
              >
                Bookings
              </Link>
              {session?.role === "ADMIN" && (
                <Link
                  href="/dashboard/users"
                  className="rounded-lg px-3 py-1.5 text-sm font-medium text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 transition-colors"
                >
                  Users
                </Link>
              )}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-sm font-medium text-zinc-900">
                {session?.name}
              </span>
              <Badge
                variant="secondary"
                className={`text-xs py-0 h-4 ${
                  session?.role === "ADMIN"
                    ? "bg-violet-100 text-violet-700"
                    : "bg-sky-100 text-sky-700"
                }`}
              >
                {session?.role}
              </Badge>
            </div>
            <form action={logout}>
              <Button variant="outline" size="sm" type="submit">
                Sign Out
              </Button>
            </form>
          </div>
        </div>
      </header>

      <main className="flex-1 mx-auto w-full max-w-7xl px-6 py-8">
        {children}
      </main>
    </div>
  );
}
