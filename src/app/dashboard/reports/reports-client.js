"use client";

import { useState, useTransition, useEffect } from "react";
import { format, subDays, startOfWeek, startOfMonth } from "date-fns";
import { getReports } from "@/actions/reports";
import { DURATION_LABELS } from "@/lib/constants";
import { formatISTTime, formatISTDate } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ChartTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const COLORS = ["#7c3aed", "#db2777", "#f59e0b", "#10b981"];

export default function ReportsClient() {
  const [range, setRange] = useState("today");
  const [customStart, setCustomStart] = useState(
    format(new Date(), "yyyy-MM-dd")
  );
  const [customEnd, setCustomEnd] = useState(format(new Date(), "yyyy-MM-dd"));
  const [data, setData] = useState(null);
  const [pending, startTransition] = useTransition();

  function load() {
    let start = new Date();
    let end = new Date();

    if (range === "today") {
      start.setHours(0, 0, 0, 0);
    } else if (range === "week") {
      start = startOfWeek(new Date(), { weekStartsOn: 1 });
    } else if (range === "month") {
      start = startOfMonth(new Date());
    } else if (range === "custom") {
      start = new Date(customStart);
      start.setHours(0, 0, 0, 0);
      end = new Date(customEnd);
      end.setHours(23, 59, 59, 999);
    }

    startTransition(async () => {
      const result = await getReports(start, end);
      setData(result);
    });
  }

  useEffect(() => {
    load();
  }, [range]);

  if (!data && pending) {
    return <div className="py-20 text-center text-zinc-400">Loading reports...</div>;
  }

  if (!data) return null;

  return (
    <div className="space-y-8">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-end justify-between bg-white p-4 rounded-2xl border shadow-sm">
        <div className="flex flex-wrap gap-4 items-end">
          <div className="space-y-1.5">
            <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider ml-1">
              Time Range
            </p>
            <Select value={range} onValueChange={setRange}>
              <SelectTrigger className="w-40 rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="custom">Custom Range</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {range === "custom" && (
            <>
              <div className="space-y-1.5">
                <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider ml-1">
                  From
                </p>
                <Input
                  type="date"
                  value={customStart}
                  onChange={(e) => setCustomStart(e.target.value)}
                  className="w-40 rounded-xl"
                />
              </div>
              <div className="space-y-1.5">
                <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider ml-1">
                  To
                </p>
                <Input
                  type="date"
                  value={customEnd}
                  onChange={(e) => setCustomEnd(e.target.value)}
                  className="w-40 rounded-xl"
                />
              </div>
              <Button
                onClick={load}
                disabled={pending}
                className="rounded-xl bg-zinc-900 text-white"
              >
                Apply
              </Button>
            </>
          )}
        </div>

        <div className="text-right">
          <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">
            Total Revenue
          </p>
          <p className="text-2xl font-black text-violet-600">
            ₹{data.summary.totalRevenue.toLocaleString("en-IN")}
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5 border shadow-none">
          <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">
            Total Bookings
          </p>
          <p className="text-3xl font-black text-zinc-900">
            {data.summary.totalBookings}
          </p>
        </Card>
        <Card className="p-5 border shadow-none">
          <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">
            Monthly Passes
          </p>
          <p className="text-3xl font-black text-pink-600">
            {data.summary.monthlyPasses}
          </p>
        </Card>
        <Card className="p-5 border shadow-none">
          <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">
            Avg. Ticket Size
          </p>
          <p className="text-3xl font-black text-amber-600">
            ₹
            {data.summary.totalBookings > 0
              ? Math.round(
                  data.summary.totalRevenue / data.summary.totalBookings
                ).toLocaleString("en-IN")
              : 0}
          </p>
        </Card>
        <Card className="p-5 border shadow-none">
          <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">
            Unique Kids
          </p>
          <p className="text-3xl font-black text-emerald-600">
            {data.summary.uniqueCustomers}
          </p>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6 border shadow-none">
          <h3 className="font-bold text-zinc-900 mb-6">Revenue Trend</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.dailyRevenue}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="date"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `₹${value}`}
                />
                <ChartTooltip
                  cursor={{ fill: "#f4f4f5" }}
                  contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)" }}
                />
                <Bar
                  dataKey="revenue"
                  fill="#7c3aed"
                  radius={[4, 4, 0, 0]}
                  name="Revenue"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6 border shadow-none">
          <h3 className="font-bold text-zinc-900 mb-6">Booking Types</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.durationBreakdown}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="count"
                  nameKey="duration"
                >
                  {data.durationBreakdown.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <ChartTooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Detailed Table */}
      <Card className="border shadow-none overflow-hidden">
        <div className="px-6 py-4 border-b bg-zinc-50 flex items-center justify-between">
          <h3 className="font-bold text-zinc-900">All Bookings in Range</h3>
          <Badge variant="secondary" className="font-bold">
            {data.bookings.length} Records
          </Badge>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs font-bold text-zinc-400 uppercase tracking-widest bg-white border-b">
              <tr>
                <th className="px-6 py-4">Date & Time</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Duration</th>
                <th className="px-6 py-4 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {data.bookings.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-zinc-400">
                    No bookings found for this range
                  </td>
                </tr>
              ) : (
                data.bookings.map((b) => (
                  <tr key={b.id} className="hover:bg-zinc-50/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-zinc-600">
                      <span className="block text-zinc-900 font-bold">
                        {formatISTDate(b.createdAt)}
                      </span>
                      <span className="text-xs">{formatISTTime(b.createdAt)}</span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-zinc-900">{b.customer.name}</p>
                      <p className="text-xs text-zinc-500">{b.customer.phone}</p>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="outline" className="font-medium">
                        {DURATION_LABELS[b.duration]}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right font-black text-zinc-900">
                      ₹{b.amount}
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
