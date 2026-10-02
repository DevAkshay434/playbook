"use server";
import { prisma } from "@/lib/prisma";
import { isDbConnected } from "@/lib/db-services";
import { auth, isAdmin } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function updateUserRole(userId: string, role: "AGENT" | "MANAGER" | "ADMIN") {
  const session = await auth();
  if (!isAdmin((session?.user as any)?.role)) {
    throw new Error("Unauthorized");
  }

  if (isDbConnected) {
    await prisma.user.update({
      where: { id: userId },
      data: { role }
    });
    revalidatePath("/admin/users");
  }
}

export async function toggleUserActive(userId: string, active: boolean) {
  const session = await auth();
  if (!isAdmin((session?.user as any)?.role)) {
    throw new Error("Unauthorized");
  }

  if (isDbConnected) {
    // Prevent deactivating the last active admin
    if (!active) {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (user?.role === "ADMIN") {
        const adminCount = await prisma.user.count({ where: { role: "ADMIN", active: true } });
        if (adminCount <= 1) {
          throw new Error("Cannot deactivate the last active admin.");
        }
      }
    }

    await prisma.user.update({
      where: { id: userId },
      data: { active }
    });
    revalidatePath("/admin/users");
  }
}

import crypto from "crypto";

export async function createUserWithInvite(name: string, email: string, role: "AGENT" | "MANAGER" | "ADMIN") {
  const session = await auth();
  if (!isAdmin((session?.user as any)?.role)) throw new Error("Unauthorized");

  const lowerEmail = email.toLowerCase().trim();
  
  let user = await prisma.user.findUnique({ where: { email: lowerEmail } });
  if (!user) {
    user = await prisma.user.create({
      data: { name, email: lowerEmail, role, active: true }
    });
  } else {
    // If exists, just update role and make sure it's active
    user = await prisma.user.update({
      where: { id: user.id },
      data: { name, role, active: true }
    });
  }

  return generateInviteForUser(user.id, "INVITE", (session?.user as any)?.id);
}

export async function generateResetLink(userId: string) {
  const session = await auth();
  if (!isAdmin((session?.user as any)?.role)) throw new Error("Unauthorized");
  return generateInviteForUser(userId, "RESET", (session?.user as any)?.id);
}

async function generateInviteForUser(userId: string, type: "INVITE" | "RESET", createdByUserId?: string) {
  const token = crypto.randomBytes(32).toString("hex");
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
  
  // Invalidate previous active invites for this user
  await prisma.userInvite.updateMany({
    where: { userId, usedAt: null, expiresAt: { gt: new Date() } },
    data: { usedAt: new Date() } // Mark old as used/invalidated
  });

  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 48); // 48 hour expiry

  await prisma.userInvite.create({
    data: {
      userId,
      tokenHash,
      type,
      expiresAt,
      createdByUserId
    }
  });

  revalidatePath("/admin/users");
  
  // Return the raw token ONLY once so the admin can copy it
  return token;
}
