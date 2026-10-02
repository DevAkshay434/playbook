import { auth, isAdmin, isManager } from "@/lib/auth";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session || !session.user) {
    redirect("/login");
  }

  const role = (session.user as any).role;
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
    { name: "Analytics", href: "/admin/analytics" },
    ...(isAdmin(role) ? [{ name: "Users", href: "/admin/users" }] : []),
  ];

  return (
    <div className="max-w-[1180px] mx-auto py-[26px] px-[20px] pb-[80px] grid grid-cols-1 md:grid-cols-[186px_minmax(0,1fr)] gap-[22px] md:gap-[36px] items-start">
      <nav className="sticky top-[118px] flex flex-row flex-wrap md:flex-col gap-[6px] md:gap-[2px] border border-[var(--line)] rounded-[var(--radius)] p-[10px] md:p-0 md:border-0 md:bg-transparent bg-[var(--surface)]" aria-label="Admin Sections">
        <h3 className="font-display font-semibold text-[10px] tracking-[0.16em] uppercase text-[var(--ink-3)] px-[9px] mb-[4px] hidden md:block">Admin</h3>
        {adminNav.map((item) => (
          <Link key={item.name} href={item.href} className="font-display font-semibold text-[12px] tracking-[0.02em] text-[var(--ink-2)] no-underline px-[9px] py-[6px] rounded-[6px] flex justify-between gap-[8px] hover:bg-[var(--surface-2)] hover:text-[var(--ink)]">
            {item.name}
          </Link>
        ))}
        <hr className="hidden md:block border-0 border-t border-[var(--line)] my-[10px] mx-[2px]" />
        <Link href="/" className="font-display font-semibold text-[12px] tracking-[0.02em] text-[var(--accent)] no-underline px-[9px] py-[6px] rounded-[6px] flex justify-between gap-[8px] hover:bg-[var(--surface-2)]">
          Back to Playbooks
        </Link>
      </nav>
      <main className="flex flex-col min-w-0">
        {children}
      </main>
    </div>
  );
}
