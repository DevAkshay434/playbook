import { Playbook } from "@/types/playbook";
import { playbooks } from "@/data/playbooks";

export interface SearchResult {
  playbook: Playbook;
  score: number;
}

export function searchPlaybooks(query: string, categoryFilter?: string, authorityFilter?: string): Playbook[] {
  // Simple empty check
  const q = query.trim().toLowerCase();
  
  let candidates = playbooks;
  
  if (categoryFilter) {
    candidates = candidates.filter(p => p.category === categoryFilter);
  }
  
  if (authorityFilter) {
    candidates = candidates.filter(p => p.authority === authorityFilter);
  }
  
  if (!q) return candidates;

  const results: SearchResult[] = candidates.map(playbook => {
    let score = 0;
    
    const titleMatch = playbook.title.toLowerCase();
    
    // 1. Exact title match
    if (titleMatch === q) {
      score += 100;
    } 
    // 4. Partial title match
    else if (titleMatch.includes(q)) {
      score += 50;
    }
    
    // 2. Customer phrase match
    const phraseMatch = playbook.customerPhrases.some(phrase => phrase.toLowerCase().includes(q));
    if (phraseMatch) {
      score += 80;
    }
    
    // 3. Alias match
    const aliasMatch = playbook.aliases.some(alias => alias.toLowerCase().includes(q));
    if (aliasMatch) {
      score += 60;
    }
    
    // 5. Remaining content match (facts, troubleshooting steps)
    let contentStr = '';
    if (playbook.facts) contentStr += playbook.facts.join(" ") + " ";
    if (playbook.troubleshootingSteps) contentStr += playbook.troubleshootingSteps.join(" ");
    
    if (contentStr.toLowerCase().includes(q)) {
      score += 20;
    }
    
    return { playbook, score };
  });
  
  return results
    .filter(r => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .map(r => r.playbook);
}

export function trackSearchEvent(query: string, resultCount: number, selectedPlaybookId?: string) {
  // Placeholder for analytics logic
  console.log(`[Search Analytics] query: "${query}", results: ${resultCount}, selected: ${selectedPlaybookId || 'none'}`);
}
