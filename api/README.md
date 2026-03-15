# Backend Architecture for Segment-of-One Campaigns

This backend implements scalable cross-sell/up-sell intelligence using `demo_customers.js` as the source of truth.

## Folder Structure

- `api/src/app.js`: App wiring and route registration
- `api/src/config/constants.js`: Scoring weights, channel sequence, and product catalog
- `api/src/data/customerRepository.js`: Read access to customer data
- `api/src/routes/dashboardRoutes.js`: Existing dashboard/customer APIs used by UI
- `api/src/routes/intelligenceRoutes.js`: Segment-of-one intelligence and campaign APIs
- `api/src/services/dashboardService.js`: Summary and customer list services
- `api/src/services/customerIntelligenceService.js`: Unified profile enrichment and scoring
- `api/src/services/contentGenerationService.js`: NLG-style personalized content generation
- `api/src/services/campaignActivationService.js`: Multi-channel campaign activation plan builder
- `api/src/utils/formatters.js`: Pagination and currency formatting helpers

## Core APIs

### Existing UI APIs (unchanged behavior)

- `GET /api/summary`
- `GET /api/customers`
- `GET /api/customers/:id`

### New Intelligence APIs

- `GET /api/intelligence/profiles`
  - Query: `q`, `risk`, `intent`, `channel`, `page`, `limit`
  - Returns segment-of-one profile list with portfolio summary
- `GET /api/intelligence/profiles/:id`
  - Returns a single enriched customer intelligence profile
- `POST /api/intelligence/profiles/:id/content`
  - Body: `{ "channels": ["Email", "App", "Web", "Social"] }`
  - Returns channel-specific personalized content and creative prompts
- `POST /api/intelligence/campaigns/activate`
  - Body: `{ "customerId": 5, "objective": "Cross-Sell", "channels": ["Email", "App"], "startAt": "2026-03-15T10:00:00.000Z" }`
  - Returns activation schedule and campaign execution metadata

### Scanner APIs

- `POST /api/scanners/cyber-score`
  - Body: `{ "email": "customer@example.com" }`
  - Uses IPQualityScore Dark Web Leak API to derive cyber risk score and signals.

## Run

```bash
npm start
```

Set your IPQS key before starting server:

```bash
export IPQS_API_KEY="your_ipqs_key_here"
```

Windows PowerShell:

```powershell
$env:IPQS_API_KEY="your_ipqs_key_here"
```

## Notes

- This is a backend logic foundation focused on intelligence, automation, and activation orchestration.
