# ADR-003: Next.js App Router (Server Components by Default)

**Status**: Accepted
**Date**: 2025-Q4

## Context

After initial Pages Router implementation, the project migrated to Next.js App Router to align with the current Next.js standard and unlock server-side rendering improvements.

## Decision

Use **Next.js App Router** exclusively. Server Components are the default; Client Components (`'use client'`) only when needed for interactivity, hooks, or browser APIs.

## Consequences

**Positive:**
- Reduced client bundle size — most components render on the server
- Simpler data fetching — async components without useEffect
- Layouts and nested routing are cleaner
- Better performance for SEO pages

**Negative:**
- Migration cost from Pages Router (completed)
- Some libraries (HeroUI, React Bits) require `'use client'` wrappers
- Learning curve for distinguishing Server vs Client components

## Rules

- Component libraries (HeroUI, React Bits) always need `'use client'`
- Forms, event handlers, useState/useEffect → Client Components
- Data fetching, static pages, SEO pages → Server Components
