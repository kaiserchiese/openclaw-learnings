# Content Strategy — openclaw-learnings

> For OpenClaw's `learnings:daily-share` cron (Mon-Fri 10:00 Madrid).
> Social-operator reads this to generate daily posts for LinkedIn + Twitter.

## Accounts

| Platform | Account | Style | Format |
|----------|---------|-------|--------|
| LinkedIn | Pio Iglesias (personal) | Professional, thought-leadership | Long posts (800-1500 chars), carousels |
| Twitter | @ravaclaw | Tech-casual, punchy, retranca gallega | Threads (3-5 tweets) or single tweets |

## Content Pillars

Each post maps to one of these pillars. Rotate through them evenly.

### 1. Architecture Patterns (40% of posts)
Source: `patterns/` directory + website pages.
Angle: "Here's how we solved X in production" — concrete, not theoretical.

Topics:
- Multi-agent orchestration (routing, sub-agent isolation, IF/ELSE vs LLM)
- Cost optimization journey ($45 → $7/month, model tiering)
- Memory management (dreaming, self-improvement loops, VACUUM)
- Telegram as control plane (forum topics, noise reduction 300→20/day)
- Windows Server for AI (NSSM, RAM budgeting, Docker gotchas)
- Claude Code workflow (rules, hooks, skills, memory, agent delegation)
- Claude Code + OpenClaw dual system ($27/month full-stack AI dev+ops)

### 2. Real Numbers (25% of posts)
Source: actual metrics from production + `use-cases/` directory.
Angle: "Here are the real costs, real numbers, no BS."

Topics:
- Token usage breakdown by agent ($0.22/day across 21 agents)
- Blog pipeline cost ($0.05/day fully autonomous)
- Social automation economics (120 tweets/month for $0.15)
- Legal AI scale (440K docs, 6.9M embeddings on a single server)
- Boxing data coverage (11K fighters, 19K matches)
- RAM management on 16GB (11 Node.js processes, 29 Docker containers)
- Cron job optimization (65 crons → staggered, silent, categorized)

### 3. Gotchas & Failures (20% of posts)
Source: `gotchas/common-pitfalls.md` + MEMORY.md archived sessions.
Angle: "This broke at 2am. Here's what we learned."

Topics:
- Sub-agents calling sub-agents (infinite loops)
- WP API URL wrong for 3 weeks (/wp-json/ vs /blog/wp-json/)
- Telegram crash loop (@grammyjs/transformer-throttler missing)
- Memory dreaming timeouts (limit 20→10 entries)
- lcm.db growing to 4.2GB (VACUUM doesn't help when it's real data)
- Node.js heredoc `\n` literal vs escaped on Windows
- Cloudflare WAF blocking your own scrapers
- NSSM PAUSED state = crashed, not actually paused

### 4. Tool Reviews & Comparisons (15% of posts)
Source: `skills-inventory.md` + tool evaluations from overhaul sessions.
Angle: "We evaluated X tools. Here's what we actually use."

Topics:
- LiteLLM as universal model proxy (why not direct API calls)
- Ollama for local embeddings (nomic-embed-text, zero cost)
- SearXNG vs paid search APIs
- Mission Control vs Linear/Jira for AI task management
- autoskills, DESIGN.md, tokenjuice — the Claude Code ecosystem
- QMD for hybrid search (BM25 + vector, 5K docs indexed)
- Playwright for social automation (why not official APIs)
- Postiz evaluation (on-demand vs always-on)

## Post Templates

### LinkedIn Template
```
{HOOK — provocative stat or contrarian take, 1-2 lines}

{CONTEXT — what we built, 2-3 lines}

{THE INSIGHT — the pattern/lesson/number, 3-5 lines with specifics}

{TAKEAWAY — what others can apply, 1-2 lines}

---
🔗 Full write-up: https://kaiserchiese.github.io/openclaw-learnings/{path}/
#AIAgents #DevOps #BuildInPublic #OpenSource
```

### Twitter/Ravaclaw Template (Thread)
```
Tweet 1: {HOOK — bold claim or surprising number}

Tweet 2: {CONTEXT — setup}

Tweet 3: {THE MEAT — the insight with specifics}

Tweet 4: {RESULT — what happened}

Tweet 5: {LINK — "Full breakdown:" + URL}
```

### Twitter/Ravaclaw Template (Single)
```
{Surprising stat or insight in 1-2 sentences}

{One concrete detail}

{Link to website or thread}
```

## Weekly Calendar

| Day | Pillar | LinkedIn | Twitter |
|-----|--------|----------|---------|
| Monday | Architecture | Deep dive on one pattern | Thread summarizing the pattern |
| Tuesday | Real Numbers | Cost/metrics breakdown | Single tweet with the headline number |
| Wednesday | Gotchas | Failure story + lesson | Thread: "This broke at 2am..." |
| Thursday | Tool Review | Tool comparison or evaluation | Poll or hot take about the tool |
| Friday | Architecture | Week's best insight recap | Casual "Friday deploy" observation |

## Content Queue (First 4 Weeks)

### Week 1: Launch Week
- Mon: "We run 21 AI agents on a single Windows server for $7/month. Here's the architecture."
- Tue: "$45→$7: the exact model changes that cut our AI costs 85%"
- Wed: "Our sub-agents kept calling each other in infinite loops. The fix was embarrassingly simple."
- Thu: "LiteLLM: the one tool that made our multi-model AI stack possible"
- Fri: "5 months of running AI agents in production. The biggest surprise: it's not the AI that breaks."

### Week 2: Cost Deep Dive
- Mon: "Why we route 90% of AI tasks through the cheapest model — and it works better"
- Tue: "21 agents, $0.22/day. Here's the token-by-token breakdown."
- Wed: "We spent 3 weeks posting to the wrong WordPress API endpoint. Here's how."
- Thu: "Ollama vs cloud embeddings: running nomic-embed-text locally saves us $50/month"
- Fri: "The $27/month AI development stack: Claude Code ($20) + OpenClaw ($7) + $0 infra"

### Week 3: Architecture
- Mon: "Telegram as an AI control plane: forum topics, routing, and going from 300 to 20 messages/day"
- Tue: "440,000 legal documents, 6.9M embeddings, one server. The LexIA numbers."
- Wed: "Our Telegram bot crash-looped for a week. A missing npm package was the cause."
- Thu: "Mission Control vs Jira for AI-managed projects: what works when your PM is a robot"
- Fri: "Windows Server for AI: actually viable? After 5 months, yes — with caveats."

### Week 4: Automation
- Mon: "Zero-human blog pipeline: research → write → image → publish → promote"
- Tue: "120 tweets/month, $0.15. The economics of AI social automation."
- Wed: "The NSSM PAUSED state doesn't mean what you think. It means crashed."
- Thu: "SearXNG + Firecrawl + Playwright: our scraping hierarchy and why order matters"
- Fri: "Month 5 retrospective: from 'it works!' to autonomous operations"

## Rules for Social-Operator

1. **Never post the same topic within 14 days** — check recent posts before generating
2. **Always include a link** to the website or specific pattern page
3. **LinkedIn**: professional tone, first-person plural ("we"), include 3-4 hashtags
4. **Twitter/Ravaclaw**: casual, punchy, can be opinionated. Retranca gallega welcome.
5. **Numbers are mandatory** — every post needs at least one concrete metric
6. **No AI hype** — position as pragmatic engineering, not "AI will change everything"
7. **Credit the tools** — mention OpenClaw, Claude Code, LiteLLM, etc. by name
8. **Website link format**: `https://kaiserchiese.github.io/openclaw-learnings/{section}/{slug}/`
9. **Image**: generate an OG-style card for LinkedIn posts (dark theme, accent green, stat highlight)
10. **Time**: post LinkedIn at 10:00 Madrid (peak engagement). Twitter via existing ravaclaw crons.

## Metrics to Track

- LinkedIn: impressions, engagement rate, profile views, connection requests
- Twitter: impressions, retweets, link clicks, followers gained
- Website: GitHub Pages analytics (if available), GitHub stars, forks
- Review monthly in `learnings:monthly-review` cron (create if needed)
