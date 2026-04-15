import Link from "next/link";
import { getSession } from "@/lib/session";
import { getDashboardStats } from "@/actions/dashboard";
import { DURATION_LABELS } from "@/lib/constants";
import { formatISTTime } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Dashboard — Play Port" };

export default async function DashboardPage() {
  const session = await getSession();
  const stats = await getDashboardStats();

  const quickStats = [
    {
      label: "Bookings Today",
      value: stats.bookingsToday,
      color: "text-violet-600",
    },
    {
      label: "Revenue Today",
      value: `₹${stats.revenueToday.toLocaleString("en-IN")}`,
      color: "text-pink-600",
    },
    {
      label: "Active Subs",
      value: stats.activeSubs,
      color: "text-amber-600",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome + Quick Action */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-bold text-zinc-900">
              Welcome back, {session?.username}
            </h1>
            <Badge
              className={
                session?.role === "ADMIN"
                  ? "bg-violet-100 text-violet-700 border-violet-200"
                  : "bg-sky-100 text-sky-700 border-sky-200"
              }
            >
              {session?.role === "FRONT_DESK" ? "Front Desk" : session?.role}
            </Badge>
          </div>
          <p className="text-zinc-500 text-sm">
            Here's what's happening at Play Port today.
          </p>
        </div>
        <Link href="/dashboard/bookings/new">
          <Button className="h-12 px-6 text-base font-semibold rounded-xl bg-gradient-to-r from-violet-600 to-pink-500 hover:from-violet-700 hover:to-pink-600 text-white shadow-lg shadow-violet-200">
            New Booking
          </Button>
        </Link>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {quickStats.map((stat) => (
          <Card key={stat.label} className="p-5 border shadow-none">
            <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">
              {stat.label}
            </p>
            <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
          </Card>
        ))}
      </div>

      {/* Recent Bookings */}
      <Card className="border shadow-none p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-zinc-900">Recent Bookings</h2>
          <Link
            href="/dashboard/bookings"
            className="text-sm text-violet-600 hover:underline"
          >
            View all
          </Link>
        </div>
        {stats.recentBookings.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed border-zinc-200 py-12 flex items-center justify-center">
            <span className="text-sm text-zinc-400">
              No bookings yet today
            </span>
          </div>
        ) : (
          <div className="space-y-3">
            {stats.recentBookings.map((b) => (
              <div
                key={b.id}
                className="flex items-center justify-between rounded-xl bg-zinc-50 px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <div className="size-9 rounded-full bg-gradient-to-br from-violet-400 to-pink-400 flex items-center justify-center text-white font-semibold text-xs flex-shrink-0">
                    {b.customer.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium text-zinc-900 text-sm">
                      {b.customer.name}
                    </p>
                    <p className="text-xs text-zinc-500">
                      {DURATION_LABELS[b.duration]} — {formatISTTime(b.createdAt)}
                    </p>
                  </div>
                </div>
                <span className="font-bold text-zinc-900">₹{b.amount}</span>
              </div>
            ))}
          </div>
        )}
      </Card>

      {session?.role === "ADMIN" && (
        <Card className="p-6 border shadow-none bg-violet-50 border-violet-100">
          <h2 className="font-semibold text-violet-900 mb-1">
            Admin Quick Actions
          </h2>
          <p className="text-sm text-violet-600">
            Manage your team from the{" "}
            <Link href="/dashboard/users" className="underline font-medium">
              Users page
            </Link>
            . View detailed analytics on the{" "}
            <Link href="/dashboard/reports" className="underline font-medium">
              Reports page
            </Link>
            .
          </p>
        </Card>
      )}
    </div>
  );
}
