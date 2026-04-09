# ADR-002: OpenRouter as AI Provider Gateway

**Status**: Accepted
**Date**: 2025-Q4

## Context

DevCache's AI chat and embedding features need access to LLMs. Using a single provider (Anthropic, OpenAI) creates lock-in and limits model selection for users.

## Decision

Use **OpenRouter** as an API gateway that provides access to 75+ models under a single API key, with a unified OpenAI-compatible interface.

## Consequences

**Positive:**
- Access to Claude, GPT, Gemini, and open-source models via one API
- Users can choose their preferred model
- Fallback models if one provider is down
- Cost flexibility — cheaper models for simple tasks

**Negative:**
- Additional latency vs. direct provider API
- OpenRouter is a third-party dependency (potential downtime)
- Pricing markup compared to direct API access

## Notes

- Primary model for AI chat: Claude Sonnet (via OpenRouter)
- Embedding generation uses a dedicated embedding model
- See `scripts/test-openrouter.ts` for integration tests
