import { categories } from "@/data/categories";
import { playbooks } from "@/data/playbooks";
import { notFound } from "next/navigation";
import PlaybookCard from "@/components/playbook/PlaybookCard";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export function generateStaticParams() {
  return categories.map((c) => ({
    slug: c.key,
  }));
}

export default function CategoryPage({ params }: { params: { slug: string } }) {
  const category = categories.find((c) => c.key === params.slug);

  if (!category) {
    notFound();
  }

  const categoryPlaybooks = playbooks.filter((p) => p.category === category.key);

  return (
    <div className="max-w-[800px] mx-auto py-[40px] px-[20px]">
      <Link href="/" className="inline-flex items-center gap-[4px] text-[13px] text-[var(--ink-2)] hover:text-[var(--accent)] mb-[20px] no-underline">
        <ChevronLeft className="w-4 h-4" /> Back to Home
      </Link>
      
      <div className="flex flex-col gap-[3px] mb-[20px]">
        <span className="font-display font-semibold text-[10px] tracking-[0.16em] uppercase text-[var(--accent)]">Category</span>
        <h2 className="text-[26px] font-bold tracking-[-0.015em]">{category.title}</h2>
      </div>

      <div className="flex flex-col gap-[15px]">
        {categoryPlaybooks.length > 0 ? (
          categoryPlaybooks.map(p => (
            <PlaybookCard key={p.id} playbook={p} />
          ))
        ) : (
          <div className="border border-dashed border-[var(--line)] rounded-[var(--radius)] p-[34px_20px] text-center text-[var(--ink-3)] text-[14px]">
            No playbooks found in this category.
          </div>
        )}
      </div>
    </div>
  );
}
