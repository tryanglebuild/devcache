# Agent Template Guide

Use this template to create a new agent in `.claude/agents/agent-name.md`.

## Steps

1. Create `.claude/agents/agent-name.md` with the frontmatter below
2. Add an entry to `opencode.json` pointing to the `.md` file
3. Add the agent to the hierarchy in `AGENTS.md`

---

## Claude Code Frontmatter (canonical)

```yaml
---
name: agent-name
description: "One-line description of what this agent does"
model: sonnet
color: blue
---
```

**Model options**: `opus` (3x cost, for orchestration), `sonnet` (1x, for implementation), `haiku` (0.33x, for exploration)
**Color options**: purple, green, blue, orange, red, yellow

---

## Agent Body Structure

```markdown
# [Agent Name]

## Role
[What this agent specializes in]

## Responsibilities
- [Core responsibility 1]
- [Core responsibility 2]

## Guidelines
- [Behavioral rule 1]
- [Behavioral rule 2]

## Context
- Always read `.project/brief.md` before starting
- Check `.project/kanban/in-progress.md` for current tasks
- Use domain terms from `.project/glossary.md`
```

---

## OpenCode Bridge Entry (in opencode.json)

```json
"agent-name": {
  "name": "agent-name",
  "description": "Same description as frontmatter",
  "model": "github-copilot/claude-sonnet-4.6",
  "temperature": 0.2,
  "color": "#3B82F6",
  "mode": "subagent",
  "prompt": "{file:./.claude/agents/agent-name.md}"
}
```

**Mode options**: `primary` (orchestrators), `subagent` (specialists)
