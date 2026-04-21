# OpenClaw Learnings

Real-world lessons from running a multi-agent AI system on a home server (Windows Server 2025, 16GB RAM, GTX 1080).

This repo documents patterns, gotchas, and architecture decisions from building with **OpenClaw** (an AI agent orchestration framework) and **Claude Code** across multiple production projects.

## What's Inside

### [Patterns](patterns/)
Architecture patterns that emerged from running 21 agents, 50+ cron jobs, and multiple projects simultaneously:
- [Multi-Agent Orchestration](patterns/multi-agent-orchestration.md) - How to route tasks across specialized agents
- [Telegram Integration](patterns/telegram-integration.md) - Using Telegram as a multi-channel control plane
- [Memory Management](patterns/memory-management.md) - Persistent memory across agent sessions
- [Cost Optimization](patterns/cost-optimization.md) - Keeping AI costs under $10/month
- [Windows Server Setup](patterns/windows-server-setup.md) - Running AI infra on Windows with NSSM

### [Configs](configs/)
Sanitized example configurations:
- [OpenClaw config](configs/openclaw.example.json) - Main agent framework config
- [LiteLLM config](configs/litellm.example.yaml) - Model proxy routing
- [Cron patterns](configs/cron-patterns.md) - Scheduling strategies for agent automation

### [Use Cases](use-cases/)
Real projects built with this stack:
- [Boxing Data Platform](use-cases/boxing-data-platform.md) - Scraping + AI analysis for amateur boxing
- [Legal AI Platform](use-cases/legal-ai-platform.md) - 440K legal documents, semantic search
- [Blog Pipeline](use-cases/blog-pipeline.md) - Fully automated research → write → publish → promote
- [Social Automation](use-cases/social-automation.md) - Multi-platform posting with personality

### [Skills Inventory](skills/)
- [Skills inventory](skills/skills-inventory.md) - What we installed, what worked, what didn't

### [Gotchas](gotchas/)
- [Common pitfalls](gotchas/common-pitfalls.md) - Hard-won lessons that save you hours

## Stack

| Component | Role |
|-----------|------|
| OpenClaw | Agent orchestration framework |
| LiteLLM | Model proxy (route to any LLM provider) |
| Gemini Flash/Pro | Primary LLM (via Vertex AI) |
| Ollama | Local embeddings + small models |
| NSSM | Windows service management |
| Docker | Infrastructure services |
| Mission Control | Task/project management |
| Telegram | Notification + control interface |

## Hardware

- Windows Server 2025 Standard
- 16GB RAM
- NVIDIA GTX 1080 (8GB VRAM)
- Running 24/7 as a home server

## Cost

Total monthly AI cost: **~$7/month** (Vertex AI Gemini models). See [cost optimization](patterns/cost-optimization.md) for how.

## License

MIT
