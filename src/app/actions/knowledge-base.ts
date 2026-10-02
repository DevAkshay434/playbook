"use server";
import { auth, isAdmin, isManager } from "@/lib/auth";
import { syncKnowledgeBase } from "@/lib/integrations/wordpress/sync";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function triggerKBSync() {
  const session = await auth();
  const role = (session?.user as any)?.role;
  if (!isAdmin(role) && !isManager(role)) {
    throw new Error("Unauthorized");
  }

  try {
    const result = await syncKnowledgeBase("MANUAL");
    revalidatePath("/admin/knowledge-base");
    return { success: true, result };
  } catch (error: any) {
    console.error("KB Sync Error:", error);
    return { success: false, error: error.message };
  }
}

export async function addPlaybookKBLink(playbookId: string, knowledgeBaseArticleId: string) {
  const session = await auth();
  const role = (session?.user as any)?.role;
  if (!isAdmin(role) && !isManager(role)) {
    throw new Error("Unauthorized");
  }

  const userId = (session?.user as any)?.id || null;

  // Get current max sortOrder for this playbook
  const maxSort = await prisma.playbookKnowledgeBaseArticle.findFirst({
    where: { playbookId },
    orderBy: { sortOrder: "desc" },
    select: { sortOrder: true }
  });

  await prisma.playbookKnowledgeBaseArticle.create({
    data: {
      playbookId,
      knowledgeBaseArticleId,
      sortOrder: (maxSort?.sortOrder ?? -1) + 1,
      createdByUserId: userId,
    }
  });

  revalidatePath(`/admin/playbooks/${playbookId}`);
  return { success: true };
}

export async function removePlaybookKBLink(id: string) {
  const session = await auth();
  const role = (session?.user as any)?.role;
  if (!isAdmin(role) && !isManager(role)) {
    throw new Error("Unauthorized");
  }

  await prisma.playbookKnowledgeBaseArticle.delete({ where: { id } });
  revalidatePath("/admin/playbooks");
  return { success: true };
}

export async function searchKBArticles(query: string) {
  const session = await auth();
  const role = (session?.user as any)?.role;
  if (!isAdmin(role) && !isManager(role)) {
    throw new Error("Unauthorized");
  }

  const q = query.trim().toLowerCase();
  if (!q) return [];

  const articles = await prisma.knowledgeBaseArticle.findMany({
    where: { active: true },
    select: { id: true, title: true, url: true, slug: true },
    orderBy: { title: "asc" }
  });

  return articles.filter(a => a.title.toLowerCase().includes(q)).slice(0, 10);
}
