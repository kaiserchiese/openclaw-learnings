# Skills & Tools Inventory

## Installed & Active

| Tool | Purpose | RAM Impact | Verdict |
|------|---------|-----------|---------|
| **autoskills** v0.2.7 | Auto-detects stack, installs Claude Code skills | Zero (config only) | Essential for new projects |
| **tokenjuice** v0.5.1 | Compresses shell output to save context tokens | Negligible | Useful for verbose commands |
| **context-mode** v1.0.89 | MCP plugin for context window analytics | Zero (MCP server) | Good for monitoring token usage |
| **QMD** v2.0.1 | Hybrid BM25+vector search over workspace docs | ~200MB (embedding model) | Core tool — 5000+ docs indexed |
| **lossless-claw** v0.9.1 | DAG-based context management plugin | Negligible | Reduces context bloat across sessions |
| **xreach-cli** v0.3.3 | Read-only Twitter CLI (search, user info) | Negligible | Good for monitoring, can't post |
| **Ollama** | Local model serving | ~500MB idle | nomic-embed-text + qwen2.5:3b |
| **SearXNG** | Self-hosted meta-search engine | ~200MB (Docker) | Core scraping infrastructure |
| **Firecrawl** | JS-rendered web scraping | On-demand | Fallback after SearXNG |
| **Playwright** | Full browser automation | On-demand | Tweet posting, IG scraping |
| **NSSM** | Windows service manager | Zero | Essential for persistent processes |
| **LiteLLM** | Model proxy + routing | ~200MB | Required for multi-model setup |
| **gws** v0.8.0 | Google Workspace CLI | Negligible | Sheets/Docs/Slides/Drive/Gmail/Calendar |
| **Chrome DevTools MCP** | Browser debugging via MCP | On-demand | Useful for frontend debugging |

## Installed But On-Demand

| Tool | Purpose | RAM When Running | Notes |
|------|---------|-----------------|-------|
| **Postiz** | Social media management UI | ~400-600MB | Docker-based, start/stop scripts |
| **Grafana + Prometheus** | Monitoring dashboards | ~200MB | Only run when debugging |

## Evaluated & Skipped

| Tool | Reason Skipped |
|------|---------------|
| **Gigabrain** | Redundant — OpenClaw SQLite + nomic-embed-text already does hybrid search + dedup |
| **FrameFlow** | Needs more VRAM than GTX 1080 provides |
| **VoxCPM2** | Insufficient VRAM for local voice synthesis at quality |
| **Minions (PG queue)** | OpenClaw crons handle job scheduling. Adding Postgres queue = unnecessary complexity |
| **agentmail** | Evaluate later for LinkedIn posting. Not urgent |
| **GeoDaddy** | Niche SEO tool, low priority for current projects |
| **Cabinet/Paperclip** | Already have Mission Control for task management |
| **design-md (npm)** | Doesn't exist as npm package. Create DESIGN.md manually |
| **ui-ux-pro-max-skill** | Doesn't exist. autoskills installs equivalent frontend-design skill |
| **officialskills.sh** | Website/directory, not an installable script |

## Skill Categories (from autoskills)

When running `npx autoskills` on a project, it detects the stack and installs relevant Claude Code skills:

### Next.js Project (e.g., PunchCard)
- `nextjs` — routing, API routes, middleware
- `react` — component patterns, hooks
- `tailwindcss` — utility-first CSS
- `supabase` — database, auth, storage

### Astro Project (e.g., PioPortfolio)
- `astro` — SSG, islands architecture
- `tailwindcss` — styling

### Bun + Next.js (e.g., OpenCut)
- `nextjs` — app router
- `tailwindcss` — styling
- `shadcn-ui` — component library

## Decision Framework

Before installing a new tool, ask:

1. **Does it overlap with something already installed?** If yes, skip unless it's dramatically better.
2. **What's the RAM cost?** On a 16GB server, every 200MB matters.
3. **Can it run on-demand?** Prefer start/stop over always-on.
4. **Is it maintained?** Check last commit date and open issues.
5. **Does it need GPU?** GTX 1080 has 8GB VRAM — rule out anything needing 12GB+.
