"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { DURATION_LABELS } from "@/lib/constants";

export async function getReports(startDate, endDate) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") throw new Error("Unauthorized");

  const start = new Date(startDate);
  const end = new Date(endDate);

  const bookings = await prisma.booking.findMany({
    where: { createdAt: { gte: start, lte: end } },
    include: {
      customer: { select: { id: true, name: true, phone: true } },
      creator: { select: { username: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  // Calculate stats
  const totalRevenue = bookings.reduce((sum, b) => sum + b.amount, 0);
  const monthlyPasses = bookings.filter((b) => b.duration === "MONTHLY").length;
  const uniqueCustomers = new Set(bookings.map((b) => b.customer.id)).size;

  // Duration breakdown for pie chart
  const durationCounts = {};
  bookings.forEach((b) => {
    const label = DURATION_LABELS[b.duration];
    durationCounts[label] = (durationCounts[label] || 0) + 1;
  });
  const durationBreakdown = Object.entries(durationCounts).map(([duration, count]) => ({
    duration,
    count,
  }));

  // Daily revenue for bar chart
  const dailyData = {};
  bookings.forEach((b) => {
    const day = new Date(b.createdAt).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      timeZone: "Asia/Kolkata",
    });
    dailyData[day] = (dailyData[day] || 0) + b.amount;
  });
  const dailyRevenue = Object.entries(dailyData)
    .map(([date, revenue]) => ({ date, revenue }))
    .reverse();

  return {
    bookings,
    summary: {
      totalBookings: bookings.length,
      totalRevenue,
      monthlyPasses,
      uniqueCustomers,
    },
    durationBreakdown,
    dailyRevenue,
  };
}
