import { prisma } from "@/lib/prisma";
import { isDbConnected } from "@/lib/db-services";
import { isAdmin } from "@/lib/auth";
import { requireActiveDbUser } from "@/lib/server-auth";
import { redirect } from "next/navigation";
import UserManager from "./UserManager";

export default async function UsersAdminPage() {
  const { dbUser } = await requireActiveDbUser();
  if (!isAdmin(dbUser.role)) {
    redirect("/admin");
  }

  let users: any[] = [];
  if (isDbConnected) {
    users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" }
    });
  } else {
    users = [
      { id: "1", name: "Admin User", email: "admin@softprowatersystems.com", role: "ADMIN", active: true, createdAt: new Date() },
      { id: "2", name: "Manager User", email: "manager@softprowatersystems.com", role: "MANAGER", active: true, createdAt: new Date() },
      { id: "3", name: "Agent User", email: "agent@softprowatersystems.com", role: "AGENT", active: true, createdAt: new Date() }
    ];
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  return <UserManager initialUsers={users} appUrl={appUrl} />;
}
