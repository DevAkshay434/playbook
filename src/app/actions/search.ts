"use server";
import { prisma } from "@/lib/prisma";
import { HistoricalSupportCase } from "@prisma/client";
import { isDbConnected, trackSearchEvent } from "@/lib/db-services";
import { searchPlaybooks as staticSearch } from "@/lib/search-static";

// ────────────────────────────────────────────
// Unified Search Result Types
// Designed for extension: add RichpanelCaseSearchResult | GhlCaseSearchResult later
// ────────────────────────────────────────────

export type SearchResultType =
  | "playbook"
  | "kb_article"
  | "historical_case";

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

export interface HistoricalCaseSearchResult extends BaseSearchResult {
  type: "historical_case";
  ticketId: string;
  resolvedDate?: string;
  tags?: string[];
  resolutionSummary?: string;
}

export type UnifiedSearchResult =
  | PlaybookSearchResult
  | KnowledgeBaseSearchResult
  | HistoricalCaseSearchResult;

// ────────────────────────────────────────────
// Scoring constants — one place to tune ranking
// ────────────────────────────────────────────

const TIER = {
  PLAYBOOK: 1000,
  KB_ARTICLE: 500,
  HISTORICAL_CASE: 0
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
  const allowStaticFallback = process.env.NODE_ENV !== "production" && process.env.USE_STATIC_DATA === "true";

  if (!isDbConnected) {
    if (!allowStaticFallback) {
      console.error("[Database Error] Database connection required for performSearch.");
      throw new Error("Database connection required.");
    }
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

  try {
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

    // 3. Historical Cases
    if (q) {
      const historicalCases = await prisma.historicalSupportCase.findMany({
        where: {
          active: true,
          reviewStatus: "APPROVED",
          extractionStatus: "READY",
          usableAsHistoricalCase: true,
          OR: [
            { subject: { contains: q, mode: 'insensitive' } },
            { issueText: { contains: q, mode: 'insensitive' } },
            { topic: { contains: q, mode: 'insensitive' } },
            { resolutionText: { contains: q, mode: 'insensitive' } }
          ]
        },
        take: 20
      });

      for (const hc of historicalCases) {
        let score = 0;
        const title = (hc.subject || hc.issueText || "").toLowerCase();

        if (title === q) score += MATCH.EXACT_TITLE;
        else if (title.includes(q)) score += MATCH.PARTIAL_TITLE;

        if (hc.topic && hc.topic.toLowerCase().includes(q)) score += MATCH.EXACT_TITLE; // treat topic like title
        if (hc.issueText && hc.issueText.toLowerCase().includes(q)) score += MATCH.EXCERPT;
        if (hc.resolutionText && hc.resolutionText.toLowerCase().includes(q)) score += MATCH.BODY_TEXT;

        const tags = Array.isArray(hc.tags) ? hc.tags.map(t => String(t).toLowerCase()) : [];
        if (tags.some(t => t.includes(q))) score += MATCH.CUSTOMER_PHRASE;

        if (score > 0) {
          results.push({
            type: "historical_case",
            id: hc.id,
            title: hc.issueText || hc.subject || "Historical Case",
            slug: hc.id,
            url: hc.sourceUrl || undefined,
            source: hc.source === "RICHPANEL" ? "Richpanel" : hc.source,
            ticketId: hc.externalNumber || hc.externalId,
            tags: Array.isArray(hc.tags) ? hc.tags.map(t => String(t)) : [],
            resolutionSummary: hc.resolutionText || undefined,
            resolvedDate: hc.resolvedAt ? hc.resolvedAt.toLocaleDateString() : undefined,
            score: score + TIER.HISTORICAL_CASE,
          });
        }
      }
    }

    return results.sort((a, b) => b.score - a.score);
  } catch (err: any) {
    console.error("[Database Error] Search query failed:", err);
    if (allowStaticFallback) {
      console.warn("[Database Fallback] Falling back to static playbooks because allowStaticFallback is enabled.");
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
    throw new Error(`Database search failed: ${err?.message || "Unknown database error"}`);
  }
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

// ─────────────────────────────────────────────────────────────────────────────
// Similar Resolved Cases
// ─────────────────────────────────────────────────────────────────────────────

export async function findSimilarResolvedCases(playbookId: string) {
  const allowStaticFallback = process.env.NODE_ENV !== "production" && process.env.USE_STATIC_DATA === "true";

  if (!isDbConnected) {
    if (!allowStaticFallback) {
      console.error("[Database Error] Database connection required for findSimilarResolvedCases.");
      throw new Error("Database connection required.");
    }
    return [];
  }

  try {
    const playbook = await prisma.playbook.findUnique({
      where: { id: playbookId }
    });

    if (!playbook) return [];

    const pbSearchTerms = [
      playbook.title,
      ...(playbook.aliases || []),
      ...(playbook.customerPhrases || []),
      ...(playbook.facts || []),
      ...(playbook.troubleshootingSteps || [])
    ]
      .map(t => t.trim().toLowerCase())
      .filter(t => t.length > 3);

    // 1. Bounded fetch: only approved, and limit to max 100 candidates to avoid memory issues
    // To make it relevant, we could use OR conditions, but for simplicity and safety, we just fetch latest 100 approved.
    const cases: HistoricalSupportCase[] = await prisma.historicalSupportCase.findMany({
      where: {
        active: true,
        reviewStatus: "APPROVED",
        extractionStatus: "READY",
        usableAsHistoricalCase: true
      },
      take: 100,
      orderBy: { resolvedAt: "desc" }
    });

    const scoredCases = cases.map(c => {
      let score = 0;

      const tags = Array.isArray(c.tags) ? (c.tags as any[]).map((t: any) => String(t).toLowerCase()) : [];

      // Basic scoring
      for (const pbTerm of pbSearchTerms) {
        if (c.topic && pbTerm.includes(c.topic.toLowerCase())) score += 30; // topic exact/partial match
        if (tags.some((t: string) => pbTerm.includes(t))) score += 20; // tag overlap

        if (c.issueText && c.issueText.toLowerCase().includes(pbTerm)) score += 15;
        if (c.subject && c.subject.toLowerCase().includes(pbTerm)) score += 10;
        if (c.resolutionText && c.resolutionText.toLowerCase().includes(pbTerm)) score += 5;
      }

      return { ...c, score };
    });

    // Filter out zero-score and return top 3
    return scoredCases
      .filter(c => c.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map(c => ({
        id: c.id,
        source: c.source === "RICHPANEL" ? "Richpanel" : c.source,
        ticketId: c.externalNumber || c.externalId,
        issueSummary: c.issueText || c.subject || "No Issue Summary",
        resolutionSummary: c.resolutionText || undefined,
        resolvedDate: c.resolvedAt ? c.resolvedAt.toLocaleDateString() : undefined,
        tags: Array.isArray(c.tags) ? (c.tags as any[]).map((t: any) => String(t)) : [],
        sourceUrl: c.sourceUrl || undefined,
      }));
  } catch (err: any) {
    console.error(`[Database Error] Failed to find similar resolved cases for playbook "${playbookId}":`, err);
    if (allowStaticFallback) {
      return [];
    }
    throw err;
  }
}
