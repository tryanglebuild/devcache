# DevCache CI/CD Flow

## 🔄 Complete Automation Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    Developer Workflow                        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │  Code Changes    │
                    │  + Commit        │
                    └──────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │  Push to GitHub  │
                    │  (main/develop)  │
                    └──────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│              GitHub Actions: Test Workflow                   │
│  ✓ Install dependencies                                      │
│  ✓ Lint code                                                 │
│  ✓ Run tests (Node 18 & 20)                                 │
│  ✓ Build TypeScript                                          │
│  ✓ Validate output                                           │
└─────────────────────────────────────────────────────────────┘
                              │
                    ┌─────────┴─────────┐
                    │                   │
                    ▼                   ▼
              ✅ Pass              ❌ Fail
                    │                   │
                    │                   └──> Fix & Retry
                    │
                    ▼
          ┌──────────────────┐
          │  Ready to Release │
          └──────────────────┘
                    │
                    ▼
          ┌──────────────────┐
          │  npm version     │
          │  patch/minor/    │
          │  major           │
          └──────────────────┘
                    │
                    ▼
          ┌──────────────────┐
          │  git tag vX.Y.Z  │
          │  git push --tags │
          └──────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────────┐
│           GitHub Actions: Publish Workflow                   │
│                                                               │
│  Job 1: Test & Validate                                      │
│  ✓ Checkout code                                             │
│  ✓ Install dependencies                                      │
│  ✓ Lint code                                                 │
│  ✓ Run tests                                                 │
│  ✓ Build package                                             │
│  ✓ Validate build output                                     │
│                                                               │
│  Job 2: Publish (only if Job 1 passes)                      │
│  ✓ Rebuild package                                           │
│  ✓ Update version from tag                                   │
│  ✓ Publish to NPM                                            │
│  ✓ Create GitHub Release                                     │
└─────────────────────────────────────────────────────────────┘
                    │
          ┌─────────┴─────────┐
          │                   │
          ▼                   ▼
    ✅ Published        ❌ Failed
          │                   │
          │                   └──> Check logs & fix
          │
          ▼
┌─────────────────────────────────────────────────────────────┐
│                    NPM Registry                              │
│  📦 devcache@X.Y.Z published                                │
│  🌐 Available globally                                       │
└─────────────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────┐
│                  GitHub Release Created                      │
│  📝 Release notes                                            │
│  🔗 NPM package link                                         │
│  📥 Installation instructions                                │
└─────────────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────┐
│                   Users Can Install                          │
│  $ npm install -g devcache@X.Y.Z                            │
│  $ devcache --version                                        │
└─────────────────────────────────────────────────────────────┘
```

## 🎯 Triggers

### Continuous Testing (test-devcache.yml)
**Triggers on:**
- Push to `main` or `develop` branches
- Pull requests to `main` or `develop`
- Only when files in `packages/devcache/` change

**Actions:**
- Runs tests on Node.js 18 and 20
- Validates build
- Blocks merge if tests fail

### Publish to NPM (publish-devcache.yml)
**Triggers on:**
- Push of version tags (e.g., `v1.0.0`, `v0.2.3`)
- Manual trigger via GitHub Actions UI

**Actions:**
- Runs full test suite
- Publishes to NPM (only if tests pass)
- Creates GitHub Release

## 📋 Quick Commands

### Development
```bash
# Regular development
git add .
git commit -m "feat: add new feature"
git push origin main
# → Triggers test workflow
```

### Release
```bash
# Using helper script (recommended)
./scripts/release.sh patch   # 0.1.0 → 0.1.1
./scripts/release.sh minor   # 0.1.0 → 0.2.0
./scripts/release.sh major   # 0.1.0 → 1.0.0
# → Triggers publish workflow

# Manual release
npm version patch
git push origin main
git push origin v0.1.1
# → Triggers publish workflow
```

## 🔐 Required Setup

### GitHub Secrets
1. Go to: https://github.com/tryanglebuild/devcache/settings/secrets/actions
2. Add secret: `NPM_TOKEN`
3. Value: Your NPM access token

### NPM Token Permissions
- ✓ Read and Publish packages
- ✓ Bypass 2FA (for automation)

## ✅ Benefits

1. **Automated Testing**
   - Every commit is tested
   - Multiple Node.js versions
   - Prevents broken code from being published

2. **Consistent Releases**
   - Same process every time
   - No manual steps to forget
   - Version automatically synced

3. **Quality Assurance**
   - Tests must pass before publish
   - Build validation
   - Automated checks

4. **Traceability**
   - GitHub Releases for each version
   - Clear changelog
   - Easy rollback if needed

5. **Time Saving**
   - No manual npm publish
   - No manual release notes
   - One command to release

## 🚨 Failure Handling

### If Tests Fail
```
Test Job Failed ❌
│
├─> Check GitHub Actions logs
├─> Fix the issue locally
├─> Push fix to main
└─> Tests run again automatically
```

### If Publish Fails
```
Publish Job Failed ❌
│
├─> Check if version already exists on NPM
├─> Verify NPM_TOKEN is valid
├─> Check GitHub Actions logs
└─> Re-run workflow or create new tag
```

## 📊 Monitoring

### Check Workflow Status
- https://github.com/tryanglebuild/devcache/actions

### Check NPM Package
- https://www.npmjs.com/package/devcache

### Check Releases
- https://github.com/tryanglebuild/devcache/releases

## 🎓 Best Practices

1. **Always test locally first**
   ```bash
   npm test
   npm run build
   ```

2. **Update CHANGELOG.md before release**
   - Document new features
   - List bug fixes
   - Note breaking changes

3. **Use semantic versioning**
   - PATCH: Bug fixes
   - MINOR: New features
   - MAJOR: Breaking changes

4. **Monitor the deployment**
   - Watch GitHub Actions
   - Verify on NPM
   - Test installation

5. **Keep main branch stable**
   - Use feature branches
   - Require PR reviews
   - Merge only after tests pass
