# Show HN: 21 AI agents on a single Windows Server for $5/month

**Title:** Show HN: I run 21 AI agents and 50+ cron jobs on one Windows Server for $5/month

**URL:** https://github.com/kaiserchiese/openclaw-learnings

---

**Comment to post immediately after submission:**

Hey HN — I've been running a multi-agent AI system in production for 5 months on a single Windows Server 2025 box (16GB RAM, GTX 1080). 21 specialized agents, 50+ automated cron jobs, and the whole thing costs about $5-7/month in API calls.

The repo documents every pattern, disaster, and optimization from getting here:

**Architecture highlights:**
- Central orchestrator routes to specialized agents (dev, research, social, content, finance). Sub-agents can't call each other — the orchestrator handles all routing via IF/ELSE rules, not LLM judgment
- LiteLLM proxy routes 90% of tasks to Gemini Flash ($0.001/call), Pro only where quality demands it
- Ollama handles local embeddings (nomic-embed-text) — zero cost
- Telegram as the control plane with forum topics as channels

**What actually runs on this:**
- Autonomous blog pipeline: research → write → image → WordPress draft → review → publish (3x/week, ~$0.05/day)
- Social media automation: 120+ tweets/month with AI personality
- Legal document platform: 440K documents, 6.9M embeddings, semantic search
- Boxing data platform: 11K fighters, 19K matches, ELO ratings

**Cost breakdown:**
- Month 1: $45/month (everything on Gemini Pro)
- Month 5: $5.43/month (model tiering + silent crons + local embeddings)
- Biggest single optimization: switching sub-agent model from Pro to Flash saved ~60%

**Hard-won lessons (each cost hours):**
- NSSM services without AppThrottle = instant crash-loops
- Sub-agent chains calling sub-agents = $3 burned in minutes
- Memory "dreaming" crons cost more than all agents combined until we rate-limited them
- WordPress API URL when installed at /blog/ is /blog/wp-json/, not /wp-json/

The repo has sanitized configs you can use as starting points, plus 14 documented gotchas.

Happy to answer questions about the architecture, cost optimization, or running AI infra on Windows.
