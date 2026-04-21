# Claude Code: Patterns That Actually Work

## What is Claude Code?

Claude Code is Anthropic's CLI/IDE tool for AI-assisted development. It's not just autocomplete — it's a full agent that reads your codebase, runs commands, edits files, and delegates to specialized sub-agents.

This document covers the patterns we developed after 4+ months of daily use across multiple projects.

## The Rules System

The single most impactful thing you can do with Claude Code is write good rules.

### Structure

```
~/.claude/rules/
├── common/              # Language-agnostic (always loaded)
│   ├── coding-style.md
│   ├── git-workflow.md
│   ├── testing.md
│   ├── security.md
│   ├── agents.md
│   └── performance.md
├── typescript/          # Loaded for TS/JS projects
├── python/              # Loaded for Python projects
├── web/                 # Loaded for frontend projects
│   ├── design-quality.md
│   ├── performance.md
│   └── hooks.md
└── golang/              # Loaded for Go projects
```

### Why this structure works

- **Layered**: Common rules apply everywhere, language-specific rules override when idioms differ
- **Small files**: Each rule file is ~50-100 lines. One concern per file.
- **Actionable**: Rules say "do X" or "never do Y", not "consider the implications of..."

### Rules that made the biggest difference

1. **Immutability by default** — "ALWAYS create new objects, NEVER mutate existing ones." Eliminated an entire class of bugs.

2. **Sub-agents can't spawn sub-agents** — Same rule we use in OpenClaw. Without this, Claude Code tasks cascade into expensive recursive agent chains.

3. **File size limits** — "Functions < 50 lines, files < 800 lines." Enforced via a PreToolUse hook that blocks oversized writes.

4. **Security checklist before every commit** — "No hardcoded secrets, all inputs validated, parameterized queries." Catches things before they reach git.

5. **Research before implementing** — "Search GitHub and package registries before writing new code." Prevented us from reinventing wheels dozens of times.

## Agent Delegation

Claude Code has specialized sub-agents. Knowing when to use which one saves hours:

| Agent | When to use | When NOT to use |
|-------|------------|-----------------|
| **planner** | Complex features, refactoring | Simple one-file changes |
| **architect** | System design decisions | Implementation details |
| **tdd-guide** | New features, bug fixes | Docs, configs |
| **code-reviewer** | After every code change | Before writing code |
| **security-reviewer** | Auth, crypto, user input, APIs | Internal utilities |
| **build-error-resolver** | Complex build failures | Simple typos |

### The delegation rule

For any non-trivial task:
1. **planner** designs the approach
2. You (or Claude) implement it
3. **code-reviewer** reviews immediately after
4. **security-reviewer** if it touches boundaries

Don't skip step 3. The reviewer catches things the implementer misses every time.

### Parallel agent execution

Independent tasks should run in parallel, not sequentially:

```
GOOD: Launch 3 agents simultaneously
  - Security analysis of auth module
  - Performance review of cache
  - Type checking of utilities

BAD: Run them one after another (3x slower, same cost)
```

## Hooks

Hooks automate quality gates so you don't have to remember them:

### PostToolUse: Format + lint after every edit

```json
{
  "PostToolUse": [
    { "matcher": "Write|Edit", "command": "pnpm prettier --write \"$FILE_PATH\"" },
    { "matcher": "Write|Edit", "command": "pnpm eslint --fix \"$FILE_PATH\"" }
  ]
}
```

### PreToolUse: Block oversized files

```json
{
  "PreToolUse": [
    {
      "matcher": "Write",
      "command": "node -e \"...(count lines, block if > 800)...\""
    }
  ]
}
```

### Stop: Verify build at session end

```json
{
  "Stop": [
    { "command": "pnpm build", "description": "Verify production build" }
  ]
}
```

## Skills System

Skills are deep reference docs that Claude Code reads on-demand. Unlike rules (short, always loaded), skills are long and loaded only when relevant.

### What makes a good skill

- **Specific**: "Playwright Best Practices" not "Testing"
- **Actionable**: Copy-paste patterns, not theory
- **Scoped**: One domain per skill, 200-500 lines

### Skills we use daily

| Skill | Purpose |
|-------|---------|
| `frontend-design` | Design quality standards, anti-template patterns |
| `playwright-best-practices` | E2E testing patterns, selectors, CI config |
| `nodejs-backend-patterns` | Express/Fastify middleware, auth, error handling |
| `seo` | Technical SEO, structured data, meta tags |
| `accessibility` | WCAG 2.2 compliance patterns |

### autoskills

Instead of manually creating skills for each project, run `npx autoskills` in the project root. It detects the stack and generates relevant skill files automatically.

## Memory System

Claude Code has persistent memory across sessions. The key is knowing what to store vs. what to derive:

### Store in memory

- User preferences and role context
- Feedback corrections ("don't do X because Y")
- Project decisions that aren't in the code ("we're migrating auth for compliance reasons")
- External resource locations ("bugs are tracked in Linear project INGEST")

### DON'T store in memory

- Code patterns (read the code)
- Git history (use git log)
- File paths (use glob/grep)
- Debugging solutions (the fix is in the commit)

**Why**: Stale memories are worse than no memories. Code changes; stored facts about code don't.

## Context Window Management

Claude Code's context window is finite. Managing it well is the difference between a productive session and hitting the wall mid-task.

### What wastes context

- Reading entire large files when you only need a section
- Running verbose commands without truncation
- Keeping old conversation history that's no longer relevant
- Large system prompts (rules + skills + memory)

### What helps

- `bootstrapMaxChars: 25000` — limits system prompt size
- `tokenjuice` — compresses shell output
- `lossless-claw` — DAG-based context management
- Read only the lines you need: `Read file.ts --offset 50 --limit 30`
- Use agents for research-heavy tasks (results stay in agent context, not yours)

## The Development Workflow

Our standard flow for any feature:

```
1. Research    — GitHub search + docs before writing code
2. Plan        — planner agent for non-trivial tasks
3. TDD         — Write test → fail → implement → pass → refactor
4. Review      — code-reviewer + security-reviewer
5. Commit      — Conventional commits (feat:, fix:, docs:)
6. Verify      — Build passes, tests green, feature works
```

Every step has a rule file that defines the standard. The workflow is the same whether Claude Code is driving or a human is.

## Anti-patterns we eliminated

1. **"Let me clean up the surrounding code"** — Claude loves to refactor neighbors. Rule: "Don't add features, refactor code, or make improvements beyond what was asked."

2. **Speculative abstractions** — Building helpers for one-time operations. Rule: "Three similar lines of code is better than a premature abstraction."

3. **Trailing summaries** — "Here's what I did: ..." after every response. Rule: "No trailing summaries unless asked."

4. **Adding comments to unchanged code** — Rule: "Don't add docstrings, comments, or type annotations to code you didn't change."

5. **Error handling for impossible scenarios** — Rule: "Only validate at system boundaries. Trust internal code and framework guarantees."
