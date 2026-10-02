import { prisma } from "@/lib/prisma";
import { isDbConnected } from "@/lib/db-services";
import { auth, isAdmin } from "@/lib/auth";
import { redirect } from "next/navigation";
import { toggleUserActive, updateUserRole } from "@/app/actions/user";

export default async function UsersAdminPage() {
  const session = await auth();
  if (!isAdmin((session?.user as any)?.role)) {
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

  return (
    <div className="flex flex-col gap-[20px]">
      <div className="flex flex-col gap-[3px] mb-[10px]">
        <h2 className="text-[26px] font-bold tracking-[-0.015em]">User Management</h2>
        <p className="text-[var(--ink-2)] text-[13.5px]">Manage roles and access for the playbook.</p>
      </div>

      <div className="overflow-x-auto border border-[var(--line)] rounded-[var(--radius)] bg-[var(--surface)]">
        <table className="w-full min-w-[560px] border-collapse text-[13.5px]">
          <thead>
            <tr>
              <th className="text-left p-[10px_14px] border-b border-[var(--line)] font-display font-bold text-[10px] tracking-[0.12em] uppercase text-[var(--ink-3)] bg-[var(--surface-2)]">Name / Email</th>
              <th className="text-left p-[10px_14px] border-b border-[var(--line)] font-display font-bold text-[10px] tracking-[0.12em] uppercase text-[var(--ink-3)] bg-[var(--surface-2)]">Role</th>
              <th className="text-left p-[10px_14px] border-b border-[var(--line)] font-display font-bold text-[10px] tracking-[0.12em] uppercase text-[var(--ink-3)] bg-[var(--surface-2)]">Status</th>
              <th className="text-left p-[10px_14px] border-b border-[var(--line)] font-display font-bold text-[10px] tracking-[0.12em] uppercase text-[var(--ink-3)] bg-[var(--surface-2)]">Created</th>
              <th className="text-left p-[10px_14px] border-b border-[var(--line)] font-display font-bold text-[10px] tracking-[0.12em] uppercase text-[var(--ink-3)] bg-[var(--surface-2)]">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="[&:last-child_td]:border-b-0 hover:bg-[var(--ground)]">
                <td className="text-left p-[10px_14px] border-b border-[var(--line-soft)]">
                  <div className="flex flex-col">
                    <span className="font-semibold">{u.name || "Unknown"}</span>
                    <span className="text-[12px] text-[var(--ink-3)]">{u.email}</span>
                  </div>
                </td>
                <td className="text-left p-[10px_14px] border-b border-[var(--line-soft)]">
                  <form action={async (formData) => {
                    "use server";
                    const role = formData.get("role") as any;
                    await updateUserRole(u.id, role);
                  }} className="flex items-center gap-[4px]">
                    <select name="role" defaultValue={u.role} className="bg-transparent border border-[var(--line)] rounded-[4px] px-[4px] py-[2px] font-display text-[10px] tracking-[0.05em] uppercase outline-none focus:border-[var(--accent)]">
                      <option value="AGENT">Agent</option>
                      <option value="MANAGER">Manager</option>
                      <option value="ADMIN">Admin</option>
                    </select>
                    <button type="submit" className="text-[10px] bg-[var(--surface-2)] border border-[var(--line)] rounded-[4px] px-[6px] py-[2px]">Save</button>
                  </form>
                </td>
                <td className="text-left p-[10px_14px] border-b border-[var(--line-soft)]">
                  <span className={`font-display font-bold text-[9px] tracking-[0.1em] uppercase rounded-[4px] px-[7px] py-[3px] ${u.active ? "bg-[var(--ok-soft)] text-[var(--ok)]" : "bg-[var(--stop-soft)] text-[var(--stop)]"}`}>
                    {u.active ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="text-left p-[10px_14px] border-b border-[var(--line-soft)] font-mono text-[11px] text-[var(--ink-3)]">
                  {new Date(u.createdAt).toLocaleDateString()}
                </td>
                <td className="text-left p-[10px_14px] border-b border-[var(--line-soft)]">
                  <form action={async () => {
                    "use server";
                    await toggleUserActive(u.id, !u.active);
                  }}>
                    <button type="submit" className="text-[var(--accent)] hover:underline font-mono text-[12px] bg-transparent border-0 cursor-pointer p-0">
                      {u.active ? "Deactivate" : "Activate"}
                    </button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
