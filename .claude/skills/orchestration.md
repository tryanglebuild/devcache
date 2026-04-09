---
description: Multi-agent orchestration workflow for DevCache — classify, discover, plan, delegate, review.
---

# Orchestration Skill

## When to use

Use this skill when a task involves **multiple areas** of the codebase (both frontend and backend), or when the scope is unclear and requires classification first.

For single-area tasks (only UI, or only DB), delegate directly without the full workflow.

## Workflow

### Step 1 — Classify

Determine which areas are involved:
- **Backend only**: DB schema, API routes, RLS, Edge Functions, embeddings
- **Frontend only**: UI components, pages, client-side logic
- **Full-stack**: Changes that span both areas

### Step 2 — Discover

Gather context before planning:
- Read `.project/brief.md` for product context
- Read `.project/kanban/in-progress.md` for current work
- Read relevant story in `.project/stories/` if one exists
- Read relevant source files in `app/`, `components/`, `lib/`, `supabase/`

### Step 3 — Plan

Define the execution plan:
- List specific files to create or modify
- Define API contract (request/response shape) if backend+frontend are involved
- Define DB schema changes with migration SQL if needed
- State cross-cutting constraints (types that must match, etc.)
- Estimate model usage (prefer sonnet for implementation steps)

### Step 4 — Delegate

Execute in this order:
1. **Backend first**: Delegate schema/API changes to `@backend-agent`
2. **Frontend second**: Delegate UI changes to `@frontend-agent` (only after backend types/API are defined)
3. For cost tracking: Delegate to `@cost-tracker` at any point

### Step 5 — Review

After implementation:
- Verify API contract matches between frontend calls and backend routes
- Verify TypeScript types are consistent
- Check that RLS policies cover the new feature
- Update `.project/kanban/` — move completed items

## Rules

- Never start frontend implementation before the API contract is defined
- Never commit DB schema changes without RLS policies
- Always update `.project/kanban/in-progress.md` when starting a task
- Always move items to `on-review.md` → `done.md` when complete
