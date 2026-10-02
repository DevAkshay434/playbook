"use client";
import { useState, useTransition } from "react";
import { addPlaybookKBLink, removePlaybookKBLink, searchKBArticles } from "@/app/actions/knowledge-base";

interface LinkedArticle {
  id: string;
  knowledgeBaseArticle: {
    id: string;
    title: string;
    url: string;
  };
}

interface Props {
  playbookId: string;
  linkedArticles: LinkedArticle[];
}

export default function PlaybookKBLinkManager({ playbookId, linkedArticles }: Props) {
  const [isPending, startTransition] = useTransition();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<{ id: string; title: string; url: string }[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const linkedIds = new Set(linkedArticles.map(l => l.knowledgeBaseArticle.id));

  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    searchKBArticles(searchQuery).then(results => {
      setSearchResults(results.filter(r => !linkedIds.has(r.id)));
      setIsSearching(false);
    });
  };

  const handleAdd = (articleId: string) => {
    startTransition(async () => {
      await addPlaybookKBLink(playbookId, articleId);
      setSearchResults(prev => prev.filter(r => r.id !== articleId));
      window.location.reload();
    });
  };

  const handleRemove = (linkId: string) => {
    startTransition(async () => {
      await removePlaybookKBLink(linkId);
      window.location.reload();
    });
  };

  return (
    <div className="flex flex-col gap-[12px] bg-[var(--surface)] border border-[var(--line)] rounded-[var(--radius)] p-[15px]">
      <h3 className="font-display font-bold text-[11px] tracking-[0.12em] uppercase text-[var(--ink-2)]">
        Linked KB Articles
      </h3>

      {/* Current links */}
      {linkedArticles.length === 0 ? (
        <p className="text-[12px] text-[var(--ink-3)] m-0">No KB articles manually linked yet.</p>
      ) : (
        <div className="flex flex-col gap-[6px]">
          {linkedArticles.map(link => (
            <div key={link.id} className="flex items-center gap-[8px] bg-[var(--ground)] rounded-[6px] px-[10px] py-[7px] border border-[var(--line)]">
              <span className="text-[13px] text-[var(--ink)] flex-1 truncate">{link.knowledgeBaseArticle.title}</span>
              <a href={link.knowledgeBaseArticle.url} target="_blank" rel="noreferrer" className="text-[11px] text-[var(--accent)] hover:underline shrink-0">View</a>
              <button
                onClick={() => handleRemove(link.id)}
                disabled={isPending}
                className="text-[11px] text-[var(--stop)] hover:underline bg-transparent border-0 cursor-pointer shrink-0 disabled:opacity-50"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Search to add */}
      <div className="flex gap-[6px] items-center mt-[6px]">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          placeholder="Search KB articles to link..."
          className="flex-1 text-[13px] p-[7px_10px] rounded-[6px] border border-[var(--line)] bg-[var(--ground)]"
        />
        <button
          onClick={handleSearch}
          disabled={isSearching}
          className="font-display font-bold text-[10px] tracking-[0.05em] uppercase bg-[var(--navy)] text-white rounded-[6px] px-[12px] py-[8px] cursor-pointer hover:bg-[var(--accent)] disabled:opacity-50 border-0 shrink-0"
        >
          {isSearching ? "..." : "Search"}
        </button>
      </div>

      {/* Search results */}
      {searchResults.length > 0 && (
        <div className="flex flex-col gap-[4px] border border-[var(--line)] rounded-[6px] p-[8px] bg-[var(--ground)]">
          {searchResults.map(article => (
            <div key={article.id} className="flex items-center gap-[8px] py-[4px]">
              <span className="text-[12px] text-[var(--ink)] flex-1 truncate">{article.title}</span>
              <button
                onClick={() => handleAdd(article.id)}
                disabled={isPending}
                className="text-[11px] text-[var(--ok)] font-bold hover:underline bg-transparent border-0 cursor-pointer shrink-0 disabled:opacity-50"
              >
                + Add
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
