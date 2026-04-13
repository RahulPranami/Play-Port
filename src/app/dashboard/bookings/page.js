import Link from "next/link";
import { getTodaysBookings } from "@/actions/bookings";
import { DURATION_LABELS } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const metadata = { title: "Bookings — Play Port" };

export default async function BookingsPage() {
  const bookings = await getTodaysBookings();

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">
            Today's Bookings
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            {bookings.length}{" "}
            {bookings.length === 1 ? "booking" : "bookings"} today
          </p>
        </div>
        <Link href="/dashboard/bookings/new">
          <Button className="h-12 px-6 text-base font-semibold rounded-xl bg-gradient-to-r from-violet-600 to-pink-500 hover:from-violet-700 hover:to-pink-600 text-white">
            New Booking
          </Button>
        </Link>
      </div>

      {bookings.length === 0 ? (
        <Card className="p-12 border shadow-none text-center">
          <p className="text-zinc-400 text-lg">No bookings yet today</p>
          <p className="text-zinc-400 text-sm mt-1">
            Create one to get started
          </p>
        </Card>
      ) : (
        <Card className="border shadow-none overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b bg-zinc-50">
                <tr>
                  <th className="px-5 py-3.5 text-left font-semibold text-zinc-600">
                    Customer
                  </th>
                  <th className="px-5 py-3.5 text-left font-semibold text-zinc-600">
                    Phone
                  </th>
                  <th className="px-5 py-3.5 text-left font-semibold text-zinc-600">
                    Duration
                  </th>
                  <th className="px-5 py-3.5 text-left font-semibold text-zinc-600">
                    Amount
                  </th>
                  <th className="px-5 py-3.5 text-left font-semibold text-zinc-600">
                    Time
                  </th>
                  <th className="px-5 py-3.5 text-left font-semibold text-zinc-600">
                    Staff
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {bookings.map((b) => (
                  <tr
                    key={b.id}
                    className="hover:bg-zinc-50 transition-colors"
                  >
                    <td className="px-5 py-4 font-medium text-zinc-900">
                      {b.customer.name}
                    </td>
                    <td className="px-5 py-4 text-zinc-600">
                      {b.customer.phone}
                    </td>
                    <td className="px-5 py-4">
                      <Badge
                        variant="secondary"
                        className={
                          b.duration === "MONTHLY"
                            ? "bg-amber-100 text-amber-700"
                            : "bg-sky-100 text-sky-700"
                        }
                      >
                        {DURATION_LABELS[b.duration]}
                      </Badge>
                    </td>
                    <td className="px-5 py-4 font-semibold text-zinc-900">
                      ₹{b.amount}
                    </td>
                    <td className="px-5 py-4 text-zinc-500">
                      {new Date(b.createdAt).toLocaleTimeString("en-IN", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="px-5 py-4 text-zinc-500">
                      {b.creator.name}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
