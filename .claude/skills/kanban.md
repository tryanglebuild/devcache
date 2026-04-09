---
description: Kanban board management — moving tasks through todo → in-progress → on-review → done.
---

# Kanban Skill

## Board Location

`.project/kanban/` — four lane files:

```
todo.md → in-progress.md → on-review.md → done.md
```

## Item Format

```markdown
- [ ] Feature Name — brief description
- [x] Completed Feature — what was done (done.md only)
```

## Rules

- One item per line, checkbox format
- Move items by **cutting** from source file and **appending** to destination
- Change `- [ ]` to `- [x]` only when moving to `done.md`
- Empty lane files keep only their `# Header` line
- **Never delete items** — move them forward or to done

## Workflow

### Starting work on a task

1. Find item in `todo.md`
2. Cut it from `todo.md`
3. Append to `in-progress.md`

### Submitting for review

1. Find item in `in-progress.md`
2. Cut it from `in-progress.md`
3. Append to `on-review.md`

### Completing a task

1. Find item in `on-review.md`
2. Cut it from `on-review.md`
3. Change `- [ ]` to `- [x]`
4. Append to `done.md`

### Adding a new task

Append to `todo.md`:
```markdown
- [ ] Task Name — brief description
```

## When to update the board

- **Starting any significant task**: Move from todo → in-progress
- **After implementation**: Move from in-progress → on-review
- **After verification/testing**: Move from on-review → done
- **When discovering new work**: Add to todo.md
