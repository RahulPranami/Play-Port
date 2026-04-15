"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { generateUniqueCode } from "@/lib/unique-code";
import { addDays, isValid } from "date-fns";

async function requireAuth() {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");
  return session;
}

export async function createSubscription(customerId) {
  await requireAuth();

  const uniqueCode = await generateUniqueCode();
  const startDate = new Date();
  const endDate = addDays(startDate, 30);

  const subscription = await prisma.subscription.create({
    data: { customerId, uniqueCode, startDate, endDate },
    include: { customer: { select: { name: true, phone: true } } },
  });

  revalidatePath("/dashboard/subscriptions");
  return subscription;
}

export async function updateSubscription(id, data) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return { error: "Only admins can edit subscriptions." };
  }

  const { endDate, isActive } = data;
  const updateData = {};

  if (endDate && isValid(new Date(endDate))) {
    updateData.endDate = new Date(endDate);
  }

  if (typeof isActive === "boolean") {
    updateData.isActive = isActive;
  }

  try {
    await prisma.subscription.update({
      where: { id },
      data: updateData,
    });
    revalidatePath("/dashboard/subscriptions");
    return { success: true };
  } catch (err) {
    return { error: "Failed to update subscription." };
  }
}

export async function validateSubscription(code) {
  await requireAuth();
  if (!code) return { valid: false, error: "Enter a subscription code." };

  const sub = await prisma.subscription.findUnique({
    where: { uniqueCode: code.toUpperCase().trim() },
    include: { customer: { select: { name: true, phone: true } } },
  });

  if (!sub) return { valid: false, error: "Subscription not found." };
  if (!sub.isActive) return { valid: false, error: "Subscription is inactive." };
  if (new Date() > new Date(sub.endDate)) {
    return { valid: false, error: "Subscription has expired." };
  }

  return { valid: true, subscription: sub };
}

export async function getSubscriptions() {
  await requireAuth();

  return prisma.subscription.findMany({
    include: { customer: { select: { name: true, phone: true } } },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
}

export async function deactivateSubscription(id) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") throw new Error("Unauthorized");

  await prisma.subscription.update({
    where: { id },
    data: { isActive: false },
  });
  revalidatePath("/dashboard/subscriptions");
}
