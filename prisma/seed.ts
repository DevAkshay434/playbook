import { PrismaClient } from "@prisma/client";
import { playbooks } from "../src/data/playbooks";
import { categories } from "../src/data/categories";
import { authorityRules } from "../src/data/authorityRules";
import { policies } from "../src/data/policies";
import { tools } from "../src/data/tools";

const prisma = new PrismaClient();

async function main() {
  // Categories
  for (let i = 0; i < categories.length; i++) {
    const c = categories[i];
    await prisma.category.upsert({
      where: { slug: c.key },
      update: { name: c.title, sortOrder: i },
      create: { slug: c.key, name: c.title, sortOrder: i }
    });
  }

  // Playbooks
  for (const playbook_data of playbooks) {
    const p = playbook_data as any;
    const cat = await prisma.category.findUnique({ where: { slug: p.category } });
    if (!cat) continue;

    const upserted = await prisma.playbook.upsert({
      where: { slug: p.slug },
      update: {
        title: p.title,
        authority: p.authority,
        summary: p.summary,
        customerPhrases: p.customerPhrases,
        aliases: p.aliases || [],
        facts: p.facts || [],
        troubleshootingSteps: p.troubleshootingSteps || [],
        suggestedResponse: p.suggestedResponse,
        dontDo: p.dontDo || [],
        source: p.source,
        lastConfirmed: p.lastConfirmed,
        knownGap: p.knownGap === true || p.knownGap === 'true',
        categoryId: cat.id
      },
      create: {
        slug: p.slug,
        title: p.title,
        authority: p.authority,
        summary: p.summary,
        customerPhrases: p.customerPhrases,
        aliases: p.aliases || [],
        facts: p.facts || [],
        troubleshootingSteps: p.troubleshootingSteps || [],
        suggestedResponse: p.suggestedResponse,
        dontDo: p.dontDo || [],
        source: p.source,
        lastConfirmed: p.lastConfirmed,
        knownGap: p.knownGap === true || p.knownGap === 'true',
        categoryId: cat.id
      }
    });

    if (p.policyReferences) {
      for (const pr of p.policyReferences) {
        await prisma.policyReference.create({
          data: {
            playbookId: upserted.id,
            title: pr.title,
            reference: pr.reference,
            url: pr.url,
            description: pr.description
          }
        });
      }
    }
  }

  // Authority Rules
  for (const r of authorityRules) {
    const exists = await prisma.authorityRule.findFirst({ where: { action: r.action, who: r.who } });
    if (!exists) {
      await prisma.authorityRule.create({
        data: {
          action: r.action,
          who: r.who,
          ceiling: r.ceiling,
          confirm: r.confirm || false,
          cond: r.cond
        }
      });
    }
  }

  // Policies
  for (const pol of policies) {
    const exists = await prisma.policy.findFirst({ where: { policy: pol.policy } });
    if (!exists) {
      await prisma.policy.create({
        data: {
          policy: pol.policy,
          note: pol.note
        }
      });
    }
  }

  // Tools
  for (const t of tools) {
    const exists = await prisma.tool.findFirst({ where: { name: t.name } });
    if (!exists) {
      await prisma.tool.create({
        data: {
          name: t.name,
          role: t.role,
          note: t.note
        }
      });
    }
  }

  console.log("Database seeded successfully.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
