# DevCache — Project Brief

## What

**DevCache.dev** is a platform that helps developers store, organize, and reuse code solutions. It acts as a "second brain" for development: instead of saving entire projects, developers save *reusable solutions* — structured blocks of knowledge with context, decisions, and implementation details.

The platform is evolving into an **Agentic AI Marketplace** where developers can create, share, and orchestrate specialized AI agents (`.agent.md` files) that encapsulate domain expertise and reusable workflows.

## Why

Developers repeatedly solve the same problems because they lack **structured memory**. Tools like notes, docs, and repos fail because:
- Information isn't structured for reuse
- Context (decisions, edge cases) is lost
- Solutions are tied to projects, not reusable units
- Search is inefficient

DevCache fixes this by capturing knowledge at the right level — not projects, but **meaningful reusable pieces**.

## Who

- **Primary users**: Individual developers and teams using AI coding assistants
- **Secondary users**: Developers building and sharing specialized agents on the marketplace

## Tech Stack

- **Framework**: Next.js 16.2 (App Router, TypeScript strict mode)
- **Backend**: Supabase (PostgreSQL, Auth, Storage, Edge Functions, RLS)
- **UI**: Tailwind CSS, Shadcn UI, HeroUI, React Bits, React Hot Toast
- **AI**: OpenRouter API (multi-model), Anthropic Claude (primary)
- **Embeddings**: Supabase pgvector (RAG search)
- **Deploy**: Vercel

## Current Phase

Transitioning from **Phase 4 (completed)** — core template storage platform — to the **Agentic Platform** phase: agent marketplace, multi-agent orchestration, and community-driven agent pool.

## Agent Hierarchy

```
@orchestrator (root — opus)
  |-- @frontend-agent (Next.js/UI — sonnet)
  |-- @backend-agent (Supabase/API — sonnet)
  +-- @cost-tracker (utility — gpt-4.1, free)
```

## Key Links

- App: https://devcache.dev
- Supabase: See `.env.local` for project credentials
- Docs: `./docs/project/` for planning documents
