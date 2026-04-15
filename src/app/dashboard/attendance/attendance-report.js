"use client";

import { useState, useTransition, useEffect } from "react";
import { format } from "date-fns";
import { getAttendanceReport } from "@/actions/attendance";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { formatISTTime } from "@/lib/utils";

export default function AttendanceReport() {
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [records, setRecords] = useState([]);
  const [pending, startTransition] = useTransition();

  function load(d) {
    startTransition(async () => {
      const data = await getAttendanceReport(d);
      setRecords(data);
    });
  }

  useEffect(() => {
    load(date);
  }, []);

  return (
    <Card className="p-6 border shadow-none">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-zinc-900 text-lg">
          Attendance Report
        </h2>
        <div className="flex gap-2 items-center">
          <Input
            type="date"
            value={date}
            onChange={(e) => {
              setDate(e.target.value);
              load(e.target.value);
            }}
            className="w-44 h-9"
          />
        </div>
      </div>

      {pending ? (
        <div className="text-center py-8 text-zinc-400">Loading...</div>
      ) : records.length === 0 ? (
        <div className="text-center py-8 text-zinc-400 text-sm">
          No attendance records for this date
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b bg-zinc-50">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-zinc-600">
                  Staff
                </th>
                <th className="px-4 py-3 text-left font-semibold text-zinc-600">
                  Role
                </th>
                <th className="px-4 py-3 text-left font-semibold text-zinc-600">
                  Check In
                </th>
                <th className="px-4 py-3 text-left font-semibold text-zinc-600">
                  Check Out
                </th>
                <th className="px-4 py-3 text-left font-semibold text-zinc-600">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {records.map((r) => (
                <tr key={r.id}>
                  <td className="px-4 py-3 font-medium text-zinc-900">
                    {r.user.username}
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      variant="secondary"
                      className={
                        r.user.role === "ADMIN"
                          ? "bg-violet-100 text-violet-700"
                          : "bg-sky-100 text-sky-700"
                      }
                    >
                      {r.user.role === "FRONT_DESK" ? "Front Desk" : r.user.role}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-zinc-600">
                    {formatISTTime(r.checkIn)}
                  </td>
                  <td className="px-4 py-3 text-zinc-600">
                    {r.checkOut ? formatISTTime(r.checkOut) : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      className={
                        r.checkOut
                          ? "bg-zinc-100 text-zinc-500"
                          : "bg-green-100 text-green-700"
                      }
                    >
                      {r.checkOut ? "Completed" : "On Shift"}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}
