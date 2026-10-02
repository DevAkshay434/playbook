"use server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";

export async function setPasswordWithToken(token: string, password: string) {
  if (password.length < 10) {
    throw new Error("Password must be at least 10 characters long");
  }

  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

  const invite = await prisma.userInvite.findUnique({
    where: { tokenHash },
    include: { user: true }
  });

  if (!invite) {
    throw new Error("Invalid or expired link");
  }

  if (invite.usedAt) {
    throw new Error("This link has already been used");
  }

  if (invite.expiresAt < new Date()) {
    throw new Error("This link has expired");
  }

  if (!invite.user.active) {
    throw new Error("This account has been deactivated");
  }

  // Hash password
  const passwordHash = await bcrypt.hash(password, 12);

  // Transaction to update password and invalidate token
  await prisma.$transaction([
    prisma.user.update({
      where: { id: invite.userId },
      data: { passwordHash }
    }),
    prisma.userInvite.update({
      where: { id: invite.id },
      data: { usedAt: new Date() }
    })
  ]);

  return { success: true };
}
