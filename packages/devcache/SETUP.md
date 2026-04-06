# DevCache Setup Guide

## ✅ Completed Steps

1. ✓ NPM token generated: `npm_AgP7qZLdH6y14cbwDE8qEbQ5ezdAXd3CDm4ZQualis`
2. ✓ GitHub Actions workflow created
3. ✓ Package structure created
4. ✓ Basic CLI commands implemented

## 🚀 Next Steps

### 1. Store NPM Token in GitHub

1. Go to your GitHub repository
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Name: `NPM_TOKEN`
5. Value: `npm_AgP7qZLdH6y14cbwDE8qEbQ5ezdAXd3CDm4ZQualis`
6. Click **Add secret**

### 2. Update package.json

Edit `packages/devcache/package.json` and update:

```json
{
  "author": "Your Name <your.email@example.com>",
  "repository": {
    "type": "git",
    "url": "https://github.com/YOUR_USERNAME/YOUR_REPO.git",
    "directory": "packages/devcache"
  },
  "bugs": {
    "url": "https://github.com/YOUR_USERNAME/YOUR_REPO/issues"
  },
  "homepage": "https://github.com/YOUR_USERNAME/YOUR_REPO#readme"
}
```

### 3. Install Dependencies

```bash
cd packages/devcache
npm install
```

### 4. Build the Package

```bash
npm run build
```

### 5. Test Locally

```bash
# Link package locally
npm link

# Test commands
devcache --version
devcache init
```

### 6. Commit and Push

```bash
git add .
git commit -m "feat: initial DevCache package setup"
git push origin main
```

### 7. Create Version Tag

```bash
# Create and push a version tag to trigger CI/CD
git tag v0.1.0
git push origin v0.1.0
```

This will automatically trigger the GitHub Actions workflow to publish to NPM!

### 8. Manual Publish (Alternative)

If you prefer to publish manually:

```bash
cd packages/devcache
npm login
npm publish --access public
```

## 📋 Verification

After publishing, verify:

1. Check NPM: https://www.npmjs.com/package/devcache
2. Test installation: `npm install -g devcache`
3. Run: `devcache --version`

## 🔧 Troubleshooting

### Build Errors

If you get TypeScript errors:
```bash
npm install
npm run build
```

### Permission Errors

If npm publish fails:
```bash
npm login
# Enter your NPM credentials
npm publish --access public
```

### GitHub Actions Fails

Check:
1. NPM_TOKEN secret is set correctly
2. package.json has correct repository URL
3. Build succeeds locally

## 📝 Next Development Steps

After successful publish:

1. Implement Orchestrator (Week 2)
2. Create Analyzers (Week 3)
3. Add Supabase integration (Week 4)
4. Build web dashboard (Week 5)

See `docs/project/devcache/implementation-plan.md` for full roadmap.
