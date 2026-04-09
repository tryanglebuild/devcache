# Skill Template Guide

Use this template to create a new skill in `.claude/skills/skill-name.md`.

## Steps

1. Create `.claude/skills/skill-name.md` with the frontmatter below
2. Skills are automatically available to all agents at the same directory level

---

## Skill Frontmatter (required)

```yaml
---
description: One-line description of what this skill covers
---
```

---

## Skill Body Structure

```markdown
---
description: What this skill does in one line
---

# Skill Name

## When to use this skill
[Trigger conditions]

## Workflow

1. [Step 1]
2. [Step 2]
3. [Step 3]

## Rules
- [Constraint or rule 1]
- [Constraint or rule 2]
```
