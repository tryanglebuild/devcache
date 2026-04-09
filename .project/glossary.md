# DevCache — Domain Glossary

AI agents must always use these terms consistently when discussing the project.

---

## Core Concepts

**Cache** / **DevCache**
The act of saving a reusable solution to the platform. "Caching a solution" = storing it for later reuse. The platform itself is called "DevCache."

**Template**
A reusable solution stored in DevCache. Contains: title, description, code/content, tags, category, and context. NOT a full project — a meaningful unit of knowledge.

**Agent Template** / **Agent** (`.agent.md`)
A markdown file defining a specialized AI agent with domain expertise, behavioral rules, tool access, and decision logic. The core artifact of the Agentic Platform phase. Stored with extension `.agent.md`.

**Agent Marketplace** / **Community Pool**
The public section of DevCache where developers publish and download agent templates. Agents can be rated, forked, and customized.

**Collection**
A curated group of templates organized around a theme, stack, or project type. Users can organize their cache into collections.

**Skill** (in context of Claude/OpenCode)
A `.md` file in `.claude/skills/` defining a specialized workflow or capability for AI coding agents. Different from "Agent Template" — skills are for the AI tools themselves, not the DevCache product.

**RAG Search** / **Semantic Search**
The AI-powered search system using vector embeddings (pgvector) to find semantically similar templates, not just keyword matches.

**Embedding**
A vector representation of template content used for semantic similarity search. Generated via OpenRouter/Supabase edge functions.

**Orchestrator**
An agent (in the Agentic Platform) that coordinates multiple specialized agents to solve complex problems. Routes tasks to the right specialists.

**Stack**
A technology combination (e.g., "Next.js + Supabase"). Used to tag templates and filter the marketplace.

---

## Platform Sections

**Dashboard**
The main authenticated user interface. Shows recent templates, collections, and stats.

**Marketplace**
Public gallery of published templates and agents. Browseable, searchable, rateable.

**Chat**
AI-powered assistant interface. Users can ask questions and get recommendations from their cached templates.

**Support**
Help center and feedback system.

---

## Technical Terms

**RLS** (Row Level Security)
Supabase/PostgreSQL security model. Always enabled on all tables.

**Edge Function**
Supabase serverless function (Deno runtime). Used for embeddings, webhooks, background jobs.

**Server Component**
Next.js default — renders on server, no client-side JS. Used for data fetching and static content.

**Client Component**
Next.js component with `'use client'` directive. Used for interactive UI, hooks, browser APIs.

**App Router**
Next.js 13+ routing system using the `app/` directory. Always used in this project.
