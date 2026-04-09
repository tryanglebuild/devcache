# ADR-001: Supabase as the Backend Platform

**Status**: Accepted
**Date**: 2025-Q4

## Context

DevCache needs a backend with: user authentication, relational database, file storage, real-time capabilities, full-text + vector search, and serverless functions. Building this from scratch would take significant time.

## Decision

Use **Supabase** as the primary backend platform, providing PostgreSQL (with pgvector), Auth, Storage, Edge Functions, and RLS out of the box.

## Consequences

**Positive:**
- Rapid development — auth, DB, storage without custom servers
- Row Level Security built into PostgreSQL — secure by default
- pgvector extension enables semantic search (RAG) without a separate vector DB
- Edge functions (Deno) for embedding generation and background jobs
- Generated TypeScript types keep frontend type-safe

**Negative:**
- Vendor lock-in to Supabase ecosystem
- Edge functions are Deno, not Node.js — different ecosystem
- Free tier limits require monitoring
