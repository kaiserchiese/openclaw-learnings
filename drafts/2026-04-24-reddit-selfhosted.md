# r/selfhosted Post

**Title:** 21 AI agents, 50+ cron jobs, $7/month — all on one Windows Server

**Subreddit:** r/selfhosted

**Flair:** Self-Hosted AI

---

I've been self-hosting a full multi-agent AI system for 5 months on a single Windows Server 2025 machine (16GB RAM, GTX 1080). Thought this community would appreciate the setup since most AI tutorials assume cloud infrastructure.

**The stack:**
```
Windows Server 2025
├── OpenClaw (agent orchestration framework)
├── LiteLLM (proxy → Vertex AI / Ollama / OpenRouter)
├── 21 specialized AI agents
├── 50+ automated cron jobs
├── Docker (dashboards, databases, SearXNG)
├── Ollama (local embeddings + small models)
└── Telegram bot (control plane)
```

**What it actually does:**
- Writes and publishes blog posts autonomously (3x/week)
- Manages social media across multiple accounts
- Runs a legal document search engine (440K docs, 6.9M embeddings)
- Tracks amateur boxing data (11K fighters, 19K matches)
- Monitors markets, generates reports, handles email triage

**Cost evolution:**
- Month 1: ~$45/month (naive approach, everything on expensive models)
- Month 5: ~$7/month (model tiering, silent crons, local embeddings)

**Key decisions that worked:**
1. Gemini Flash for 90% of tasks, Pro only for deep reasoning
2. Ollama for embeddings instead of API calls (free)
3. Silent cron jobs by default — only notify on errors (cut Telegram noise from 300 to 20 msgs/day)
4. NSSM for Windows services with 30s AppThrottle on everything
5. Central orchestrator pattern — sub-agents can't call each other

**Windows-specific gotchas:**
- NSSM is essential. Without AppThrottle, crashed services restart instantly in infinite loops
- Docker Desktop works but eats RAM. Budget 2-3GB just for Docker
- Bash `$_` in PowerShell contexts will ruin your day
- Path separators matter everywhere (forward slashes in configs, backslashes in Windows paths)

I documented everything in a public repo with patterns, configs, and 14 hard-won lessons: https://github.com/kaiserchiese/openclaw-learnings

Happy to answer questions about the setup. Running AI on your own hardware is totally viable if you're smart about model routing.
