import { getTodaysBookings } from "@/actions/bookings";
import { DURATION_LABELS } from "@/lib/constants";
import { formatISTTime } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

export const metadata = { title: "Bookings — Play Port" };

export default async function BookingsPage() {
  const bookings = await getTodaysBookings();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-zinc-900">Today's Bookings</h1>
        <Badge variant="outline" className="text-zinc-500">
          {bookings.length} Total
        </Badge>
      </div>

      <Card className="border shadow-none overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-zinc-50 border-b border-zinc-100">
              <tr>
                <th className="px-6 py-4 font-semibold text-zinc-600">Customer</th>
                <th className="px-6 py-4 font-semibold text-zinc-600">Duration</th>
                <th className="px-6 py-4 font-semibold text-zinc-600">Amount</th>
                <th className="px-6 py-4 font-semibold text-zinc-600">Time</th>
                <th className="px-6 py-4 font-semibold text-zinc-600">Staff</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {bookings.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-zinc-400">
                    No bookings yet today
                  </td>
                </tr>
              ) : (
                bookings.map((b) => (
                  <tr key={b.id} className="hover:bg-zinc-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-bold text-zinc-900">{b.customer.name}</p>
                      <p className="text-xs text-zinc-500">{b.customer.phone}</p>
                    </td>
                    <td className="px-6 py-4">
                      <Badge className="bg-violet-50 text-violet-700 border-violet-100 shadow-none font-medium">
                        {DURATION_LABELS[b.duration]}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 font-black text-zinc-900 text-base">
                      ₹{b.amount}
                    </td>
                    <td className="px-6 py-4 text-zinc-500 font-medium">
                      {formatISTTime(b.createdAt)}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider bg-zinc-100 px-2 py-1 rounded-md">
                        {b.creator.username}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
