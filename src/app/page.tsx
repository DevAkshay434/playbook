import { getPlaybooks, getCategories, getAuthorityRules, getPolicies, getTools } from "@/lib/db-services";
import PlaybookCard from "@/components/playbook/PlaybookCard";
import SearchResults from "@/components/search/SearchResults";
import AddResolution from "@/components/resolution/AddResolution";
import Link from "next/link";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const query = typeof params.q === "string" ? params.q : "";
  const categoryFilter = typeof params.category === "string" ? params.category : undefined;
  const authorityFilter = typeof params.authority === "string" ? params.authority : undefined;

  const [playbooks, categories, authorityRules, policies, tools] = await Promise.all([
    getPlaybooks(),
    getCategories(),
    getAuthorityRules(),
    getPolicies(),
    getTools()
  ]);

  return (
    <>
      <FilterStrip currentCategory={categoryFilter || ""} currentAuthority={authorityFilter || ""} categories={categories} playbooks={playbooks} />

      <div className="max-w-[1180px] mx-auto py-[26px] px-[20px] pb-[80px] grid grid-cols-1 md:grid-cols-[186px_minmax(0,1fr)] gap-[22px] md:gap-[36px] items-start">
        {/* Navigation Rail */}
        <nav className="sticky top-[118px] flex flex-row flex-wrap md:flex-col gap-[6px] md:gap-[2px] border border-[var(--line)] rounded-[var(--radius)] p-[10px] md:p-0 md:border-0 md:bg-transparent bg-[var(--surface)]" aria-label="Sections">
          <h3 className="font-display font-semibold text-[10px] tracking-[0.16em] uppercase text-[var(--ink-3)] px-[9px] mb-[4px] hidden md:block">Contents</h3>
          
          <Link href="#authority" className="font-display font-semibold text-[12px] tracking-[0.02em] text-[var(--ink-2)] no-underline px-[9px] py-[6px] rounded-[6px] flex justify-between gap-[8px] hover:bg-[var(--surface-2)] hover:text-[var(--ink)]">
            Authority
          </Link>
          
          <hr className="hidden md:block border-0 border-t border-[var(--line)] my-[10px] mx-[2px]" />
          <h3 className="font-display font-semibold text-[10px] tracking-[0.16em] uppercase text-[var(--ink-3)] px-[9px] mb-[4px] mt-[4px] hidden md:block">Categories</h3>
          
          {categories.map((c: any) => {
            const count = playbooks.filter(p => (p as any).categoryId === c.id || (p as any).category === c.slug).length;
            return (
              <Link key={c.id} href={`#cat-${c.slug}`} className="font-display font-semibold text-[12px] tracking-[0.02em] text-[var(--ink-2)] no-underline px-[9px] py-[6px] rounded-[6px] flex justify-between gap-[8px] hover:bg-[var(--surface-2)] hover:text-[var(--ink)]">
                {c.name} <span className="font-mono text-[10.5px] opacity-60 text-right min-w-[14px]">{count}</span>
              </Link>
            );
          })}

          <hr className="hidden md:block border-0 border-t border-[var(--line)] my-[10px] mx-[2px]" />
          <h3 className="font-display font-semibold text-[10px] tracking-[0.16em] uppercase text-[var(--ink-3)] px-[9px] mb-[4px] mt-[4px] hidden md:block">Reference</h3>
          
          <Link href="#policies" className="font-display font-semibold text-[12px] tracking-[0.02em] text-[var(--ink-2)] no-underline px-[9px] py-[6px] rounded-[6px] flex justify-between gap-[8px] hover:bg-[var(--surface-2)] hover:text-[var(--ink)]">Policies</Link>
          <Link href="#tools" className="font-display font-semibold text-[12px] tracking-[0.02em] text-[var(--ink-2)] no-underline px-[9px] py-[6px] rounded-[6px] flex justify-between gap-[8px] hover:bg-[var(--surface-2)] hover:text-[var(--ink)]">Tools</Link>
          <Link href="#contribute" className="font-display font-semibold text-[12px] tracking-[0.02em] text-[var(--accent)] no-underline px-[9px] py-[6px] rounded-[6px] flex justify-between gap-[8px] hover:bg-[var(--surface-2)]">Submit fix</Link>
        </nav>

        {/* Content Area */}
        <main className="flex flex-col gap-[64px] min-w-0">
          {query || categoryFilter || authorityFilter ? (
            <SearchResults query={query} categoryFilter={categoryFilter} authorityFilter={authorityFilter} />
          ) : (
            <>
              {/* Rules of Engagement */}
              <section id="authority" className="flex flex-col gap-[13px] scroll-mt-[124px]">
                <div className="flex flex-col gap-[3px]">
                  <span className="font-display font-semibold text-[10px] tracking-[0.16em] uppercase text-[var(--accent)]">Ground Rules</span>
                  <h2 className="text-[21px] font-bold tracking-[-0.015em]">What you can do</h2>
                  <p className="text-[var(--ink-2)] text-[13.5px]">Stop asking permission to solve the customer&apos;s problem.</p>
                </div>
                <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-[10px]">
                  {authorityRules.map((rule: any, idx: number) => (
                    <div key={idx} className="bg-[var(--surface)] border border-[var(--line)] rounded-[var(--radius)] p-[15px] flex flex-col gap-[8px]">
                      <h4 className={`text-[12px] font-display font-bold uppercase tracking-[0.05em] m-0 ${rule.level === 'Agent' ? 'text-[var(--ok)]' : rule.level === 'Manager' ? 'text-[var(--warn)]' : 'text-[var(--stop)]'}`}>
                        {rule.level}
                      </h4>
                      <p className="text-[13px] text-[var(--ink)] m-0 leading-snug font-semibold">{rule.rule}</p>
                      <p className="text-[12px] text-[var(--ink-2)] m-0 mt-[2px]">{rule.reason}</p>
                    </div>
                  ))}
                </div>
              </section>

              {categories.map((c: any) => {
                const catPlaybooks = playbooks.filter(p => (p as any).categoryId === c.id || (p as any).category === c.slug);
                if (catPlaybooks.length === 0) return null;
                
                return (
                  <section key={c.id} id={`cat-${c.slug}`} className="flex flex-col gap-[13px] scroll-mt-[124px]">
                    <div className="flex flex-col gap-[3px]">
                      <span className="font-display font-semibold text-[10px] tracking-[0.16em] uppercase text-[var(--accent)]">Playbooks</span>
                      <h2 className="text-[21px] font-bold tracking-[-0.015em]">{c.name}</h2>
                    </div>
                    <div className="flex flex-col gap-[15px]">
                      {catPlaybooks.map(p => (
                        <PlaybookCard key={p.id} playbook={p as any} />
                      ))}
                    </div>
                  </section>
                );
              })}

              {/* Remaining Sections */}
              <section id="contribute" className="flex flex-col gap-[13px] scroll-mt-[124px]">
                <div className="flex flex-col gap-[3px]">
                  <span className="font-display font-semibold text-[10px] tracking-[0.16em] uppercase text-[var(--accent)]">Keep it alive</span>
                  <h2 className="text-[21px] font-bold tracking-[-0.015em]">Add a resolution</h2>
                </div>
                <AddResolution />
              </section>
            </>
          )}
        </main>
      </div>
    </>
  );
}

function FilterStrip({ currentCategory, currentAuthority, categories, playbooks }: any) {
  return (
    <div className="max-w-[1180px] mx-auto pb-[12px] px-[20px] flex gap-[7px] flex-wrap items-center">
      <Link href={currentAuthority === 'resolve' ? '/' : '?authority=resolve'} 
            className={`font-display font-semibold text-[11px] tracking-[0.06em] uppercase border border-[var(--line)] rounded-full px-[11px] py-[5px] no-underline transition-colors ${currentAuthority === 'resolve' ? 'bg-[var(--ok)] border-[var(--ok)] text-white' : 'bg-[var(--ground)] text-[var(--ink-2)]'}`}>
        Handle it
      </Link>
      <span className="w-[1px] h-[20px] bg-[var(--line)] mx-[4px]"></span>
      {categories.map((c: any) => (
        <Link key={c.id} href={currentCategory === c.slug ? '/' : `?category=${c.slug}`}
              className={`font-display font-semibold text-[11px] tracking-[0.06em] uppercase border border-[var(--line)] rounded-full px-[11px] py-[5px] no-underline transition-colors ${currentCategory === c.slug ? 'bg-[var(--navy)] border-[var(--navy)] text-white' : 'bg-[var(--ground)] text-[var(--ink-2)]'}`}>
          {c.name}
        </Link>
      ))}
    </div>
  );
}
