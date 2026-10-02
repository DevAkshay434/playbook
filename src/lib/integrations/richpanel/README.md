# Richpanel Integration

This directory will contain the Richpanel API integration layer.

## Status: Pending API access

## Expected structure

- `client.ts` — Richpanel API client
- `types.ts` — API response types
- `sync.ts` — Historical ticket synchronization
- `mapper.ts` — Map Richpanel tickets to internal ResolvedCase format

## Prerequisites

- Richpanel Developer/API credentials
- API endpoint documentation
- Webhook configuration (if push-based sync is preferred)

## Environment variables (future)

```env
RICHPANEL_API_KEY=
RICHPANEL_API_URL=
```

Do NOT implement until credentials and API documentation are available.
