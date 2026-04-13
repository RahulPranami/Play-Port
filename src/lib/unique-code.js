import { prisma } from "@/lib/prisma";

const CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function generate() {
  let code = "PP-";
  for (let i = 0; i < 4; i++) {
    code += CHARS[Math.floor(Math.random() * CHARS.length)];
  }
  return code;
}

export async function generateUniqueCode() {
  for (let attempt = 0; attempt < 10; attempt++) {
    const code = generate();
    const exists = await prisma.subscription.findUnique({
      where: { uniqueCode: code },
      select: { id: true },
    });
    if (!exists) return code;
  }
  throw new Error("Failed to generate unique code");
}
