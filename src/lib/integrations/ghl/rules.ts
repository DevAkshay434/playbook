/**
 * GoHighLevel (GHL) Business Rules & Eligibility Engine
 * Source of truth confirmed by client.
 */

// ─────────────────────────────────────────────────────────────
// 1. Pipeline Allowlist (Phase 2)
// ─────────────────────────────────────────────────────────────
export const APPROVED_SUPPORT_PIPELINE_IDS = [
  "RTfFA6UWNRIMCAc4tRI8", // Ticket - QWT Support Pipeline
  "krmlzguJvECSLdLNVL7o", // Tickets -SoftPro Water Systems support Pipeline
] as const;

export const EXCLUDED_PIPELINE_IDS = [
  "RrztnRRqzwSIVm18MlIX", // Tickets - Local Install Request
] as const;

export const APPROVED_SUPPORT_PIPELINES = [
  "Ticket - QWT Support Pipeline",
  "Tickets - SoftPro Water Systems support Pipeline",
  "Tickets -SoftPro Water Systems support Pipeline",
] as const;

export const EXCLUDED_PIPELINES = [
  "Tickets - Local Install Request",
] as const;

export function isApprovedPipeline(pipelineName?: string | null, pipelineId?: string | null): boolean {
  // 1. Check verified IDs first if provided
  if (pipelineId) {
    if (EXCLUDED_PIPELINE_IDS.includes(pipelineId as any)) return false;
    if (APPROVED_SUPPORT_PIPELINE_IDS.includes(pipelineId as any)) return true;
  }

  if (!pipelineName) return false;
  const normalized = pipelineName.trim().toLowerCase().replace(/\s*-\s*/g, " - ");

  // Exclude explicitly disallowed pipelines
  for (const excluded of EXCLUDED_PIPELINES) {
    if (normalized === excluded.toLowerCase().replace(/\s*-\s*/g, " - ")) return false;
  }

  // Check if Deals, Sales, Order, Ecommerce, Install
  if (
    normalized.includes("deal") ||
    normalized.includes("sales") ||
    normalized.includes("order") ||
    normalized.includes("ecommerce") ||
    normalized.includes("install")
  ) {
    return false;
  }

  // Must match one of the approved support pipelines
  return APPROVED_SUPPORT_PIPELINES.some(
    approved => normalized === approved.toLowerCase().replace(/\s*-\s*/g, " - ")
  );
}

// ─────────────────────────────────────────────────────────────
// 2. Stage-Based Resolution Eligibility (Phase 3)
// ─────────────────────────────────────────────────────────────

// Fully resolved candidate stages
export const RESOLVED_STAGES = [
  "Closed",
  "Support Provided Customer With Resolution",
] as const;

// Unresolved stages (never treat as resolved)
export const UNRESOLVED_STAGES = [
  "New Ticket Submitted",
  "Awaiting Customer Response/Closure",
  "Awaiting Customer Response/ Closure",
] as const;

// Conditional issue-type stages: qualify ONLY with explicit conversation evidence
export const CONDITIONAL_ISSUE_STAGES = [
  "Delayed shipping",
  "Missing Items",
  "Damaged Items",
  "Return - Refund Applied",
  "Return- Refund applied",
] as const;

export type StageResolutionType = "RESOLVED" | "UNRESOLVED" | "CONDITIONAL_ISSUE";

function cleanStage(s: string): string {
  return s
    .trim()
    .toLowerCase()
    .replace(/[\s\-_]+/g, " ")
    .replace(/\s*\/\s*/g, "/")
    .replace(/\s+/g, " ")
    .trim();
}

export function classifyStage(stageName?: string | null): StageResolutionType {
  if (!stageName) return "UNRESOLVED";
  const normalized = cleanStage(stageName);

  for (const stage of RESOLVED_STAGES) {
    if (normalized === cleanStage(stage)) return "RESOLVED";
  }

  for (const stage of CONDITIONAL_ISSUE_STAGES) {
    if (normalized === cleanStage(stage)) return "CONDITIONAL_ISSUE";
  }

  // All known unresolved and any unrecognized stages default to UNRESOLVED
  return "UNRESOLVED";
}

export function isStageResolvedCandidate(stageName?: string | null): boolean {
  return classifyStage(stageName) === "RESOLVED";
}

export function isStageUnresolved(stageName?: string | null): boolean {
  return classifyStage(stageName) === "UNRESOLVED";
}

export function isStageConditionalIssue(stageName?: string | null): boolean {
  return classifyStage(stageName) === "CONDITIONAL_ISSUE";
}

export const isConditionalIssueStage = isStageConditionalIssue;

// ─────────────────────────────────────────────────────────────
// 3. Canonical Category Mapping for Issue Stages (Phase 4)
// ─────────────────────────────────────────────────────────────

export interface CanonicalCategoryInfo {
  readonly id: string;
  readonly slug: string;
  readonly name: string;
  readonly displayLabel: string;
}

export const CANONICAL_PLAYBOOK_CATEGORIES = {
  SHIPPING_FREIGHT: {
    id: "73fd8964-a56c-403b-b2c1-19e9bf750ebf",
    slug: "freight",
    name: "Shipping & freight",
    displayLabel: "Shipping & Freight",
  },
  RETURNS_MONEY: {
    id: "70ec7dd6-e6ba-440d-afa5-4bf3936d6b07",
    slug: "money",
    name: "Returns, refunds & disputes",
    displayLabel: "Returns & Money",
  },
} as const;

// Verified stage IDs to canonical categories
export const STAGE_ID_CATEGORY_MAP: Record<string, CanonicalCategoryInfo> = {
  // Pipeline 1: Ticket - QWT Support Pipeline
  "0ecffdca-1ebb-4805-811c-e304040bb66a": CANONICAL_PLAYBOOK_CATEGORIES.SHIPPING_FREIGHT, // Delayed shipping
  "4c5fbe01-54d4-4419-a977-fae85f491b61": CANONICAL_PLAYBOOK_CATEGORIES.SHIPPING_FREIGHT, // Missing Items
  "68932065-800e-46d5-b8b6-fcdc24ce5bf7": CANONICAL_PLAYBOOK_CATEGORIES.SHIPPING_FREIGHT, // Damaged Items
  "3883a40f-39a8-402a-9118-80d32bfe5886": CANONICAL_PLAYBOOK_CATEGORIES.RETURNS_MONEY,    // Return- Refund applied

  // Pipeline 2: Tickets -SoftPro Water Systems support Pipeline
  "3645e848-6b7d-4833-a121-e463c5dd5ba4": CANONICAL_PLAYBOOK_CATEGORIES.SHIPPING_FREIGHT, // Delayed shipping
  "27a93033-536a-4aa6-bc1a-e5511d92c469": CANONICAL_PLAYBOOK_CATEGORIES.SHIPPING_FREIGHT, // Missing Items
  "5bd2016a-07d5-4d37-995d-29ffb78c67fa": CANONICAL_PLAYBOOK_CATEGORIES.SHIPPING_FREIGHT, // Damaged Items
  "ea7e3d08-db27-4fe1-ad2f-b6d3f4d0e72e": CANONICAL_PLAYBOOK_CATEGORIES.RETURNS_MONEY,    // Return - Refund Applied
};

// Normalized stage names to canonical categories
export const STAGE_NAME_CATEGORY_MAP: Record<string, CanonicalCategoryInfo> = {
  "delayed shipping": CANONICAL_PLAYBOOK_CATEGORIES.SHIPPING_FREIGHT,
  "missing items": CANONICAL_PLAYBOOK_CATEGORIES.SHIPPING_FREIGHT,
  "damaged items": CANONICAL_PLAYBOOK_CATEGORIES.SHIPPING_FREIGHT,
  "return refund applied": CANONICAL_PLAYBOOK_CATEGORIES.RETURNS_MONEY,
};

export function getCanonicalCategoryForStage(stageIdentifier?: string | null): CanonicalCategoryInfo | null {
  if (!stageIdentifier) return null;

  // 1. Check direct stage ID
  if (STAGE_ID_CATEGORY_MAP[stageIdentifier]) {
    return STAGE_ID_CATEGORY_MAP[stageIdentifier];
  }

  // 2. Check normalized stage name
  const normalized = cleanStage(stageIdentifier);
  if (STAGE_NAME_CATEGORY_MAP[normalized]) {
    return STAGE_NAME_CATEGORY_MAP[normalized];
  }

  return null;
}

export function getCategoryForIssueStage(stageIdentifier?: string | null): string | null {
  const cat = getCanonicalCategoryForStage(stageIdentifier);
  return cat ? cat.name : null;
}

export function getCategorySlugForIssueStage(stageIdentifier?: string | null): string | null {
  const cat = getCanonicalCategoryForStage(stageIdentifier);
  return cat ? cat.slug : null;
}

export function getCategoryIdForIssueStage(stageIdentifier?: string | null): string | null {
  const cat = getCanonicalCategoryForStage(stageIdentifier);
  return cat ? cat.id : null;
}

// Backward compatible string map
export const ISSUE_STAGE_CATEGORY_MAP: Record<string, string> = {
  "delayed shipping": CANONICAL_PLAYBOOK_CATEGORIES.SHIPPING_FREIGHT.name,
  "missing items": CANONICAL_PLAYBOOK_CATEGORIES.SHIPPING_FREIGHT.name,
  "damaged items": CANONICAL_PLAYBOOK_CATEGORIES.SHIPPING_FREIGHT.name,
  "return - refund applied": CANONICAL_PLAYBOOK_CATEGORIES.RETURNS_MONEY.name,
  "return- refund applied": CANONICAL_PLAYBOOK_CATEGORIES.RETURNS_MONEY.name,
  "return refund applied": CANONICAL_PLAYBOOK_CATEGORIES.RETURNS_MONEY.name,
};
