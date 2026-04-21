# Cron Scheduling Patterns

## Avoiding Collision Windows

When running 50+ cron jobs, scheduling collisions cause RAM spikes and timeout cascades.

### The Problem

Multiple agents starting simultaneously:
- Each agent session uses 200-600MB RAM
- LiteLLM proxy queues requests, increasing latency
- Timeouts cascade — one slow job delays the next

### The Fix: Stagger by Category

```
06:00 - 07:00  Infrastructure (token dashboard, backups)
07:00 - 08:00  Reports (Google daily, weekly digests)
08:00 - 09:00  Business (ads research, strategy — weekdays only)
09:00 - 10:00  Content review (blog review, social planning)
10:00 - 11:00  Content publish (blog publication, social posting)
11:00 - 12:00  Research (trending topics, market intel)
```

Within each window, offset by 10-15 minutes:
```json
{ "schedule": "0 8 * * 1" }    // 08:00 - Strategy briefing
{ "schedule": "10 8 * * 1" }   // 08:10 - Weekly report
{ "schedule": "15 8 * * 1" }   // 08:15 - Ads research
```

## Silent Mode for Infrastructure

Infrastructure crons (heartbeat, self-healing, cleanup) should NOT notify unless there's an error.

```json
{
  "id": "sistema:heartbeat",
  "schedule": "*/30 * * * *",
  "delivery": {
    "mode": "silent"
  },
  "payload": {
    "prompt": "Check services. Only report if something is DOWN."
  }
}
```

**Result:** 300+ daily notifications → ~20

## Interval vs Cron Schedule

Use `intervalMs` for recurring checks that don't need clock alignment:
```json
{
  "intervalMs": 7200000,
  "activeHours": { "start": "08:00", "end": "23:00" }
}
```

Use `schedule` (cron expression) for time-specific tasks:
```json
{
  "schedule": "30 9 * * 1-5"
}
```

## Active Hours

Don't waste tokens overnight:
```json
{
  "activeHours": {
    "start": "08:00",
    "end": "23:00",
    "timezone": "Europe/Madrid"
  }
}
```

## Throttling Restart Loops

Set `consecutiveErrorsThreshold` to auto-disable broken crons:
```json
{
  "consecutiveErrorsThreshold": 3,
  "payload": {
    "maxOutputChars": 500
  }
}
```

## Best Effort Delivery

For non-critical notifications, don't retry failures:
```json
{
  "delivery": {
    "mode": "announce",
    "bestEffort": true
  }
}
```

## Real Cost Impact

| Pattern | Before | After | Savings |
|---------|--------|-------|---------|
| Infrastructure silent | 200+ msgs/day | 0 (unless error) | ~50K tokens/day |
| Heartbeat 5min → 30min | 288 runs/day | 32 runs/day | ~30K tokens/day |
| Self-healing 15min → 12h | 96 runs/day | 2 runs/day | ~20K tokens/day |
| Mining 30min → 2h | 48 runs/day | 12 runs/day | ~40K tokens/day |
