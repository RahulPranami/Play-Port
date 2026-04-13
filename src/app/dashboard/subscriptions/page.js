import { getSubscriptions } from "@/actions/subscriptions";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import ValidateSubscription from "./validate-subscription";

export const metadata = { title: "Subscriptions — Play Port" };

export default async function SubscriptionsPage() {
  const subscriptions = await getSubscriptions();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">Subscriptions</h1>
        <p className="text-sm text-zinc-500 mt-1">
          Manage and validate monthly passes
        </p>
      </div>

      {/* Validate Section */}
      <ValidateSubscription />

      {/* Subscriptions Table */}
      <Card className="border shadow-none overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b bg-zinc-50">
              <tr>
                <th className="px-5 py-3.5 text-left font-semibold text-zinc-600">
                  Code
                </th>
                <th className="px-5 py-3.5 text-left font-semibold text-zinc-600">
                  Customer
                </th>
                <th className="px-5 py-3.5 text-left font-semibold text-zinc-600">
                  Phone
                </th>
                <th className="px-5 py-3.5 text-left font-semibold text-zinc-600">
                  Status
                </th>
                <th className="px-5 py-3.5 text-left font-semibold text-zinc-600">
                  Expires
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {subscriptions.map((sub) => {
                const expired = new Date() > new Date(sub.endDate);
                const active = sub.isActive && !expired;
                return (
                  <tr
                    key={sub.id}
                    className="hover:bg-zinc-50 transition-colors"
                  >
                    <td className="px-5 py-4 font-mono font-bold text-violet-700">
                      {sub.uniqueCode}
                    </td>
                    <td className="px-5 py-4 font-medium text-zinc-900">
                      {sub.customer.name}
                    </td>
                    <td className="px-5 py-4 text-zinc-600">
                      {sub.customer.phone}
                    </td>
                    <td className="px-5 py-4">
                      <Badge
                        className={
                          active
                            ? "bg-green-100 text-green-700"
                            : "bg-zinc-100 text-zinc-500"
                        }
                      >
                        {active ? "Active" : expired ? "Expired" : "Inactive"}
                      </Badge>
                    </td>
                    <td className="px-5 py-4 text-zinc-500">
                      {new Date(sub.endDate).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {subscriptions.length === 0 && (
            <div className="py-16 text-center text-zinc-400 text-sm">
              No subscriptions yet
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
