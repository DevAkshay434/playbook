export interface Category {
  key: string;
  title: string;
}

export interface AuthorityRule {
  action: string;
  who: string;
  lvl: 'resolve' | 'judge' | 'escalate';
  ceiling: string;
  confirm: boolean;
  cond: string;
}

export interface PolicyReference {
  policy: string;
  note: string;
}

export interface Playbook {
  id: string;
  slug: string;
  title: string;
  category: "freight" | "product" | "tech" | "money" | "sales" | string;
  authority: "resolve" | "judge" | "escalate" | string;
  customerPhrases: string[];
  aliases: string[];
  facts?: string[];
  troubleshootingSteps?: string[];
  suggestedResponse?: string;
  dontDo?: string[];
  policyReferences?: PolicyReference[];
  source?: string;
  lastConfirmed?: string;
  knownGap?: boolean | string;
}
