---
description: AI cost tracking workflow — calculate premium request consumption and generate budget reports.
---

# Cost Tracking Skill

## When to use

Use this skill before starting large multi-step operations to check budget headroom, or when `@cost-tracker` is invoked to generate a report.

## Model Multipliers (GitHub Copilot Pro+)

| Model | Claude Code `model:` | OpenCode `model:` | Multiplier | Best for |
|---|---|---|---|---|
| Claude Opus 4.6 | `opus` | `github-copilot/claude-opus-4.6` | 3x | Orchestration, planning |
| Claude Sonnet 4.6 | `sonnet` | `github-copilot/claude-sonnet-4.6` | 1x | Implementation (default) |
| Claude Haiku 4.5 | `haiku` | `github-copilot/claude-haiku-4.5` | 0.33x | Exploration, search |
| GPT-4.1 | `gpt-4.1` | `github-copilot/gpt-4.1` | 0x | Utility, cost tracking (free) |
| GPT-4.1-mini | — | `github-copilot/gpt-4.1-mini` | 0x | Simple tasks (free) |

## Calculation

```
premium_requests = Σ (messages_per_model × multiplier)
budget_used_% = (premium_requests / 1500) × 100
```

## Optimization Strategy

```
Planning & orchestration   → Opus 4.6 (3x)   — use sparingly
Implementation & coding    → Sonnet 4.6 (1x)  — default choice
File search & exploration  → Haiku 4.5 (0.33x) — cheap reads
Formatting & cost reports  → GPT-4.1 (0x)    — completely free
```

## Workflow

1. Delegate to `@cost-tracker` with usage data
2. `@cost-tracker` reads `.project/costs/budget.yaml` for multipliers
3. Calculates totals per model
4. Generates report using `.project/templates/cost-report.md`
5. Updates `.project/costs/current.md`
6. Archives monthly reports to `.project/costs/history/YYYY-MM.md`

## Alert Thresholds

- **75% of budget**: Warn — switch from opus to sonnet where possible
- **95% of budget**: Alert — switch to haiku for exploration, gpt-4.1 for utilities
- **Over budget**: Only free models (gpt-4.1, gpt-4.1-mini) for rest of period
