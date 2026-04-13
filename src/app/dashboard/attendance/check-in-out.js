"use client";

import { useTransition } from "react";
import { checkIn, checkOut } from "@/actions/attendance";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { formatISTTime } from "@/lib/utils";

export default function CheckInOut({ status }) {
  const [pending, startTransition] = useTransition();

  const hasCheckedIn = !!status;
  const hasCheckedOut = !!status?.checkOut;

  function handleCheckIn() {
    startTransition(async () => {
      const result = await checkIn();
      if (result.error) toast.error(result.error);
      else toast.success("Checked in successfully!");
    });
  }

  function handleCheckOut() {
    startTransition(async () => {
      const result = await checkOut();
      if (result.error) toast.error(result.error);
      else toast.success("Checked out. See you tomorrow!");
    });
  }

  return (
    <Card className="p-6 border shadow-none">
      <h2 className="font-semibold text-zinc-900 text-lg mb-4">
        Today's Status
      </h2>

      {hasCheckedOut ? (
        <div className="text-center py-6">
          <div className="inline-flex size-14 items-center justify-center rounded-full bg-green-100 mb-3">
            <svg
              className="size-7 text-green-600"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4.5 12.75l6 6 9-13.5"
              />
            </svg>
          </div>
          <p className="font-semibold text-zinc-900">Shift Complete</p>
          <p className="text-sm text-zinc-500 mt-1">
            In: {formatISTTime(status.checkIn)} — Out: {formatISTTime(status.checkOut)}
          </p>
        </div>
      ) : (
        <div className="flex gap-4">
          <Button
            onClick={handleCheckIn}
            disabled={pending || hasCheckedIn}
            className={`flex-1 h-16 text-lg font-bold rounded-2xl ${
              hasCheckedIn
                ? "bg-green-100 text-green-700 cursor-default"
                : "bg-green-600 hover:bg-green-700 text-white"
            }`}
          >
            {hasCheckedIn
              ? `Checked In at ${formatISTTime(status.checkIn)}`
              : pending
                ? "Checking in..."
                : "Check In"}
          </Button>
          <Button
            onClick={handleCheckOut}
            disabled={pending || !hasCheckedIn || hasCheckedOut}
            className="flex-1 h-16 text-lg font-bold rounded-2xl bg-red-600 hover:bg-red-700 text-white disabled:opacity-40"
          >
            {pending ? "Checking out..." : "Check Out"}
          </Button>
        </div>
      )}
    </Card>
  );
}
