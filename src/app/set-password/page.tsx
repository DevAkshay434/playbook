import SetPasswordForm from "./SetPasswordForm";

export default async function SetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams;
  const token = params?.token as string;

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--ground)] p-[20px]">
      <div className="max-w-[400px] w-full bg-[var(--surface)] border border-[var(--line)] rounded-[var(--radius)] p-[30px] flex flex-col gap-[20px] shadow-[var(--shadow)] text-center">
        <div>
          <h1 className="font-display font-bold text-[20px] tracking-[-0.02em] text-[var(--ink)] mb-[5px]">SoftPro Support Playbook</h1>
          <p className="text-[14px] text-[var(--ink-2)]">Set Your Password</p>
        </div>

        {!token ? (
          <div className="text-[13px] text-[var(--stop)] bg-[var(--stop-soft)] p-[12px] rounded-[6px] border border-[var(--stop)] font-medium">
            Missing invitation token. Please check your link.
          </div>
        ) : (
          <SetPasswordForm token={token} />
        )}
      </div>
    </div>
  );
}
