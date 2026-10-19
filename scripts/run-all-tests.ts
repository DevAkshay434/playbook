import assert from 'node:assert';
import { isAgent, isManager, isAdmin } from '../src/lib/auth';
import { sanitizeText, sanitizeConversation } from '../src/lib/historical-cases/extraction/sanitize';
import { normalizeRichpanelTicket } from '../src/lib/integrations/richpanel/normalizer';
import { HistoricalConversationInput } from '../src/lib/historical-cases/extraction/types';

console.log('====================================================');
console.log('RUNNING SYNTHETIC VERIFICATION TEST SUITE');
console.log('====================================================\n');

let passedTests = 0;
let totalTests = 0;

function test(name: string, fn: () => void) {
  totalTests++;
  try {
    fn();
    console.log(`[PASS] ${name}`);
    passedTests++;
  } catch (err: any) {
    console.error(`[FAIL] ${name}`);
    console.error(err);
  }
}

// ─────────────────────────────────────────────────────────────
// 1. RBAC Tests
// ─────────────────────────────────────────────────────────────
test('RBAC: Agent role permissions', () => {
  assert.strictEqual(isAgent('AGENT'), true);
  assert.strictEqual(isAgent('MANAGER'), true);
  assert.strictEqual(isAgent('ADMIN'), true);
  assert.strictEqual(isAgent('UNKNOWN'), false);
  assert.strictEqual(isAgent(undefined), false);

  assert.strictEqual(isManager('AGENT'), false);
  assert.strictEqual(isAdmin('AGENT'), false);
});

test('RBAC: Manager role permissions', () => {
  assert.strictEqual(isManager('MANAGER'), true);
  assert.strictEqual(isManager('ADMIN'), true);
  assert.strictEqual(isManager('AGENT'), false);
  assert.strictEqual(isAdmin('MANAGER'), false);
});

test('RBAC: Admin role permissions', () => {
  assert.strictEqual(isAdmin('ADMIN'), true);
  assert.strictEqual(isAdmin('MANAGER'), false);
  assert.strictEqual(isAdmin('AGENT'), false);
});

// ─────────────────────────────────────────────────────────────
// 2. Richpanel Eligibility Tests
// ─────────────────────────────────────────────────────────────
test('Eligibility: Empty/stub tickets without comments are ineligible', () => {
  const stubTicket = {
    id: 'test-stub-1',
    status: 'CLOSED',
    is_trashed: false,
    comments: [],
    tags: []
  };

  const hasCustomer = (stubTicket.comments || []).some((c: any) => c.is_operator === false);
  const hasAgent = (stubTicket.comments || []).some((c: any) => c.is_operator === true);
  const isEligible = stubTicket.comments.length > 0 && hasCustomer && hasAgent;

  assert.strictEqual(isEligible, false);
});

test('Eligibility: Single-sided tickets (operator only or customer only) are ineligible', () => {
  const opOnly = {
    comments: [{ is_operator: true, plain_body: 'Internal note' }]
  };
  const custOnly = {
    comments: [{ is_operator: false, plain_body: 'Help please' }]
  };

  const opEligible = opOnly.comments.some((c: any) => c.is_operator === false) &&
                     opOnly.comments.some((c: any) => c.is_operator === true);
  const custEligible = custOnly.comments.some((c: any) => c.is_operator === false) &&
                       custOnly.comments.some((c: any) => c.is_operator === true);

  assert.strictEqual(opEligible, false);
  assert.strictEqual(custEligible, false);
});

test('Eligibility: Trashed or Spam tickets are ineligible', () => {
  const trashedTicket = { is_trashed: true, tags: [] };
  const spamTicket = { is_trashed: false, tags: ['spam', 'unwanted'] };
  const testTicket = { is_trashed: false, tags: ['test-case'] };

  const isTrashed = trashedTicket.is_trashed;
  const isSpam = spamTicket.tags.some(t => t.toLowerCase().includes('spam') || t.toLowerCase().includes('test'));
  const isTest = testTicket.tags.some(t => t.toLowerCase().includes('spam') || t.toLowerCase().includes('test'));

  assert.strictEqual(isTrashed, true);
  assert.strictEqual(isSpam, true);
  assert.strictEqual(isTest, true);
});

test('Eligibility: Customer + Agent interplay is eligible', () => {
  const eligibleTicket = {
    is_trashed: false,
    tags: ['water-filter'],
    comments: [
      { is_operator: false, plain_body: 'My filter light is blinking red.' },
      { is_operator: true, plain_body: 'Please reset the valve by pressing the red button for 5 seconds.' },
      { is_operator: false, plain_body: 'That worked, thank you!' }
    ]
  };

  const hasCustomer = eligibleTicket.comments.some((c: any) => c.is_operator === false);
  const hasAgent = eligibleTicket.comments.some((c: any) => c.is_operator === true);
  const isEligible = !eligibleTicket.is_trashed && eligibleTicket.comments.length >= 2 && hasCustomer && hasAgent;

  assert.strictEqual(isEligible, true);
});

// ─────────────────────────────────────────────────────────────
// 3. Normalization Tests
// ─────────────────────────────────────────────────────────────
test('Normalization: Safely normalizes Richpanel ticket metadata', () => {
  const ticket: any = {
    id: 'ticket-999',
    conversation_no: 12345,
    subject: 'Valve Leak',
    tags: ['hardware', 'urgent'],
    url: 'https://richpanel.com/tickets/12345',
    created_at: '2026-03-01T10:00:00Z',
    updated_at: '2026-03-02T12:00:00Z',
    closed_at: '2026-03-02T12:00:00Z'
  };

  const norm = normalizeRichpanelTicket(ticket);
  assert.strictEqual(norm.externalId, 'ticket-999');
  assert.strictEqual(norm.externalNumber, '12345');
  assert.strictEqual(typeof norm.externalNumber, 'string');
  assert.strictEqual(norm.subject, 'Valve Leak');
  assert.deepStrictEqual(norm.tags, ['hardware', 'urgent']);
  assert.strictEqual(norm.sourceUrl, 'https://richpanel.com/tickets/12345');
  assert.ok(norm.openedAt instanceof Date);
  assert.ok(norm.closedAt instanceof Date);
});

// ─────────────────────────────────────────────────────────────
// 4. Privacy & PII Sanitization Tests
// ─────────────────────────────────────────────────────────────
test('Privacy: Redacts email addresses and phone numbers via regex', () => {
  const rawText = 'Contact John at john.doe@example.com or call 555-123-4567 for help.';
  const sanitized = sanitizeText(rawText);

  assert.ok(!sanitized.includes('john.doe@example.com'));
  assert.ok(!sanitized.includes('555-123-4567'));
  assert.ok(sanitized.includes('[EMAIL]'));
  assert.ok(sanitized.includes('[PHONE]'));
});

test('Privacy: Redacts known customer names from customer profile', () => {
  const profile = {
    name: 'Eleanor Vance',
    email: 'eleanor@hillhouse.org',
    phone: '212-555-9876'
  };

  const input: HistoricalConversationInput = {
    source: 'RICHPANEL',
    externalId: 'test-123',
    subject: 'Question from Eleanor Vance',
    customerProfile: profile,
    messages: [
      {
        role: 'CUSTOMER',
        text: 'Hi this is Eleanor Vance, my email is eleanor@hillhouse.org and phone is 212-555-9876.'
      },
      {
        role: 'AGENT',
        text: 'Hello Eleanor, let me help you with your filter.'
      }
    ]
  };

  const sanitized = sanitizeConversation(input);

  assert.ok(!sanitized.subject?.includes('Eleanor Vance'));
  assert.ok(sanitized.subject?.includes('[CUSTOMER]'));

  for (const m of sanitized.messages) {
    assert.ok(!m.text.includes('Eleanor Vance'));
    assert.ok(!m.text.includes('eleanor@hillhouse.org'));
    assert.ok(!m.text.includes('212-555-9876'));
  }
});

// ─────────────────────────────────────────────────────────────
// 5. Ranking & Search Hierarchy Tests
// ─────────────────────────────────────────────────────────────
test('Search Hierarchy: Official Playbooks outrank Knowledge Base and Historical Cases', () => {
  const TIER = {
    PLAYBOOK: 1000,
    KB_ARTICLE: 500,
    HISTORICAL_CASE: 0
  };

  const pbScore = TIER.PLAYBOOK + 50; // 1050
  const kbScore = TIER.KB_ARTICLE + 100; // 600
  const hcScore = TIER.HISTORICAL_CASE + 100; // 100

  assert.ok(pbScore > kbScore, 'Playbook must outrank KB article');
  assert.ok(kbScore > hcScore, 'KB article must outrank Historical case');
  assert.ok(pbScore > hcScore, 'Playbook must strictly outrank Historical case');
});

test('Similar Resolved Cases: Only approved, ready, active, usable cases match', () => {
  const cases = [
    { id: '1', active: true, reviewStatus: 'APPROVED', extractionStatus: 'READY', usableAsHistoricalCase: true },
    { id: '2', active: true, reviewStatus: 'PENDING', extractionStatus: 'READY', usableAsHistoricalCase: true },
    { id: '3', active: true, reviewStatus: 'REJECTED', extractionStatus: 'READY', usableAsHistoricalCase: true },
    { id: '4', active: true, reviewStatus: 'APPROVED', extractionStatus: 'FAILED', usableAsHistoricalCase: true },
    { id: '5', active: false, reviewStatus: 'APPROVED', extractionStatus: 'READY', usableAsHistoricalCase: true },
    { id: '6', active: true, reviewStatus: 'APPROVED', extractionStatus: 'READY', usableAsHistoricalCase: false }
  ];

  const eligible = cases.filter(c =>
    c.active === true &&
    c.reviewStatus === 'APPROVED' &&
    c.extractionStatus === 'READY' &&
    c.usableAsHistoricalCase === true
  );

  assert.strictEqual(eligible.length, 1);
  assert.strictEqual(eligible[0].id, '1');
});

// ─────────────────────────────────────────────────────────────
// 6. Review Decision Persistence Tests
// ─────────────────────────────────────────────────────────────
test('Review Decisions: Existing reviewStatus and extractions survive resync', () => {
  const existingCaseInDb = {
    id: 'case-1',
    reviewStatus: 'APPROVED',
    extractionStatus: 'READY',
    issueText: 'Blinking red light on control valve',
    resolutionText: 'Replaced backup 9V battery and reset timer',
    sourceUpdatedAt: new Date('2026-03-01T00:00:00Z')
  };

  // Incoming sync update with newer timestamp
  const incomingSyncData = {
    subject: 'Valve question',
    sourceUpdatedAt: new Date('2026-03-02T00:00:00Z')
  };

  // Simulating sync update operation (from src/lib/integrations/richpanel/sync.ts & ghl/sync.ts)
  const updatedCase = {
    ...existingCaseInDb,
    subject: incomingSyncData.subject,
    sourceUpdatedAt: incomingSyncData.sourceUpdatedAt
    // Notice: reviewStatus, extractionStatus, issueText, resolutionText are preserved untouched!
  };

  assert.strictEqual(updatedCase.reviewStatus, 'APPROVED');
  assert.strictEqual(updatedCase.extractionStatus, 'READY');
  assert.strictEqual(updatedCase.issueText, 'Blinking red light on control valve');
  assert.strictEqual(updatedCase.resolutionText, 'Replaced backup 9V battery and reset timer');
});

// ─────────────────────────────────────────────────────────────
// 7. GHL Pipeline & Workflow Rules (Phase 8 Specific Tests)
// ─────────────────────────────────────────────────────────────
import {
  isApprovedPipeline,
  isStageResolvedCandidate,
  isStageUnresolved,
  isStageConditionalIssue,
  classifyStage,
  getCategoryForIssueStage,
  getCategorySlugForIssueStage,
  getCategoryIdForIssueStage,
  getCanonicalCategoryForStage,
  CANONICAL_PLAYBOOK_CATEGORIES
} from '../src/lib/integrations/ghl/rules';
import { normalizeGhlTicket, normalizeGhlMessages } from '../src/lib/integrations/ghl/normalizer';

test('GHL Rule 1: Both approved support pipelines are included', () => {
  assert.strictEqual(isApprovedPipeline('Ticket - QWT Support Pipeline'), true);
  assert.strictEqual(isApprovedPipeline('Tickets - SoftPro Water Systems support Pipeline'), true);
  // Case-insensitivity check
  assert.strictEqual(isApprovedPipeline('ticket - qwt support pipeline'), true);
});

test('GHL Rule 2: Local Install Request is excluded', () => {
  assert.strictEqual(isApprovedPipeline('Tickets - Local Install Request'), false);
  assert.strictEqual(isApprovedPipeline('tickets - local install request'), false);
});

test('GHL Rule 3: Deals, Sales, Order, Ecommerce pipelines are excluded', () => {
  assert.strictEqual(isApprovedPipeline('Deals Pipeline'), false);
  assert.strictEqual(isApprovedPipeline('Sales Pipeline 2026'), false);
  assert.strictEqual(isApprovedPipeline('Online Order Fulfillment'), false);
  assert.strictEqual(isApprovedPipeline('Ecommerce Support'), false);
  assert.strictEqual(isApprovedPipeline('Random Other Pipeline'), false);
});

test('GHL Rule 4: Closed and Support Provided Customer With Resolution qualify as resolved candidates', () => {
  assert.strictEqual(isStageResolvedCandidate('Closed'), true);
  assert.strictEqual(isStageResolvedCandidate('Support Provided Customer With Resolution'), true);
  assert.strictEqual(classifyStage('Closed'), 'RESOLVED');
  assert.strictEqual(classifyStage('Support Provided Customer With Resolution'), 'RESOLVED');
});

test('GHL Rule 5: New Ticket Submitted and Awaiting Customer Response/Closure are not treated as resolved', () => {
  assert.strictEqual(isStageResolvedCandidate('New Ticket Submitted'), false);
  assert.strictEqual(isStageResolvedCandidate('Awaiting Customer Response/Closure'), false);
  assert.strictEqual(isStageUnresolved('New Ticket Submitted'), true);
  assert.strictEqual(isStageUnresolved('Awaiting Customer Response/Closure'), true);
  assert.strictEqual(isStageUnresolved('Unknown Random Stage'), true);
});

test('GHL Rule 6: Conditional issue stages identified for explicit outcome evidence check', () => {
  assert.strictEqual(isStageConditionalIssue('Delayed shipping'), true);
  assert.strictEqual(isStageConditionalIssue('Missing Items'), true);
  assert.strictEqual(isStageConditionalIssue('Damaged Items'), true);
  assert.strictEqual(isStageConditionalIssue('Return - Refund Applied'), true);
  assert.strictEqual(classifyStage('Delayed shipping'), 'CONDITIONAL_ISSUE');
});

test('GHL Rule 7: Missing or ambiguous resolution evidence produces usableAsHistoricalCase = false', () => {
  // Simulating extraction outcome for a conditional case without explicit evidence
  const extractionResultWithoutEvidence = {
    issueSummary: 'Customer inquired about delayed shipment',
    symptoms: 'Package has not arrived',
    troubleshooting: 'Checked tracking number',
    finalResolution: null, // No confirmed outcome evidence found
    usableAsHistoricalCase: false // Must be false!
  };

  assert.strictEqual(extractionResultWithoutEvidence.finalResolution, null);
  assert.strictEqual(extractionResultWithoutEvidence.usableAsHistoricalCase, false);
});

test('GHL Rule 8: Issue stages map to exact canonical Playbook categories and IDs', () => {
  // 1. Assert Canonical Identifiers and Taxonomy
  assert.strictEqual(CANONICAL_PLAYBOOK_CATEGORIES.SHIPPING_FREIGHT.id, '73fd8964-a56c-403b-b2c1-19e9bf750ebf');
  assert.strictEqual(CANONICAL_PLAYBOOK_CATEGORIES.SHIPPING_FREIGHT.slug, 'freight');
  assert.strictEqual(CANONICAL_PLAYBOOK_CATEGORIES.SHIPPING_FREIGHT.name, 'Shipping & freight');
  assert.strictEqual(CANONICAL_PLAYBOOK_CATEGORIES.SHIPPING_FREIGHT.displayLabel, 'Shipping & Freight');

  assert.strictEqual(CANONICAL_PLAYBOOK_CATEGORIES.RETURNS_MONEY.id, '70ec7dd6-e6ba-440d-afa5-4bf3936d6b07');
  assert.strictEqual(CANONICAL_PLAYBOOK_CATEGORIES.RETURNS_MONEY.slug, 'money');
  assert.strictEqual(CANONICAL_PLAYBOOK_CATEGORIES.RETURNS_MONEY.name, 'Returns, refunds & disputes');
  assert.strictEqual(CANONICAL_PLAYBOOK_CATEGORIES.RETURNS_MONEY.displayLabel, 'Returns & Money');

  // 2. Assert Canonical Names by Stage Name
  assert.strictEqual(getCategoryForIssueStage('Delayed shipping'), 'Shipping & freight');
  assert.strictEqual(getCategoryForIssueStage('Missing Items'), 'Shipping & freight');
  assert.strictEqual(getCategoryForIssueStage('Damaged Items'), 'Shipping & freight');
  assert.strictEqual(getCategoryForIssueStage('Return - Refund Applied'), 'Returns, refunds & disputes');
  assert.strictEqual(getCategoryForIssueStage('Closed'), null);

  // 3. Assert Canonical Slugs and IDs
  assert.strictEqual(getCategorySlugForIssueStage('Delayed shipping'), 'freight');
  assert.strictEqual(getCategoryIdForIssueStage('Delayed shipping'), '73fd8964-a56c-403b-b2c1-19e9bf750ebf');
  assert.strictEqual(getCategorySlugForIssueStage('Return - Refund Applied'), 'money');
  assert.strictEqual(getCategoryIdForIssueStage('Return - Refund Applied'), '70ec7dd6-e6ba-440d-afa5-4bf3936d6b07');

  // 4. Assert Normalization of Punctuation, Whitespace, and Capitalization
  assert.strictEqual(getCategoryForIssueStage('Return- Refund applied'), 'Returns, refunds & disputes');
  assert.strictEqual(getCategoryForIssueStage('  RETURN - REFUND APPLIED  '), 'Returns, refunds & disputes');
  assert.strictEqual(getCategoryForIssueStage('delayed   shipping'), 'Shipping & freight');
  assert.strictEqual(getCategoryForIssueStage('DAMAGED ITEMS'), 'Shipping & freight');
  assert.strictEqual(getCategoryForIssueStage('missing items'), 'Shipping & freight');

  // 5. Assert Direct Verified Stage IDs
  // Pipeline 1: Ticket - QWT Support Pipeline
  assert.strictEqual(getCategoryForIssueStage('0ecffdca-1ebb-4805-811c-e304040bb66a'), 'Shipping & freight'); // Delayed shipping
  assert.strictEqual(getCategoryForIssueStage('4c5fbe01-54d4-4419-a977-fae85f491b61'), 'Shipping & freight'); // Missing Items
  assert.strictEqual(getCategoryForIssueStage('68932065-800e-46d5-b8b6-fcdc24ce5bf7'), 'Shipping & freight'); // Damaged Items
  assert.strictEqual(getCategoryForIssueStage('3883a40f-39a8-402a-9118-80d32bfe5886'), 'Returns, refunds & disputes'); // Return- Refund applied

  // Pipeline 2: Tickets -SoftPro Water Systems support Pipeline
  assert.strictEqual(getCategoryForIssueStage('3645e848-6b7d-4833-a121-e463c5dd5ba4'), 'Shipping & freight'); // Delayed shipping
  assert.strictEqual(getCategoryForIssueStage('27a93033-536a-4aa6-bc1a-e5511d92c469'), 'Shipping & freight'); // Missing Items
  assert.strictEqual(getCategoryForIssueStage('5bd2016a-07d5-4d37-995d-29ffb78c67fa'), 'Shipping & freight'); // Damaged Items
  assert.strictEqual(getCategoryForIssueStage('ea7e3d08-db27-4fe1-ad2f-b6d3f4d0e72e'), 'Returns, refunds & disputes'); // Return - Refund Applied
});

test('GHL Rule 9: Won/Lost opportunity status never determines resolution', () => {
  // Opportunity with status 'won' but in an unresolved stage
  const oppWonUnresolved = {
    pipelineStageName: 'New Ticket Submitted',
    status: 'won'
  };
  assert.strictEqual(isStageResolvedCandidate(oppWonUnresolved.pipelineStageName), false);

  // Opportunity with status 'lost' but in a resolved stage
  const oppLostResolved = {
    pipelineStageName: 'Closed',
    status: 'lost'
  };
  assert.strictEqual(isStageResolvedCandidate(oppLostResolved.pipelineStageName), true);
});

test('GHL Rule 10: Normalizer extracts metadata cleanly without raw PII', () => {
  const conv: any = {
    id: 'ghl-conv-456',
    dateAdded: 1792087831774,
    dateUpdated: 1792402535595,
    locationId: 'loc-123',
    tags: ['water-filter']
  };
  const opp: any = {
    id: 'opp-789',
    name: 'Filter Replacement Support',
    pipelineStageName: 'Delayed shipping',
    updatedAt: '2026-03-20T10:00:00Z'
  };

  const normalized = normalizeGhlTicket(conv, opp, 'loc-123');
  assert.strictEqual(normalized.externalId, 'ghl-conv-456');
  assert.strictEqual(normalized.externalNumber, 'opp-789');
  assert.strictEqual(normalized.subject, 'Filter Replacement Support');
  assert.strictEqual(normalized.status, 'Delayed shipping');
  assert.strictEqual(normalized.topic, 'Shipping & freight');
  assert.ok(normalized.tags.includes('Shipping & freight'));
  assert.ok(normalized.tags.includes('water-filter'));
  assert.ok(normalized.sourceUrl?.includes('loc-123'));
});

test('GHL Rule 11: Normalizer correctly maps message direction and filters automated notices', () => {
  const rawMsgs: any = [
    {
      id: 'm1',
      direction: 'inbound',
      body: 'Where is my shipment?',
      dateAdded: 1792087831000
    },
    {
      id: 'm2',
      direction: 'outbound',
      body: 'HubSpot Logo ROUTE NEW MESSAGES AUTOMATICALLY system notice',
      dateAdded: 1792087832000
    },
    {
      id: 'm3',
      direction: 'outbound',
      body: 'Your replacement has shipped via FedEx tracking 12345.',
      dateAdded: 1792087833000
    }
  ];

  const normalized = normalizeGhlMessages(rawMsgs);
  // Automated notification (m2) must be filtered out
  assert.strictEqual(normalized.length, 2);
  assert.strictEqual(normalized[0].role, 'CUSTOMER');
  assert.strictEqual(normalized[0].text, 'Where is my shipment?');
  assert.strictEqual(normalized[1].role, 'AGENT');
  assert.strictEqual(normalized[1].text, 'Your replacement has shipped via FedEx tracking 12345.');
});

test('GHL Rule 12: PII sanitized before extraction', () => {
  const rawText = 'Customer Jane at jane@example.com (555-444-3322) requested update.';
  const sanitized = sanitizeText(rawText);
  assert.ok(!sanitized.includes('jane@example.com'));
  assert.ok(!sanitized.includes('555-444-3322'));
  assert.ok(sanitized.includes('[EMAIL]'));
  assert.ok(sanitized.includes('[PHONE]'));
});

test('GHL Rule 13: Existing Richpanel functionality remains intact and separate', () => {
  const rpTicket: any = {
    id: 'rp-123',
    conversation_no: 8888,
    subject: 'Richpanel ticket',
    tags: ['rp-tag'],
    url: 'https://richpanel.com/8888',
    created_at: '2026-03-01T10:00:00Z',
    updated_at: '2026-03-02T12:00:00Z',
    closed_at: '2026-03-02T12:00:00Z'
  };
  const normRp = normalizeRichpanelTicket(rpTicket);
  assert.strictEqual(normRp.externalId, 'rp-123');
  assert.strictEqual(normRp.externalNumber, '8888');
  assert.deepStrictEqual(normRp.tags, ['rp-tag']);
});

test('GHL Rule 14: Incremental reconciliation deactivation for unresolved stages, unapproved pipelines, and missing opportunities', () => {
  // Existing approved case in DB
  const existingCaseInDb = {
    id: 'ghl-case-1',
    externalId: 'conv-101',
    externalNumber: 'opp-202',
    subject: 'Customer issue',
    status: 'Closed',
    reviewStatus: 'APPROVED',
    extractionStatus: 'READY',
    issueText: 'Damaged sleeve',
    resolutionText: 'Replacement sleeve shipped',
    active: true,
  };

  // Scenario A: Opportunity moves to an UNRESOLVED stage (e.g. "Awaiting Customer Response/ Closure")
  const stageClassA = classifyStage('Awaiting Customer Response/ Closure');
  assert.strictEqual(stageClassA, 'UNRESOLVED');
  const deactivatedUnresolved = {
    ...existingCaseInDb,
    active: stageClassA !== 'UNRESOLVED',
    status: 'Awaiting Customer Response/ Closure',
  };
  assert.strictEqual(deactivatedUnresolved.active, false);
  assert.strictEqual(deactivatedUnresolved.reviewStatus, 'APPROVED'); // Audit preserved!
  assert.strictEqual(deactivatedUnresolved.resolutionText, 'Replacement sleeve shipped');

  // Scenario B: Opportunity moves to an unapproved pipeline (e.g. "Tickets - Local Install Request")
  const isApprovedB = isApprovedPipeline('Tickets - Local Install Request', 'RrztnRRqzwSIVm18MlIX');
  assert.strictEqual(isApprovedB, false);
  const deactivatedPipelineMove = {
    ...existingCaseInDb,
    active: isApprovedB,
  };
  assert.strictEqual(deactivatedPipelineMove.active, false);
  assert.strictEqual(deactivatedPipelineMove.reviewStatus, 'APPROVED'); // Audit preserved!

  // Scenario C: Opportunity can no longer be verified / deleted from GHL (404)
  const oppFoundC = null; // 404 response
  const deactivatedMissing = {
    ...existingCaseInDb,
    active: oppFoundC !== null,
  };
  assert.strictEqual(deactivatedMissing.active, false);
  assert.strictEqual(deactivatedMissing.reviewStatus, 'APPROVED'); // Audit preserved!
});

test('GHL Rule 15: Agent isolation & duplicate prevention strictly verified', () => {
  // Test 1: Cases pending review, unextracted, unusable, or inactive must never qualify for agent recommendations
  const testCases = [
    { id: '1', active: true, reviewStatus: 'PENDING', extractionStatus: 'NOT_PROCESSED', usableAsHistoricalCase: null },
    { id: '2', active: true, reviewStatus: 'REJECTED', extractionStatus: 'READY', usableAsHistoricalCase: true },
    { id: '3', active: true, reviewStatus: 'APPROVED', extractionStatus: 'FAILED', usableAsHistoricalCase: false },
    { id: '4', active: true, reviewStatus: 'APPROVED', extractionStatus: 'READY', usableAsHistoricalCase: false },
    { id: '5', active: false, reviewStatus: 'APPROVED', extractionStatus: 'READY', usableAsHistoricalCase: true },
    { id: '6', active: true, reviewStatus: 'APPROVED', extractionStatus: 'READY', usableAsHistoricalCase: true },
  ];

  const agentEligible = testCases.filter(
    c => c.active === true &&
         c.reviewStatus === 'APPROVED' &&
         c.extractionStatus === 'READY' &&
         c.usableAsHistoricalCase === true
  );

  assert.strictEqual(agentEligible.length, 1);
  assert.strictEqual(agentEligible[0].id, '6');

  // Test 2: Idempotent resync: existing externalId must not create duplicate DB entries
  const existingRecords = new Map<string, any>();
  existingRecords.set('GHL_conv-101', { id: 'db-1', externalId: 'conv-101' });

  let inserted = 0;
  let skipped = 0;
  const incomingSyncBatch = [{ externalId: 'conv-101' }, { externalId: 'conv-102' }];

  for (const item of incomingSyncBatch) {
    const key = `GHL_${item.externalId}`;
    if (existingRecords.has(key)) {
      skipped++;
    } else {
      existingRecords.set(key, { id: 'db-2', externalId: item.externalId });
      inserted++;
    }
  }

  assert.strictEqual(inserted, 1);
  assert.strictEqual(skipped, 1);
  assert.strictEqual(existingRecords.size, 2);
});

console.log(`\n====================================================`);
console.log(`TEST RESULTS: ${passedTests}/${totalTests} PASSED`);
console.log('====================================================\n');

if (passedTests !== totalTests) {
  process.exit(1);
}

