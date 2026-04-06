# Scripts Directory

This directory contains utility scripts for managing embeddings, marketplace data, and development tasks.

## Active Scripts

### 🔄 `generate-embeddings.ts`

**Purpose**: Batch generate embeddings for all items missing embeddings or with outdated embeddings.

**When to use**:
- After importing large amounts of data
- When migrating from old system
- To reprocess all embeddings after algorithm changes
- When the weekly cron job isn't enough (processes unlimited items)

**Usage**:
```bash
npm run generate-embeddings
# or
tsx scripts/generate-embeddings.ts
```

**Features**:
- Processes items in batches of 20
- Supports both agents and project items
- Uses OpenRouter or OpenAI API
- Automatic retry logic
- Progress tracking

**Requirements**:
- `OPENROUTER_API_KEY` or `OPENAI_API_KEY` in `.env.local`
- `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`

---

### 📦 `populate-marketplace.ts`

**Purpose**: Populate the marketplace with sample agent templates.

**When to use**:
- Initial setup of development environment
- After database reset
- Adding new example agents
- Testing marketplace features

**Usage**:
```bash
tsx scripts/populate-marketplace.ts
```

**What it does**:
- Creates 35+ diverse agent templates
- Categories: orchestrator, frontend, backend, cloud, testing, documentation, security, data
- Assigns to first user in database
- Sets visibility to public

**Note**: Run this only once or after database reset to avoid duplicates.

---

### 🧪 `test-openrouter.ts`

**Purpose**: Test OpenRouter API connection and configuration.

**When to use**:
- Verifying API key is valid
- Debugging embedding generation issues
- Testing API connectivity
- Checking rate limits

**Usage**:
```bash
tsx scripts/test-openrouter.ts
```

**What it tests**:
- API key validity
- Embedding generation
- Response format
- Token usage
- Error handling

---

## Archived Scripts

Scripts in `archive/` are kept for reference but not actively used:

- `populate-advanced-agents.ts` - Old agent population script
- `populate-expert-agents.ts` - Alternative agent templates
- `verify-marketplace.ts` - Marketplace data verification
- `README-populate-marketplace.md` - Old documentation

## Comparison: Scripts vs Cron Job

| Feature | Scripts (Manual) | Cron Job (Automatic) |
|---------|------------------|----------------------|
| **Execution** | On-demand | Weekly (Sundays 2 AM UTC) |
| **Batch Size** | Unlimited | 100 items max |
| **Use Case** | Bulk operations, migrations | Maintenance, catch missed items |
| **Speed** | Fast (parallel processing) | Slower (rate limited) |
| **Monitoring** | Console output | Database logs |
| **Best For** | Development, one-time tasks | Production, ongoing maintenance |

## Common Workflows

### Initial Setup
```bash
# 1. Populate marketplace with sample agents
tsx scripts/populate-marketplace.ts

# 2. Generate embeddings for all agents
npm run generate-embeddings
```

### After Data Import
```bash
# Generate embeddings for newly imported items
npm run generate-embeddings
```

### Debugging Embeddings
```bash
# 1. Test API connection
tsx scripts/test-openrouter.ts

# 2. Try generating embeddings
npm run generate-embeddings
```

### Production Maintenance
- Let the weekly cron job handle it automatically
- Check logs: `SELECT * FROM embedding_cron_logs ORDER BY run_at DESC LIMIT 5;`
- Manual trigger if needed: `POST /api/embeddings/cron-trigger`

## Environment Variables

All scripts require these environment variables in `.env.local`:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# OpenRouter (preferred) or OpenAI
OPENROUTER_API_KEY=sk-or-v1-your-key
# OR
OPENAI_API_KEY=sk-your-key

# Application URL (optional)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Troubleshooting

### "Missing API key" error
- Ensure `OPENROUTER_API_KEY` or `OPENAI_API_KEY` is set in `.env.local`
- Check the key is valid and has credits

### "Failed to get items" error
- Verify Supabase credentials are correct
- Check database has the required functions (`get_items_needing_embeddings`)
- Ensure tables exist (`agent_templates`, `project_items`)

### "Rate limit exceeded" error
- Wait a few minutes and try again
- Reduce batch size in the script
- Use OpenRouter instead of OpenAI (higher limits)

### No items processed
- Check if items actually need embeddings: `SELECT * FROM get_pending_embeddings(10);`
- Verify items exist in database
- Check `deleted_at` is NULL

## Adding New Scripts

When adding new scripts:

1. Create the script in `scripts/` directory
2. Add TypeScript types and error handling
3. Document usage in this README
4. Add npm script in `package.json` if frequently used
5. Test locally before committing

## Related Documentation

- [Automatic Embeddings System](../docs/features/automatic-embeddings.md)
- [Embedding Cron Setup Guide](../docs/setup/embedding-cron-setup.md)
- [Supabase Edge Functions](../supabase/functions/)
