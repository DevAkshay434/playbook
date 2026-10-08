import { isAdmin, isManager } from "@/lib/auth";
import { requireActiveDbUser } from "@/lib/server-auth";
import Link from "next/link";
import { redirect } from "next/navigation";
import AdminNav from "./AdminNav";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { dbUser } = await requireActiveDbUser();

  const role = dbUser.role;
  if (!isManager(role)) {
    return (
      <div className="p-10 text-center">
        <h1>Unauthorized</h1>
        <p>You do not have permission to view the admin dashboard.</p>
        <Link href="/" className="text-[var(--accent)] hover:underline">Return to Playbook</Link>
      </div>
    );
  }

  const adminNav = [
    { name: "Dashboard", href: "/admin" },
    { name: "Playbooks", href: "/admin/playbooks" },
    { name: "Resolutions", href: "/admin/resolutions" },
    { name: "Knowledge Base", href: "/admin/knowledge-base" },
    { name: "Historical Cases", href: "/admin/historical-cases" },
    { name: "Analytics", href: "/admin/analytics" },
    ...(isAdmin(role) ? [{ name: "Users", href: "/admin/users" }] : []),
  ];

  return (
    <div className="max-w-[1180px] mx-auto py-[26px] px-[20px] pb-[80px] grid grid-cols-1 md:grid-cols-[186px_minmax(0,1fr)] gap-[22px] md:gap-[36px] items-start">
      <AdminNav navItems={adminNav} isAdminRole={isAdmin(role)} />
      <main className="flex flex-col min-w-0">
        {children}
      </main>
    </div>
  );
}
