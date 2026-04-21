# Common Pitfalls

Hard-won lessons from running AI agents in production on Windows Server.

## 1. NSSM AppThrottle — Set It or Die

**Problem:** A crashing NSSM service restarts instantly in an infinite loop, consuming 100% CPU.

**Fix:** Always set AppThrottle:
```bash
nssm set ServiceName AppThrottle 30000  # 30 seconds minimum
```

**How we learned:** A Telegram bot with an invalid token crash-looped 40 times per second, making the server unresponsive. Had to SSH in and manually stop it.

## 2. WordPress API URL: /blog/wp-json/ not /wp-json/

**Problem:** If WordPress is installed at a subdirectory (`/blog/`), the REST API lives at `/blog/wp-json/wp/v2/`, not `/wp-json/wp/v2/`. Requests to the wrong URL return HTML (the main site) with a 200 status — not a 404.

**Fix:** Always verify the WP API base URL by testing:
```bash
curl -s https://example.com/blog/wp-json/wp/v2/posts?per_page=1 | head -c 100
```

**How we learned:** The blog pipeline silently "published" articles to nowhere for 2 weeks. The agent reported success because it got a 200 response (which was actually the homepage HTML).

## 3. Bash vs PowerShell: The $_ Trap

**Problem:** Running PowerShell commands from Git Bash breaks when `$_` appears, because Bash interprets it as the last argument of the previous command.

**Fix:** Use Node.js instead of PowerShell for system info:
```bash
# BROKEN
powershell -Command "Get-Process | Where { $_.WorkingSet -gt 100MB }"

# WORKS
node -e "console.log(require('os').freemem())"
```

## 4. Sub-Agent Chains Burn Tokens

**Problem:** If sub-agents can call other sub-agents, you get uncontrolled execution chains. Agent A calls Agent B which calls Agent C, each adding tokens and latency.

**Fix:** Only the main orchestrator can call sub-agents. Sub-agents cannot spawn other agents.

**How we learned:** A research task triggered image generation which triggered content writing which triggered research — a circular chain that burned $3 in tokens before hitting the timeout.

## 5. Memory Dreaming Without Limits

**Problem:** A nightly "memory consolidation" cron reviewed ALL agent memories. With 500+ memories, it timed out at 600 seconds every night and cost more tokens than all other agents combined.

**Fix:** Cap at 10 memories per consolidation, 30-day max age.

## 6. Infrastructure Crons That Talk Too Much

**Problem:** Heartbeat, self-healing, and monitoring crons sent 300+ Telegram messages per day. Each "all OK" message was noise.

**Fix:** Silent mode for infrastructure. Only notify on errors:
```json
{
  "delivery": { "mode": "silent" },
  "payload": { "prompt": "Check services. Only report if DOWN." }
}
```

**Result:** 300+ messages/day → ~20/day

## 7. Node.js `-e` and Exclamation Marks

**Problem:** Bash interprets `!` in double-quoted strings as history expansion. `node -e "if (x !== y)"` breaks because `!==` triggers history lookup.

**Fix:** Use single quotes or temp files:
```bash
node -e 'if (x !== y) console.log("different")'
```

## 8. Docker Restart Policy: `unless-stopped` > `always`

**Problem:** `restart: always` means you can never manually stop a container — it always comes back.

**Fix:** Use `restart: unless-stopped`. Manual `docker stop` stays stopped; only system reboots trigger restart.

## 9. SQLite WAL Bloat

**Problem:** SQLite databases grow large because WAL (Write-Ahead Log) files accumulate. A 100MB database can have a 2GB WAL file.

**Fix:** Periodic VACUUM:
```bash
sqlite3 database.db "PRAGMA wal_checkpoint(TRUNCATE); VACUUM;"
```

**Caveat:** VACUUM rewrites the entire DB. For a 4GB database, this needs 4GB free disk space and takes minutes. Schedule during low-activity periods.

## 10. Cron Jobs at the Same Time

**Problem:** Multiple crons scheduled at round numbers (08:00, 09:00) start simultaneously, causing RAM spikes and timeout cascades.

**Fix:** Stagger by 10-15 minutes within each hour window. Never schedule more than 2 heavy crons in the same 15-minute block.

## 11. Agent Output Too Large

**Problem:** Self-healing and monitoring agents produce verbose output. When output exceeds LLM context, you get "Agent couldn't generate a response" errors.

**Fix:** Truncate output:
```json
{ "payload": { "maxOutputChars": 500 } }
```

Or truncate in the check script itself before returning results.

## 12. Embedding Daemon Left Running

**Problem:** A one-shot embedding job was configured as an always-on NSSM service. After processing all 6.9M documents, it sat idle consuming 200MB RAM for weeks.

**Fix:** Run batch jobs as one-shot scripts triggered by cron. Disable/remove the service once the job completes.

## 13. LiteLLM Timeout Too High

**Problem:** Default LiteLLM timeout was 90 seconds. A single slow request blocks the worker for 90 seconds, causing cascading delays for other agents.

**Fix:** Reduce to 60 seconds. Most legitimate requests complete in <30s. If a request needs more than 60s, it's probably stuck.

## 14. Ignoring `consecutiveErrors` in Cron Logs

**Problem:** A broken cron job failed silently for weeks because nobody checked the `consecutiveErrors` counter.

**Fix:** Set `consecutiveErrorsThreshold: 3` to auto-disable after repeated failures, and surface errors in the daily token dashboard.
