"use client";

import React, { Suspense } from "react";
import Link from "next/link";
import SearchBar from "../search/SearchBar";

function HeaderContent() {
  return (
    <div className="max-w-[1180px] mx-auto w-full py-3 px-5 flex items-center gap-[18px] flex-wrap">
      <Link href="/" className="flex items-baseline gap-[9px] shrink-0 no-underline">
        <b className="font-display font-bold text-base tracking-[-0.01em] text-[var(--ink)]">
          Field Playbook
        </b>
        <span className="font-display font-semibold text-[10px] tracking-[0.14em] uppercase text-[var(--ink-3)]">
          SoftPro / QWT Customer Service
        </span>
      </Link>
      <div className="flex-1 min-w-0 basis-[320px] relative flex items-center">
        <SearchBar />
      </div>
    </div>
  );
}

export default function Header() {
  return (
    <header className="sticky top-0 z-40 bg-[var(--surface)] border-b border-[var(--line)] flex flex-col">
      <Suspense fallback={<div className="h-[60px]" />}>
        <HeaderContent />
      </Suspense>
      <div id="header-filter-portal"></div>
    </header>
  );
}
