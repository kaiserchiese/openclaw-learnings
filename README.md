# OpenClaw Learnings

**21 AI agents. 50+ cron jobs. $7/month. One Windows server.**

This repo documents everything we learned running a production multi-agent AI system on consumer hardware — the architecture that worked, the disasters that didn't, and the optimizations that brought costs from $45/month to $7.

None of this is theory. Every pattern here came from breaking something first.

---

## Who is this for?

- You're building with AI agents and don't want to burn $500/month on API costs
- You want to run AI infrastructure on your own hardware, not just in the cloud
- You've heard "multi-agent" and wonder if it actually works at scale
- You're on Windows and everyone's tutorials assume Linux

## The setup

```
Windows Server 2025 | 16GB RAM | GTX 1080
├── OpenClaw (agent orchestration)
├── LiteLLM (model proxy → Vertex AI / Ollama / OpenRouter)
├── 21 specialized agents (dev, research, social, content, finance...)
├── 50+ automated cron jobs
├── Docker (Mission Control, SearXNG, databases)
├── Ollama (local embeddings + small models)
└── Telegram (control plane + notifications)
```

**Monthly cost: ~$7** via Gemini Flash for 90% of tasks, Pro only where it matters.

---

## Patterns

Hard-won architecture patterns from 4+ months in production:

| Pattern | TL;DR |
|---------|-------|
| [Multi-Agent Orchestration](patterns/multi-agent-orchestration.md) | Central router, sub-agents can't call each other, IF/ELSE routing beats LLM judgment |
| [Cost Optimization](patterns/cost-optimization.md) | Model tiering, silent crons, local embeddings — $45 → $7/month |
| [Telegram Integration](patterns/telegram-integration.md) | Forum topics as multi-channel control plane, 300 → 20 messages/day |
| [Memory Management](patterns/memory-management.md) | Persistent memory, dreaming with limits, self-improvement loops |
| [Windows Server Setup](patterns/windows-server-setup.md) | NSSM, path gotchas, RAM budgeting, Docker on Windows |
| [Claude Code Workflow](patterns/claude-code-workflow.md) | Rules, hooks, skills, memory, agent delegation — patterns from 4+ months |
| [Claude Code + OpenClaw](patterns/claude-code-plus-openclaw.md) | How both systems complement: dev (interactive) + ops (autonomous) for $27/month |

## Use cases

Real projects running on this stack:

| Project | What it does | Scale |
|---------|-------------|-------|
| [Boxing Data Platform](use-cases/boxing-data-platform.md) | Scrape, match, and analyze amateur boxing data | 11K fighters, 19K matches |
| [Legal AI Platform](use-cases/legal-ai-platform.md) | Ingest and search government legal documents | 440K docs, 6.9M embeddings |
| [Blog Pipeline](use-cases/blog-pipeline.md) | Research → write → image → publish → promote | $0.05/day, fully autonomous |
| [Social Automation](use-cases/social-automation.md) | Multi-platform posting with AI personality | 120 tweets/month, $0.15/month |

## Configs

Sanitized example configurations you can use as starting points:

- [`openclaw.example.json`](configs/openclaw.example.json) — Agent framework config with model routing
- [`litellm.example.yaml`](configs/litellm.example.yaml) — LiteLLM proxy setup for Vertex AI + Ollama
- [`cron-patterns.md`](configs/cron-patterns.md) — Scheduling strategies that won't kill your server

## Gotchas

**[14 hard-won lessons](gotchas/common-pitfalls.md)** that each cost us hours (or days):

1. NSSM crash-loops without AppThrottle
2. WordPress API URL when installed at a subdirectory
3. Bash `$_` trap when calling PowerShell
4. Sub-agent chains that burn $3 in tokens in minutes
5. Memory dreaming crons that cost more than all agents combined
6. ...and 9 more

## Tools inventory

**[What we installed, what we skipped, and why](skills/skills-inventory.md)** — 14 tools evaluated, 6 installed, 8 skipped with reasons.

---

## Quick start: replicate this in a weekend

### Day 1: Foundation

```bash
# 1. Install the orchestration layer
npm install -g openclaw litellm

# 2. Set up LiteLLM with your model provider
cp configs/litellm.example.yaml litellm-config.yaml
# Edit: add your Vertex AI / OpenAI / Anthropic keys
litellm --config litellm-config.yaml

# 3. Configure OpenClaw
cp configs/openclaw.example.json openclaw.json
# Edit: point models to your LiteLLM proxy
openclaw gateway --port 18789

# 4. Install Ollama for local embeddings (free)
# Download from ollama.com, then:
ollama pull nomic-embed-text
```

### Day 2: Agents + Automation

```bash
# 5. Set up Telegram bot (free)
# Create bot via @BotFather, get token
# Create group with Forum mode, add bot as admin

# 6. Add your first cron job
# See configs/cron-patterns.md for templates

# 7. Start with 3-5 agents, not 21
# Main (orchestrator) + 2-3 specialists
# Add more as you hit real needs, not hypothetical ones
```

### Key principles

- **Start with Flash/cheap models everywhere.** Upgrade individual agents to Pro only when Flash quality isn't cutting it.
- **Sub-agents can't call sub-agents.** The orchestrator routes everything. No exceptions.
- **Silent infrastructure by default.** Only notify on errors. You'll thank yourself on day 3.
- **Set NSSM AppThrottle to 30000ms on every service.** Every. Single. One.

---

## Architecture overview

```
                    ┌─────────────┐
                    │  Telegram    │
                    │  (control)   │
                    └──────┬──────┘
                           │
┌──────────┐        ┌──────▼──────┐        ┌──────────┐
│  Crons   │───────>│    Main     │<───────│  User    │
│ (50+)    │        │   Agent     │        │  (DM)    │
└──────────┘        └──────┬──────┘        └──────────┘
                           │
          ┌────────────────┼────────────────┐
          │                │                │
    ┌─────▼─────┐   ┌─────▼─────┐   ┌─────▼─────┐
    │  Thinker  │   │ Dev Agents│   │  Social   │
    │  (Pro)    │   │  (Flash)  │   │  (Flash)  │
    └───────────┘   └───────────┘   └───────────┘
          │                │                │
    ┌─────▼─────────────────▼────────────────▼─────┐
    │              LiteLLM Proxy                    │
    │   Flash ($0.001) │ Pro ($0.01) │ Local (free) │
    └──────────────────┬───────────────────────────┘
                       │
          ┌────────────┼────────────┐
          ▼            ▼            ▼
    Vertex AI      Ollama       OpenRouter
    (Gemini)    (embeddings)   (fallback)
```

---

## Contributing

Found something useful? Disagree with a pattern? Open an issue or PR. This repo is a living document — it gets updated as we learn more.

## License

[MIT](LICENSE) — Use anything here however you want.

---

*Built by [Pio Iglesias](https://github.com/kaiserchiese) with [OpenClaw](https://github.com/openclaw) + [Claude Code](https://claude.ai/claude-code).*
