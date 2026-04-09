# Agent Instructions

<!-- This file is read by all AI coding tools (OpenCode, Claude Code, GitHub Copilot, Cursor). -->
<!-- It provides universal instructions that apply regardless of which tool is active. -->

## Project Context

- Read `.project/brief.md` for the project overview.
- Read `.project/glossary.md` for domain terminology — always use these terms consistently.
- Check `.project/kanban/in-progress.md` to see what's currently being worked on.
- Check `.project/costs/current.md` before starting large operations to verify budget.

## Agents & Orchestration

### Agent Hierarchy

```
@orchestrator (root — opus)
  |-- @frontend-agent    -> Next.js, React, Tailwind — implementation
  |     |-- @design-agent      -> Page architecture, layout, component hierarchy
  |     |-- @icons-agent       -> Icon selection, consistency, non-AI iconography
  |     |-- @copywriter-agent  -> All text — UI microcopy, marketing, error messages
  |     +-- @colors-agent      -> Color palette, contrast, emotional alignment
  |-- @backend-agent     -> Supabase, PostgreSQL, API routes, Edge Functions
  +-- @cost-tracker      (utility — gpt-4.1, free)
```

### Agent Table

| Agent | Location | Role | Model | Color |
|---|---|---|---|---|
| `@orchestrator` | `.claude/agents/` | **Orchestrator** — classifies, plans, delegates, reviews | opus | purple |
| `@frontend-agent` | `.claude/agents/` | **Frontend lead** — Next.js App Router, React, Tailwind, implementation | sonnet | blue |
| `@design-agent` | `.claude/agents/` | UI/UX — page blueprints, layout decisions, component hierarchy | sonnet | orange |
| `@icons-agent` | `.claude/agents/` | Icons — contextual icon selection, consistency, non-AI iconography | sonnet | yellow |
| `@copywriter-agent` | `.claude/agents/` | Copy — UI microcopy, landing page, marketing, error messages | sonnet | pink |
| `@colors-agent` | `.claude/agents/` | Colors — palette management, WCAG contrast, emotional alignment | sonnet | cyan |
| `@backend-agent` | `.claude/agents/` | **Backend lead** — Supabase, PostgreSQL, RLS, API routes, Edge Functions | sonnet | green |
| `@cost-tracker` | `.claude/agents/` | Utility — AI usage cost analysis, budget reports | gpt-4.1 | red |

### Skills Table

| Skill | Location | Description |
|---|---|---|
| `orchestration` | `.claude/skills/` | Multi-agent orchestration workflow (classify, discover, plan, delegate, review) |
| `kanban` | `.claude/skills/` | Kanban board management (todo → in-progress → on-review → done) |
| `cost-tracking` | `.claude/skills/` | AI cost tracking workflow and model multiplier reference |

### Delegation Model

`@orchestrator` is the **entry point** for all workspace-level tasks. It follows the orchestration skill workflow:

1. **Classify** — determine which areas are involved (frontend, backend, or both)
2. **Discover** — gather context from `.project/brief.md`, `.project/kanban/in-progress.md`, relevant docs
3. **Plan** — define execution order and cross-cutting contracts (API shapes, DB types)
4. **Delegate** — route to agents (**backend first**, then frontend)
5. **Review** — verify cross-area consistency and update kanban board

For tasks scoped to a single area, delegate directly to that agent without the full orchestration flow.

#### Frontend Sub-Delegation

When `@orchestrator` delegates a frontend task, `@frontend-agent` is responsible for coordinating the frontend sub-agents **before writing any code**:

1. **New page or major component** → consult `@design-agent` for a page blueprint first
2. **Any icons needed** → consult `@icons-agent` for icon specifications (describe the *function*, not the icon name)
3. **Any text content** → consult `@copywriter-agent` for copy specifications (headings, CTAs, empty states, errors)
4. **Any new color context** → consult `@colors-agent` for palette decisions and contrast verification
5. **Only then** → implement with the full specification in hand

The four frontend sub-agents (`@design-agent`, `@icons-agent`, `@copywriter-agent`, `@colors-agent`) **do not write code** — they produce specifications. `@frontend-agent` is the sole implementer.

#### When `@orchestrator` invokes sub-agents directly

`@orchestrator` may invoke frontend sub-agents directly (bypassing `@frontend-agent`) when:
- The task is purely a design, icon, copy, or color audit — no implementation needed
- A cross-cutting visual consistency issue is identified
- A new feature requires design and copy decisions before implementation planning

## Workspace Structure

| Area | Path | Stack | Description |
|---|---|---|---|
| Pages & API | `app/` | Next.js 16.2 App Router | Server-rendered pages, route groups, API routes |
| Components | `components/` | React, Tailwind, Shadcn UI, HeroUI | UI components organized by feature area |
| Business Logic | `lib/` | TypeScript | Supabase clients, AI integration, utilities, hooks |
| Database | `supabase/` | PostgreSQL (Supabase) | Migrations, Edge Functions (Deno) |
| Types | `types/` | TypeScript | Database-generated types + custom types |
| Project Docs | `.project/` | Markdown + YAML | Product intelligence layer (kanban, stories, decisions) |
| Agent Configs | `.claude/` | Markdown | Agent definitions and skill files |
| Kiro Steering | `.kiro/steering/` | Markdown | Kiro-specific rules (English learning, code standards) |

## Task Tracking

Manage tasks via `.project/kanban/` following the kanban skill:
- `todo.md` → `in-progress.md` → `on-review.md` → `done.md`
- Format: `- [ ] Task` (incomplete) / `- [x] Task` (done.md only)

## Cost Awareness

This project tracks AI usage costs via `.project/costs/budget.yaml`.
- Before expensive multi-step operations, check `.project/costs/current.md`.
- Prefer cost-effective models for simple tasks (see budget.yaml for multipliers).
- Delegate to `@cost-tracker` to regenerate the cost report.
- GPT-4.1 is free (0x) — use for utility tasks and cost tracking itself.

## Stories & Decisions

- User stories live in `.project/stories/` (backlog, active, done).
- Architecture decisions live in `.project/decisions/` as numbered ADRs.
- Use templates from `.project/templates/` when creating new items.

## Cross-Project Rules

1. **All database/schema changes** happen via Supabase migrations in `supabase/migrations/` — never in frontend code.
2. **RLS is always enabled** on every table — no exceptions.
3. **Types are generated** from the Supabase schema: `npx supabase gen types typescript --project-id <id> > types/database.types.ts`
4. **Environment secrets** (`.env.local`, service role keys, API keys) must **never** be committed.
5. **Backend-first**: API contract must be defined before frontend implementation begins.

## Code Standards

- **TypeScript**: strict mode, no `any` types, define interfaces for all data structures
- **Components**: PascalCase (`UserProfile.tsx`), functions: camelCase, constants: UPPER_SNAKE_CASE
- **Routing**: Always App Router — never Pages Router
- **Components first**: Check Shadcn UI → HeroUI → React Bits before building from scratch
- **Notifications**: Always use `react-hot-toast` — never native alerts or custom toast
- **Auth**: Always verify with `supabase.auth.getUser()` in API routes
- **Images**: Always use `next/image`
- **No `NEXT_PUBLIC_` prefix** for server-side secrets
