# Use Case: Social Media Automation

## What It Does

An AI personality ("Ravaclaw") posts autonomously to Twitter 4 times per day. The persona has a defined voice, interests, and regional identity — it's not generic AI content.

## Architecture

```
Cron Trigger (4x daily: 08:00, 13:00, 19:30, 23:00)
    │
    ▼
Social Operator Agent (gemini-3-flash)
    │
    ├── Generates tweet based on personality profile
    ├── Considers time of day (morning = news, evening = casual)
    └── Avoids repeating recent topics
    │
    ▼
Playwright Posting Script
    │
    ├── Loads stored cookies (session auth)
    ├── Navigates to Twitter compose
    ├── Types tweet with 3-selector retry strategy
    └── Confirms post
    │
    ▼
Telegram Notification (Thread: Social)
```

## Why Playwright, Not the API

Twitter's API is expensive and restrictive. Playwright browser automation:
- Free (no API costs)
- No rate limit concerns at 4 posts/day
- Can handle media uploads
- Cookies last ~1 year

The tradeoff: fragile selectors. Twitter changes their DOM regularly.

## Selector Resilience

The posting script uses a 3-tier selector strategy:

```
1. data-testid="tweetTextarea_0"   (most stable)
2. RichTextInputContainer div      (fallback)
3. [contenteditable="true"]        (last resort)
```

Each selector gets a 25-second timeout before falling to the next. This survived 3 months of Twitter DOM changes without manual intervention.

## Personality System

The agent doesn't just post — it has a defined persona:

- **Region:** Pontevedra, Galicia
- **Interests:** Tech, politics, science, football (Celta/Pontevedra CF)
- **Tone:** Galician retranca (dry, ironic humor)
- **Language:** Spanish with occasional Galician expressions
- **Goal:** Maximum virality while staying in character

This prevents the generic "AI thought leader" voice that makes automated accounts obvious.

## Noise Control: From 8 to 4 Posts

Initially scheduled 8 posts/day. Reduced to 4 because:
- Engagement per tweet dropped with higher frequency
- Each tweet was lower quality (less research per post)
- 4 well-timed posts outperform 8 generic ones

Disabled slots: 10:30, 15:30, 17:30, 21:30.

## What Worked

1. **Time-of-day awareness:** Morning posts cover news, evening posts are casual/humorous. Matches natural Twitter behavior.
2. **Cookie-based auth:** One manual login, cookies persist for months. No OAuth complexity.
3. **Silent on success:** Only notifies Telegram if posting fails. Reduces alert fatigue.

## What Didn't Work

- **Draft mode for personal account:** Too much friction. Sending 3 tweet options to Telegram for human approval was abandoned in favor of the autonomous Ravaclaw account.
- **Image generation for every tweet:** Slowed the pipeline and most tweets don't benefit from images.
- **Hashtag stuffing:** AI loves hashtags. Had to explicitly ban them from the prompt.

## Cost

| Component | Daily Tokens | Daily Cost |
|-----------|-------------|-----------|
| Tweet generation (4x) | ~20K | $0.005 |
| Playwright execution | 0 | $0 |
| **Total** | **~20K** | **~$0.005** |

~$0.15/month for 120 tweets/month.
