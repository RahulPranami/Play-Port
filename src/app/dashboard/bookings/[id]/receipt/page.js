import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import Receipt from "@/components/receipt";
import PrintButton from "./print-button";

export const metadata = { title: "Receipt — Play Port" };

export default async function ReceiptPage({ params }) {
  const session = await getSession();
  if (!session) redirect("/login");

  const { id } = await params;

  const booking = await prisma.booking.findUnique({
    where: { id },
    include: { customer: { select: { name: true, phone: true } } },
  });

  if (!booking) redirect("/dashboard/bookings");

  const subscription =
    booking.duration === "MONTHLY"
      ? await prisma.subscription.findFirst({
          where: {
            customerId: booking.customerId,
            createdAt: { gte: new Date(booking.createdAt.getTime() - 60000) },
          },
          select: { uniqueCode: true, endDate: true },
        })
      : null;

  return (
    <div className="space-y-4">
      <div className="flex justify-end" data-print-hide>
        <PrintButton />
      </div>
      <Receipt booking={booking} subscription={subscription} />
    </div>
  );
}
