# Running AI Infrastructure on Windows Server

## Why Windows?

Not by choice — it's what the hardware came with. But it works. The key is knowing the workarounds.

## Service Management with NSSM

NSSM (Non-Sucking Service Manager) turns any executable into a Windows service. Essential for running Node.js processes as persistent services.

### Installation
```powershell
winget install nssm
```

### Common Commands
```bash
nssm install ServiceName "C:\path\to\node.exe" "script.js"
nssm start ServiceName
nssm stop ServiceName
nssm restart ServiceName
nssm status ServiceName
```

### Service Configuration
```bash
# Set working directory
nssm set ServiceName AppDirectory "C:\path\to\project"

# Set environment variables
nssm set ServiceName AppEnvironmentExtra "NODE_ENV=production"

# Set stdout/stderr log files
nssm set ServiceName AppStdout "C:\logs\service.log"
nssm set ServiceName AppStderr "C:\logs\service-error.log"

# Throttle restart (prevent crash loops)
nssm set ServiceName AppThrottle 30000
```

### AppThrottle is Critical

Without `AppThrottle`, a crashing service restarts instantly in an infinite loop, consuming all CPU. Set it to at least 30 seconds:
```bash
nssm set ServiceName AppThrottle 30000
```

## Docker on Windows

Docker Desktop works but consumes significant RAM. For our 16GB server:

- Docker + containers: ~2-3GB RAM baseline
- Each container: 30-600MB depending on service
- Total with infrastructure: ~4GB

### Tip: Use `restart: unless-stopped`
```yaml
services:
  my-service:
    restart: unless-stopped  # Not always — allows manual stops to stay stopped
```

## Path Gotchas

| Context | Path Style | Example |
|---------|-----------|---------|
| JSON/YAML config | Backslash (escaped) | `C:\\Users\\Admin\\.openclaw` |
| Git Bash | Forward slash | `/c/Users/Admin/.openclaw` |
| PowerShell | Backslash | `C:\Users\Admin\.openclaw` |
| Node.js | Either works | `path.join()` handles it |

### Bash `$_` in PowerShell

Running PowerShell commands from Git Bash breaks when `$_` appears:
```bash
# BROKEN — bash interprets $_
powershell -Command "Get-Process | Where { $_.WorkingSet -gt 100MB }"

# FIX — use Node.js instead
node -e "console.log(require('os').freemem())"
```

## Scheduled Tasks vs Cron

Windows Task Scheduler can supplement agent-based crons for critical monitoring:
```bash
schtasks /create /tn "ServiceWatchdog" /tr "C:\path\to\watchdog.bat" /sc minute /mo 5
```

Use for: health checks, service restart, disk monitoring. These run even if the agent framework is down.

## RAM Management

With 16GB, budget carefully:

| Component | RAM |
|-----------|-----|
| Windows OS | ~3GB |
| Docker | ~3GB |
| OpenClaw Gateway (4 workers) | ~2.5GB |
| LiteLLM proxy | ~200MB |
| Ollama (idle) | ~500MB |
| Node.js services (5-6) | ~1.5GB |
| **Available** | **~5GB** |

### Tips
- Kill Tor containers when not actively scraping (~100MB each)
- Stop monitoring stacks (Grafana/Prometheus) unless debugging (~200MB)
- Use `AppThrottle` to prevent RAM-consuming restart loops
- Run `docker container prune` and `docker image prune` monthly
