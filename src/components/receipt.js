import { DURATION_LABELS } from "@/lib/constants";
import { formatISTFull } from "@/lib/utils";

export default function Receipt({ booking }) {
  return (
    <div className="bg-white p-8 max-w-sm mx-auto border-2 border-zinc-100 rounded-3xl shadow-xl space-y-6 text-zinc-900">
      <div className="text-center border-b border-zinc-100 pb-6 space-y-2">
        <h1 className="text-3xl font-black tracking-tighter uppercase">Play Port</h1>
        <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
          Kids Play Zone
        </p>
      </div>

      <div className="space-y-4 py-2">
        <div className="flex justify-between items-center text-sm">
          <span className="text-zinc-400 font-medium uppercase tracking-wider text-[10px]">
            Receipt No.
          </span>
          <span className="font-bold tracking-tight">#{booking.id.slice(-6).toUpperCase()}</span>
        </div>
        <div className="flex justify-between items-center text-sm">
          <span className="text-zinc-400 font-medium uppercase tracking-wider text-[10px]">
            Date & Time
          </span>
          <span className="font-bold tracking-tight">
            {formatISTFull(booking.createdAt)}
          </span>
        </div>
      </div>

      <div className="bg-zinc-50 rounded-2xl p-5 space-y-4">
        <div className="space-y-1">
          <span className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">
            Customer
          </span>
          <p className="text-lg font-black leading-none">{booking.customer.name}</p>
          <p className="text-xs font-bold text-zinc-500">{booking.customer.phone}</p>
        </div>

        <div className="flex justify-between items-end border-t border-zinc-200 pt-4">
          <div className="space-y-1">
            <span className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">
              Play Time
            </span>
            <p className="text-sm font-bold">{DURATION_LABELS[booking.duration]}</p>
          </div>
          <div className="text-right space-y-1">
            <span className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">
              Amount
            </span>
            <p className="text-2xl font-black text-violet-600 leading-none">
              ₹{booking.amount}
            </p>
          </div>
        </div>
      </div>

      <div className="text-center pt-4 border-t border-dashed border-zinc-200">
        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">
          Thank you for playing!
        </p>
        <p className="text-[9px] font-medium text-zinc-300">
          Visit again soon at Play Port
        </p>
      </div>
    </div>
  );
}
