# r/LocalLLaMA Post

**Title:** Running 21 AI agents on a GTX 1080 + Gemini Flash for $5/month — hybrid local/cloud approach

**Subreddit:** r/LocalLLaMA

---

I know this sub leans fully local, but hear me out — a hybrid approach with local models for embeddings + cheap cloud APIs for generation has been running 21 agents in production for 5 months at ~$5/month total.

**Hardware:** Windows Server 2025, 16GB RAM, GTX 1080 (8GB VRAM)

**Local models (Ollama):**
- `nomic-embed-text` — all embeddings (6.9M vectors generated for a legal doc platform). Free, fast, good enough
- `qwen2.5:3b` — grunt work, simple classification, formatting tasks
- `mistral:latest` — fallback for when cloud is down

**Cloud (via LiteLLM proxy → Vertex AI):**
- Gemini Flash — 90% of agent tasks ($0.001/call). This is the real cost saver
- Gemini Pro — only for the "thinker" agent that handles complex reasoning
- OpenRouter — emergency fallback

**The math:**
- Month 1 with everything on Pro: ~$45/month
- After switching sub-agents to Flash: ~$15/month  
- After silencing chatty crons + local embeddings: ~$5-7/month
- Single biggest optimization: sub-agent model Pro → Flash saved ~60% alone

**What surprised me:**
- Flash quality is ~90% of Pro for most agentic tasks (routing, summarizing, formatting, posting)
- The 10% where Pro matters is genuinely important (legal analysis, complex multi-step reasoning)
- Local embeddings with nomic-embed-text are good enough for production search. Didn't need ada-002
- Memory "dreaming" crons (agents reviewing their own memories) were secretly the biggest cost — more than all 21 agents combined until I rate-limited them

**What's running:**
- Autonomous blog pipeline (research → write → image → publish, $0.05/day)
- Social automation (120+ tweets/month with distinct AI personality)
- Legal document search (440K docs with semantic search)
- Sports data platform (11K fighters, 19K matches)

All patterns and configs documented here: https://github.com/kaiserchiese/openclaw-learnings

The GTX 1080 handles Ollama embeddings fine. VRAM is the constraint — couldn't fit larger local models alongside the embedding model. If I had a 3090, I'd probably run a 13B model locally and cut cloud costs even more.

Curious what this sub thinks about hybrid approaches vs going fully local.
