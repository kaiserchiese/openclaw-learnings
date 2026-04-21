# AI Cost Optimization: $7/month for 21 Agents

## The Goal

Run a production multi-agent system with 21 agents, 50+ cron jobs, and multiple projects for under $10/month.

## Strategy: Model Tiering

The single biggest cost lever is which model handles which task.

### Before Optimization

| Model | Agents | Monthly Cost |
|-------|--------|-------------|
| Pro (expensive) | All 21 agents + sub-agents | ~$45/month |

### After Optimization

| Model | Agents | Monthly Cost |
|-------|--------|-------------|
| Flash (cheap) | 19 agents + all sub-agents | ~$5/month |
| Pro | 1 agent (deep reasoning only) | ~$1.50/month |
| Pro+Search | 1 agent (research only) | ~$0.50/month |

**Key insight:** Sub-agents using Flash instead of Pro was the single biggest cost saver. Sub-agents do grunt work — they don't need deep reasoning.

## Token Budget Breakdown

| Category | Daily Tokens | Daily Cost |
|----------|-------------|-----------|
| Cron jobs (50+) | ~200K | $0.05 |
| User interactions | ~100K | $0.03 |
| Blog pipeline | ~150K | $0.04 |
| Social posting | ~50K | $0.01 |
| Research | ~100K | $0.03 |
| **Total** | **~600K** | **~$0.16** |

## Optimization Techniques

### 1. Reduce cron frequency
- Heartbeat: every 30min (not every 5min)
- Self-healing: every 12h (not every 15min) — Windows Scheduled Task handles frequent checks
- Mining/scraping: every 2h (not every 30min)

### 2. Silent mode for infrastructure
Infrastructure crons don't need LLM output if everything is OK. Run the script, check exit code, only involve the LLM if there's an error to analyze.

### 3. Output truncation
Agent output that exceeds ~500 chars gets truncated before delivery. Saves notification costs and prevents "couldn't generate response" errors.

### 4. Local models for embeddings
Ollama + nomic-embed-text = free embeddings. Don't pay API costs for vector search.

### 5. Bootstrap compression
Smaller system prompts = fewer input tokens per session. We trimmed from 412 to 113 lines.

## Monitoring

Daily token dashboard cron at 06:00 generates a cost report. Any spike above $0.50/day triggers an alert.

## What NOT to Optimize

- **Deep reasoning tasks:** Don't use Flash for architecture decisions or complex debugging. The quality drop costs more in rework.
- **Search-grounded tasks:** Pro+Search for current events is worth the premium — Flash hallucinates facts.
- **First-run setups:** Spend tokens getting the config right once, then optimize the steady state.
