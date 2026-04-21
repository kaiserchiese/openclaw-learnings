# Use Case: Legal AI Platform (LexIA)

## What It Does

LexIA is a legal document search and analysis platform for Spanish law. It indexes BOE (Official State Gazette), CENDOJ (judicial decisions), and Constitutional Tribunal rulings, making them searchable with semantic understanding.

## The Challenge

Spanish legal databases have basic keyword search at best. Lawyers need semantic search — "cases about wrongful dismissal during probation period" — not just keyword matching. The official sources have hundreds of thousands of documents with no unified search.

## Architecture

```
Ingestion Layer
    │
    ├── BOE API (daily incremental + full archive)
    ├── CENDOJ (Tor-based scraping — Cloudflare protected)
    └── Constitutional Tribunal (direct HTTP)
    │
    ▼
Processing Layer
    │
    ├── Document chunking (legal docs → searchable segments)
    ├── Embedding generation (nomic-embed-text via Ollama)
    └── Metadata extraction (date, court, subject matter)
    │
    ▼
Storage
    │
    ├── SQLite (document metadata + chunks)
    ├── Embeddings (6.9M vectors, local storage)
    └── Full text (439K+ documents)
    │
    ▼
Access Layer
    │
    ├── Web UI (Next.js, port 3003)
    ├── REST API (Hono, port 3004)
    └── Telegram bot (@LexIA_Robot)
```

## Scale

| Metric | Count |
|--------|-------|
| Total documents | 439,880 |
| BOE documents | 404,000+ |
| CENDOJ documents | 35,000+ |
| TC rulings | 105 |
| Chunks | 6.9M |
| Embeddings | 6.9M |

## What Worked

### 1. Local Embeddings
Using Ollama + nomic-embed-text instead of paid API:
- Zero marginal cost
- ~32 docs/minute on CPU
- Good enough quality for legal search
- No rate limits or API dependency

### 2. Incremental Ingestion
BOE publishes daily. A cron job fetches only new documents instead of re-processing the entire archive. Full archive ingestion ran once as a batch job, then switched to daily incremental.

### 3. Telegram as Primary Interface
Many lawyers prefer messaging over web apps. The Telegram bot provides:
- Natural language queries
- Document snippets with links to full text
- Quick, mobile-friendly access

### 4. Chunking Strategy
Legal documents are long (some BOE entries are 50+ pages). Chunking by section headers + fixed overlap gives good recall without losing context.

## What Didn't Work

- **CENDOJ scraping without Tor:** Cloudflare blocks datacenter IPs. Had to route through Tor SOCKS5 proxy.
- **CENDOJ from GCP:** Even with a Cloud Function relay, CENDOJ returns 403 from GCP IP ranges. Tor from the local server is the only working method.
- **Embedding daemon as a persistent service:** The initial embedding run (6.9M vectors) took days. Running it as an always-on NSSM service wasted resources once complete. Better as a one-shot job triggered by cron when new un-embedded docs appear.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15 (production build, port 3003) |
| API | Hono (Node.js, tsx runner, port 3004) |
| Bot | Grammy (Telegram bot framework) |
| Database | SQLite (better-sqlite3) |
| Embeddings | Ollama + nomic-embed-text |
| Scraping | Tor SOCKS5 proxy (Docker) for CENDOJ |
| Hosting | Windows Server + NSSM services |

## Lessons Learned

1. **Local embeddings are good enough** for domain search. Don't pay API costs for vector search unless you need multilingual or cross-domain quality.
2. **Tor is sometimes the only option** for sources with aggressive bot protection. Docker makes Tor proxy deployment trivial.
3. **One-shot tasks shouldn't be services.** If a job completes, disable the service. Don't waste RAM on idle daemons.
4. **Legal data has high value but high friction.** The moat is in the ingestion pipeline, not the search layer.
