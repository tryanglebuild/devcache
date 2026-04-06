# Archived Scripts

This directory contains scripts that are no longer actively used but kept for reference.

## Why These Scripts Are Archived

These scripts were used during development but have been superseded by:
- The main `populate-marketplace.ts` script (consolidated approach)
- Automated cron job for embeddings
- Better database functions

## Archived Files

### `populate-advanced-agents.ts`
- **Original Purpose**: Populate marketplace with advanced agent templates
- **Why Archived**: Consolidated into main `populate-marketplace.ts`
- **Can Be Deleted**: Yes, after verifying main script works

### `populate-expert-agents.ts`
- **Original Purpose**: Populate marketplace with expert-level agents
- **Why Archived**: Consolidated into main `populate-marketplace.ts`
- **Can Be Deleted**: Yes, after verifying main script works

### `verify-marketplace.ts`
- **Original Purpose**: Verify marketplace data integrity
- **Why Archived**: Database functions now handle validation
- **Can Be Deleted**: Maybe useful for debugging, keep for now

### `README-populate-marketplace.md`
- **Original Purpose**: Documentation for old populate scripts
- **Why Archived**: New README.md in parent directory
- **Can Be Deleted**: Yes, outdated documentation

## Should You Delete This Folder?

**Not yet!** Keep it for:
- Reference during development
- Rollback if new scripts have issues
- Historical context

**Delete after**:
- 1-2 months of stable operation
- Confirming new scripts work perfectly
- No need to reference old implementations

## Restoring Archived Scripts

If you need to restore a script:

```bash
# Move back to active scripts
mv scripts/archive/script-name.ts scripts/

# Update documentation
# Add to scripts/README.md
```

## Cleanup Checklist

Before deleting this archive folder, verify:

- [ ] Main `populate-marketplace.ts` works correctly
- [ ] All marketplace agents are properly created
- [ ] Embeddings are generated successfully
- [ ] No references to archived scripts in codebase
- [ ] At least 1 month has passed since archiving
- [ ] Team agrees archive is no longer needed

---

**Last Updated**: April 6, 2026
**Archived By**: Automated cleanup process
