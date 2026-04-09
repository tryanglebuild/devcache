# Story: Agentic Marketplace

**Status**: Backlog
**Complexity**: XL (4+ weeks)
**Kanban**: `.project/kanban/todo.md`

## Description

As a developer, I want to browse, download, and publish specialized AI agent templates on the DevCache marketplace, so that I can leverage community expertise and share my own domain knowledge as reusable agents.

## Acceptance Criteria

- [ ] Developers can create agent templates via the UI (markdown editor with frontmatter)
- [ ] Agents can be published as public or kept private
- [ ] Public agents appear in the marketplace with search, filter by category/stack/rating
- [ ] Users can download (fork) a public agent to their account
- [ ] Users can rate agents (1-5 stars)
- [ ] Agent templates are validated for correct `.agent.md` frontmatter format
- [ ] Download count is tracked and displayed

## Subproject Routing

- **@backend-agent**: Database schema (`agent_templates` table, RLS, indexes), API routes (`/api/agents/`)
- **@frontend-agent**: Marketplace UI, agent editor, rating component
- **@orchestrator**: Coordinate backend-first, then frontend

## Technical Notes

- See `docs/project/agentic-platform/implementation-plan.md` for full DB schema
- Extend existing marketplace infrastructure in `components/marketplace/`
- API routes at `app/api/agents/`
- RLS: users see own agents + all public agents
