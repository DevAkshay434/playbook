"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import SearchResults from "../search/SearchResults";
import AddResolution from "../resolution/AddResolution";
import SearchBar from "../search/SearchBar";
import PlaybookDetail from "../playbook/PlaybookDetail";

export default function HomeClient({
  query,
  playbooks,
  categories,
  authorityRules,
  policies,
  tools,
}: {
  query: string;
  playbooks: any[];
  categories: any[];
  authorityRules: any[];
  policies: any[];
  tools: any[];
}) {
  const [searchQuery, setSearchQuery] = useState(query);
  const [selectedAuthorities, setSelectedAuthorities] = useState<Set<string>>(new Set());
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set());

  useEffect(() => {
    setSearchQuery(query);
  }, [query]);

  const toggleAuthority = (auth: string) => {
    setSelectedAuthorities((prev) => {
      const next = new Set(prev);
      if (next.has(auth)) next.delete(auth);
      else next.add(auth);
      return next;
    });
  };

  const toggleCategory = (slug: string) => {
    setSelectedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });
  };

  // Map category slugs to shorter labels matching Claude artifact
  const categoryLabels: Record<string, string> = {
    freight: "Shipping & freight",
    product: "Product & install",
    tech: "Technical",
    money: "Returns & money",
    sales: "Sales",
  };

  const filteredPlaybooks = playbooks.filter((p) => {
    const okL = selectedAuthorities.size === 0 || selectedAuthorities.has(p.authority.toLowerCase());
    const okS = selectedCategories.size === 0 || selectedCategories.has(p.category?.slug) || selectedCategories.has(p.categoryId);
    return okL && okS;
  });

  const totalFiltered = filteredPlaybooks.length;

  const filterStrip = (
    <div className="filters max-w-[1180px] mx-auto pb-[12px] px-[20px] flex gap-[7px] flex-wrap items-center bg-[var(--surface)]">
      <button
        onClick={() => toggleAuthority("resolve")}
        aria-pressed={selectedAuthorities.has("resolve")}
        className={`font-display font-semibold text-[11px] tracking-[0.06em] uppercase border border-[var(--line)] rounded-full px-[11px] py-[5px] transition-colors cursor-pointer ${
          selectedAuthorities.has("resolve")
            ? "bg-[var(--ok)] border-[var(--ok)] text-white"
            : "bg-[var(--ground)] text-[var(--ink-2)] hover:border-[var(--ink-3)]"
        }`}
      >
        <span
          className={`w-[7px] h-[7px] rounded-full inline-block mr-[6px] align-[1px] ${
            selectedAuthorities.has("resolve") ? "bg-white opacity-65" : "bg-[var(--ok)]"
          }`}
        ></span>
        Handle it
      </button>
      <button
        onClick={() => toggleAuthority("judge")}
        aria-pressed={selectedAuthorities.has("judge")}
        className={`font-display font-semibold text-[11px] tracking-[0.06em] uppercase border border-[var(--line)] rounded-full px-[11px] py-[5px] transition-colors cursor-pointer ${
          selectedAuthorities.has("judge")
            ? "bg-[var(--warn)] border-[var(--warn)] text-white"
            : "bg-[var(--ground)] text-[var(--ink-2)] hover:border-[var(--ink-3)]"
        }`}
      >
        <span
          className={`w-[7px] h-[7px] rounded-full inline-block mr-[6px] align-[1px] ${
            selectedAuthorities.has("judge") ? "bg-white opacity-65" : "bg-[var(--warn)]"
          }`}
        ></span>
        Your call
      </button>
      <button
        onClick={() => toggleAuthority("escalate")}
        aria-pressed={selectedAuthorities.has("escalate")}
        className={`font-display font-semibold text-[11px] tracking-[0.06em] uppercase border border-[var(--line)] rounded-full px-[11px] py-[5px] transition-colors cursor-pointer ${
          selectedAuthorities.has("escalate")
            ? "bg-[var(--stop)] border-[var(--stop)] text-white"
            : "bg-[var(--ground)] text-[var(--ink-2)] hover:border-[var(--ink-3)]"
        }`}
      >
        <span
          className={`w-[7px] h-[7px] rounded-full inline-block mr-[6px] align-[1px] ${
            selectedAuthorities.has("escalate") ? "bg-white opacity-65" : "bg-[var(--stop)]"
          }`}
        ></span>
        Escalate
      </button>

      <span className="w-[1px] h-[20px] bg-[var(--line)] mx-[4px]"></span>

      {categories.map((c: any) => (
        <button
          key={c.id}
          onClick={() => toggleCategory(c.slug)}
          aria-pressed={selectedCategories.has(c.slug)}
          className={`font-display font-semibold text-[11px] tracking-[0.06em] uppercase border border-[var(--line)] rounded-full px-[11px] py-[5px] transition-colors cursor-pointer ${
            selectedCategories.has(c.slug)
              ? "bg-[var(--navy)] border-[var(--navy)] text-white"
              : "bg-[var(--ground)] text-[var(--ink-2)] hover:border-[var(--ink-3)]"
          }`}
        >
          {categoryLabels[c.slug] || c.name}
        </button>
      ))}

      <span className="w-[1px] h-[20px] bg-[var(--line)] mx-[4px]"></span>
      <span className="font-mono text-[11.5px] text-[var(--ink-3)]">
        {selectedAuthorities.size > 0 || selectedCategories.size > 0 || searchQuery
          ? `${totalFiltered} of ${playbooks.length} playbooks`
          : `${playbooks.length} playbooks`}
      </span>
    </div>
  );

  return (
    <>
      <header className="sticky top-0 z-40 bg-[var(--surface)] border-b border-[var(--line)] flex flex-col w-full">
        <Suspense fallback={<div className="h-[60px]" />}>
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
              <SearchBar value={searchQuery} onChange={setSearchQuery} />
            </div>
          </div>
        </Suspense>
        {filterStrip}
      </header>

      <div className="max-w-[1180px] mx-auto py-[26px] px-[20px] pb-[80px] grid grid-cols-1 md:grid-cols-[186px_minmax(0,1fr)] gap-[22px] md:gap-[36px] items-start">
        {/* Navigation Rail */}
        <nav
          className="sticky top-[118px] flex flex-row flex-wrap md:flex-col gap-[6px] md:gap-[2px] border border-[var(--line)] rounded-[var(--radius)] p-[10px] md:p-0 md:border-0 md:bg-transparent bg-[var(--surface)]"
          aria-label="Sections"
        >
          <Link
            href="#start"
            className="font-display font-semibold text-[12px] tracking-[0.02em] text-[var(--ink-2)] no-underline px-[9px] py-[6px] rounded-[6px] flex justify-between gap-[8px] hover:bg-[var(--surface-2)] hover:text-[var(--ink)] w-full text-left"
          >
            How to use this
          </Link>
          <Link
            href="#authority"
            className="font-display font-semibold text-[12px] tracking-[0.02em] text-[var(--ink-2)] no-underline px-[9px] py-[6px] rounded-[6px] flex justify-between gap-[8px] hover:bg-[var(--surface-2)] hover:text-[var(--ink)] w-full text-left"
          >
            Authority limits
          </Link>

          <hr className="hidden md:block border-0 border-t border-[var(--line)] my-[10px] mx-[2px]" />

          {categories.map((c: any) => {
            const count = playbooks.filter(
              (p) => p.categoryId === c.id || p.category?.slug === c.slug
            ).length;
            return (
              <Link
                key={c.id}
                href={`#cat-${c.slug}`}
                className="font-display font-semibold text-[12px] tracking-[0.02em] text-[var(--ink-2)] no-underline px-[9px] py-[6px] rounded-[6px] flex justify-between gap-[8px] hover:bg-[var(--surface-2)] hover:text-[var(--ink)] w-full text-left"
              >
                {c.name}{" "}
                <span className="font-mono text-[10.5px] opacity-60 text-right min-w-[14px]">
                  {count}
                </span>
              </Link>
            );
          })}

          <hr className="hidden md:block border-0 border-t border-[var(--line)] my-[10px] mx-[2px]" />

          <Link
            href="#policies"
            className="font-display font-semibold text-[12px] tracking-[0.02em] text-[var(--ink-2)] no-underline px-[9px] py-[6px] rounded-[6px] flex justify-between gap-[8px] hover:bg-[var(--surface-2)] hover:text-[var(--ink)] w-full text-left"
          >
            Policy quick ref
          </Link>
          <Link
            href="#tools"
            className="font-display font-semibold text-[12px] tracking-[0.02em] text-[var(--ink-2)] no-underline px-[9px] py-[6px] rounded-[6px] flex justify-between gap-[8px] hover:bg-[var(--surface-2)] hover:text-[var(--ink)] w-full text-left"
          >
            Where things live
          </Link>
          <Link
            href="#contribute"
            className="font-display font-semibold text-[12px] tracking-[0.02em] text-[var(--accent)] no-underline px-[9px] py-[6px] rounded-[6px] flex justify-between gap-[8px] hover:bg-[var(--surface-2)] w-full text-left"
          >
            Add a resolution
          </Link>
        </nav>

        <main className="flex flex-col gap-[64px] min-w-0">
          {!searchQuery && (
            <section id="start" className="flex flex-col gap-[13px] scroll-mt-[124px]">
              <div className="bg-[var(--surface)] border border-[var(--line)] rounded-[var(--radius)] p-[22px] flex flex-col gap-[16px] shadow-[var(--shadow)]">
                <div>
                  <h1 className="text-[26px] font-bold tracking-[-0.02em] leading-[1.2]">
                    Answer it yourself. Escalate only what actually needs Heather.
                  </h1>
                </div>
                <p className="text-[var(--ink-2)] text-[14.5px] max-w-[64ch]">
                  Every entry below is a situation we have already worked through, with the decision
                  already made. Search what the customer said — not what we call it internally — and the
                  entry tells you the facts, the steps, and the words. If an entry says{" "}
                  <strong>Handle it</strong>, you do not need approval. Asking anyway is what slows the
                  queue down.
                </p>
                <div className="grid grid-cols-[repeat(auto-fit,minmax(210px,1fr))] gap-[10px]">
                  <div className="bg-[var(--ok-soft)] border border-[var(--line-soft)] border-l-[3px] border-l-[var(--ok)] rounded-[5px] p-[12px_14px] flex flex-col gap-[5px]">
                    <h4 className="font-display text-[11px] font-bold tracking-[0.1em] uppercase text-[var(--ok)]">
                      Handle it
                    </h4>
                    <p className="text-[13px] text-[var(--ink-2)]">
                      Decision is already made and written down. Do it, log it on the ticket, move on. No
                      approval needed.
                    </p>
                  </div>
                  <div className="bg-[var(--warn-soft)] border border-[var(--line-soft)] border-l-[3px] border-l-[var(--warn)] rounded-[5px] p-[12px_14px] flex flex-col gap-[5px]">
                    <h4 className="font-display text-[11px] font-bold tracking-[0.1em] uppercase text-[var(--warn)]">
                      Your call, inside the limits
                    </h4>
                    <p className="text-[13px] text-[var(--ink-2)]">
                      You choose, as long as you stay under the limits in the next section. Note your
                      reasoning on the ticket.
                    </p>
                  </div>
                  <div className="bg-[var(--stop-soft)] border border-[var(--line-soft)] border-l-[3px] border-l-[var(--stop)] rounded-[5px] p-[12px_14px] flex flex-col gap-[5px]">
                    <h4 className="font-display text-[11px] font-bold tracking-[0.1em] uppercase text-[var(--stop)]">
                      Escalate
                    </h4>
                    <p className="text-[13px] text-[var(--ink-2)]">
                      Stop and route it. These carry legal, chargeback, or policy consequences that
                      outrank speed.
                    </p>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Authority Limits - ALWAYS VISIBLE */}
          <section id="authority" className="flex flex-col gap-[13px] scroll-mt-[124px]">
            <div className="flex flex-col gap-[3px]">
              <span className="font-display font-semibold text-[10px] tracking-[0.16em] uppercase text-[var(--accent)]">
                The part that stops the questions
              </span>
              <h2 className="text-[21px] font-bold tracking-[-0.015em]">Authority limits</h2>
              <p className="text-[var(--ink-2)] text-[13.5px]">
                What you can approve without asking. If the ask fits in a green row, do it — do not send
                it up.
              </p>
            </div>
            <div className="overflow-x-auto border border-[var(--line)] rounded-[var(--radius)] bg-[var(--surface)]">
              <table className="w-full min-w-[560px] border-collapse text-[13.5px]">
                <thead>
                  <tr>
                    <th className="text-left p-[10px_14px] border-b border-[var(--line)] font-display font-bold text-[10px] tracking-[0.12em] uppercase text-[var(--ink-3)] bg-[var(--surface-2)]">
                      Action
                    </th>
                    <th className="text-left p-[10px_14px] border-b border-[var(--line)] font-display font-bold text-[10px] tracking-[0.12em] uppercase text-[var(--ink-3)] bg-[var(--surface-2)]">
                      Who can approve
                    </th>
                    <th className="text-left p-[10px_14px] border-b border-[var(--line)] font-display font-bold text-[10px] tracking-[0.12em] uppercase text-[var(--ink-3)] bg-[var(--surface-2)]">
                      Ceiling
                    </th>
                    <th className="text-left p-[10px_14px] border-b border-[var(--line)] font-display font-bold text-[10px] tracking-[0.12em] uppercase text-[var(--ink-3)] bg-[var(--surface-2)]">
                      Condition
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {authorityRules.map((rule: any) => (
                    <tr key={rule.id || rule.action} className="[&:last-child_td]:border-b-0">
                      <td className="text-left p-[10px_14px] border-b border-[var(--line-soft)] align-top font-semibold">
                        {rule.action}
                      </td>
                      <td className="text-left p-[10px_14px] border-b border-[var(--line-soft)] align-top">
                        {rule.who}
                      </td>
                      <td className="text-left p-[10px_14px] border-b border-[var(--line-soft)] align-top font-mono font-bold text-[var(--ink)]">
                        {rule.ceiling}
                      </td>
                      <td className="text-left p-[10px_14px] border-b border-[var(--line-soft)] align-top">
                        {rule.cond}
                        {rule.confirm && (
                          <span className="inline-block font-display font-bold text-[9px] tracking-[0.1em] uppercase text-[var(--warn)] bg-[var(--warn-soft)] rounded-[3px] p-[2px_5px] ml-[6px] align-[1px]">
                            confirm
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-[12.5px] text-[var(--ink-3)]">
              Rows marked{" "}
              <span className="inline-block font-display font-bold text-[9px] tracking-[0.1em] uppercase text-[var(--warn)] bg-[var(--warn-soft)] rounded-[3px] p-[2px_5px] align-[1px]">
                confirm
              </span>{" "}
              represent standard operating practices pending final policy schedule confirmation.
            </p>
          </section>

          {searchQuery ? (
            <SearchResults
              query={searchQuery}
              allPlaybooks={playbooks}
              categoryFilter={Array.from(selectedCategories)[0]}
              authorityFilter={Array.from(selectedAuthorities)[0]}
            />
          ) : (
            <>
              {/* Category Sections */}
              {categories.map((c: any) => {
                const categoryPlaybooks = filteredPlaybooks.filter(
                  (p) => p.categoryId === c.id || p.category?.slug === c.slug
                );

                if (categoryPlaybooks.length === 0) return null;

                return (
                  <section
                    key={c.id}
                    id={`cat-${c.slug}`}
                    className="flex flex-col gap-[13px] scroll-mt-[124px]"
                  >
                    <div className="flex flex-col gap-[3px]">
                      <span className="font-display font-semibold text-[10px] tracking-[0.16em] uppercase text-[var(--accent)]">
                        Playbooks
                      </span>
                      <h2 className="text-[21px] font-bold tracking-[-0.015em]">{c.name}</h2>
                    </div>
                    <div className="flex flex-col gap-[10px]">
                      {categoryPlaybooks.map((p) => {
                        let authClass = "";
                        let badgeClass = "";
                        const pAuth = p.authority?.toLowerCase();
                        if (pAuth === "resolve") {
                          authClass = "border-l-[var(--ok)]";
                          badgeClass = "bg-[var(--ok-soft)] text-[var(--ok)]";
                        } else if (pAuth === "judge") {
                          authClass = "border-l-[var(--warn)]";
                          badgeClass = "bg-[var(--warn-soft)] text-[var(--warn)]";
                        } else {
                          authClass = "border-l-[var(--stop)]";
                          badgeClass = "bg-[var(--stop-soft)] text-[var(--stop)]";
                        }

                        // Map internal authority string to display text
                        const displayAuth =
                          pAuth === "resolve"
                            ? "Handle it"
                            : pAuth === "judge"
                            ? "Your call"
                            : pAuth === "escalate"
                            ? "Escalate"
                            : p.authority;

                        return (
                          <details
                            key={p.id}
                            className={`bg-[var(--surface)] border border-[var(--line)] border-l-[3px] ${authClass} rounded-[var(--radius)] overflow-hidden group shadow-[var(--shadow)]`}
                          >
                            <summary className="w-full bg-transparent border-0 text-left cursor-pointer p-[14px_16px] flex gap-[13px] items-start hover:bg-[var(--surface-2)] focus-visible:outline-2 focus-visible:outline-[var(--accent)] focus-visible:-outline-offset-2 list-none [&::-webkit-details-marker]:hidden">
                              <div className="flex-none mt-[4px] w-[9px] h-[9px] border-r-[1.6px] border-b-[1.6px] border-[var(--ink-3)] -rotate-45 transition-transform duration-160 group-open:rotate-45" />
                              <div className="flex flex-col gap-[5px] min-w-0 flex-1">
                                <h3 className="text-[15.5px] font-semibold tracking-[-0.005em] leading-[1.35]">
                                  {p.title}
                                </h3>
                                {p.customerPhrases && p.customerPhrases.length > 0 && (
                                  <div className="text-[12.5px] text-[var(--ink-3)] italic">
                                    &ldquo;{p.customerPhrases[0]}&rdquo;
                                  </div>
                                )}
                              </div>
                              <div className="flex gap-[6px] flex-wrap items-center flex-none pt-[1px]">
                                <span
                                  className={`font-display font-bold text-[9.5px] tracking-[0.1em] uppercase rounded-[4px] px-[7px] py-[3px] whitespace-nowrap ${badgeClass}`}
                                >
                                  {displayAuth}
                                </span>
                              </div>
                            </summary>
                            <div className="p-[2px_16px_18px_16px] flex flex-col gap-[15px] border-t border-[var(--line-soft)] mt-0 pt-[16px]">
                              <PlaybookDetail playbook={p} />
                            </div>
                          </details>
                        );
                      })}
                    </div>
                  </section>
                );
              })}

              {totalFiltered === 0 && (
                <div className="border border-dashed border-[var(--line)] rounded-[var(--radius)] p-[34px_20px] text-center text-[var(--ink-3)] text-[14px]">
                  <p>Nothing matches that yet.</p>
                  <p className="mt-[8px]">
                    If you solved it anyway,{" "}
                    <Link
                      href="#contribute"
                      className="text-[var(--accent)] bg-transparent border-none p-0 cursor-pointer hover:underline"
                    >
                      write it up at the bottom
                    </Link>{" "}
                    — that is how this page grows.
                  </p>
                </div>
              )}

              {/* Policies */}
              <section id="policies" className="flex flex-col gap-[13px] scroll-mt-[124px]">
                <div className="flex flex-col gap-[3px]">
                  <span className="font-display font-semibold text-[10px] tracking-[0.16em] uppercase text-[var(--accent)]">
                    Source of truth
                  </span>
                  <h2 className="text-[21px] font-bold tracking-[-0.015em]">Policy quick reference</h2>
                  <p className="text-[var(--ink-2)] text-[13.5px]">
                    Quote the posted policy, not your memory of it. These are the six written store
                    policies live on the site.
                  </p>
                </div>
                <div className="overflow-x-auto border border-[var(--line)] rounded-[var(--radius)] bg-[var(--surface)]">
                  <table className="w-full min-w-[560px] border-collapse text-[13.5px]">
                    <thead>
                      <tr>
                        <th className="text-left p-[10px_14px] border-b border-[var(--line)] font-display font-bold text-[10px] tracking-[0.12em] uppercase text-[var(--ink-3)] bg-[var(--surface-2)]">
                          Policy
                        </th>
                        <th className="text-left p-[10px_14px] border-b border-[var(--line)] font-display font-bold text-[10px] tracking-[0.12em] uppercase text-[var(--ink-3)] bg-[var(--surface-2)]">
                          What agents get wrong
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {policies.map((pol: any) => (
                        <tr key={pol.id} className="[&:last-child_td]:border-b-0">
                          <td
                            className="text-left p-[10px_14px] border-b border-[var(--line-soft)] align-top"
                            dangerouslySetInnerHTML={{
                              __html: pol.policy
                                .replace(
                                  "Performance Satisfaction Guarantee",
                                  "<strong>Performance Satisfaction Guarantee</strong>"
                                )
                                .replace("Shipping", "<strong>Shipping</strong>")
                                .replace("Privacy", "<strong>Privacy</strong>")
                                .replace("Terms of Service", "<strong>Terms of Service</strong>")
                                .replace("Contact", "<strong>Contact</strong>")
                                .replace("Legal Notice", "<strong>Legal Notice</strong>"),
                            }}
                          ></td>
                          <td
                            className="text-left p-[10px_14px] border-b border-[var(--line-soft)] align-top"
                            dangerouslySetInnerHTML={{
                              __html: pol.note.replace("not", "<strong>not</strong>"),
                            }}
                          ></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>

              {/* Tools */}
              <section id="tools" className="flex flex-col gap-[13px] scroll-mt-[124px]">
                <div className="flex flex-col gap-[3px]">
                  <span className="font-display font-semibold text-[10px] tracking-[0.16em] uppercase text-[var(--accent)]">
                    Orientation
                  </span>
                  <h2 className="text-[21px] font-bold tracking-[-0.015em]">Where things live</h2>
                  <p className="text-[var(--ink-2)] text-[13.5px]">
                    Current operational stack and primary support tools.
                  </p>
                </div>
                <div className="grid grid-cols-[repeat(auto-fit,minmax(215px,1fr))] gap-[10px]">
                  {tools.map((tool: any) => (
                    <div
                      key={tool.id}
                      className="bg-[var(--surface)] border border-[var(--line)] rounded-[var(--radius)] p-[13px_15px] flex flex-col gap-[4px]"
                    >
                      <span className="font-display font-semibold text-[9.5px] tracking-[0.1em] uppercase text-[var(--accent)]">
                        {tool.role}
                      </span>
                      <h4 className="text-[14px] font-semibold">{tool.name}</h4>
                      <p
                        className="text-[13px] text-[var(--ink-2)]"
                        dangerouslySetInnerHTML={{
                          __html: tool.note.replace("blocked", "<strong>blocked</strong>"),
                        }}
                      ></p>
                    </div>
                  ))}
                </div>
              </section>

              {/* Add a resolution */}
              <section id="contribute" className="flex flex-col gap-[13px] scroll-mt-[124px]">
                <div className="flex flex-col gap-[3px]">
                  <span className="font-display font-semibold text-[10px] tracking-[0.16em] uppercase text-[var(--accent)]">
                    Keep it alive
                  </span>
                  <h2 className="text-[21px] font-bold tracking-[-0.015em]">Add a resolution</h2>
                  <p className="text-[var(--ink-2)] text-[13.5px]">
                    Solved something that isn&apos;t in here? Submit it below. Submissions go directly
                    to the manager review queue and are standardized into official playbook entries.
                  </p>
                </div>
                <AddResolution playbooks={playbooks} />
              </section>
            </>
          )}
        </main>
      </div>

      <footer className="max-w-[1180px] mx-auto pb-[46px] px-[20px] text-[var(--ink-3)] text-[12px] border-t border-[var(--line)] pt-[18px]">
        <p>
          SoftPro Water Systems / Quality Water Treatment — internal customer service playbook. Entries
          carry the date the position was last confirmed; if an entry is stale or wrong, say so rather
          than working around it.
        </p>
      </footer>
    </>
  );
}
