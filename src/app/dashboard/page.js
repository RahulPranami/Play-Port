import { getSession } from "@/lib/session";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

export const metadata = {
  title: "Dashboard — Play Port",
};

const quickStats = [
  { label: "Sessions Today", value: "—", color: "text-violet-600" },
  { label: "Active Bookings", value: "—", color: "text-pink-600" },
  { label: "Children In", value: "—", color: "text-amber-600" },
  { label: "Staff On Duty", value: "—", color: "text-green-600" },
];

export default async function DashboardPage() {
  const session = await getSession();

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div>
        <div className="flex items-center gap-3 mb-1">
          <h1 className="text-2xl font-bold text-zinc-900">
            Welcome back, {session?.name?.split(" ")[0]}
          </h1>
          <Badge
            className={
              session?.role === "ADMIN"
                ? "bg-violet-100 text-violet-700 border-violet-200"
                : "bg-sky-100 text-sky-700 border-sky-200"
            }
          >
            {session?.role}
          </Badge>
        </div>
        <p className="text-zinc-500 text-sm">
          Here's what's happening at Play Port today.
        </p>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {quickStats.map((stat) => (
          <Card key={stat.label} className="p-5 border shadow-none">
            <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">
              {stat.label}
            </p>
            <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
          </Card>
        ))}
      </div>

      {/* Placeholder content */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="p-6 border shadow-none">
          <h2 className="font-semibold text-zinc-900 mb-1">
            Upcoming Sessions
          </h2>
          <p className="text-sm text-zinc-500 mb-4">
            Today's scheduled sessions will appear here.
          </p>
          <div className="rounded-xl border-2 border-dashed border-zinc-200 py-12 flex items-center justify-center">
            <span className="text-sm text-zinc-400">Coming soon</span>
          </div>
        </Card>

        <Card className="p-6 border shadow-none">
          <h2 className="font-semibold text-zinc-900 mb-1">
            Recent Activity
          </h2>
          <p className="text-sm text-zinc-500 mb-4">
            Check-ins, bookings, and updates will appear here.
          </p>
          <div className="rounded-xl border-2 border-dashed border-zinc-200 py-12 flex items-center justify-center">
            <span className="text-sm text-zinc-400">Coming soon</span>
          </div>
        </Card>
      </div>

      {session?.role === "ADMIN" && (
        <Card className="p-6 border shadow-none bg-violet-50 border-violet-100">
          <h2 className="font-semibold text-violet-900 mb-1">Admin Quick Actions</h2>
          <p className="text-sm text-violet-600">
            Manage your team from the{" "}
            <a href="/dashboard/users" className="underline font-medium">
              Users page
            </a>
            . Register new staff, update roles, or remove accounts.
          </p>
        </Card>
      )}
    </div>
  );
}
