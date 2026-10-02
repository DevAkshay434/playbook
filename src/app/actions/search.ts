"use server";
import { prisma } from "@/lib/prisma";
import { isDbConnected, trackSearchEvent } from "@/lib/db-services";
import { searchPlaybooks as staticSearch } from "@/lib/search-static";

// ────────────────────────────────────────────
// Unified Search Result Types
// Designed for extension: add RichpanelCaseSearchResult | GhlCaseSearchResult later
// ────────────────────────────────────────────

export type SearchResultType =
  | "playbook"
  | "kb_article";
  // Future: | "richpanel_case" | "ghl_case"

interface BaseSearchResult {
  id: string;
  title: string;
  slug: string;
  url?: string;
  excerpt?: string;
  source?: string;
  score: number;
}

export interface PlaybookSearchResult extends BaseSearchResult {
  type: "playbook";
  categoryName: string;
  authority: string;
}

export interface KnowledgeBaseSearchResult extends BaseSearchResult {
  type: "kb_article";
}

// Future:
// export interface RichpanelCaseSearchResult extends BaseSearchResult {
//   type: "richpanel_case";
//   ticketId: string;
//   resolvedDate?: string;
// }
// export interface GhlCaseSearchResult extends BaseSearchResult {
//   type: "ghl_case";
//   ticketId: string;
//   resolvedDate?: string;
// }

export type UnifiedSearchResult =
  | PlaybookSearchResult
  | KnowledgeBaseSearchResult;
  // Future: | RichpanelCaseSearchResult | GhlCaseSearchResult

// ────────────────────────────────────────────
// Scoring constants — one place to tune ranking
// ────────────────────────────────────────────

const TIER = {
  PLAYBOOK: 1000,
  KB_ARTICLE: 0,
  // Future: RICHPANEL_CASE: -100, GHL_CASE: -100
} as const;

const MATCH = {
  EXACT_TITLE: 100,
  PARTIAL_TITLE: 50,
  CUSTOMER_PHRASE: 80,
  ALIAS: 60,
  CONTENT: 20,
  EXCERPT: 30,
  BODY_TEXT: 10,
} as const;

// ────────────────────────────────────────────
// Core search
// ────────────────────────────────────────────

export async function performSearch(
  query: string,
  categoryFilter?: string,
  authorityFilter?: string
): Promise<UnifiedSearchResult[]> {
  const q = query.trim().toLowerCase();

  if (!isDbConnected) {
    const playbooks = staticSearch(q, categoryFilter, authorityFilter);
    return playbooks.map(p => ({
      type: "playbook" as const,
      id: p.id,
      title: p.title,
      slug: p.slug,
      categoryName: p.category,
      authority: p.authority,
      score: TIER.PLAYBOOK + MATCH.EXACT_TITLE,
    }));
  }

  const results: UnifiedSearchResult[] = [];

  // ── Playbooks ──
  const pbWhere: Record<string, any> = { active: true };
  if (categoryFilter) {
    const cat = await prisma.category.findUnique({ where: { slug: categoryFilter } });
    if (cat) pbWhere.categoryId = cat.id;
  }
  if (authorityFilter) pbWhere.authority = authorityFilter;

  const playbooks = await prisma.playbook.findMany({
    where: pbWhere,
    include: { category: true },
  });

  for (const pb of playbooks) {
    let score = 0;
    const title = pb.title.toLowerCase();

    if (!q) {
      score = MATCH.EXACT_TITLE;
    } else {
      if (title === q) score += MATCH.EXACT_TITLE;
      else if (title.includes(q)) score += MATCH.PARTIAL_TITLE;
      if (pb.customerPhrases.some(p => p.toLowerCase().includes(q))) score += MATCH.CUSTOMER_PHRASE;
      if (pb.aliases.some(a => a.toLowerCase().includes(q))) score += MATCH.ALIAS;
      const content = `${pb.facts.join(" ")} ${pb.troubleshootingSteps.join(" ")}`.toLowerCase();
      if (content.includes(q)) score += MATCH.CONTENT;
    }

    if (score > 0) {
      results.push({
        type: "playbook",
        id: pb.id,
        title: pb.title,
        slug: pb.slug,
        categoryName: pb.category?.name || "General",
        authority: pb.authority,
        score: score + TIER.PLAYBOOK,
      });
    }
  }

  // ── Knowledge Base ──
  if (q) {
    const kbArticles = await prisma.knowledgeBaseArticle.findMany({
      where: { active: true },
    });

    for (const kb of kbArticles) {
      let score = 0;
      const title = kb.title.toLowerCase();

      if (title === q) score += MATCH.EXACT_TITLE;
      else if (title.includes(q)) score += MATCH.PARTIAL_TITLE;
      if (kb.excerpt?.toLowerCase().includes(q)) score += MATCH.EXCERPT;
      if (kb.contentText.toLowerCase().includes(q)) score += MATCH.BODY_TEXT;

      if (score > 0) {
        results.push({
          type: "kb_article",
          id: kb.id,
          title: kb.title,
          slug: kb.slug,
          url: kb.url,
          excerpt: kb.excerpt || undefined,
          source: kb.source,
          score: score + TIER.KB_ARTICLE,
        });
      }
    }
  }

  // Future: Richpanel / GHL case search providers would be added here

  return results.sort((a, b) => b.score - a.score);
}

// ────────────────────────────────────────────
// Analytics tracking
// ────────────────────────────────────────────

function normalizeQuery(q: string): string {
  return q.trim().toLowerCase().replace(/\s+/g, " ");
}

export async function logSearch(
  query: string,
  categoryFilter: string,
  authorityFilter: string,
  resultCount: number
) {
  if (query) {
    await trackSearchEvent({
      query,
      normalizedQuery: normalizeQuery(query),
      categoryFilter,
      authorityFilter,
      resultCount,
    });
  }
}

export async function logSearchSelection(
  searchEventId: string,
  selectedResultId: string,
  selectedResultType: SearchResultType
) {
  if (!isDbConnected) return;
  try {
    // We record selection on the SearchEvent if we have the ID,
    // otherwise create a lightweight event
    await prisma.searchEvent.updateMany({
      where: { id: searchEventId },
      data: {
        selectedResultId,
        selectedResultType,
        ...(selectedResultType === "playbook" ? { selectedPlaybookId: selectedResultId } : {}),
      },
    });
  } catch (err) {
    console.error("Failed to log search selection:", err);
  }
}
