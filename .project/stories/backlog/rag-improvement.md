# Story: RAG Search Improvement

**Status**: Backlog
**Complexity**: M (1 week)
**Kanban**: `.project/kanban/todo.md`

## Description

As a developer, I want the AI chat to find more relevant templates when I ask questions, so that recommendations feel accurate and context-aware.

## Acceptance Criteria

- [ ] Search results can be filtered by stack (e.g., "only Next.js templates")
- [ ] Search results can be filtered by category
- [ ] Relevance threshold is configurable (currently using default)
- [ ] Chat explains WHY a template is relevant
- [ ] Migration to `generate-embeddings-v2` is deployed to production

## Subproject Routing

- **@backend-agent**: Update embedding search query, add filter params to search endpoint
- **@frontend-agent**: Add filter UI to chat sidebar
- **@orchestrator**: Coordinate and review cross-cutting changes

## Technical Notes

- See `docs/RAG_RELEVANCE_ANALYSIS.md` for current analysis
- See `scripts/generate-embeddings-v2.ts` for the new embedding generator
- Edge function: `supabase/functions/`
