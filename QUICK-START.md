# Quick Start: Multi-Agent AI on Your Own Server

Go from zero to a working multi-agent system in a weekend. This guide assumes you have a server (Windows or Linux) with at least 8GB RAM.

## Prerequisites

- Node.js 20+
- Docker (for infrastructure services)
- A model provider account (Vertex AI, OpenAI, Anthropic, or OpenRouter)
- Telegram account (for the control plane)

## Step 1: Model Proxy (30 min)

LiteLLM lets you route to any model provider through one API. This is the foundation — your agents talk to LiteLLM, LiteLLM talks to the actual models.

```bash
pip install litellm[proxy]
```

Create `litellm-config.yaml`:

```yaml
model_list:
  # Cheap model for 90% of work
  - model_name: flash
    litellm_params:
      model: vertex_ai/gemini-2.0-flash  # or openai/gpt-4o-mini, etc.
      vertex_project: YOUR_PROJECT
      vertex_location: us-central1

  # Expensive model for deep reasoning (1 agent only)
  - model_name: pro
    litellm_params:
      model: vertex_ai/gemini-2.0-pro
      vertex_project: YOUR_PROJECT
      vertex_location: us-central1

  # Local model for embeddings (free)
  - model_name: embed
    litellm_params:
      model: ollama/nomic-embed-text
      api_base: http://localhost:11434

general_settings:
  master_key: YOUR_MASTER_KEY
  request_timeout: 60  # Not 90 — stuck requests block workers

litellm_settings:
  num_retries: 2
  request_timeout: 60
```

```bash
litellm --config litellm-config.yaml --port 4000
```

Test it:
```bash
curl http://localhost:4000/v1/chat/completions \
  -H "Authorization: Bearer YOUR_MASTER_KEY" \
  -H "Content-Type: application/json" \
  -d '{"model": "flash", "messages": [{"role": "user", "content": "ping"}]}'
```

## Step 2: Agent Orchestration (1 hour)

Install OpenClaw and configure your first agents:

```bash
npm install -g openclaw
```

The key config is `openclaw.json`. Copy `configs/openclaw.example.json` from this repo and edit it.

**Critical rules:**
- Point all agents at your LiteLLM proxy (`http://localhost:4000`)
- Use `flash` model for everything initially
- Only upgrade individual agents to `pro` when quality isn't good enough
- Set `subagents.model` to `flash` — this is the single biggest cost saver

Start the gateway:
```bash
openclaw gateway --port 18789
```

## Step 3: Local Embeddings (15 min)

Don't pay for embeddings. Run them locally:

```bash
# Install Ollama (ollama.com)
ollama pull nomic-embed-text
```

This gives you free vector search over your workspace. Quality is good enough for document retrieval.

**If you have an NVIDIA GPU:** Great, embeddings will be faster. If not, CPU works fine — just slower for bulk indexing (~32 docs/min).

**Gotcha on Windows:** If you get Vulkan build errors with node-llama-cpp, set `NODE_LLAMA_CPP_GPU=false` system-wide.

## Step 4: Telegram Control Plane (30 min)

Telegram Forum topics are the killer feature. One group chat, multiple channels:

1. Create a bot via [@BotFather](https://t.me/BotFather)
2. Create a group chat
3. Enable Forum mode (group settings → Topics)
4. Add your bot as admin
5. Create topics: General, Dev, Research, System, Blog, etc.

Each topic gets its own `message_thread_id`. Route agent output to the right topic:

```json
{
  "delivery": {
    "channel": "telegram",
    "to": "CHAT_ID:TOPIC_ID"
  }
}
```

**Day 1 mistake everyone makes:** Sending every notification to Telegram. You'll get 300+ messages/day. Instead:
- Infrastructure checks → `"mode": "silent"` (only notify on errors)
- Routine reports → daily digest, not per-event
- `bestEffort: true` on everything

## Step 5: First Cron Jobs (30 min)

Start with 3-5 cron jobs, not 50:

```json
[
  {
    "id": "heartbeat",
    "name": "system:heartbeat",
    "schedule": { "expr": "*/30 * * * *" },
    "payload": {
      "prompt": "Check if all services are running. Only report errors."
    },
    "delivery": { "mode": "silent" }
  },
  {
    "id": "daily-summary",
    "name": "system:daily-summary",
    "schedule": { "expr": "0 8 * * *" },
    "payload": {
      "prompt": "Generate a brief summary of yesterday's agent activity."
    },
    "delivery": { "mode": "announce", "channel": "telegram", "to": "CHAT_ID:GENERAL_TOPIC" }
  }
]
```

**Scheduling rules that prevent disasters:**
- Never put 2+ heavy crons at the same time (stagger by 10-15 min)
- Active hours only (08:00-23:00) for non-critical jobs
- `bestEffort: true` — failed delivery shouldn't retry forever

## Step 6: Make It Persistent (Windows)

Use NSSM to run everything as Windows services:

```bash
# Install NSSM
winget install nssm

# Register gateway as service
nssm install OpenClaw-Gateway "C:\path\to\node.exe" "C:\path\to\openclaw\dist\index.js" gateway --port 18789
nssm set OpenClaw-Gateway AppDirectory "C:\path\to\openclaw-config"
nssm set OpenClaw-Gateway AppThrottle 30000  # CRITICAL
nssm set OpenClaw-Gateway AppStdout "C:\logs\gateway.log"
nssm set OpenClaw-Gateway AppStderr "C:\logs\gateway-error.log"

# Same for LiteLLM
nssm install LiteLLM "C:\path\to\python.exe" "-m" "litellm" "--config" "litellm-config.yaml" "--port" "4000"
nssm set LiteLLM AppThrottle 30000  # CRITICAL
```

**AppThrottle is non-negotiable.** Without it, a crash-looping service will eat 100% CPU and make your server unresponsive. 30 seconds minimum. See [gotchas](gotchas/common-pitfalls.md#1-nssm-appthrottle--set-it-or-die).

## Step 6b: Make It Persistent (Linux)

```bash
# systemd service file
sudo tee /etc/systemd/system/openclaw.service << 'EOF'
[Unit]
Description=OpenClaw Gateway
After=network.target

[Service]
Type=simple
ExecStart=/usr/bin/node /path/to/openclaw gateway --port 18789
WorkingDirectory=/path/to/config
Restart=on-failure
RestartSec=30

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl enable openclaw
sudo systemctl start openclaw
```

## What to build first

Don't try to replicate 21 agents on day one. Start with:

1. **Main agent** — the orchestrator that routes everything
2. **Research agent** — searches the web, summarizes findings
3. **Dev agent** — writes and reviews code

Add more agents only when you hit a real need, not a hypothetical one. Every agent you add is:
- More RAM consumed
- More system prompt tokens per session
- More potential for routing bugs

## Cost expectations

| Setup | Monthly Cost |
|-------|-------------|
| 3 agents, 5 crons, Gemini Flash | $2-3 |
| 10 agents, 20 crons, Flash + Pro | $5-8 |
| 21 agents, 50 crons, Flash + Pro + Search | $7-10 |
| Same setup with GPT-4o instead of Gemini | $30-50 |

The Gemini Flash pricing is what makes this viable on a budget. As of early 2026, it's the best cost/quality ratio for agent grunt work.

## Common first-week mistakes

1. **Using Pro model for everything** — 10x cost, minimal quality gain for routine tasks
2. **Letting agents call each other** — circular chains, uncontrolled token burn
3. **Too many Telegram notifications** — you'll mute the group by day 2
4. **No AppThrottle on NSSM services** — one crash loop makes the whole server unusable
5. **Running embedding daemon as always-on** — it's a batch job, not a service
6. **Scheduling crons at round numbers** — 08:00/09:00 creates RAM spikes

## Next steps

- Read the [patterns](patterns/) for architecture decisions
- Check [gotchas](gotchas/common-pitfalls.md) before you hit them yourself
- Review [use cases](use-cases/) for inspiration on what to build
- See [configs](configs/) for example configurations
