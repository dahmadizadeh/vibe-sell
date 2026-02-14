# Vibe & Sell — The Build-to-Sell Platform

## What This Is
This IS the product. A user comes here, describes their app idea, and gets TWO things in one session:
1. A working app (generated via AI — rendered live in the browser)
2. 100 real potential customers with personalized outreach ready to send

No one else does both. Lovable builds but doesn't find customers. Apollo finds customers but doesn't build. We do both because Crustdata's people+company graph is the connective tissue.

## Core User Flow
1. User describes their app idea in natural language
2. AI generates a working React app and renders it live in a preview pane
3. AI analyzes the app's value proposition → generates an ICP (ideal customer profile)
4. ICP is used to query Crustdata's API → returns 100 real, verified targets
5. AI drafts personalized outreach per target referencing their role, company signals, and the user's app
6. User reviews and sends outreach — conversations start

## Tech Stack
- Next.js 14 (App Router), TypeScript, Tailwind CSS
- Claude API — generates the app code AND the ICP + outreach
- Crustdata API — real-time people + company search
- Sandpack or iframe — renders the generated app live in-browser

## Crustdata API Endpoints
1. **People Search (In-DB)**: POST https://api.crustdata.com/screener/persondb/search
   - Auth: `Authorization: Token $CRUSTDATA_API_KEY`
   - Filter format: { column, type, value } with AND/OR nesting via { op, conditions }
   - Key filters: current_employers.title, current_employers.company_industries, region, current_employers.company_headcount_latest, current_employers.seniority_level, current_employers.business_email_verified
   - Fuzzy text search: type "(.)"; Exact match: type "="; List match: type "in"
   - Returns: profiles[] with name, headline, region, current_employers, linkedin_profile_url
   - Limit: up to 1000/request, cursor-based pagination
   - Cost: 3 credits per 100 results

2. **People Enrichment**: GET https://api.crustdata.com/screener/person/enrich
   - Params: linkedin_profile_url (up to 25), fields=business_email
   - Returns: full profile + verified business email
   - Cost: 3 credits + 2 for email enrichment

## Validation
```bash
curl -s -X POST "$CRUSTDATA_BASE_URL/screener/persondb/search" \
  -H "Authorization: Token $CRUSTDATA_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"filters":{"column":"current_employers.title","type":"(.)","value":"founder"},"limit":1}' \
  | jq '.profiles | length'
# Should return 1. If 0, the filters are wrong.
```

## Environment Variables
- CRUSTDATA_API_KEY
- ANTHROPIC_API_KEY
- V0_API_KEY

## Directory Structure
- /app/page.tsx — Main product experience (single page app)
- /app/api/generate-app/ — Claude generates React component code from idea
- /app/api/generate-icp/ — Claude generates ICP from app description
- /app/api/find-customers/ — Queries Crustdata PersonDB search
- /app/api/enrich-contacts/ — Enriches top targets with business emails
- /app/api/generate-outreach/ — Claude drafts personalized emails per target
- /components/ — IdeaInput, AppPreview, ICPEditor, ProspectTable, OutreachModal, StepProgress
- /lib/mock-data.ts — Realistic mock data for development before APIs are wired
- /lib/types.ts — TypeScript interfaces
