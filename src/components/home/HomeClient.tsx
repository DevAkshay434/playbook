"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import SearchResults from "../search/SearchResults";
import AddResolution from "../resolution/AddResolution";

export default function HomeClient({
  query,
  playbooks,
  categories,
  authorityRules,
  policies,
  tools
}: {
  query: string;
  playbooks: any[];
  categories: any[];
  authorityRules: any[];
  policies: any[];
  tools: any[];
}) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activeAuthority, setActiveAuthority] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const cat = params.get("category");
    const auth = params.get("authority");
    if (cat) setActiveCategory(cat);
    if (auth) setActiveAuthority(auth);
  }, []);

  const updateUrl = (cat: string | null, auth: string | null) => {
    const params = new URLSearchParams(window.location.search);
    if (cat) params.set("category", cat);
    else params.delete("category");
    
    if (auth) params.set("authority", auth);
    else params.delete("authority");

    const newUrl = params.toString() ? `?${params.toString()}` : window.location.pathname;
    window.history.replaceState(null, "", newUrl);
  };

  const handleCategoryClick = (slug: string) => {
    const newCat = activeCategory === slug ? null : slug;
    setActiveCategory(newCat);
    updateUrl(newCat, activeAuthority);
  };

  const handleAuthorityClick = (auth: string) => {
    const newAuth = activeAuthority === auth ? null : auth;
    setActiveAuthority(newAuth);
    updateUrl(activeCategory, newAuth);
  };

  const handleReset = () => {
    setActiveCategory(null);
    setActiveAuthority(null);
    updateUrl(null, null);
  };

  const filteredPlaybooks = playbooks.filter(p => {
    const catMatch = !activeCategory || p.category?.slug === activeCategory || p.categoryId === activeCategory;
    let authMatch = true;
    if (activeAuthority) {
      const pAuth = p.authority?.toLowerCase();
      if (activeAuthority === 'resolve') {
        authMatch = pAuth === 'handle it' || pAuth === 'handle_it';
      } else if (activeAuthority === 'judge') {
        authMatch = pAuth === 'your call' || pAuth === 'your_call';
      } else if (activeAuthority === 'escalate') {
        authMatch = pAuth === 'escalate' || pAuth === 'hard stop';
      }
    }
    return catMatch && authMatch;
  });

  const totalFiltered = filteredPlaybooks.length;

  return (
    <>
      <div className="max-w-[1180px] mx-auto pb-[12px] px-[20px] flex gap-[7px] flex-wrap items-center">
        <button 
          onClick={() => handleAuthorityClick('resolve')}
          aria-pressed={activeAuthority === 'resolve'}
          className={`font-display font-semibold text-[11px] tracking-[0.06em] uppercase border border-[var(--line)] rounded-full px-[11px] py-[5px] transition-colors cursor-pointer ${activeAuthority === 'resolve' ? 'bg-[var(--ok)] border-[var(--ok)] text-white' : 'bg-[var(--ground)] text-[var(--ink-2)] hover:border-[var(--ink-3)]'}`}>
          <span className={`w-[7px] h-[7px] rounded-full inline-block mr-[6px] align-[1px] ${activeAuthority === 'resolve' ? 'bg-white opacity-65' : 'bg-[var(--ok)]'}`}></span>Handle it
        </button>
        <button 
          onClick={() => handleAuthorityClick('judge')}
          aria-pressed={activeAuthority === 'judge'}
          className={`font-display font-semibold text-[11px] tracking-[0.06em] uppercase border border-[var(--line)] rounded-full px-[11px] py-[5px] transition-colors cursor-pointer ${activeAuthority === 'judge' ? 'bg-[var(--warn)] border-[var(--warn)] text-white' : 'bg-[var(--ground)] text-[var(--ink-2)] hover:border-[var(--ink-3)]'}`}>
          <span className={`w-[7px] h-[7px] rounded-full inline-block mr-[6px] align-[1px] ${activeAuthority === 'judge' ? 'bg-white opacity-65' : 'bg-[var(--warn)]'}`}></span>Your call
        </button>
        <button 
          onClick={() => handleAuthorityClick('escalate')}
          aria-pressed={activeAuthority === 'escalate'}
          className={`font-display font-semibold text-[11px] tracking-[0.06em] uppercase border border-[var(--line)] rounded-full px-[11px] py-[5px] transition-colors cursor-pointer ${activeAuthority === 'escalate' ? 'bg-[var(--stop)] border-[var(--stop)] text-white' : 'bg-[var(--ground)] text-[var(--ink-2)] hover:border-[var(--ink-3)]'}`}>
          <span className={`w-[7px] h-[7px] rounded-full inline-block mr-[6px] align-[1px] ${activeAuthority === 'escalate' ? 'bg-white opacity-65' : 'bg-[var(--stop)]'}`}></span>Escalate
        </button>
        
        <span className="w-[1px] h-[20px] bg-[var(--line)] mx-[4px]"></span>
        
        {categories.map((c: any) => (
          <button 
            key={c.id} 
            onClick={() => handleCategoryClick(c.slug)}
            aria-pressed={activeCategory === c.slug}
            className={`font-display font-semibold text-[11px] tracking-[0.06em] uppercase border border-[var(--line)] rounded-full px-[11px] py-[5px] transition-colors cursor-pointer ${activeCategory === c.slug ? 'bg-[var(--navy)] border-[var(--navy)] text-white' : 'bg-[var(--ground)] text-[var(--ink-2)] hover:border-[var(--ink-3)]'}`}>
            {c.name}
          </button>
        ))}
        
        <span className="w-[1px] h-[20px] bg-[var(--line)] mx-[4px]"></span>
        <button 
          onClick={handleReset}
          className="font-mono text-[11.5px] text-[var(--ink-3)] hover:text-[var(--ink)] transition-colors bg-transparent border-none p-0 cursor-pointer"
          title="Reset filters"
        >
          {totalFiltered} Playbook{totalFiltered !== 1 ? 's' : ''}
        </button>
      </div>

      <div className="max-w-[1180px] mx-auto py-[26px] px-[20px] pb-[80px] grid grid-cols-1 md:grid-cols-[186px_minmax(0,1fr)] gap-[22px] md:gap-[36px] items-start">
        {/* Navigation Rail */}
        <nav className="sticky top-[118px] flex flex-row flex-wrap md:flex-col gap-[6px] md:gap-[2px] border border-[var(--line)] rounded-[var(--radius)] p-[10px] md:p-0 md:border-0 md:bg-transparent bg-[var(--surface)]" aria-label="Sections">
          <button onClick={() => { document.getElementById('start')?.scrollIntoView(); handleReset(); }} className="font-display font-semibold text-[12px] tracking-[0.02em] text-[var(--ink-2)] no-underline px-[9px] py-[6px] rounded-[6px] flex justify-between gap-[8px] hover:bg-[var(--surface-2)] hover:text-[var(--ink)] bg-transparent border-none cursor-pointer w-full text-left">
            How to use this
          </button>
          <button onClick={() => { document.getElementById('authority')?.scrollIntoView(); handleReset(); }} className="font-display font-semibold text-[12px] tracking-[0.02em] text-[var(--ink-2)] no-underline px-[9px] py-[6px] rounded-[6px] flex justify-between gap-[8px] hover:bg-[var(--surface-2)] hover:text-[var(--ink)] bg-transparent border-none cursor-pointer w-full text-left">
            Authority limits
          </button>
          
          <hr className="hidden md:block border-0 border-t border-[var(--line)] my-[10px] mx-[2px]" />
          
          {categories.map((c: any) => {
            const count = playbooks.filter(p => (p.categoryId === c.id || p.category?.slug === c.slug)).length;
            return (
              <button 
                key={c.id} 
                onClick={() => {
                  handleCategoryClick(c.slug);
                  setTimeout(() => document.getElementById(`cat-${c.slug}`)?.scrollIntoView(), 0);
                }} 
                className="font-display font-semibold text-[12px] tracking-[0.02em] text-[var(--ink-2)] no-underline px-[9px] py-[6px] rounded-[6px] flex justify-between gap-[8px] hover:bg-[var(--surface-2)] hover:text-[var(--ink)] bg-transparent border-none cursor-pointer w-full text-left"
              >
                {c.name} <span className="font-mono text-[10.5px] opacity-60 text-right min-w-[14px]">{count}</span>
              </button>
            );
          })}

          <hr className="hidden md:block border-0 border-t border-[var(--line)] my-[10px] mx-[2px]" />
          
          <button onClick={() => { document.getElementById('policies')?.scrollIntoView(); handleReset(); }} className="font-display font-semibold text-[12px] tracking-[0.02em] text-[var(--ink-2)] no-underline px-[9px] py-[6px] rounded-[6px] flex justify-between gap-[8px] hover:bg-[var(--surface-2)] hover:text-[var(--ink)] bg-transparent border-none cursor-pointer w-full text-left">Policy quick ref</button>
          <button onClick={() => { document.getElementById('tools')?.scrollIntoView(); handleReset(); }} className="font-display font-semibold text-[12px] tracking-[0.02em] text-[var(--ink-2)] no-underline px-[9px] py-[6px] rounded-[6px] flex justify-between gap-[8px] hover:bg-[var(--surface-2)] hover:text-[var(--ink)] bg-transparent border-none cursor-pointer w-full text-left">Where things live</button>
          <button onClick={() => { document.getElementById('contribute')?.scrollIntoView(); handleReset(); }} className="font-display font-semibold text-[12px] tracking-[0.02em] text-[var(--accent)] no-underline px-[9px] py-[6px] rounded-[6px] flex justify-between gap-[8px] hover:bg-[var(--surface-2)] bg-transparent border-none cursor-pointer w-full text-left">Add a resolution</button>
        </nav>

        {/* Content Area */}
        <main className="flex flex-col gap-[64px] min-w-0">
          {query ? (
            <SearchResults query={query} categoryFilter={activeCategory || undefined} authorityFilter={activeAuthority || undefined} />
          ) : (
            <>
              {/* How to Use / Intro */}
              <section id="start" className="flex flex-col gap-[13px] scroll-mt-[124px]">
                <div className="bg-[var(--surface)] border border-[var(--line)] rounded-[var(--radius)] p-[22px] flex flex-col gap-[16px] shadow-[var(--shadow)]">
                  <div>
                    <h1 className="text-[26px] font-bold tracking-[-0.02em] leading-[1.2]">Answer it yourself. Escalate only what actually needs Heather.</h1>
                  </div>
                  <p className="text-[var(--ink-2)] text-[14.5px] max-w-[64ch]">
                    Every entry below is a situation we have already worked through, with the decision
                    already made. Search what the customer said — not what we call it internally — and the entry tells you
                    the facts, the steps, and the words. If an entry says <strong>Handle it</strong>, you do not need
                    approval. Asking anyway is what slows the queue down.
                  </p>
                  <div className="grid grid-cols-[repeat(auto-fit,minmax(210px,1fr))] gap-[10px]">
                    <div className="bg-[var(--ok-soft)] border border-[var(--line-soft)] border-l-[3px] border-l-[var(--ok)] rounded-[5px] p-[12px_14px] flex flex-col gap-[5px]">
                      <h4 className="font-display text-[11px] font-bold tracking-[0.1em] uppercase text-[var(--ok)]">Handle it</h4>
                      <p className="text-[13px] text-[var(--ink-2)]">Decision is already made and written down. Do it, log it in Richpanel, move on. No approval.</p>
                    </div>
                    <div className="bg-[var(--warn-soft)] border border-[var(--line-soft)] border-l-[3px] border-l-[var(--warn)] rounded-[5px] p-[12px_14px] flex flex-col gap-[5px]">
                      <h4 className="font-display text-[11px] font-bold tracking-[0.1em] uppercase text-[var(--warn)]">Your call, inside the limits</h4>
                      <p className="text-[13px] text-[var(--ink-2)]">You choose, as long as you stay under the dollar and concession limits in the next section. Note your reasoning on the ticket.</p>
                    </div>
                    <div className="bg-[var(--stop-soft)] border border-[var(--line-soft)] border-l-[3px] border-l-[var(--stop)] rounded-[5px] p-[12px_14px] flex flex-col gap-[5px]">
                      <h4 className="font-display text-[11px] font-bold tracking-[0.1em] uppercase text-[var(--stop)]">Escalate</h4>
                      <p className="text-[13px] text-[var(--ink-2)]">Stop and route it. These carry legal, chargeback, or reserve-hold consequences that outrank speed.</p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Authority Limits */}
              <section id="authority" className="flex flex-col gap-[13px] scroll-mt-[124px]">
                <div className="flex flex-col gap-[3px]">
                  <span className="font-display font-semibold text-[10px] tracking-[0.16em] uppercase text-[var(--accent)]">The part that stops the questions</span>
                  <h2 className="text-[21px] font-bold tracking-[-0.015em]">Authority limits</h2>
                  <p className="text-[var(--ink-2)] text-[13.5px]">What you can approve without asking. If the ask fits in a green row, do it — do not send it up.</p>
                </div>
                <div className="overflow-x-auto border border-[var(--line)] rounded-[var(--radius)] bg-[var(--surface)]">
                  <table className="w-full min-w-[560px] border-collapse text-[13.5px]">
                    <thead>
                      <tr>
                        <th className="text-left p-[10px_14px] border-b border-[var(--line)] font-display font-bold text-[10px] tracking-[0.12em] uppercase text-[var(--ink-3)] bg-[var(--surface-2)]">Action</th>
                        <th className="text-left p-[10px_14px] border-b border-[var(--line)] font-display font-bold text-[10px] tracking-[0.12em] uppercase text-[var(--ink-3)] bg-[var(--surface-2)]">Who can approve</th>
                        <th className="text-left p-[10px_14px] border-b border-[var(--line)] font-display font-bold text-[10px] tracking-[0.12em] uppercase text-[var(--ink-3)] bg-[var(--surface-2)]">Ceiling</th>
                        <th className="text-left p-[10px_14px] border-b border-[var(--line)] font-display font-bold text-[10px] tracking-[0.12em] uppercase text-[var(--ink-3)] bg-[var(--surface-2)]">Condition</th>
                      </tr>
                    </thead>
                    <tbody>
                      {authorityRules.map((rule: any) => (
                        <tr key={rule.id} className="[&:last-child_td]:border-b-0">
                          <td className="text-left p-[10px_14px] border-b border-[var(--line-soft)] align-top font-semibold">{rule.action}</td>
                          <td className="text-left p-[10px_14px] border-b border-[var(--line-soft)] align-top">{rule.who}</td>
                          <td className="text-left p-[10px_14px] border-b border-[var(--line-soft)] align-top font-mono font-bold text-[var(--ink)]">{rule.ceiling}</td>
                          <td className="text-left p-[10px_14px] border-b border-[var(--line-soft)] align-top">
                            {rule.cond}
                            {rule.confirm && (
                              <span className="inline-block font-display font-bold text-[9px] tracking-[0.1em] uppercase text-[var(--warn)] bg-[var(--warn-soft)] rounded-[3px] p-[2px_5px] ml-[6px] align-[1px]">confirm</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="text-[12.5px] text-[var(--ink-3)]">Rows marked <span className="inline-block font-display font-bold text-[9px] tracking-[0.1em] uppercase text-[var(--warn)] bg-[var(--warn-soft)] rounded-[3px] p-[2px_5px] align-[1px]">confirm</span> are placeholders drafted from how these calls have actually been made — Heather sets the real numbers before this goes to the floor.</p>
              </section>

              {/* Category Sections */}
              {categories.map((c: any) => {
                const categoryPlaybooks = filteredPlaybooks.filter(p => p.categoryId === c.id || p.category?.slug === c.slug);
                
                if (categoryPlaybooks.length === 0) return null;

                return (
                  <section key={c.id} id={`cat-${c.slug}`} className="flex flex-col gap-[13px] scroll-mt-[124px]">
                    <div className="flex flex-col gap-[3px]">
                      <span className="font-display font-semibold text-[10px] tracking-[0.16em] uppercase text-[var(--accent)]">Playbooks</span>
                      <h2 className="text-[21px] font-bold tracking-[-0.015em]">{c.name}</h2>
                    </div>
                    <div className="flex flex-col gap-[10px]">
                      {categoryPlaybooks.map(p => {
                        let authClass = '';
                        let badgeClass = '';
                        const pAuth = p.authority?.toLowerCase();
                        if (pAuth === 'handle it' || pAuth === 'handle_it') {
                          authClass = 'border-l-[var(--ok)]';
                          badgeClass = 'bg-[var(--ok-soft)] text-[var(--ok)]';
                        } else if (pAuth === 'your call' || pAuth === 'your_call') {
                          authClass = 'border-l-[var(--warn)]';
                          badgeClass = 'bg-[var(--warn-soft)] text-[var(--warn)]';
                        } else {
                          authClass = 'border-l-[var(--stop)]';
                          badgeClass = 'bg-[var(--stop-soft)] text-[var(--stop)]';
                        }
                        
                        return (
                          <details key={p.id} className={`bg-[var(--surface)] border border-[var(--line)] border-l-[3px] ${authClass} rounded-[var(--radius)] overflow-hidden group`}>
                            <summary className="w-full bg-transparent border-0 text-left cursor-pointer p-[14px_16px] flex gap-[13px] items-start hover:bg-[var(--surface-2)] focus-visible:outline-2 focus-visible:outline-[var(--accent)] focus-visible:-outline-offset-2 list-none [&::-webkit-details-marker]:hidden">
                              <div className="flex-none mt-[4px] w-[9px] h-[9px] border-r-[1.6px] border-b-[1.6px] border-[var(--ink-3)] -rotate-45 transition-transform duration-160 group-open:rotate-45" />
                              <div className="flex flex-col gap-[5px] min-w-0 flex-1">
                                <h3 className="text-[15.5px] font-semibold tracking-[-0.005em] leading-[1.35]">{p.title}</h3>
                                {p.customerPhrases && p.customerPhrases.length > 0 && (
                                  <div className="text-[12.5px] text-[var(--ink-3)] italic">&ldquo;{p.customerPhrases[0]}&rdquo;</div>
                                )}
                              </div>
                              <div className="flex gap-[6px] flex-wrap items-center flex-none pt-[1px]">
                                <span className={`font-display font-bold text-[9.5px] tracking-[0.1em] uppercase rounded-[4px] px-[7px] py-[3px] whitespace-nowrap ${badgeClass}`}>
                                  {p.authority}
                                </span>
                              </div>
                            </summary>
                            <div className="p-[2px_16px_18px_16px] flex flex-col gap-[15px] border-t border-[var(--line-soft)] mt-0 pt-[16px]">
                              {/* Facts */}
                              {p.facts && p.facts.length > 0 && (
                                <div className="flex flex-col gap-[6px]">
                                  <h4 className="font-display font-bold text-[10px] tracking-[0.13em] uppercase text-[var(--ink-3)]">Facts</h4>
                                  <ul className="m-0 pl-[17px] flex flex-col gap-[5px] list-disc">
                                    {p.facts.map((fact: string, idx: number) => (
                                      <li key={idx} className="text-[14px] text-[var(--ink-2)]" dangerouslySetInnerHTML={{ __html: fact.replace(/(\*\*[^*]+\*\*)/g, '<strong>$1</strong>').replace(/\*\*/g, '') }} />
                                    ))}
                                  </ul>
                                </div>
                              )}
                              
                              {/* Steps */}
                              {p.troubleshootingSteps && p.troubleshootingSteps.length > 0 && (
                                <div className="flex flex-col gap-[6px]">
                                  <h4 className="font-display font-bold text-[10px] tracking-[0.13em] uppercase text-[var(--ink-3)]">Steps</h4>
                                  <ol className="list-none pl-0 gap-[8px] flex flex-col [counter-reset:s]">
                                    {p.troubleshootingSteps.map((step: string, idx: number) => (
                                      <li key={idx} className="relative pl-[28px] text-[14px] text-[var(--ink-2)] before:content-[counter(s)] before:[counter-increment:s] before:absolute before:left-0 before:top-[1px] before:w-[19px] before:h-[19px] before:rounded-full before:bg-[var(--accent-soft)] before:text-[var(--accent)] before:font-mono before:text-[11px] before:grid before:place-items-center" dangerouslySetInnerHTML={{ __html: step.replace(/(\*\*[^*]+\*\*)/g, '<strong>$1</strong>').replace(/\*\*/g, '') }} />
                                    ))}
                                  </ol>
                                </div>
                              )}

                              {/* What to Say */}
                              {p.whatToSay && (
                                <div className="bg-[var(--ground)] border border-[var(--line-soft)] rounded-[6px] p-[13px_14px] flex flex-col gap-[9px]">
                                  <p className="text-[14px] text-[var(--ink)] leading-[1.6]" dangerouslySetInnerHTML={{ __html: p.whatToSay.replace(/(\*\*[^*]+\*\*)/g, '<strong>$1</strong>').replace(/\*\*/g, '') }} />
                                </div>
                              )}
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
                  <p className="mt-[8px]">If you solved it anyway, <button onClick={() => { document.getElementById('contribute')?.scrollIntoView(); handleReset(); }} className="text-[var(--accent)] bg-transparent border-none p-0 cursor-pointer hover:underline">write it up at the bottom</button> — that is how this page grows.</p>
                </div>
              )}

              {/* Policies */}
              <section id="policies" className="flex flex-col gap-[13px] scroll-mt-[124px]">
                <div className="flex flex-col gap-[3px]">
                  <span className="font-display font-semibold text-[10px] tracking-[0.16em] uppercase text-[var(--accent)]">Source of truth</span>
                  <h2 className="text-[21px] font-bold tracking-[-0.015em]">Policy quick reference</h2>
                  <p className="text-[var(--ink-2)] text-[13.5px]">Quote the posted policy, not your memory of it. These are the six written store policies live on the site.</p>
                </div>
                <div className="overflow-x-auto border border-[var(--line)] rounded-[var(--radius)] bg-[var(--surface)]">
                  <table className="w-full min-w-[560px] border-collapse text-[13.5px]">
                    <thead>
                      <tr>
                        <th className="text-left p-[10px_14px] border-b border-[var(--line)] font-display font-bold text-[10px] tracking-[0.12em] uppercase text-[var(--ink-3)] bg-[var(--surface-2)]">Policy</th>
                        <th className="text-left p-[10px_14px] border-b border-[var(--line)] font-display font-bold text-[10px] tracking-[0.12em] uppercase text-[var(--ink-3)] bg-[var(--surface-2)]">What agents get wrong</th>
                      </tr>
                    </thead>
                    <tbody>
                      {policies.map((pol: any) => (
                        <tr key={pol.id} className="[&:last-child_td]:border-b-0">
                          <td className="text-left p-[10px_14px] border-b border-[var(--line-soft)] align-top" dangerouslySetInnerHTML={{__html: pol.policy.replace('Performance Satisfaction Guarantee', '<strong>Performance Satisfaction Guarantee</strong>').replace('Shipping', '<strong>Shipping</strong>').replace('Privacy', '<strong>Privacy</strong>').replace('Terms of Service', '<strong>Terms of Service</strong>').replace('Contact', '<strong>Contact</strong>').replace('Legal Notice', '<strong>Legal Notice</strong>')}}></td>
                          <td className="text-left p-[10px_14px] border-b border-[var(--line-soft)] align-top" dangerouslySetInnerHTML={{__html: pol.note.replace('not', '<strong>not</strong>')}}></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>

              {/* Tools */}
              <section id="tools" className="flex flex-col gap-[13px] scroll-mt-[124px]">
                <div className="flex flex-col gap-[3px]">
                  <span className="font-display font-semibold text-[10px] tracking-[0.16em] uppercase text-[var(--accent)]">Orientation</span>
                  <h2 className="text-[21px] font-bold tracking-[-0.015em]">Where things live</h2>
                  <p className="text-[var(--ink-2)] text-[13.5px]">Current stack as of September 2026.</p>
                </div>
                <div className="grid grid-cols-[repeat(auto-fit,minmax(215px,1fr))] gap-[10px]">
                  {tools.map((tool: any) => (
                    <div key={tool.id} className="bg-[var(--surface)] border border-[var(--line)] rounded-[var(--radius)] p-[13px_15px] flex flex-col gap-[4px]">
                      <span className="font-display font-semibold text-[9.5px] tracking-[0.1em] uppercase text-[var(--accent)]">{tool.role}</span>
                      <h4 className="text-[14px] font-semibold">{tool.name}</h4>
                      <p className="text-[13px] text-[var(--ink-2)]" dangerouslySetInnerHTML={{__html: tool.note.replace('blocked', '<strong>blocked</strong>')}}></p>
                    </div>
                  ))}
                </div>
              </section>

              {/* Add a resolution */}
              <section id="contribute" className="flex flex-col gap-[13px] scroll-mt-[124px]">
                <div className="flex flex-col gap-[3px]">
                  <span className="font-display font-semibold text-[10px] tracking-[0.16em] uppercase text-[var(--accent)]">Keep it alive</span>
                  <h2 className="text-[21px] font-bold tracking-[-0.015em]">Add a resolution</h2>
                  <p className="text-[var(--ink-2)] text-[13.5px]">Solved something that isn&apos;t in here? Write it up while it&apos;s fresh. Submissions are reviewed and turned into standard entries — the next agent who hits it won&apos;t have to ask.</p>
                </div>
                <div className="bg-[var(--surface)] border border-[var(--line)] rounded-[var(--radius)] p-[20px] flex flex-col gap-[14px]">
                  <div className="flex flex-col gap-[6px]">
                    <h4 className="font-display font-bold text-[10px] tracking-[0.13em] uppercase text-[var(--ink-3)]">How to submit one</h4>
                    <ol className="list-none pl-0 gap-[8px] flex flex-col [counter-reset:s]">
                      <li className="relative pl-[28px] text-[14px] text-[var(--ink-2)] before:content-[counter(s)] before:[counter-increment:s] before:absolute before:left-0 before:top-[1px] before:w-[19px] before:h-[19px] before:rounded-full before:bg-[var(--accent-soft)] before:text-[var(--accent)] before:font-mono before:text-[11px] before:grid before:place-items-center">
                        Open a ticket in Richpanel and tag it <strong>playbook</strong>.
                      </li>
                      <li className="relative pl-[28px] text-[14px] text-[var(--ink-2)] before:content-[counter(s)] before:[counter-increment:s] before:absolute before:left-0 before:top-[1px] before:w-[19px] before:h-[19px] before:rounded-full before:bg-[var(--accent-soft)] before:text-[var(--accent)] before:font-mono before:text-[11px] before:grid before:place-items-center">
                        Paste the template below and fill it in. Five minutes while it&apos;s fresh beats reconstructing it in a month.
                      </li>
                      <li className="relative pl-[28px] text-[14px] text-[var(--ink-2)] before:content-[counter(s)] before:[counter-increment:s] before:absolute before:left-0 before:top-[1px] before:w-[19px] before:h-[19px] before:rounded-full before:bg-[var(--accent-soft)] before:text-[var(--accent)] before:font-mono before:text-[11px] before:grid before:place-items-center">
                        Accepted submissions become standard entries here. You&apos;ll see yours show up.
                      </li>
                    </ol>
                  </div>
                  
                  <div className="bg-[var(--ground)] border border-[var(--line-soft)] rounded-[6px] p-[13px_14px] flex flex-col gap-[9px]">
                    <p className="whitespace-pre-line font-mono text-[12.5px] leading-[1.75] text-[var(--ink-2)]">PLAYBOOK SUBMISSION{"\n\n"}Problem, in the customer&apos;s words:{"\n"}What&apos;s true (facts I confirmed):{"\n"}What I did, step by step:{"\n"}Dollar amount involved, if any:{"\n"}How it landed:{"\n"}Order / ticket #:{"\n"}Anything the next agent should avoid:</p>
                    <div className="flex justify-between items-center gap-[10px]">
                      <span className="font-mono text-[11.5px] text-[var(--ink-3)]">Paste this into a Richpanel ticket tagged <strong>playbook</strong>.</span>
                      <button className="border border-[var(--line)] bg-[var(--surface)] text-[var(--ink-2)] font-display font-semibold text-[10px] tracking-[0.08em] uppercase rounded-[5px] p-[4px_9px] cursor-pointer flex-none hover:border-[var(--accent)] hover:text-[var(--accent)]" type="button" onClick={() => {
                        navigator.clipboard.writeText("PLAYBOOK SUBMISSION\n\nProblem, in the customer's words:\nWhat's true (facts I confirmed):\nWhat I did, step by step:\nDollar amount involved, if any:\nHow it landed:\nOrder / ticket #:\nAnything the next agent should avoid:");
                      }}>Copy template</button>
                    </div>
                  </div>

                  <div className="flex flex-col gap-[6px]">
                    <h4 className="font-display font-bold text-[10px] tracking-[0.13em] uppercase text-[var(--ink-3)]">What happens to it</h4>
                    <ul className="m-0 pl-[17px] flex flex-col gap-[5px] text-[14px] text-[var(--ink-2)] list-disc">
                      <li>Submissions are reviewed, standardized into the same five-part format as every entry here, and given an authority level — so the next agent knows whether they can just do it.</li>
                      <li>Separately, Richpanel and Consio exports get swept for recurring issues nobody wrote up. You&apos;re the fast path, not the only path.</li>
                      <li>If an entry here is stale or wrong, submit that too. A playbook nobody corrects is one people quietly work around.</li>
                    </ul>
                  </div>

                  <div className="mt-[20px] pt-[20px] border-t border-[var(--line-soft)]">
                    <h4 className="font-display font-bold text-[10px] tracking-[0.13em] uppercase text-[var(--ink-3)] mb-[10px]">Or submit directly to the database</h4>
                    <AddResolution />
                  </div>
                </div>
              </section>
            </>
          )}
        </main>
      </div>
      
      <footer className="max-w-[1180px] mx-auto pb-[46px] px-[20px] text-[var(--ink-3)] text-[12px] border-t border-[var(--line)] pt-[18px]">
        <p>SoftPro Water Systems / Quality Water Treatment — internal customer service playbook. Entries carry the date
        the position was last confirmed; if an entry is stale or wrong, say so rather than working around it.</p>
      </footer>
    </>
  );
}
