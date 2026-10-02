import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="max-w-[800px] mx-auto py-[40px] px-[20px] text-center">
      <div className="border border-dashed border-[var(--line)] rounded-[var(--radius)] p-[50px_20px] text-[var(--ink-3)] text-[14px] bg-[var(--surface)]">
        <h2 className="text-[26px] font-bold tracking-[-0.015em] text-[var(--ink)] mb-[10px]">Page Not Found</h2>
        <p className="mb-[20px]">We couldn't find the playbook or category you were looking for.</p>
        <Link href="/" className="inline-flex items-center gap-[4px] font-display font-semibold text-[12px] tracking-[0.05em] uppercase text-white bg-[var(--navy)] hover:bg-[var(--accent)] transition-colors rounded-[6px] px-[18px] py-[10px] no-underline">
          <ChevronLeft className="w-4 h-4" /> Return Home
        </Link>
      </div>
    </div>
  );
}
