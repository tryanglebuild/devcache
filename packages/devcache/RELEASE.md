# DevCache Release Process

## 🔄 Automated CI/CD Workflow

### What Happens Automatically

When you push a new version tag (e.g., `v1.0.0`), the following happens automatically:

1. **Test Job** (runs first)
   - ✓ Checkout code
   - ✓ Install dependencies
   - ✓ Run linting (if configured)
   - ✓ Run tests (if configured)
   - ✓ Build TypeScript to JavaScript
   - ✓ Validate build output

2. **Publish Job** (only if tests pass)
   - ✓ Rebuild the package
   - ✓ Update version in package.json
   - ✓ Publish to NPM registry
   - ✓ Create GitHub Release with notes

### Continuous Testing

Every push to `main` or `develop` branches:
- ✓ Runs tests on Node.js 18 and 20
- ✓ Validates build
- ✓ Ensures code quality

Every Pull Request:
- ✓ Must pass all tests before merge
- ✓ Validates on multiple Node versions

## 📦 Release Workflow

### Step 1: Prepare Release

```bash
# Make sure you're on main branch
git checkout main
git pull origin main

# Update version in package.json (choose one)
cd packages/devcache
npm version patch  # 0.1.0 -> 0.1.1
npm version minor  # 0.1.0 -> 0.2.0
npm version major  # 0.1.0 -> 1.0.0
```

### Step 2: Update Changelog (Optional but Recommended)

Create/update `CHANGELOG.md`:

```markdown
## [0.2.0] - 2026-04-06

### Added
- New feature X
- New analyzer Y

### Fixed
- Bug in Z

### Changed
- Improved performance of W
```

### Step 3: Commit Changes

```bash
git add .
git commit -m "chore: bump version to 0.2.0"
git push origin main
```

### Step 4: Create and Push Tag

```bash
# Create tag (must match version in package.json)
git tag v0.2.0

# Push tag to trigger CI/CD
git push origin v0.2.0
```

### Step 5: Monitor Deployment

1. Go to: https://github.com/tryanglebuild/devcache/actions
2. Watch the "Publish DevCache to NPM" workflow
3. Wait for green checkmark ✅

### Step 6: Verify Publication

```bash
# Check NPM
npm view devcache

# Test installation
npm install -g devcache@0.2.0
devcache --version
```

## 🚨 Troubleshooting

### Build Fails

If the build fails in CI/CD:

```bash
# Test locally first
cd packages/devcache
npm install
npm run build

# Check for errors
npm run lint
npm test
```

### Publish Fails

Common issues:

1. **NPM Token Invalid**
   - Regenerate token on npmjs.com
   - Update GitHub secret `NPM_TOKEN`

2. **Version Already Published**
   - You can't republish the same version
   - Bump version and create new tag

3. **Permission Denied**
   - Ensure you're a maintainer of the package
   - Check NPM token has publish permissions

### Tag Already Exists

If you need to recreate a tag:

```bash
# Delete local tag
git tag -d v0.2.0

# Delete remote tag
git push origin :refs/tags/v0.2.0

# Create new tag
git tag v0.2.0
git push origin v0.2.0
```

## 📋 Pre-Release Checklist

Before creating a release tag:

- [ ] All tests pass locally
- [ ] Build succeeds locally
- [ ] Version bumped in package.json
- [ ] CHANGELOG.md updated
- [ ] README.md updated (if needed)
- [ ] Breaking changes documented
- [ ] All PRs merged to main

## 🔐 Required Secrets

Ensure these are set in GitHub repository settings:

1. **NPM_TOKEN**
   - Location: Settings → Secrets → Actions
   - Value: Your NPM access token
   - Permissions: Read and Publish

2. **GITHUB_TOKEN**
   - Automatically provided by GitHub
   - Used for creating releases

## 📊 Version Strategy

Follow Semantic Versioning (SemVer):

- **MAJOR** (1.0.0): Breaking changes
- **MINOR** (0.1.0): New features, backward compatible
- **PATCH** (0.0.1): Bug fixes, backward compatible

Examples:
- `v0.1.0` → `v0.1.1`: Bug fix
- `v0.1.0` → `v0.2.0`: New feature
- `v0.1.0` → `v1.0.0`: Breaking change

## 🎯 Quick Release Commands

```bash
# Patch release (bug fix)
npm version patch && git push && git push --tags

# Minor release (new feature)
npm version minor && git push && git push --tags

# Major release (breaking change)
npm version major && git push && git push --tags
```

## 📝 Post-Release

After successful release:

1. ✓ Verify on NPM: https://www.npmjs.com/package/devcache
2. ✓ Check GitHub Release: https://github.com/tryanglebuild/devcache/releases
3. ✓ Test installation: `npm install -g devcache@latest`
4. ✓ Announce on social media/Discord/Slack (if applicable)
5. ✓ Update documentation site (if applicable)

## 🔄 Rollback

If you need to rollback a release:

```bash
# Deprecate the bad version on NPM
npm deprecate devcache@0.2.0 "This version has critical bugs, use 0.1.9 instead"

# Or unpublish within 72 hours
npm unpublish devcache@0.2.0
```

**Note**: Unpublishing is discouraged and only works within 72 hours of publication.

## 📚 Resources

- [NPM Publishing Guide](https://docs.npmjs.com/cli/v9/commands/npm-publish)
- [GitHub Actions](https://docs.github.com/en/actions)
- [Semantic Versioning](https://semver.org/)
