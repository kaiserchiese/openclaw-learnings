# Timeline: What We Learned Each Month

A chronological view of how this system evolved. Each month had a theme — usually dictated by whatever broke hardest.

---

## Month 1: "It works!" (December 2025)

**Theme: Getting things running**

- Installed OpenClaw, LiteLLM, first 7 agents
- Everything on Gemini Pro (expensive)
- Telegram bot for notifications
- First cron jobs: heartbeat, daily summary
- **Cost: ~$45/month** (Pro model for everything)

**Key lesson:** It actually works. 7 agents coordinating through a central orchestrator can handle real tasks autonomously.

**Key mistake:** Using the expensive model for sub-agents. Sub-agents do grunt work — they don't need deep reasoning.

---

## Month 2: "Why is it so expensive?" (January 2026)

**Theme: Cost optimization**

- Switched 90% of agents from Pro → Flash: **$45 → $8/month**
- `subagents.model = flash` was the single biggest cost saver
- Started tracking tokens via daily dashboard cron
- Disabled 19 unused cron jobs
- Set LiteLLM timeout from 90s → 60s (stuck requests were blocking workers)

**Key lesson:** Model tiering is the #1 optimization. Most agent tasks don't need the smartest model.

**Key mistake:** Not monitoring costs from day one. We ran Pro for everything for a full month before realizing.

---

## Month 3: "Why is the server unresponsive?" (February 2026)

**Theme: RAM management and stability**

- RAM hit 95% — server became unresponsive
- NSSM crash-loops: a service with an invalid token restarted 40x/second
- Added AppThrottle (30s) to every NSSM service
- Disabled Tor containers when not scraping (-100MB each)
- Docker restart policy: `always` → `unless-stopped`
- Memory dreaming cron was burning more tokens than all agents combined — capped at 10 memories/session

**Key lesson:** `AppThrottle 30000` is non-negotiable for every NSSM service.

**Key mistake:** Running a batch embedding job as an always-on service. After processing all documents, it sat idle consuming 200MB.

---

## Month 4: "Telegram is too noisy" (March 2026)

**Theme: Notification management and automation maturity**

- Telegram: **300+ messages/day → ~20/day**
- Silent mode for infrastructure crons
- Priority system: ACTION / FYI / SILENT
- Blog pipeline built: research → write → image → publish at $0.05/day
- Social automation: 4 tweets/day via Playwright
- Grew from 7 → 21 agents
- Started self-improvement loop (errors → weekly review → permanent rules)
- WP API URL bug: agent "published" to nowhere for 2 weeks because `/wp-json/` was wrong

**Key lesson:** Silent by default, notify only on errors. If you notify on success, you'll drown in noise.

**Key mistake:** Not verifying blog posts were actually published. The WP API returned 200 OK for the wrong URL (because WordPress returns the homepage for any URL with a 200 status).

---

## Month 5: "Let's make it autonomous" (April 2026)

**Theme: Autonomous operation and public launch**

- Ralph-loop: autonomous development loop that picks up MC stories
- Mission Control boards for project management
- 25+ user stories created for 5 projects
- Made the learnings repo public
- PunchCard (boxing data) repo made public
- Tool evaluation: 14 tools assessed, 6 installed, 8 skipped
- WORKFLOW_PROYECTO.md: streamlined new project creation
- Cron collision staggering: Monday 08:00 peak resolved

**Key lesson:** Autonomous loops work if you give them clear, prioritized task lists. Ralph-loop can pick up MC stories and execute them without human intervention.

**Key mistake:** Trying to install every trending AI tool. Most are redundant with what you already have. Evaluate ruthlessly — RAM is finite.

---

## The numbers

| Metric | Month 1 | Month 5 |
|--------|---------|---------|
| Agents | 7 | 21 |
| Cron jobs | 10 | 50+ |
| Monthly cost | $45 | $7 |
| Telegram msgs/day | 50 | 20 |
| RAM usage | 70% | 74% |
| Autonomous tasks/week | 0 | 15-20 |
| Uptime | ~90% | ~99% |
| Blog posts/month | 0 | 8-10 |
| Tweets/month | 0 | 120 |

---

## What's next

- Video repurposing pipeline (blog → short clips)
- Subconscious agent (background insight surfacer)
- SEO optimization for content pipeline
- Community contributions to this repo
