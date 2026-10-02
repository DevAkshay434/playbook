import { signIn } from "@/lib/auth";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const isDevAuthEnabled = process.env.NODE_ENV !== "production" && process.env.ENABLE_DEV_AUTH === "true";
  const isGoogleConfigured = !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
  const isMicrosoftConfigured = !!(process.env.MICROSOFT_CLIENT_ID && process.env.MICROSOFT_CLIENT_SECRET && process.env.MICROSOFT_TENANT_ID);
  
  const hasProdAuth = isGoogleConfigured || isMicrosoftConfigured;

  // Await searchParams properly
  const params = await searchParams;
  const errorParam = params?.error as string | undefined;

  let errorMessage = "";
  if (errorParam === "AccessDenied") {
    errorMessage = "Your account has not been authorized for the Support Playbook.";
  } else if (errorParam === "ForgotPassword") {
    errorMessage = "Please contact your Playbook administrator to reset your password.";
  } else if (errorParam === "CredentialsSignin") {
    errorMessage = "Invalid email or password.";
  } else if (errorParam) {
    errorMessage = "Invalid email or password.";
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--ground)] p-[20px]">
      <div className="max-w-[400px] w-full bg-[var(--surface)] border border-[var(--line)] rounded-[var(--radius)] p-[30px] flex flex-col gap-[20px] shadow-[var(--shadow)] text-center">
        <div>
          <h1 className="font-display font-bold text-[20px] tracking-[-0.02em] text-[var(--ink)] mb-[5px]">SoftPro Support Playbook</h1>
          <p className="text-[14px] text-[var(--ink-2)]">Internal support workspace</p>
        </div>

        {errorMessage && (
          <div className="text-[13px] text-[var(--stop)] bg-[var(--stop-soft)] p-[12px] rounded-[6px] border border-[var(--stop)] font-medium">
            {errorMessage}
          </div>
        )}

        <form
          action={async (formData) => {
            "use server";
            await signIn("production-credentials", {
              email: formData.get("email"),
              password: formData.get("password"),
              redirectTo: "/",
            });
          }}
          className="flex flex-col gap-[15px] text-left"
        >
          <div className="flex flex-col gap-[5px]">
            <label className="text-[12px] font-bold text-[var(--ink-2)] uppercase tracking-wider">Email</label>
            <input 
              name="email" 
              type="email" 
              required
              className="p-[10px] rounded-[6px] border border-[var(--line)] bg-[var(--ground)] text-[14px]"
            />
          </div>
          <div className="flex flex-col gap-[5px]">
            <div className="flex justify-between items-center">
              <label className="text-[12px] font-bold text-[var(--ink-2)] uppercase tracking-wider">Password</label>
            </div>
            <input 
              name="password" 
              type="password" 
              required
              className="p-[10px] rounded-[6px] border border-[var(--line)] bg-[var(--ground)] text-[14px]"
            />
            <div className="text-right mt-1">
              <a href="/login?error=ForgotPassword" className="text-[12px] text-[var(--navy)] hover:underline">
                Forgot password?
              </a>
            </div>
          </div>
          <button type="submit" className="w-full bg-[var(--navy)] text-white font-display font-bold text-[13px] tracking-[0.05em] uppercase rounded-[6px] p-[12px] hover:bg-[var(--accent)] transition-colors border-0 cursor-pointer mt-[5px]">
            Sign In
          </button>
        </form>

        {hasProdAuth && (
          <div className="relative flex items-center py-[10px]">
            <div className="flex-grow border-t border-[var(--line)]"></div>
            <span className="flex-shrink-0 mx-[10px] text-[12px] text-[var(--ink-3)] font-bold uppercase tracking-wider">OR</span>
            <div className="flex-grow border-t border-[var(--line)]"></div>
          </div>
        )}

        {isGoogleConfigured && (
          <form
            action={async () => {
              "use server";
              await signIn("google", { redirectTo: "/" });
            }}
          >
            <button type="submit" className="w-full bg-[var(--surface)] text-[var(--ink)] font-display font-bold text-[13px] tracking-[0.05em] uppercase rounded-[6px] p-[12px] hover:bg-[var(--surface-2)] transition-colors border border-[var(--line)] cursor-pointer flex justify-center items-center gap-2">
              <svg width="18" height="18" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
              Continue with Google
            </button>
          </form>
        )}

        {isMicrosoftConfigured && (
          <form
            action={async () => {
              "use server";
              await signIn("microsoft-entra-id", { redirectTo: "/" });
            }}
          >
            <button type="submit" className="w-full bg-[#0078D4] text-white font-display font-bold text-[13px] tracking-[0.05em] uppercase rounded-[6px] p-[12px] hover:bg-[#005A9E] transition-colors border-0 cursor-pointer flex justify-center items-center gap-2">
              <svg width="18" height="18" viewBox="0 0 21 21"><path fill="#f3f3f3" d="M0 0h10v10H0zM11 0h10v10H11zM0 11h10v10H0zM11 11h10v10H11z"/></svg>
              Continue with Microsoft
            </button>
          </form>
        )}

        {!hasProdAuth && !isDevAuthEnabled && (
          <div className="text-[14px] text-[var(--warn)] bg-[var(--warn-soft)] p-[12px] rounded-[6px]">
            Production authentication has not yet been configured. Please check back later.
          </div>
        )}

        {isDevAuthEnabled && (
          <div className="flex flex-col gap-[10px] mt-[20px] pt-[20px] border-t border-[var(--line)]">
            <span className="font-display text-[10px] uppercase text-[var(--ink-3)] tracking-widest">Development Mode</span>
            <form
              action={async () => {
                "use server";
                await signIn("credentials", { email: "agent@softprowatersystems.com", redirectTo: "/" });
              }}
            >
              <button type="submit" className="w-full bg-[var(--navy)] text-white font-display font-bold text-[13px] tracking-[0.05em] uppercase rounded-[6px] p-[10px] hover:bg-[var(--accent)] transition-colors border-0 cursor-pointer">
                Login as Agent
              </button>
            </form>

            <form
              action={async () => {
                "use server";
                await signIn("credentials", { email: "manager@softprowatersystems.com", redirectTo: "/" });
              }}
            >
              <button type="submit" className="w-full bg-[var(--surface-2)] text-[var(--ink)] font-display font-bold text-[13px] tracking-[0.05em] uppercase rounded-[6px] p-[10px] hover:bg-[var(--line)] border border-[var(--line)] transition-colors cursor-pointer">
                Login as Manager
              </button>
            </form>

            <form
              action={async () => {
                "use server";
                await signIn("credentials", { email: "admin@softprowatersystems.com", redirectTo: "/" });
              }}
            >
              <button type="submit" className="w-full bg-[var(--surface-2)] text-[var(--ink)] font-display font-bold text-[13px] tracking-[0.05em] uppercase rounded-[6px] p-[10px] hover:bg-[var(--line)] border border-[var(--line)] transition-colors cursor-pointer">
                Login as Admin
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
