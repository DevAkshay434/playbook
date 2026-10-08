"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

type NavItem = {
  name: string;
  href: string;
};

export default function AdminNav({ navItems, isAdminRole }: { navItems: NavItem[], isAdminRole: boolean }) {
  const pathname = usePathname();
  const [pendingHref, setPendingHref] = useState<string | null>(null);

  // Clear pending state when pathname changes
  useEffect(() => {
    setPendingHref(null);
  }, [pathname]);

  return (
    <nav className="sticky top-[118px] flex flex-row flex-wrap md:flex-col gap-[6px] md:gap-[2px] border border-[var(--line)] rounded-[var(--radius)] p-[10px] md:p-0 md:border-0 md:bg-transparent bg-[var(--surface)]" aria-label="Admin Sections">
      <h3 className="font-display font-semibold text-[10px] tracking-[0.16em] uppercase text-[var(--ink-3)] px-[9px] mb-[4px] hidden md:block">Admin</h3>
      
      {navItems.map((item) => {
        const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
        const isPending = pendingHref === item.href;
        
        return (
          <Link 
            key={item.name} 
            href={item.href}
            prefetch={true}
            onClick={() => {
              if (pathname !== item.href) {
                setPendingHref(item.href);
              }
            }}
            className={`font-display font-semibold text-[12px] tracking-[0.02em] no-underline px-[9px] py-[6px] rounded-[6px] flex justify-between items-center gap-[8px] cursor-pointer transition-colors ${
              isActive 
                ? "bg-[var(--surface-2)] text-[var(--ink)]" 
                : "text-[var(--ink-2)] hover:bg-[var(--surface-2)] hover:text-[var(--ink)]"
            } ${isPending ? 'opacity-70' : ''}`}
          >
            <span>{item.name}</span>
            {isPending && !isActive && (
              <svg className="animate-spin h-3 w-3 text-[var(--ink-3)] hidden md:block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            )}
          </Link>
        );
      })}
      
      <hr className="hidden md:block border-0 border-t border-[var(--line)] my-[10px] mx-[2px]" />
      
      <Link href="/" prefetch={true} className="font-display font-semibold text-[12px] tracking-[0.02em] text-[var(--accent)] no-underline px-[9px] py-[6px] rounded-[6px] flex justify-between gap-[8px] hover:bg-[var(--surface-2)]">
        Back to Playbooks
      </Link>
    </nav>
  );
}
