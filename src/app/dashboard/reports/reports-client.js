"use client";

import { useState, useTransition, useEffect } from "react";
import {
  startOfDay,
  endOfDay,
  subDays,
  startOfWeek,
  startOfMonth,
  format,
} from "date-fns";
import { getReportData } from "@/actions/reports";
import { DURATION_LABELS } from "@/lib/constants";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const FILTERS = ["Today", "This Week", "This Month", "Custom"];
const COLORS = ["#7c3aed", "#ec4899"];

function getRange(filter) {
  const now = new Date();
  switch (filter) {
    case "Today":
      return [startOfDay(now), endOfDay(now)];
    case "This Week":
      return [startOfWeek(now, { weekStartsOn: 1 }), endOfDay(now)];
    case "This Month":
      return [startOfMonth(now), endOfDay(now)];
    default:
      return [startOfDay(now), endOfDay(now)];
  }
}

export default function ReportsClient() {
  const [filter, setFilter] = useState("Today");
  const [customStart, setCustomStart] = useState(
    format(new Date(), "yyyy-MM-dd")
  );
  const [customEnd, setCustomEnd] = useState(format(new Date(), "yyyy-MM-dd"));
  const [data, setData] = useState(null);
  const [pending, startTransition] = useTransition();

  function loadReport(f) {
    const [start, end] =
      f === "Custom"
        ? [new Date(customStart), new Date(customEnd)]
        : getRange(f);

    startTransition(async () => {
      const result = await getReportData(
        start.toISOString(),
        end.toISOString()
      );
      setData(result);
    });
  }

  useEffect(() => {
    loadReport(filter);
  }, []);

  const pieData = data
    ? [
        { name: "Regular", value: data.regularCount },
        { name: "Monthly", value: data.monthlyCount },
      ]
    : [];

  const dailyRevenue = data
    ? Object.entries(
        data.bookings.reduce((acc, b) => {
          const day = format(new Date(b.createdAt), "dd MMM");
          acc[day] = (acc[day] || 0) + b.amount;
          return acc;
        }, {})
      ).map(([day, amount]) => ({ day, amount }))
    : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">Reports</h1>
        <p className="text-sm text-zinc-500 mt-1">Revenue and booking analytics</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 items-end">
        {FILTERS.map((f) => (
          <Button
            key={f}
            variant={filter === f ? "default" : "outline"}
            size="sm"
            className={
              filter === f
                ? "bg-violet-600 text-white hover:bg-violet-700"
                : ""
            }
            onClick={() => {
              setFilter(f);
              if (f !== "Custom") loadReport(f);
            }}
          >
            {f}
          </Button>
        ))}
        {filter === "Custom" && (
          <>
            <Input
              type="date"
              value={customStart}
              onChange={(e) => setCustomStart(e.target.value)}
              className="w-40 h-9"
            />
            <Input
              type="date"
              value={customEnd}
              onChange={(e) => setCustomEnd(e.target.value)}
              className="w-40 h-9"
            />
            <Button
              size="sm"
              onClick={() => loadReport("Custom")}
              className="bg-violet-600 text-white hover:bg-violet-700"
            >
              Apply
            </Button>
          </>
        )}
      </div>

      {pending && (
        <div className="text-center py-12 text-zinc-400">Loading...</div>
      )}

      {data && !pending && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="p-5 border shadow-none">
              <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">
                Total Bookings
              </p>
              <p className="text-3xl font-bold text-violet-600">
                {data.totalBookings}
              </p>
            </Card>
            <Card className="p-5 border shadow-none">
              <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">
                Total Revenue
              </p>
              <p className="text-3xl font-bold text-pink-600">
                ₹{data.totalRevenue.toLocaleString("en-IN")}
              </p>
            </Card>
            <Card className="p-5 border shadow-none">
              <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">
                Monthly vs Regular
              </p>
              <p className="text-3xl font-bold text-amber-600">
                {data.monthlyCount} / {data.regularCount}
              </p>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid md:grid-cols-2 gap-6">
            {dailyRevenue.length > 0 && (
              <Card className="p-5 border shadow-none">
                <h3 className="font-semibold text-zinc-900 mb-4">
                  Daily Revenue
                </h3>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={dailyRevenue}>
                    <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip formatter={(v) => `₹${v}`} />
                    <Bar dataKey="amount" fill="#7c3aed" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            )}

            {(data.monthlyCount > 0 || data.regularCount > 0) && (
              <Card className="p-5 border shadow-none">
                <h3 className="font-semibold text-zinc-900 mb-4">
                  Booking Types
                </h3>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, percent }) =>
                        `${name} ${(percent * 100).toFixed(0)}%`
                      }
                    >
                      {pieData.map((_, i) => (
                        <Cell
                          key={i}
                          fill={COLORS[i % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Card>
            )}
          </div>

          {/* Bookings Table */}
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
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {data.bookings.map((b) => (
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
                        {format(new Date(b.createdAt), "dd MMM, hh:mm a")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {data.bookings.length === 0 && (
                <div className="py-16 text-center text-zinc-400 text-sm">
                  No bookings in this period
                </div>
              )}
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
