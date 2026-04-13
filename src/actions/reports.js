"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function getReportData(startDate, endDate) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") throw new Error("Unauthorized");

  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);
  const end = new Date(endDate);
  end.setHours(23, 59, 59, 999);

  const [bookings, totalRevenue, monthlyCount, regularCount] =
    await Promise.all([
      prisma.booking.findMany({
        where: { createdAt: { gte: start, lte: end } },
        include: {
          customer: { select: { name: true, phone: true } },
          creator: { select: { name: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.booking.aggregate({
        where: { createdAt: { gte: start, lte: end } },
        _sum: { amount: true },
      }),
      prisma.booking.count({
        where: { createdAt: { gte: start, lte: end }, duration: "MONTHLY" },
      }),
      prisma.booking.count({
        where: {
          createdAt: { gte: start, lte: end },
          duration: { not: "MONTHLY" },
        },
      }),
    ]);

  return {
    bookings,
    totalBookings: bookings.length,
    totalRevenue: totalRevenue._sum.amount ?? 0,
    monthlyCount,
    regularCount,
  };
}
