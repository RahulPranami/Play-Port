"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function getDashboardStats() {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  const [bookingsToday, revenueToday, activeSubs, recentBookings] =
    await Promise.all([
      prisma.booking.count({
        where: { createdAt: { gte: todayStart, lte: todayEnd } },
      }),
      prisma.booking.aggregate({
        where: { createdAt: { gte: todayStart, lte: todayEnd } },
        _sum: { amount: true },
      }),
      prisma.subscription.count({
        where: { isActive: true, endDate: { gte: new Date() } },
      }),
      prisma.booking.findMany({
        where: { createdAt: { gte: todayStart, lte: todayEnd } },
        include: {
          customer: { select: { name: true, phone: true } },
          creator: { select: { name: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
    ]);

  return {
    bookingsToday,
    revenueToday: revenueToday._sum.amount ?? 0,
    activeSubs,
    recentBookings,
  };
}
