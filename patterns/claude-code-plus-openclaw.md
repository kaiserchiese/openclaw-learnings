# Claude Code + OpenClaw: Two Agent Systems, One Stack

## Why both?

Claude Code and OpenClaw serve different purposes but complement each other perfectly:

| | Claude Code | OpenClaw |
|--|------------|----------|
| **What it is** | AI-powered development tool | Agent orchestration framework |
| **When it runs** | During development sessions | 24/7 autonomous |
| **Primary user** | Developer (interactive) | Cron jobs + Telegram (autonomous) |
| **Agents** | Sub-agents for code tasks | 21 specialized agents for anything |
| **Strength** | Code quality, testing, review | Automation, scheduling, multi-channel |

## How they work together

```
Development (Claude Code)              Production (OpenClaw)
┌─────────────────────┐               ┌─────────────────────┐
│ Write code          │               │ Blog pipeline       │
│ Review code         │               │ Social posting      │
│ Fix bugs            │               │ Data scraping       │
│ Plan architecture   │──── deploy ──▶│ Health monitoring   │
│ Run tests           │               │ Cost tracking       │
│ Create PRs          │               │ Telegram control    │
└─────────────────────┘               └─────────────────────┘
       Interactive                         Autonomous
```

### Development phase (Claude Code)

1. Claude Code writes the code using TDD workflow
2. Code-reviewer agent checks quality
3. Security-reviewer checks boundaries
4. Build-error-resolver fixes compilation issues
5. Commit + push via git workflow rules

### Production phase (OpenClaw)

1. Cron jobs trigger agents on schedule
2. Agents execute tasks autonomously
3. Results go to Telegram or Mission Control
4. Errors trigger self-healing or alerts
5. Weekly review promotes learnings to permanent rules

## Shared patterns

Both systems benefit from the same principles:

### 1. Central orchestration

- **Claude Code**: Main conversation routes to sub-agents (planner, reviewer, tdd-guide)
- **OpenClaw**: Main agent routes to sub-agents (research, dev, social, image)
- **Rule**: Sub-agents never call other sub-agents. The orchestrator decides.

### 2. Model tiering

- **Claude Code**: Opus for architecture, Sonnet for coding, Haiku for lightweight agents
- **OpenClaw**: Pro for deep reasoning, Flash for everything else, Ollama for embeddings
- **Rule**: Start cheap, upgrade only where quality demands it.

### 3. Rules as code

- **Claude Code**: `~/.claude/rules/` — layered rule files loaded per project
- **OpenClaw**: `workspace/AGENTS.md` + `AGENTS_RULES/` — routing tables and agent rules
- **Rule**: Explicit rules beat LLM judgment for routing decisions.

### 4. Silent by default

- **Claude Code**: No trailing summaries, no unnecessary comments
- **OpenClaw**: Infrastructure crons in silent mode, notify only on errors
- **Rule**: Noise erodes trust. Signal earns attention.

### 5. Self-improvement loops

- **Claude Code**: Memory system stores corrections, feedback, and user preferences
- **OpenClaw**: ERRORS.md → weekly review → promoted to AGENTS.md rules
- **Rule**: Every mistake should become a permanent fix.

## The daily workflow

A typical day looks like:

**Morning (autonomous — OpenClaw)**
- 07:45 — Google daily report (email + calendar summary)
- 08:00 — Heartbeat check (all services healthy?)
- 08:10 — Blog research cron (find today's topic)
- 10:00 — Learnings daily share (post to Twitter/LinkedIn)
- 10:30 — Blog publication (research → write → image → publish)

**Working hours (interactive — Claude Code)**
- Developer opens Claude Code
- Picks up a feature from Mission Control board
- Claude Code plans → implements → reviews → commits
- PR created, tests passing

**Evening (autonomous — OpenClaw)**
- 13:00 — Social post (tweet from AI personality)
- 19:30 — Social post
- 22:30 — Memory consolidation (review + compact agent memories)
- 23:00 — Token dashboard (daily cost report)

**Weekly (autonomous — OpenClaw)**
- Sunday 09:00 — Self-improvement review (ERRORS.md → rules)
- Sunday 11:00 — Research digest (POC evaluations)
- Monday 10:00 — Meta Ads creative review
- Monday 11:00 — Google Ads research

## Cost comparison

| System | Monthly Cost | What it covers |
|--------|-------------|----------------|
| Claude Code | ~$20 (Anthropic API) | All development work |
| OpenClaw | ~$7 (Vertex AI) | All autonomous operations |
| Ollama | $0 (local) | Embeddings + small tasks |
| Infrastructure | $0 (own server) | Hosting, compute |
| **Total** | **~$27/month** | Full AI-powered dev + ops |

For comparison, hiring a junior developer + a social media manager + a content writer would cost $3,000-5,000/month minimum. This stack covers ~60% of those roles autonomously.

## When to use which

| Task | Tool | Why |
|------|------|-----|
| Write new feature | Claude Code | Interactive, needs code review |
| Fix a bug | Claude Code | Needs context, testing |
| Publish blog post | OpenClaw | Scheduled, autonomous |
| Post to social media | OpenClaw | Scheduled, personality-driven |
| Scrape data | OpenClaw | Recurring, no human needed |
| Code review | Claude Code | Needs full codebase context |
| Monitor services | OpenClaw | 24/7, silent unless broken |
| Plan architecture | Claude Code | Interactive, needs deep reasoning |
| Research topics | OpenClaw | Can run async, results to Telegram |
