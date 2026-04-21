# Memory Management for AI Agents

## The Problem

AI agents forget everything between sessions. Without persistent memory, each conversation starts from zero — the agent re-discovers the same facts, makes the same mistakes, and can't learn from experience.

## Memory Architecture

```
┌─────────────────────┐
│   Session Context    │  ← Conversation history (ephemeral)
├─────────────────────┤
│   Agent Memory DB    │  ← SQLite, per-agent facts (persistent)
├─────────────────────┤
│   Workspace Files    │  ← AGENTS.md, SOUL.md, skills (persistent)
├─────────────────────┤
│   Vector Search      │  ← Embeddings for semantic recall (persistent)
└─────────────────────┘
```

## What Goes Where

| Type | Storage | Example |
|------|---------|---------|
| Operating rules | System prompt files | "Never restart cloudflared" |
| Learned patterns | Memory DB | "WP API is at /blog/wp-json/ not /wp-json/" |
| Error history | Error log files | "EADDRINUSE on port 3002 after restart" |
| Domain knowledge | Vector index | 5000+ workspace docs, searchable |

## Key Lessons

### 1. Memory dreaming (consolidation) needs limits

We had a nightly "dreaming" cron that reviewed all memories and consolidated them. With no limits, it:
- Timed out after 600s
- Cost more tokens than all other agents combined
- Produced diminishing returns after ~30 memories

**Fix:** Cap at 10 memories per consolidation, 30-day max age.

### 2. Embeddings should be local

We use Ollama + nomic-embed-text for embeddings:
- Zero cost (runs on CPU)
- ~32 docs/minute embedding rate
- Good enough quality for workspace search
- No API dependency

### 3. Self-improvement loop

```
Agent makes error → Logs to ERRORS.md
Weekly cron reviews ERRORS.md → Extracts patterns
Recurring patterns → Promoted to AGENTS.md rules
```

This turns failures into permanent improvements. After 3 months, the error rate dropped significantly because common mistakes became rules.

### 4. Bootstrap size matters

Agent system prompts ("bootstrap") that are too large waste context window on every session:
- Started at 412 lines → trimmed to 113 lines
- Moved details to separate files (agents read on-demand)
- Set `bootstrapMaxChars: 25000` to enforce limits

## Tools

- **QMD:** Hybrid BM25 + vector search over workspace docs
- **better-sqlite3:** Fast SQLite access from Node.js
- **Ollama nomic-embed-text:** Local embedding model (no GPU needed)
