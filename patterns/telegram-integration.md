# Telegram as AI Control Plane

## Why Telegram?

Telegram Forum topics turn a single group chat into a multi-channel control plane. Each topic = a domain. The bot routes messages to the right topic automatically.

## Architecture

```
Telegram Group (Forum Mode)
├── Topic 1: General
├── Topic 2: Images
├── Topic 3: Research
├── Topic 4: Dev
├── Topic 5: Business
├── Topic 6: Blog
├── Topic 7: Project-specific
├── Topic 8: System alerts
└── Topic N: Per-feature channels
```

## Routing Strategy

### Priority Levels

| Priority | Action | Example |
|----------|--------|---------|
| ACTION | Requires human response | "Deploy failed, needs manual fix" |
| FYI | Informational, no action needed | "Blog post published successfully" |
| SILENT | Don't notify at all | "Heartbeat OK", routine checks |

### Implementation

In cron job delivery config:
```json
{
  "delivery": {
    "mode": "announce",
    "channel": "telegram",
    "to": "CHAT_ID:TOPIC_ID",
    "bestEffort": true
  }
}
```

## Noise Reduction

Our first setup sent 300+ messages/day. After optimization: ~20/day.

### What we did:
1. **Silent infrastructure:** Heartbeat, self-healing, routine checks → no notification unless error
2. **Batched reports:** Instead of per-item alerts, aggregate into daily/weekly digests
3. **bestEffort: true:** Don't retry failed notifications endlessly
4. **Topic routing:** Users only subscribe to topics they care about

## Gotchas

- Forum topic IDs are integers, not strings. `"to": "CHAT_ID:TOPIC_ID"` format.
- Bot must be admin in the group to post to topics
- Rate limits: Telegram allows ~30 messages/second per bot, but respect the API
- `message_thread_id` is the topic ID in the Telegram Bot API
- Creating topics programmatically requires `createForumTopic` API method
