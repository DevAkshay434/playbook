import { prisma } from "./prisma";
import { playbooks as fallbackPlaybooks } from "@/data/playbooks";
import { categories as fallbackCategories } from "@/data/categories";
import { authorityRules as fallbackAuthorityRules } from "@/data/authorityRules";
import { policies as fallbackPolicies } from "@/data/policies";
import { tools as fallbackTools } from "@/data/tools";

export const isDbConnected = !!process.env.DATABASE_URL;
const allowStaticFallback = process.env.NODE_ENV !== "production" && process.env.USE_STATIC_DATA === "true";

export async function getPlaybooks() {
  if (isDbConnected) {
    return prisma.playbook.findMany({
      where: { active: true },
      include: {
        category: true,
        policyReferences: true
      },
      orderBy: { sortOrder: 'asc' }
    });
  }
  if (!allowStaticFallback) throw new Error("Database connection required.");
  return fallbackPlaybooks;
}

export async function getPlaybookBySlug(slug: string) {
  if (isDbConnected) {
    return prisma.playbook.findUnique({
      where: { slug },
      include: {
        category: true,
        policyReferences: true
      }
    });
  }
  if (!allowStaticFallback) throw new Error("Database connection required.");
  return fallbackPlaybooks.find(p => p.slug === slug) || null;
}

export async function getPlaybookById(id: string) {
  if (isDbConnected) {
    return prisma.playbook.findUnique({
      where: { id },
      include: {
        category: true,
        policyReferences: true
      }
    });
  }
  if (!allowStaticFallback) throw new Error("Database connection required.");
  return fallbackPlaybooks.find(p => (p as any).id === id) || null;
}

export async function getCategories() {
  if (isDbConnected) {
    return prisma.category.findMany({
      orderBy: { sortOrder: 'asc' }
    });
  }
  if (!allowStaticFallback) throw new Error("Database connection required.");
  return fallbackCategories;
}

export async function getAuthorityRules() {
  if (isDbConnected) {
    return prisma.authorityRule.findMany({
      orderBy: { sortOrder: 'asc' }
    });
  }
  if (!allowStaticFallback) throw new Error("Database connection required.");
  return fallbackAuthorityRules;
}

export async function getPolicies() {
  if (isDbConnected) {
    return prisma.policy.findMany({
      orderBy: { sortOrder: 'asc' }
    });
  }
  if (!allowStaticFallback) throw new Error("Database connection required.");
  return fallbackPolicies;
}

export async function getTools() {
  if (isDbConnected) {
    return prisma.tool.findMany({
      orderBy: { sortOrder: 'asc' }
    });
  }
  if (!allowStaticFallback) throw new Error("Database connection required.");
  return fallbackTools;
}

export async function saveResolution(data: any) {
  if (isDbConnected) {
    return prisma.resolution.create({
      data
    });
  }
  if (!allowStaticFallback) throw new Error("Database connection required.");
  console.log("Mock saved resolution:", data);
  return { id: "mock-id", ...data, status: "PENDING" };
}

export async function trackSearchEvent(data: {
  query: string;
  normalizedQuery?: string;
  categoryFilter?: string;
  authorityFilter?: string;
  resultCount: number;
}) {
  if (isDbConnected) {
    // Fire and forget
    prisma.searchEvent.create({ data }).catch(err => console.error("Search tracking failed:", err));
  } else {
    if (!allowStaticFallback) throw new Error("Database connection required.");
    console.log("Mock tracked search:", data);
  }
}

/**
 * Get manual KB article links for a playbook,
 * returning them in sort order.
 */
export async function getManualKBLinksForPlaybook(playbookId: string) {
  if (!isDbConnected) return [];
  return prisma.playbookKnowledgeBaseArticle.findMany({
    where: { playbookId },
    include: { knowledgeBaseArticle: true },
    orderBy: { sortOrder: "asc" },
  });
}
