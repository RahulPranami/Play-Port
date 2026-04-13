"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { PRICING } from "@/lib/constants";

async function requireAuth() {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");
  return session;
}

export async function searchCustomers(query) {
  await requireAuth();
  if (!query || query.length < 3) return [];

  const customers = await prisma.customer.findMany({
    where: {
      phone: { contains: query },
    },
    select: {
      id: true,
      name: true,
      phone: true,
      totalVisits: true,
    },
    take: 5,
  });
  return customers;
}

export async function lookupCustomer(phone) {
  await requireAuth();
  if (!phone || phone.length < 10) return null;

  const customer = await prisma.customer.findUnique({
    where: { phone },
    select: {
      id: true,
      name: true,
      phone: true,
      totalVisits: true,
      subscriptions: {
        where: { isActive: true, endDate: { gte: new Date() } },
        select: { id: true, uniqueCode: true, endDate: true },
        take: 1,
      },
    },
  });
  return customer;
}

export async function createCustomer(prevState, formData) {
  await requireAuth();

  const phone = formData.get("phone")?.toString().trim();
  const name = formData.get("name")?.toString().trim();

  if (!phone || !name) return { error: "Phone and name are required." };
  if (phone.length < 10) return { error: "Enter a valid phone number." };

  const existing = await prisma.customer.findUnique({ where: { phone } });
  if (existing) return { error: "Customer already exists.", customer: existing };

  const customer = await prisma.customer.create({
    data: { phone, name },
    select: { id: true, name: true, phone: true, totalVisits: true },
  });

  return { success: true, customer };
}

export async function createBooking(customerId, duration) {
  const session = await requireAuth();

  const amount = PRICING[duration];
  if (!amount) throw new Error("Invalid duration");

  const booking = await prisma.booking.create({
    data: {
      customerId,
      duration,
      amount,
      createdBy: session.id,
    },
    include: {
      customer: { select: { name: true, phone: true } },
    },
  });

  await prisma.customer.update({
    where: { id: customerId },
    data: { totalVisits: { increment: 1 } },
  });

  revalidatePath("/dashboard/bookings");
  revalidatePath("/dashboard");
  return booking;
}

export async function editBooking(bookingId, duration) {
  const session = await requireAuth();

  const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
  if (!booking) return { error: "Booking not found." };

  // FRONT_DESK can only edit within 1 hour of creation
  if (session.role === "FRONT_DESK") {
    const elapsed = Date.now() - new Date(booking.createdAt).getTime();
    if (elapsed > 60 * 60 * 1000) {
      return { error: "Edit window expired. Contact admin." };
    }
  }

  const amount = PRICING[duration];
  if (!amount) return { error: "Invalid duration." };

  await prisma.booking.update({
    where: { id: bookingId },
    data: { duration, amount, isEdited: true },
  });

  revalidatePath("/dashboard/bookings");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function getTodaysBookings() {
  await requireAuth();

  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date();
  end.setHours(23, 59, 59, 999);

  return prisma.booking.findMany({
    where: { createdAt: { gte: start, lte: end } },
    include: {
      customer: { select: { name: true, phone: true } },
      creator: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}
