# Multi-Agent Orchestration

## The Problem

Running 21 agents sounds impressive but quickly becomes chaos without clear routing rules. The main failure mode: agents calling other agents in unpredictable chains, burning tokens and producing hallucinated results.

## Architecture

```
User / Cron / Telegram
        │
    ┌───▼───┐
    │  Main  │  ← Orchestrator (routes, never executes domain tasks)
    │ Agent  │
    └───┬───┘
        │
   ┌────┼────┬────────┬──────────┐
   ▼    ▼    ▼        ▼          ▼
Thinker Research  Dev Agents  Social   Image
(deep    (search)  (code)    (posting) (gen)
 reason)
```

## Key Rules

### 1. Sub-agents CANNOT call other sub-agents

This is the single most important rule. If `research-expert` could call `image-gen`, you get uncontrolled chains. Only the main agent orchestrates.

### 2. Route by IF/ELSE, not by LLM judgment

Don't let the model "decide" which agent to use. Use explicit rules:

```
IF task contains code/git/deploy → backend-dev or frontend-dev
IF task needs deep analysis → thinker
IF task needs current information → research-expert
IF task needs image → image-gen
ELSE → main handles directly
```

### 3. Model tiering saves money

Not every agent needs the most expensive model:

| Tier | Model | Cost | Use For |
|------|-------|------|---------|
| Grunt | Flash | ~$0.001/req | 90% of tasks |
| Think | Pro | ~$0.01/req | Complex reasoning only |
| Search | Pro+Search | ~$0.01/req | Current events, research |

### 4. Multi-step workflows go through main

```
Blog post workflow:
1. Main → research-expert: "Find 3 trending topics in sustainability"
2. Main ← research results
3. Main → thinker: "Write a 1500-word blog post on [topic]"
4. Main ← draft
5. Main → image-gen: "Create featured image for [title]"
6. Main ← image URL
7. Main → wordpress-manager: "Publish with image"
```

Each step is a separate session. Main collects results and passes context forward.

## What Didn't Work

- **Letting agents self-organize:** Resulted in circular calls and token waste
- **Putting routing logic in each agent:** Drift and inconsistency
- **Using Pro model for everything:** 10x cost with minimal quality improvement for routine tasks
- **Agent descriptions as routing hints:** Too fuzzy, inconsistent matching

## What Worked

- **Centralized routing table** in main agent's system prompt
- **Explicit workflow definitions** for multi-step tasks
- **Session isolation** (`sessionTarget: "isolated"`) for cron-triggered tasks
- **Silent mode** for infrastructure agents (no Telegram notification unless error)
