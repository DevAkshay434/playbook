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
