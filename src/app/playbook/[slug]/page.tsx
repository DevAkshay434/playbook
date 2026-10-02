import { getPlaybooks, getPlaybookBySlug, getManualKBLinksForPlaybook } from "@/lib/db-services";
import { performSearch } from "@/app/actions/search";
import { notFound } from "next/navigation";
import PlaybookCard from "@/components/playbook/PlaybookCard";
import SimilarResolvedCases from "@/components/cases/SimilarResolvedCases";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export async function generateStaticParams() {
  const playbooks = await getPlaybooks();
  return playbooks.map((p) => ({
    slug: p.slug,
  }));
}

const MAX_RELATED_KB = 5;

export default async function PlaybookPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const playbook = await getPlaybookBySlug(slug);

  if (!playbook) {
    notFound();
  }

  // 1. Manual KB links (highest priority)
  const manualLinks = await getManualKBLinksForPlaybook(playbook.id);
  const manualArticles = manualLinks.map(link => ({
    id: link.knowledgeBaseArticle.id,
    title: link.knowledgeBaseArticle.title,
    url: link.knowledgeBaseArticle.url,
    excerpt: link.knowledgeBaseArticle.excerpt,
    isManual: true,
  }));

  // 2. Auto-discovered KB articles (fill remaining slots)
  const manualIds = new Set(manualArticles.map(a => a.id));
  const remainingSlots = MAX_RELATED_KB - manualArticles.length;
  let autoArticles: typeof manualArticles = [];

  if (remainingSlots > 0) {
    const searchTerms = [playbook.title, ...(playbook.aliases || [])].join(" ");
    const autoResults = await performSearch(searchTerms);
    autoArticles = autoResults
      .filter(r => r.type === "kb_article" && !manualIds.has(r.id))
      .slice(0, remainingSlots)
      .map(r => ({
        id: r.id,
        title: r.title,
        url: r.url || "",
        excerpt: r.excerpt || null,
        isManual: false,
      }));
  }

  const allRelatedArticles = [...manualArticles, ...autoArticles];

  return (
    <div className="max-w-[800px] mx-auto py-[40px] px-[20px]">
      <Link href="/" className="inline-flex items-center gap-[4px] text-[13px] text-[var(--ink-2)] hover:text-[var(--accent)] mb-[20px] no-underline">
        <ChevronLeft className="w-4 h-4" /> Back to Search
      </Link>
      
      <div className="flex flex-col gap-[20px]">
        <PlaybookCard playbook={playbook as any} />
      </div>

      {allRelatedArticles.length > 0 && (
        <section className="bg-[var(--surface-2)] border border-[var(--line)] rounded-[var(--radius)] p-[20px] mt-[20px]">
          <h2 className="font-display font-bold text-[11px] tracking-[0.15em] uppercase text-[var(--ink-2)] mb-[15px]">Related Knowledge Base Articles</h2>
          <div className="flex flex-col gap-[10px]">
            {allRelatedArticles.map((article) => (
              <a key={article.id} href={article.url} target="_blank" rel="noreferrer" className="flex flex-col bg-[var(--surface)] border border-[var(--line)] rounded-[6px] p-[12px] hover:border-[var(--accent)] no-underline">
                <div className="flex items-center gap-[6px] mb-[4px]">
                  <span className="font-bold text-[14px] text-[var(--ink)]">{article.title}</span>
                </div>
                {article.excerpt && <span className="text-[12px] text-[var(--ink-2)] line-clamp-2">{article.excerpt}</span>}
              </a>
            ))}
          </div>
        </section>
      )}

      {/* Similar Resolved Cases — empty until Richpanel/GHL are connected */}
      <SimilarResolvedCases cases={[]} />
    </div>
  );
}
