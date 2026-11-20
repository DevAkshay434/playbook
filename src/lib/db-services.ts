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
    try {
      return await prisma.playbook.findMany({
        where: { active: true },
        include: {
          category: true,
          policyReferences: true
        },
        orderBy: { sortOrder: 'asc' }
      });
    } catch (e: any) {
      console.error("[Database Error] Failed to fetch playbooks from database:", e);
      if (allowStaticFallback) {
        console.warn("[Database Fallback] Falling back to static playbooks because allowStaticFallback is enabled.");
        return fallbackPlaybooks as any;
      }
      throw e;
    }
  }
  if (!allowStaticFallback) {
    console.error("[Database Error] Database connection required for getPlaybooks.");
    throw new Error("Database connection required.");
  }
  return fallbackPlaybooks;
}

export async function getPlaybookBySlug(slug: string) {
  if (isDbConnected) {
    try {
      return await prisma.playbook.findUnique({
        where: { slug },
        include: {
          category: true,
          policyReferences: true
        }
      });
    } catch (e: any) {
      console.error(`[Database Error] Failed to fetch playbook for slug "${slug}":`, e);
      if (allowStaticFallback) {
        console.warn("[Database Fallback] Falling back to static playbook because allowStaticFallback is enabled.");
        return (fallbackPlaybooks.find(p => p.slug === slug) as any) || null;
      }
      throw e;
    }
  }
  if (!allowStaticFallback) {
    console.error("[Database Error] Database connection required for getPlaybookBySlug.");
    throw new Error("Database connection required.");
  }
  return fallbackPlaybooks.find(p => p.slug === slug) || null;
}

export async function getPlaybookById(id: string) {
  if (isDbConnected) {
    try {
      return await prisma.playbook.findUnique({
        where: { id },
        include: {
          category: true,
          policyReferences: true
        }
      });
    } catch (e: any) {
      console.error(`[Database Error] Failed to fetch playbook for id "${id}":`, e);
      if (allowStaticFallback) {
        console.warn("[Database Fallback] Falling back to static playbook because allowStaticFallback is enabled.");
        return fallbackPlaybooks.find(p => (p as any).id === id) || null;
      }
      throw e;
    }
  }
  if (!allowStaticFallback) {
    console.error("[Database Error] Database connection required for getPlaybookById.");
    throw new Error("Database connection required.");
  }
  return fallbackPlaybooks.find(p => (p as any).id === id) || null;
}

export async function getCategories() {
  if (isDbConnected) {
    try {
      return await prisma.category.findMany({
        orderBy: { sortOrder: 'asc' }
      });
    } catch (e: any) {
      console.error("[Database Error] Failed to fetch categories from database:", e);
      if (allowStaticFallback) {
        console.warn("[Database Fallback] Falling back to static categories because allowStaticFallback is enabled.");
        return fallbackCategories;
      }
      throw e;
    }
  }
  if (!allowStaticFallback) {
    console.error("[Database Error] Database connection required for getCategories.");
    throw new Error("Database connection required.");
  }
  return fallbackCategories;
}

export async function getAuthorityRules() {
  if (isDbConnected) {
    try {
      return await prisma.authorityRule.findMany({
        orderBy: { sortOrder: 'asc' }
      });
    } catch (e: any) {
      console.error("[Database Error] Failed to fetch authority rules from database:", e);
      if (allowStaticFallback) {
        console.warn("[Database Fallback] Falling back to static authority rules because allowStaticFallback is enabled.");
        return fallbackAuthorityRules;
      }
      throw e;
    }
  }
  if (!allowStaticFallback) {
    console.error("[Database Error] Database connection required for getAuthorityRules.");
    throw new Error("Database connection required.");
  }
  return fallbackAuthorityRules;
}

export async function getPolicies() {
  if (isDbConnected) {
    try {
      return await prisma.policy.findMany({
        orderBy: { sortOrder: 'asc' }
      });
    } catch (e: any) {
      console.error("[Database Error] Failed to fetch policies from database:", e);
      if (allowStaticFallback) {
        console.warn("[Database Fallback] Falling back to static policies because allowStaticFallback is enabled.");
        return fallbackPolicies;
      }
      throw e;
    }
  }
  if (!allowStaticFallback) {
    console.error("[Database Error] Database connection required for getPolicies.");
    throw new Error("Database connection required.");
  }
  return fallbackPolicies;
}

export async function getTools() {
  if (isDbConnected) {
    try {
      return await prisma.tool.findMany({
        orderBy: { sortOrder: 'asc' }
      });
    } catch (e: any) {
      console.error("[Database Error] Failed to fetch tools from database:", e);
      if (allowStaticFallback) {
        console.warn("[Database Fallback] Falling back to static tools because allowStaticFallback is enabled.");
        return fallbackTools;
      }
      throw e;
    }
  }
  if (!allowStaticFallback) {
    console.error("[Database Error] Database connection required for getTools.");
    throw new Error("Database connection required.");
  }
  return fallbackTools;
}

export async function saveResolution(data: any) {
  if (isDbConnected) {
    try {
      return await prisma.resolution.create({
        data
      });
    } catch (e: any) {
      console.error("[Database Error] Failed to save resolution to database:", e);
      if (allowStaticFallback) {
        console.warn("[Database Fallback] Mock saving resolution because allowStaticFallback is enabled.");
        return { id: "mock-id", ...data, status: "PENDING" };
      }
      throw e;
    }
  }
  if (!allowStaticFallback) {
    console.error("[Database Error] Database connection required for saveResolution.");
    throw new Error("Database connection required.");
  }
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
    prisma.searchEvent.create({ data }).catch(err => {
      console.error("[Database Error] Search tracking failed:", err);
    });
  } else {
    if (!allowStaticFallback) {
      console.error("[Database Error] Database connection required for trackSearchEvent.");
      throw new Error("Database connection required.");
    }
    console.log("Mock tracked search:", data);
  }
}

/**
 * Get manual KB article links for a playbook,
 * returning them in sort order.
 */
export async function getManualKBLinksForPlaybook(playbookId: string) {
  if (!isDbConnected) {
    if (!allowStaticFallback) {
      console.error("[Database Error] Database connection required for getManualKBLinksForPlaybook.");
      throw new Error("Database connection required.");
    }
    return [];
  }
  try {
    return await prisma.playbookKnowledgeBaseArticle.findMany({
      where: { playbookId },
      include: { knowledgeBaseArticle: true },
      orderBy: { sortOrder: "asc" },
    });
  } catch (e: any) {
    console.error(`[Database Error] Failed to fetch manual KB links for playbook "${playbookId}":`, e);
    if (allowStaticFallback) {
      return [];
    }
    throw e;
  }
}
