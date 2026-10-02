"use client";

import { useState } from "react";
import { setPasswordWithToken } from "@/app/actions/auth";
import { useRouter } from "next/navigation";

export default function SetPasswordForm({ token }: { token: string }) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }
    if (password.length < 10) {
      setError("Password must be at least 10 characters");
      return;
    }

    setLoading(true);
    try {
      await setPasswordWithToken(token, password);
      setSuccess(true);
      setTimeout(() => {
        router.push("/login");
      }, 3000);
    } catch (err: any) {
      setError(err.message || "Failed to set password");
    }
    setLoading(false);
  };

  if (success) {
    return (
      <div className="text-center p-[20px] bg-[var(--ok-soft)] border border-[var(--ok)] rounded-[6px] text-[var(--ok)] font-medium text-[14px]">
        Password successfully created.<br/><br/>
        Redirecting you to sign in...
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-[15px] text-left">
      {error && (
        <div className="text-[13px] text-[var(--stop)] bg-[var(--stop-soft)] p-[12px] rounded-[6px] border border-[var(--stop)] font-medium">
          {error}
        </div>
      )}
      
      <div className="flex flex-col gap-[5px]">
        <label className="text-[12px] font-bold text-[var(--ink-2)] uppercase tracking-wider">New Password</label>
        <input 
          type="password" 
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={10}
          className="p-[10px] rounded-[6px] border border-[var(--line)] bg-[var(--ground)] text-[14px]"
        />
        <span className="text-[11px] text-[var(--ink-3)]">Minimum 10 characters</span>
      </div>

      <div className="flex flex-col gap-[5px]">
        <label className="text-[12px] font-bold text-[var(--ink-2)] uppercase tracking-wider">Confirm Password</label>
        <input 
          type="password" 
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          required
          minLength={10}
          className="p-[10px] rounded-[6px] border border-[var(--line)] bg-[var(--ground)] text-[14px]"
        />
      </div>

      <button type="submit" disabled={loading} className="w-full bg-[var(--navy)] text-white font-display font-bold text-[13px] tracking-[0.05em] uppercase rounded-[6px] p-[12px] hover:bg-[var(--accent)] transition-colors border-0 cursor-pointer mt-[5px] disabled:opacity-50">
        {loading ? "Saving..." : "Set Password"}
      </button>
    </form>
  );
}
