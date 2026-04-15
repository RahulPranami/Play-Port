"use server";

import { compare } from "bcryptjs";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createSession, deleteSession } from "@/lib/session";

export async function login(prevState, formData) {
  const username = formData.get("username")?.toString().trim().toLowerCase();
  const password = formData.get("password")?.toString();

  if (!username || !password) {
    return { error: "Username and password are required." };
  }

  let user;
  try {
    user = await prisma.user.findUnique({ where: { username } });
  } catch (err) {
    console.error("Database error during login:", err);
    return { error: "Unable to connect to the database. Please try again." };
  }

  if (!user) {
    return { error: "Invalid username or password." };
  }

  const valid = await compare(password, user.password);
  if (!valid) {
    return { error: "Invalid username or password." };
  }

  await createSession(user);
  redirect("/dashboard");
}

export async function logout() {
  await deleteSession();
  redirect("/login");
}
