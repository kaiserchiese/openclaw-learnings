# Use Case: Boxing Data Platform (PunchCard)

## What It Does

PunchCard is a boxing data platform focused on amateur boxing — think "Transfermarkt for amateur boxers." It aggregates fight results, fighter profiles, and rankings from federation sources that don't have public APIs.

## The Challenge

Amateur boxing data is scattered across federation PDFs, poorly structured HTML tables, and regional websites with no API. No single source has complete records.

## Architecture

```
Scraping Layer (Playwright + SearXNG)
    │
    ├── Federation websites (Galicia, Madrid, Valencia...)
    ├── Instagram (fighter avatars, social proof)
    └── Event pages (fight cards, results)
    │
    ▼
Processing Layer (Node.js)
    │
    ├── PDF parsing (fight results from federation docs)
    ├── Fuzzy matching (connect same fighter across sources)
    ├── Data normalization (weight classes, club names)
    └── Deduplication
    │
    ▼
Database (PostgreSQL via Supabase)
    │
    ├── 11,000+ fighters
    ├── 19,000+ matches
    └── Historical rankings
    │
    ▼
Frontend (Next.js)
    │
    ├── Fighter profiles with stats
    ├── Search with fuzzy matching
    ├── H2H comparisons
    └── Leaderboards
```

## What Worked

### 1. Fuzzy Name Matching
Boxers appear with inconsistent names across sources ("García López" vs "GARCIA LOPEZ, J." vs "Juan Garcia"). We use normalized string comparison + weight class + club as disambiguation signals.

### 2. Scraping Hierarchy
```
SearXNG (meta-search) → Firecrawl (JS render) → Playwright (full browser) → Direct HTTP
```
Start cheap, escalate only when needed. 80% of federation pages work with simple HTTP.

### 3. AI-Powered Data Extraction
Agent reads raw HTML/PDF content and extracts structured fight results. Cheaper and more flexible than writing custom parsers per federation.

### 4. Instagram Avatar Pipeline
SearXNG finds fighter Instagram profiles, Playwright extracts avatar images, stored as fighter photos. When it works, gives the platform a professional look.

## What Didn't Work

- **IG scraping at scale:** Instagram blocks automated access aggressively. Pipeline works for one-off lookups but not bulk scraping.
- **Real-time results:** Federation sites update sporadically. Some results appear weeks after events.
- **Cross-region matching:** Fighters who compete in multiple regions appear as duplicates. Manual dedup still needed.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15, Tailwind CSS |
| Backend | Supabase (PostgreSQL + Auth + Storage) |
| Scraping | Playwright, SearXNG, Firecrawl |
| AI Processing | OpenClaw agents (data extraction, matching) |
| Hosting | Windows Server + NSSM service |

## Scale

- 11,348 fighters (primarily Galicia region)
- 19,355 matches
- Data coverage: weight class 52%, club 48%, avatar <1%
- Region gap: 486 Galician fighters vs single digits for other regions

## Lessons Learned

1. **Start with one region, expand later.** Getting Galicia right was more valuable than shallow coverage of all Spain.
2. **Fuzzy matching is never "done."** Every new data source introduces edge cases.
3. **Federation data formats change without warning.** Scrapers need self-healing or at minimum alerting.
4. **Amateur sports data is a blue ocean.** No competitors in this space because the data is hard to get.
