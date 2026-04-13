"use server";

import { hash } from "bcryptjs";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

async function requireAdmin() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }
  return session;
}

export async function createUser(prevState, formData) {
  await requireAdmin();

  const name = formData.get("name")?.toString().trim();
  const email = formData.get("email")?.toString().trim().toLowerCase();
  const password = formData.get("password")?.toString();
  const role = formData.get("role")?.toString();

  if (!name || !email || !password || !role) {
    return { error: "All fields are required." };
  }

  if (password.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { error: "A user with this email already exists." };
  }

  const hashed = await hash(password, 12);

  await prisma.user.create({
    data: { name, email, password: hashed, role },
  });

  revalidatePath("/dashboard/users");
  return { success: true };
}

export async function updateUserRole(userId, role) {
  await requireAdmin();

  await prisma.user.update({
    where: { id: userId },
    data: { role },
  });

  revalidatePath("/dashboard/users");
}

export async function deleteUser(userId) {
  const session = await requireAdmin();

  if (session.id === userId) {
    throw new Error("You cannot delete your own account.");
  }

  await prisma.user.delete({ where: { id: userId } });
  revalidatePath("/dashboard/users");
}

export async function getUsers() {
  await requireAdmin();
  return prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  });
}
