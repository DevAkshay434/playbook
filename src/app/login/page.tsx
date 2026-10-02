import { signIn } from "@/lib/auth";

export default function LoginPage() {
  const isDevAuthEnabled = process.env.NODE_ENV !== "production" && process.env.ENABLE_DEV_AUTH === "true";

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--ground)] p-[20px]">
      <div className="max-w-[400px] w-full bg-[var(--surface)] border border-[var(--line)] rounded-[var(--radius)] p-[30px] flex flex-col gap-[20px] shadow-[var(--shadow)] text-center">
        <div>
          <h1 className="font-display font-bold text-[20px] tracking-[-0.02em] text-[var(--ink)] mb-[5px]">SoftPro Support Playbook</h1>
          <p className="text-[14px] text-[var(--ink-2)]">Internal support workspace</p>
        </div>
        
        {isDevAuthEnabled ? (
          <>
            <form
              action={async () => {
                "use server";
                await signIn("credentials", { email: "agent@softprowatersystems.com", redirectTo: "/" });
              }}
            >
              <button type="submit" className="w-full bg-[var(--navy)] text-white font-display font-bold text-[13px] tracking-[0.05em] uppercase rounded-[6px] p-[12px] hover:bg-[var(--accent)] transition-colors border-0 cursor-pointer">
                Continue as Agent
              </button>
            </form>

            <form
              action={async () => {
                "use server";
                await signIn("credentials", { email: "manager@softprowatersystems.com", redirectTo: "/" });
              }}
            >
              <button type="submit" className="w-full bg-[var(--surface-2)] text-[var(--ink)] font-display font-bold text-[13px] tracking-[0.05em] uppercase rounded-[6px] p-[12px] hover:bg-[var(--line)] border border-[var(--line)] transition-colors cursor-pointer">
                Continue as Manager
              </button>
            </form>

            <form
              action={async () => {
                "use server";
                await signIn("credentials", { email: "admin@softprowatersystems.com", redirectTo: "/" });
              }}
            >
              <button type="submit" className="w-full bg-[var(--surface-2)] text-[var(--ink)] font-display font-bold text-[13px] tracking-[0.05em] uppercase rounded-[6px] p-[12px] hover:bg-[var(--line)] border border-[var(--line)] transition-colors cursor-pointer">
                Continue as Admin
              </button>
            </form>
          </>
        ) : (
          <div className="text-[14px] text-[var(--warn)] bg-[var(--warn-soft)] p-[10px] rounded-[6px]">
            Production Authentication is not yet configured. Please check back later.
          </div>
        )}
      </div>
    </div>
  );
}
