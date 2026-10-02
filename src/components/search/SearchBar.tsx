"use client";

import { Search } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export default function SearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlQuery = searchParams.get("q") || "";
  const [query, setQuery] = useState(urlQuery);
  const [prevUrlQuery, setPrevUrlQuery] = useState(urlQuery);
  const inputRef = useRef<HTMLInputElement>(null);

  if (urlQuery !== prevUrlQuery) {
    setPrevUrlQuery(urlQuery);
    setQuery(urlQuery);
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "/" && document.activeElement !== inputRef.current) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
    
    // We update URL params to keep state in URL. 
    // Using a simple debounce for typing.
    const current = new URLSearchParams(Array.from(searchParams.entries()));
    if (newQuery) {
      current.set("q", newQuery);
    } else {
      current.delete("q");
    }
    
    // Replace state so we don't spam history
    const search = current.toString();
    const queryStr = search ? `?${search}` : "";
    router.replace(`/${queryStr}`, { scroll: false });
  };

  const handleClear = () => {
    setQuery("");
    const current = new URLSearchParams(Array.from(searchParams.entries()));
    current.delete("q");
    router.replace(`/${current.toString() ? `?${current.toString()}` : ""}`, { scroll: false });
    inputRef.current?.focus();
  };

  return (
    <>
      <Search className="absolute left-3 w-4 h-4 text-[var(--ink-3)] pointer-events-none" />
      <input
        ref={inputRef}
        type="search"
        value={query}
        onChange={handleChange}
        autoComplete="off"
        spellCheck="false"
        placeholder='Search what the customer said — "upside down", "meter not working", "wants a refund"...'
        className="w-full font-body text-[15px] text-[var(--ink)] bg-[var(--ground)] border border-[var(--line)] rounded-[var(--radius)] py-[9px] pr-[74px] pl-[36px] focus:outline focus:outline-2 focus:outline-[var(--accent)] focus:outline-offset-1 focus:border-transparent placeholder:text-[var(--ink-3)]"
      />
      {!query && (
        <span className="absolute right-[10px] flex gap-[5px] items-center font-mono text-[11px] text-[var(--ink-3)]">
          <kbd className="border border-[var(--line)] rounded-[4px] px-[5px] py-[1px] bg-[var(--surface)]">
            /
          </kbd>
        </span>
      )}
      {query && (
        <button
          onClick={handleClear}
          type="button"
          className="absolute right-[10px] border-0 bg-[var(--surface-2)] text-[var(--ink-2)] rounded-[4px] font-mono text-[11px] px-[7px] py-[3px] cursor-pointer hover:bg-[var(--line)] transition-colors"
        >
          clear
        </button>
      )}
    </>
  );
}
