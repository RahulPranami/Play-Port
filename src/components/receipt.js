import Image from "next/image";
import { DURATION_LABELS } from "@/lib/constants";

export default function Receipt({ booking, subscription }) {
  return (
    <div className="max-w-sm mx-auto bg-white p-8 print:p-4 print:max-w-none">
      {/* Header */}
      <div className="text-center border-b pb-4 mb-4">
        <Image
          src="/Play Port.svg"
          alt="Play Port"
          width={48}
          height={48}
          className="mx-auto mb-2"
        />
        <h1 className="text-xl font-bold text-zinc-900">Play Port</h1>
        <p className="text-xs text-zinc-500">Kids Play Zone</p>
      </div>

      {/* Booking Details */}
      <div className="space-y-2 text-sm mb-4">
        <div className="flex justify-between">
          <span className="text-zinc-500">Receipt #</span>
          <span className="font-mono text-xs">{booking.id.slice(-8).toUpperCase()}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-zinc-500">Date</span>
          <span>
            {new Date(booking.createdAt).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-zinc-500">Time</span>
          <span>
            {new Date(booking.createdAt).toLocaleTimeString("en-IN", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>

        <div className="border-t pt-2 mt-2" />

        <div className="flex justify-between">
          <span className="text-zinc-500">Child Name</span>
          <span className="font-medium">{booking.customer.name}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-zinc-500">Phone</span>
          <span>{booking.customer.phone}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-zinc-500">Duration</span>
          <span>{DURATION_LABELS[booking.duration]}</span>
        </div>

        <div className="border-t pt-2 mt-2" />

        <div className="flex justify-between text-base">
          <span className="font-semibold">Amount Paid</span>
          <span className="font-bold text-violet-700">₹{booking.amount}</span>
        </div>
      </div>

      {/* Subscription Code */}
      {subscription && (
        <div className="bg-violet-50 border border-violet-200 rounded-lg p-3 text-center mb-4">
          <p className="text-xs text-violet-600">Monthly Subscription Code</p>
          <p className="text-lg font-bold font-mono text-violet-800">
            {subscription.uniqueCode}
          </p>
          <p className="text-xs text-violet-500">
            Valid until{" "}
            {new Date(subscription.endDate).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </p>
        </div>
      )}

      {/* Footer */}
      <div className="border-t pt-3 text-center text-xs text-zinc-400 space-y-1">
        <p>Thank you for visiting Play Port!</p>
        <p>Terms & Conditions apply. No refunds after session begins.</p>
        <p>For queries, contact the front desk.</p>
      </div>
    </div>
  );
}
