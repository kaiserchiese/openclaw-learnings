# Use Case: Automated Blog Pipeline

## What It Does

A fully automated blog pipeline that researches topics, writes articles, generates featured images, and publishes to WordPress — all orchestrated by AI agents on a daily schedule.

## The Pipeline

```
09:30 — Review Cron
    │
    ├── Check for draft posts needing revision
    ├── Verify SEO quality, readability
    └── Fix issues or approve for publication
    │
    ▼
10:30 — Publication Cron
    │
    ├── Research current news (EU regulations, MITECO, BOE)
    ├── Select topic avoiding recent duplicates
    ├── Write 1500-word article with organic internal links
    ├── Generate unique featured image via image-gen agent
    ├── Publish to WordPress
    └── Verify publication with GET request
```

## Multi-Agent Orchestration

The pipeline uses 4 agents coordinated by the main orchestrator:

| Step | Agent | Model |
|------|-------|-------|
| Topic research | research-expert | gemini-3.1-pro-search |
| Article writing | wordpress-manager | gemini-3-flash |
| Image generation | image-gen | gemini-3.1-flash-image-preview |
| Publishing | wordpress-manager | gemini-3-flash |

Each step is a separate session. The main agent collects results and passes context forward.

## Rules That Prevent Bad Output

### Anti-Clustering
Same vertical + angle within 14 days = discard the topic. Prevents the blog from becoming repetitive.

### Organic Links Only
Internal links must flow naturally within the content. No "Related articles" sections. No forced SEO anchor text.

### Unique Featured Images
Every post must have a unique `featured_media` ID. No image reuse. The publication cron checks this before publishing.

### Day Validation
Publication cron verifies the current day matches the schedule. Prevents accidental double-posts from retry loops.

### Post-Publish Verification
After publishing, a GET request confirms the post is live and the featured image loads correctly.

## What Went Wrong (And How We Fixed It)

### 1. SEO-Optimized Garbage
Early articles read like keyword-stuffed SEO content. **Fix:** Banned explicit SEO optimization from the writing prompt. Focus on reader value, not search ranking.

### 2. Image Reuse
The image-gen agent sometimes reused the same featured image for multiple posts. **Fix:** Made the image check blocking — publication fails if the image isn't unique.

### 3. Wrong WP API URL
WordPress was installed at `/blog/`, so the API lived at `/blog/wp-json/wp/v2/`, not `/wp-json/wp/v2/`. This broke silently — the agent thought posts were published but they weren't. **Fix:** Hardcoded the correct base URL in all agent files.

### 4. Cron Ordering
Review cron was scheduled after publication, meaning new posts were never reviewed. **Fix:** Swapped order — review at 09:30, publication at 10:30.

### 5. Topic Clustering
Without the anti-clustering rule, the blog published 5 articles about carbon credits in 2 weeks. **Fix:** 14-day cooldown per vertical+angle combination.

## Cost

| Component | Daily Tokens | Daily Cost |
|-----------|-------------|-----------|
| Research | ~50K | $0.01 |
| Writing | ~80K | $0.02 |
| Image gen | ~20K | $0.01 |
| Review | ~30K | $0.01 |
| **Total** | **~180K** | **~$0.05** |

~$1.50/month for daily automated blog content.

## Lessons Learned

1. **Review before publish, not after.** Obvious in hindsight, but easy to get wrong in cron scheduling.
2. **Verification beats trust.** The POST request says "published," but the GET request proves it.
3. **Anti-repetition rules are essential.** Without them, AI blogs converge on the same few topics.
4. **SEO focus produces bad content.** Let the model write for humans; SEO follows naturally.
