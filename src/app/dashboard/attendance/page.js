import { getSession } from "@/lib/session";
import { getMyAttendanceStatus } from "@/actions/attendance";
import CheckInOut from "./check-in-out";
import AttendanceReport from "./attendance-report";

export const metadata = { title: "Attendance — Play Port" };

export default async function AttendancePage() {
  const session = await getSession();
  const status = await getMyAttendanceStatus();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">Staff Attendance</h1>
        <p className="text-sm text-zinc-500 mt-1">
          Track your daily check-in and check-out
        </p>
      </div>

      <CheckInOut status={status} />

      {session?.role === "ADMIN" && <AttendanceReport />}
    </div>
  );
}
