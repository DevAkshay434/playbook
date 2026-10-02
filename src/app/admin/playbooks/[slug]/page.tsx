import { prisma } from "@/lib/prisma";
import { savePlaybook } from "@/app/actions/playbook";
import { redirect } from "next/navigation";
import Link from "next/link";
import PlaybookKBLinkManager from "./PlaybookKBLinkManager";

export default async function EditPlaybookPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  
  let playbook = null;
  if (slug !== "new") {
    playbook = await prisma.playbook.findUnique({ where: { slug } });
    if (!playbook) redirect("/admin/playbooks");
  }

  const categories = await prisma.category.findMany();

  // Fetch linked KB articles if editing existing playbook
  let linkedArticles: any[] = [];
  if (playbook) {
    linkedArticles = await prisma.playbookKnowledgeBaseArticle.findMany({
      where: { playbookId: playbook.id },
      include: { knowledgeBaseArticle: { select: { id: true, title: true, url: true } } },
      orderBy: { sortOrder: "asc" },
    });
  }

  return (
    <div className="flex flex-col gap-[20px] max-w-[800px]">
      <div className="flex flex-col gap-[3px] mb-[10px]">
        <h2 className="text-[26px] font-bold tracking-[-0.015em]">
          {playbook ? "Edit Playbook" : "Create Playbook"}
        </h2>
        <Link href="/admin/playbooks" className="text-[13px] text-[var(--accent)] hover:underline">
          &larr; Back to Playbooks
        </Link>
      </div>

      <form action={async (formData) => {
        "use server";
        await savePlaybook(formData);
        redirect("/admin/playbooks");
      }} className="flex flex-col gap-[20px] bg-[var(--surface)] border border-[var(--line)] rounded-[var(--radius)] p-[20px]">
        {playbook && <input type="hidden" name="id" value={playbook.id} />}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-[15px]">
          <div className="flex flex-col gap-[5px]">
            <label className="font-display font-bold text-[10px] tracking-[0.12em] uppercase text-[var(--ink-3)]">Title</label>
            <input required type="text" name="title" defaultValue={playbook?.title} className="font-body text-[14px] p-[8px] rounded-[6px] border border-[var(--line)] bg-[var(--ground)]" />
          </div>
          <div className="flex flex-col gap-[5px]">
            <label className="font-display font-bold text-[10px] tracking-[0.12em] uppercase text-[var(--ink-3)]">Slug</label>
            <input required type="text" name="slug" defaultValue={playbook?.slug} className="font-body text-[14px] p-[8px] rounded-[6px] border border-[var(--line)] bg-[var(--ground)]" />
          </div>
          <div className="flex flex-col gap-[5px]">
            <label className="font-display font-bold text-[10px] tracking-[0.12em] uppercase text-[var(--ink-3)]">Category</label>
            <select required name="categoryId" defaultValue={playbook?.categoryId} className="font-body text-[14px] p-[8px] rounded-[6px] border border-[var(--line)] bg-[var(--ground)]">
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-[5px]">
            <label className="font-display font-bold text-[10px] tracking-[0.12em] uppercase text-[var(--ink-3)]">Authority</label>
            <select required name="authority" defaultValue={playbook?.authority} className="font-body text-[14px] p-[8px] rounded-[6px] border border-[var(--line)] bg-[var(--ground)]">
              <option value="Agent">Agent</option>
              <option value="Agent, After Diagnostics">Agent, After Diagnostics</option>
              <option value="Manager">Manager</option>
              <option value="Hard Stop">Hard Stop</option>
            </select>
          </div>
        </div>

        <div className="flex flex-col gap-[5px]">
          <label className="font-display font-bold text-[10px] tracking-[0.12em] uppercase text-[var(--ink-3)]">Summary</label>
          <input type="text" name="summary" defaultValue={playbook?.summary || ""} className="font-body text-[14px] p-[8px] rounded-[6px] border border-[var(--line)] bg-[var(--ground)]" />
        </div>

        <div className="flex flex-col gap-[5px]">
          <label className="font-display font-bold text-[10px] tracking-[0.12em] uppercase text-[var(--ink-3)]">Customer Phrases (One per line)</label>
          <textarea name="customerPhrases" defaultValue={playbook?.customerPhrases.join("\n")} className="min-h-[80px] font-body text-[14px] p-[8px] rounded-[6px] border border-[var(--line)] bg-[var(--ground)]"></textarea>
        </div>

        <div className="flex flex-col gap-[5px]">
          <label className="font-display font-bold text-[10px] tracking-[0.12em] uppercase text-[var(--ink-3)]">Troubleshooting Steps (One per line)</label>
          <textarea name="troubleshootingSteps" defaultValue={playbook?.troubleshootingSteps.join("\n")} className="min-h-[100px] font-body text-[14px] p-[8px] rounded-[6px] border border-[var(--line)] bg-[var(--ground)]"></textarea>
        </div>

        <div className="flex flex-col gap-[5px]">
          <label className="font-display font-bold text-[10px] tracking-[0.12em] uppercase text-[var(--ink-3)]">Suggested Response</label>
          <textarea name="suggestedResponse" defaultValue={playbook?.suggestedResponse || ""} className="min-h-[100px] font-body text-[14px] p-[8px] rounded-[6px] border border-[var(--line)] bg-[var(--ground)]"></textarea>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-[15px]">
          <div className="flex flex-col gap-[5px]">
            <label className="font-display font-bold text-[10px] tracking-[0.12em] uppercase text-[var(--ink-3)]">Aliases (One per line)</label>
            <textarea name="aliases" defaultValue={playbook?.aliases.join("\n")} className="min-h-[60px] font-body text-[14px] p-[8px] rounded-[6px] border border-[var(--line)] bg-[var(--ground)]"></textarea>
          </div>
          <div className="flex flex-col gap-[5px]">
            <label className="font-display font-bold text-[10px] tracking-[0.12em] uppercase text-[var(--ink-3)]">Facts (One per line)</label>
            <textarea name="facts" defaultValue={playbook?.facts.join("\n")} className="min-h-[60px] font-body text-[14px] p-[8px] rounded-[6px] border border-[var(--line)] bg-[var(--ground)]"></textarea>
          </div>
          <div className="flex flex-col gap-[5px]">
            <label className="font-display font-bold text-[10px] tracking-[0.12em] uppercase text-[var(--ink-3)]">Things Not To Do (One per line)</label>
            <textarea name="dontDo" defaultValue={playbook?.dontDo.join("\n")} className="min-h-[60px] font-body text-[14px] p-[8px] rounded-[6px] border border-[var(--line)] bg-[var(--ground)]"></textarea>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-[15px]">
          <div className="flex flex-col gap-[5px]">
            <label className="font-display font-bold text-[10px] tracking-[0.12em] uppercase text-[var(--ink-3)]">Status</label>
            <select name="active" defaultValue={playbook ? String(playbook.active) : "true"} className="font-body text-[14px] p-[8px] rounded-[6px] border border-[var(--line)] bg-[var(--ground)]">
              <option value="true">Active</option>
              <option value="false">Archived / Inactive</option>
            </select>
          </div>
          <div className="flex flex-col gap-[5px]">
            <label className="font-display font-bold text-[10px] tracking-[0.12em] uppercase text-[var(--ink-3)]">Known Gap</label>
            <select name="knownGap" defaultValue={playbook ? String(playbook.knownGap) : "false"} className="font-body text-[14px] p-[8px] rounded-[6px] border border-[var(--line)] bg-[var(--ground)]">
              <option value="false">No</option>
              <option value="true">Yes</option>
            </select>
          </div>
          <div className="flex flex-col gap-[5px]">
            <label className="font-display font-bold text-[10px] tracking-[0.12em] uppercase text-[var(--ink-3)]">Last Confirmed</label>
            <input type="text" name="lastConfirmed" defaultValue={playbook?.lastConfirmed || ""} placeholder="YYYY-MM-DD" className="font-body text-[14px] p-[8px] rounded-[6px] border border-[var(--line)] bg-[var(--ground)]" />
          </div>
        </div>
        
        {playbook && (
          <div className="flex flex-col gap-[5px] mt-[10px] p-[15px] bg-[var(--ground)] border border-[var(--line)] rounded-[6px]">
            <label className="font-display font-bold text-[10px] tracking-[0.12em] uppercase text-[var(--ink-3)]">Change Note (Required for auditing)</label>
            <input type="text" name="changeNote" required placeholder="What changed and why?" className="font-body text-[14px] p-[8px] rounded-[6px] border border-[var(--line)] bg-white" />
          </div>
        )}

        <button type="submit" className="self-start mt-[10px] font-display font-bold text-[12px] tracking-[0.05em] uppercase bg-[var(--navy)] text-white rounded-[6px] px-[20px] py-[10px] cursor-pointer hover:bg-[var(--accent)] border-0">
          Save Playbook
        </button>
      </form>

      {/* KB Article Link Manager — only for existing playbooks */}
      {playbook && (
        <PlaybookKBLinkManager
          playbookId={playbook.id}
          linkedArticles={linkedArticles}
        />
      )}
    </div>
  );
}
