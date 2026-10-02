"use client";

import { useState } from "react";
import { createUserWithInvite, generateResetLink, toggleUserActive, updateUserRole } from "@/app/actions/user";

export default function UserManager({ initialUsers, appUrl }: { initialUsers: any[], appUrl: string }) {
  const [users, setUsers] = useState(initialUsers);
  const [inviteLink, setInviteLink] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleAddUser = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setInviteLink("");
    setSuccessMsg("");
    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const role = formData.get("role") as "AGENT" | "MANAGER" | "ADMIN";

    try {
      const token = await createUserWithInvite(name, email, role);
      setInviteLink(`${appUrl}/set-password?token=${token}`);
      setSuccessMsg("Invitation created successfully.");
      // We rely on revalidatePath in the action, but since we are replacing state locally or reloading, we can just reload
      window.location.reload();
    } catch (err: any) {
      setError(err.message || "Failed to create user");
    }
    setLoading(false);
  };

  const handleResetLink = async (userId: string) => {
    if (!confirm("Are you sure you want to generate a new reset link? Old links will be invalidated.")) return;
    setLoading(true);
    setInviteLink("");
    setSuccessMsg("");
    setError("");
    try {
      const token = await generateResetLink(userId);
      setInviteLink(`${appUrl}/set-password?token=${token}`);
      setSuccessMsg("Password reset link generated successfully.");
    } catch(err: any) {
      setError(err.message || "Failed to generate link");
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col gap-[20px]">
      <div className="flex flex-col gap-[3px] mb-[10px]">
        <h2 className="text-[26px] font-bold tracking-[-0.015em]">User Management</h2>
        <p className="text-[var(--ink-2)] text-[13.5px]">Manage roles and access for the playbook.</p>
      </div>

      <div className="bg-[var(--surface)] border border-[var(--line)] rounded-[var(--radius)] p-[20px]">
        <h3 className="font-display font-bold text-[14px] tracking-wide mb-[15px]">Add User</h3>
        <form onSubmit={handleAddUser} className="flex flex-col sm:flex-row gap-[10px] items-start sm:items-end">
          <div className="flex flex-col gap-[5px] flex-1">
            <label className="text-[10px] font-bold text-[var(--ink-3)] uppercase tracking-widest">Name</label>
            <input name="name" required className="p-[8px] rounded-[4px] border border-[var(--line)] bg-[var(--ground)] text-[13px]" placeholder="Jane Doe" />
          </div>
          <div className="flex flex-col gap-[5px] flex-1">
            <label className="text-[10px] font-bold text-[var(--ink-3)] uppercase tracking-widest">Email</label>
            <input name="email" type="email" required className="p-[8px] rounded-[4px] border border-[var(--line)] bg-[var(--ground)] text-[13px]" placeholder="jane@example.com" />
          </div>
          <div className="flex flex-col gap-[5px]">
            <label className="text-[10px] font-bold text-[var(--ink-3)] uppercase tracking-widest">Role</label>
            <select name="role" className="p-[8px] rounded-[4px] border border-[var(--line)] bg-[var(--ground)] text-[13px]">
              <option value="AGENT">Agent</option>
              <option value="MANAGER">Manager</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>
          <button type="submit" disabled={loading} className="bg-[var(--navy)] text-white text-[13px] font-bold p-[9px_15px] rounded-[4px] hover:bg-[var(--accent)] disabled:opacity-50 mt-[10px] sm:mt-0">
            {loading ? "Creating..." : "Create User"}
          </button>
        </form>

        {error && <div className="mt-[15px] text-[13px] text-[var(--stop)]">{error}</div>}
        
        {inviteLink && (
          <div className="mt-[15px] p-[15px] bg-[var(--ok-soft)] border border-[var(--ok)] rounded-[6px]">
            <div className="font-bold text-[var(--ok)] mb-[5px]">{successMsg}</div>
            <p className="text-[12px] mb-[10px]">Securely share this link with the user. It will expire in 48 hours and can only be used once.</p>
            <div className="flex gap-[10px]">
              <input readOnly value={inviteLink} className="flex-1 p-[8px] rounded-[4px] border border-[var(--ok)] bg-white text-[12px] font-mono" />
              <button onClick={() => navigator.clipboard.writeText(inviteLink)} className="bg-white border border-[var(--ok)] text-[var(--ok)] font-bold text-[12px] p-[8px_12px] rounded-[4px] hover:bg-[var(--ok-soft)]">
                Copy Link
              </button>
            </div>
          </div>
        )}
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
            {initialUsers.map((u) => (
              <tr key={u.id} className="[&:last-child_td]:border-b-0 hover:bg-[var(--ground)]">
                <td className="text-left p-[10px_14px] border-b border-[var(--line-soft)]">
                  <div className="flex flex-col">
                    <span className="font-semibold">{u.name || "Unknown"}</span>
                    <span className="text-[12px] text-[var(--ink-3)]">{u.email}</span>
                  </div>
                </td>
                <td className="text-left p-[10px_14px] border-b border-[var(--line-soft)]">
                  <form action={async (formData) => {
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
                  <div className="flex items-center gap-[10px]">
                    <form action={async () => {
                      await toggleUserActive(u.id, !u.active);
                    }}>
                      <button type="submit" className="text-[var(--accent)] hover:underline font-mono text-[12px] bg-transparent border-0 cursor-pointer p-0">
                        {u.active ? "Deactivate" : "Activate"}
                      </button>
                    </form>
                    <span className="text-[var(--line)]">|</span>
                    <button 
                      onClick={() => handleResetLink(u.id)}
                      className="text-[var(--navy)] hover:underline font-mono text-[12px] bg-transparent border-0 cursor-pointer p-0"
                    >
                      Reset Link
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
