"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function checkIn() {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const existing = await prisma.staffAttendance.findUnique({
    where: { userId_date: { userId: session.id, date: today } },
  });

  if (existing) {
    return { error: "Already checked in today." };
  }

  await prisma.staffAttendance.create({
    data: {
      userId: session.id,
      date: today,
      checkIn: new Date(),
    },
  });

  revalidatePath("/dashboard/attendance");
  return { success: true };
}

export async function checkOut() {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const record = await prisma.staffAttendance.findUnique({
    where: { userId_date: { userId: session.id, date: today } },
  });

  if (!record) return { error: "You haven't checked in today." };
  if (record.checkOut) return { error: "Already checked out." };

  await prisma.staffAttendance.update({
    where: { id: record.id },
    data: { checkOut: new Date() },
  });

  revalidatePath("/dashboard/attendance");
  return { success: true };
}

export async function getMyAttendanceStatus() {
  const session = await getSession();
  if (!session) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return prisma.staffAttendance.findUnique({
    where: { userId_date: { userId: session.id, date: today } },
  });
}

export async function getAttendanceReport(dateStr) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") throw new Error("Unauthorized");

  const date = new Date(dateStr);
  date.setHours(0, 0, 0, 0);

  return prisma.staffAttendance.findMany({
    where: { date },
    include: { user: { select: { username: true, role: true } } },
    orderBy: { checkIn: "asc" },
  });
}
