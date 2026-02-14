# Jam Nodes Integration Plan

## What this is
Workflow node framework from github.com/wespreadjam/jam-nodes (MIT licensed, copied while public).

## Future custom nodes to build for Vibe & Sell

### Outreach Automation
- `crustdata-people-search` — Run a Crustdata person search with filters
- `crustdata-enrich-email` — Get business email for a contact
- `generate-cold-email` — Claude API call to write personalized email
- `send-email` — Send via Gmail API / SMTP
- `wait-for-reply` — Delay node + check for reply
- `send-followup` — Generate and send follow-up if no reply

### LinkedIn Automation
- `crustdata-linkedin-posts` — Search for relevant posts
- `generate-comment` — Claude API call to write comment
- `notify-founder` — Push notification to engage with post

### Monitoring
- `competitor-mention-scan` — Weekly Crustdata search for competitor mentions
- `new-job-change-scan` — Find target personas who recently changed jobs
- `headcount-change-scan` — Monitor competitor headcount changes
- `digest-email` — Compile findings into weekly email

### Lead Scoring
- `score-contact` — AI-powered relevance scoring
- `filter-by-score` — Only pass through high-score contacts
- `deduplicate` — Remove contacts already in pipeline

## Not until after launch
This stays dormant until core product is stable and shipped.
