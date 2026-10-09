# GHL Synchronization Requirements

The base integration for GHL (GoHighLevel) authentication and schema normalization is complete and verified during the preflight phase.

However, **production synchronization** of GHL Historical Support Cases is currently **ON HOLD** pending client clarification regarding their internal CRM workflow. 

Before we can implement the production sync and cron job (similar to the Richpanel integration), we require exact business rules for the following:

## 1. Identifying a Support Conversation
GHL houses many types of conversations (sales, marketing, onboarding, support). We must only sync support threads into the Playbook. 
**Required Clarification:** How is a Support conversation explicitly identified in GHL?
*Potential Mechanisms to evaluate with the client:*
- A specific `tag` on the contact or conversation
- Presence in a specific `pipelineId`
- Assignment to a specific support user/team

## 2. Identifying a "Resolved" Support Case
We only want to ingest historical cases that are finished/closed so the AI can extract the final resolution. 
**Required Clarification:** How does an agent mark a case as resolved in GHL?
*Potential Mechanisms to evaluate with the client:*
- Moving an opportunity to a specific `pipelineStageId`
- Setting `opportunity.status` to 'won' or 'abandoned'
- Applying a specific `tag` (e.g., "resolved")
- Simply archiving the thread

## Implementation Next Steps (Post-Clarification)
Once these rules are defined:
1. Update `/src/lib/integrations/ghl/sync.ts` with the specific filter parameters.
2. Implement incremental synchronization using the appropriate `updatedAt` / `lastSourceTimestamp` logic.
3. Map the GHL payload to `HistoricalSupportCase` using `normalizeGhlConversation`.
4. Create the cron job at `/api/cron/sync-ghl`.
