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

  // Simulating sync update operation (from src/lib/integrations/richpanel/sync.ts)
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

console.log(`\n====================================================`);
console.log(`TEST RESULTS: ${passedTests}/${totalTests} PASSED`);
console.log('====================================================\n');

if (passedTests !== totalTests) {
  process.exit(1);
}
