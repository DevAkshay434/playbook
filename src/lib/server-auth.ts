import { auth } from "./auth";
import { prisma } from "./prisma";
import { redirect } from "next/navigation";
import { cache } from "react";

export const requireActiveDbUser = cache(async () => {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  
  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user || !user.active) {
    redirect("/login?error=Deactivated");
  }
  return { session, dbUser: user };
});
