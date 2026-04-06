# Changelog

All notable changes to DevCache will be documented in this file.

## [0.9.0] - 2026-04-06

### 🎯 Major Configuration Fix

This release fixes a critical configuration issue where the `.devcache.json` file was not being created in the project root, causing documentation to be generated in the wrong location.

### 🐛 Critical Fixes

#### Configuration File Location
- **Fixed missing root config** - `.devcache.json` now correctly created in project root
  - Previously: Only created inside `devcache_docs/` folder ❌
  - Now: Created in both project root (primary) and `devcache_docs/` (reference) ✅
- **Fixed documentation path** - Documentation now consistently generated in correct location
  - Root config is read by all CLI commands
  - Reference config in docs folder for context
  - No more `.devcache/` folder created by mistake

#### Git Configuration
- **Updated .gitignore** - Better handling of DevCache files
  - `.devcache.json` is now tracked (should be committed)
  - `.devcache/` folder is ignored (if created by mistake)
  - `devcache_docs/` remains ignored (generated documentation)

### 📁 Correct File Structure

**After `devcache init`:**
```
Project Root
├── .devcache.json          ← Config file (tracked in git) ✅
├── devcache_docs/          ← Generated docs (ignored)
│   ├── .devcache.json      ← Reference copy
│   ├── templates/          ← Template files
│   ├── {projectName}/      ← Empty, ready for docs
│   └── index.md            ← Navigation guide
└── packages/               ← Your source code
```

**After `devcache generate`:**
```
Project Root
├── .devcache.json          ← Config (CLI reads this)
└── devcache_docs/
    └── {projectName}/      ← Documentation HERE! ✅
        ├── index.md
        ├── general/
        │   ├── project-overview.md
        │   └── project-impact.md
        └── tech/
            ├── architecture-project.md
            ├── stack-project.md
            └── features.md
```

### 🔧 Technical Changes

#### Init Command (`src/cli/commands/init.ts`)
- Config file now written to project root as primary location
- Reference copy still created in `devcache_docs/` for documentation context
- Both files have identical content
- CLI commands read from root, not from docs folder

#### Git Ignore Configuration
- Added `.devcache/` to ignore list (incorrect folder if created)
- Added `!.devcache.json` to ensure config file is tracked
- Organized DevCache section with clear comments

### 📝 Documentation

#### Updated Files
- **`.gitignore`** - Better DevCache file handling
- **`README.md`** - Clarified configuration file location
- **`CHANGELOG.md`** - This comprehensive changelog entry

### 🎯 Root Cause Analysis

**What was happening:**
1. `devcache init` created `.devcache.json` only inside `devcache_docs/`
2. `devcache generate` looked for config in project root
3. When not found, it used fallback behavior or failed silently
4. Documentation was created in wrong location (`.devcache/docs/`)

**What's fixed:**
1. `devcache init` now creates config in project root (primary)
2. Also creates reference copy in `devcache_docs/` (for context)
3. `devcache generate` finds config correctly
4. Documentation generated in correct location (`devcache_docs/{projectName}/`)

### ⚠️ Breaking Changes

**None!** This is a bug fix that makes the system work as originally intended.

### 🚀 Migration from v0.3.8

If you have an existing project:

**Option 1: Fresh Start (Recommended)**
```bash
# Update package
npm install -g devcache-hub@latest

# Remove old config (if exists)
rm -rf .devcache

# Re-initialize
devcache init

# Generate documentation
devcache generate
```

**Option 2: Manual Fix**
```bash
# Update package
npm install -g devcache-hub@latest

# Copy config to root (if it exists in devcache_docs)
cp devcache_docs/.devcache.json .devcache.json

# Remove incorrect folder (if exists)
rm -rf .devcache

# Generate documentation
devcache generate
```

### ✅ Validation Checklist

After updating, verify:
- [ ] `.devcache.json` exists in project root
- [ ] `devcache_docs/.devcache.json` exists (reference copy)
- [ ] No `.devcache/` folder in project root
- [ ] Running `devcache generate` creates files in `devcache_docs/{projectName}/`
- [ ] `.devcache.json` is tracked in git (not ignored)

### 📊 Impact

**Before v0.9.0:**
- Config file missing from root
- Documentation in wrong location
- Confusing folder structure
- Git tracking issues

**After v0.9.0:**
- Config file in correct location
- Documentation in correct location
- Clear, consistent structure
- Proper git tracking

### 🎓 Key Learnings

1. **Config location matters** - CLI commands need config in project root
2. **Reference copies are helpful** - Keeping copy in docs folder provides context
3. **Git tracking is important** - Config should be committed, generated docs should not
4. **Validation is crucial** - Always verify file locations after init

---

## [0.3.8] - 2026-04-06

### 🐛 Critical Fixes

#### Configuration and Documentation Path Corrections
- **Fixed outputDir configuration** - Changed from `.devcache/docs` to `devcache_docs` in init command
  - Previously: Config had `.devcache/docs` but init created `devcache_docs/` ❌
  - Now: Config correctly uses `devcache_docs` matching actual folder structure ✅
- **Fixed config file location** - Now written to both project root and docs folder
  - Root `.devcache.json` - Used by CLI commands
  - `devcache_docs/.devcache.json` - Reference copy for documentation context

#### Supabase Sync Clarification
- **Clarified `supabase.enabled` flag behavior** - Flag only controls automatic sync, not manual push
  - Added debug logging in push command explaining flag doesn't block manual operations
  - Updated CLI messages to clarify manual push always works if authenticated
  - Users can now confidently use `devcache push` even with `enabled: false`

#### Improved CLI Messages
- **Better next steps guidance** - Clear instructions after init regardless of Supabase choice
  - Shows all available commands (generate, login, push)
  - Explains that manual push works even if sync is disabled
  - Helpful note when user chooses not to enable Supabase sync

### 📚 Documentation Added

#### Comprehensive Guides
- **`docs/SUPABASE-SYNC.md`** - Complete explanation of Supabase sync flag
  - What the flag controls (automatic vs manual behavior)
  - Use cases for enabled/disabled
  - Future features roadmap
  - Clear comparison table

- **`docs/MIGRATION-GUIDE.md`** - Migration guide from v0.3.7
  - Step-by-step migration instructions
  - Fresh start vs manual migration options
  - Troubleshooting common issues
  - Rollback instructions if needed

- **`docs/FIXES-SUMMARY.md`** - Summary of all fixes in this release
  - Before/after comparisons
  - Root cause analysis
  - Testing checklist
  - User impact assessment

- **`docs/FOLDER-STRUCTURE-EXPLAINED.md`** - Complete folder structure documentation
  - Purpose of each folder
  - Why structure is organized this way
  - Workflow explanations
  - Common questions answered

- **`docs/TROUBLESHOOTING.md`** - Comprehensive troubleshooting guide
  - Installation issues
  - Generation issues
  - Authentication issues
  - Push issues
  - Configuration issues
  - Debugging tips

#### Updated Documentation
- **`README.md`** - Updated with correct folder structure and Supabase sync explanation
  - Added folder structure diagram
  - Clarified configuration options
  - Explained Supabase sync behavior
  - Added link to detailed sync documentation

### 🔧 Technical Changes

#### Code Improvements
- Updated `src/cli/commands/init.ts`:
  - Changed `outputDir` from `.devcache/docs` to `devcache_docs`
  - Config now written to project root (primary) and docs folder (reference)
  - Improved CLI messages with clearer next steps
  - Added helpful note when Supabase sync is disabled

- Updated `src/cli/commands/push.ts`:
  - Added debug message explaining flag behavior
  - Clarified that manual push works regardless of `enabled` flag
  - Better error messages and guidance

### 📁 Correct Workflow

**After `devcache init`:**
```
.devcache.json              # Config in root (CLI reads this)
devcache_docs/
├── templates/              # Template definitions
├── {projectName}/          # Empty, ready for docs
├── index.md                # Navigation guide
└── .devcache.json          # Config copy (reference)
```

**After `devcache generate`:**
```
devcache_docs/
└── {projectName}/          # Documentation HERE!
    ├── index.md
    ├── general/
    │   ├── project-overview.md
    │   └── project-impact.md
    └── tech/
        ├── architecture-project.md
        ├── stack-project.md
        └── features.md
```

**After `devcache push`:**
- Uploads from correct location: `devcache_docs/{projectName}/`
- Works regardless of `supabase.enabled` flag (if authenticated)
- Maintains folder structure in cloud

### ⚠️ Breaking Changes

**None!** This is a bug fix release that makes the system work as intended.

### 🎯 Migration Notes

If you have existing projects from v0.3.7:
1. Update package: `npm install -g devcache-hub@latest`
2. Your existing `devcache_docs/` structure is already correct
3. Just run `devcache generate` again to ensure everything works
4. See `docs/MIGRATION-GUIDE.md` for detailed instructions

### 📖 Key Takeaways

1. **Documentation location**: Always `devcache_docs/{projectName}/`
2. **Config location**: `.devcache.json` in project root
3. **Supabase sync flag**: Only controls automatic behavior, not manual push
4. **Manual push**: Always works if you're authenticated, regardless of flag

---

## [0.3.7] - 2026-04-06

### 🐛 Critical Fixes

#### Documentation Structure Correction
- **Fixed output directory mismatch** - Documentation now correctly generated in `devcache_docs/{projectName}/`
  - Previously: `init` created `devcache_docs/` but `generate` wrote to `.devcache/docs/` ❌
  - Now: All commands use consistent `devcache_docs/{projectName}/` structure ✅
- **Fixed push command** - Now correctly reads from `devcache_docs/{projectName}/`
- **Fixed config outputDir** - Changed from `.devcache/docs` to `devcache_docs/{projectName}`

#### Orchestrator Improvements
- **Correct file paths** - Orchestrator now writes documentation to proper location
- **Recursive file reading** - Push command now reads all markdown files recursively
- **Better validation** - Added checks to ensure documentation exists before pushing

### 📁 Corrected Workflow

**After `devcache init`:**
```
devcache_docs/
├── templates/
│   ├── general/
│   ├── tech/
│   └── orchestrator.md
├── {projectName}/        # ← Empty, ready for docs
├── index.md
└── .devcache.json
```

**After `devcache generate`:**
```
devcache_docs/
├── templates/
├── {projectName}/        # ← Documentation HERE!
│   ├── project-overview.md
│   ├── project-impact.md
│   ├── stack-project.md
│   ├── architecture-project.md
│   ├── features.md
│   └── features/
│       ├── user-authentication.md
│       ├── ai-chat-system.md
│       └── ...
├── index.md
└── .devcache.json
```

**After `devcache push`:**
- Uploads **ONLY** `devcache_docs/{projectName}/` folder contents
- Maintains folder structure in Supabase
- Includes all subdirectories (e.g., `features/`)

### 🔧 Technical Changes
- Updated `init.ts` - Changed `outputDir` configuration
- Updated `orchestrator/index.ts` - Write to correct location
- Updated `push.ts` - Read from correct location with recursive scanning
- Added `STRUCTURE-FIX.md` - Complete documentation of the fix

### 📝 Documentation
- Added comprehensive fix documentation in `STRUCTURE-FIX.md`
- Includes before/after comparisons
- Provides validation checklist
- Documents expected behavior for all commands

### ⚠️ Breaking Changes
**None!** This is a bug fix that makes the system work as originally intended.

If you have existing projects:
1. Your `devcache_docs/` structure is already correct
2. Just update the package: `npm install -g devcache-hub@latest`
3. Run `devcache generate` again to populate the project folder

---

## [0.3.6] - 2026-04-06

### 🐛 Fixed
- **Init command recursive copy** - Fixed `ENOTSUP` error when copying template directories
  - Added recursive `copyDir` helper function
  - Properly handles nested directories (e.g., `templates/tech/features/`)
  - Now correctly copies all template files and subdirectories

### 🔧 Technical Changes
- Updated `glob` dependency from `^11.0.0` to `^13.0.6` (latest stable)
- Removed deprecation warnings for glob package
- Improved file system operations in init command

---

## [0.3.5] - 2026-04-06

### 🐛 Fixed
- Version bump for npm publishing

---

## [0.3.3] - 2026-04-06

### 🐛 Fixed
- Package publishing configuration

---

## [0.3.2] - 2026-04-06

### ✨ Added

#### New CLI Commands
- **`devcache logout`** - Logout and clear session
  - Displays current logged-in email
  - Asks for confirmation before logging out
  - Clears session from local storage
  - Shows success message
  
- **`devcache profile`** - Display user profile information
  - Shows user email
  - Displays user ID
  - Shows session status (Active/Expired)
  - Displays time remaining until session expires
  - Prompts to login if not authenticated

#### Improved Init Command
- **New folder structure** - `devcache_docs/` instead of `.devcache.json`
- **Templates directory** - Copies all templates to `devcache_docs/templates/`
- **Orchestrator template** - Creates `orchestrator.md` with instructions
- **Project folder** - Creates project-specific folder for documentation
- **Navigation index** - Generates `index.md` for easy navigation
- **Better organization** - Clear separation of templates and generated docs

### 🔧 Technical Changes
- Added `logout.ts` command implementation
- Added `profile.ts` command implementation
- Updated CLI index to register new commands
- Improved init command with proper folder structure
- Enhanced session management display

### 📁 New Init Structure

**After running `devcache init`:**
```
devcache_docs/
├── templates/
│   ├── general/          (project-overview.yaml, project-impact.yaml)
│   ├── tech/             (architecture-project.yaml, stack-project.yaml, features.yaml)
│   └── orchestrator.md   (orchestrator instructions)
├── [project-name]/       (empty, ready for generated docs)
├── index.md              (navigation guide)
└── .devcache.json        (configuration)
```

---

## [0.3.1] - 2026-04-06

### 🐛 Fixed

#### Environment Variables Loading
- **Fixed CLI authentication** - CLI now properly loads environment variables from `.env` files
- **Multiple .env locations** - Supports loading from:
  - Current working directory `.env`
  - Current working directory `.env.local`
  - User home directory `~/.devcache/.env`
- **Dotenv integration** - Added proper dotenv configuration in CLI entry point
- **Better error messages** - Clearer error when Supabase credentials are missing

### 🔧 Technical Changes
- Added dotenv config loading in `src/cli/index.ts`
- Environment variables now loaded before any command execution
- Supports both local project and global user configurations

### 📝 Usage
Users can now configure credentials in three ways:
1. **Global config** (recommended): `~/.devcache/.env`
2. **Project config**: `.env` or `.env.local` in project root
3. **Environment variables**: Export directly in shell

---

## [0.3.0] - 2026-04-06

### 🎉 Major Update - OAuth Authentication & Improved Structure

This release introduces browser-based OAuth authentication and a new project-centric folder structure with navigation index.

### ✨ Added

#### OAuth Authentication System
- **Browser-based OAuth flow** - Users can now authenticate via browser instead of configuring .env files
- **Local callback server** - Runs on `localhost:54321` to receive OAuth tokens
- **Automatic browser opening** - Opens authentication page automatically
- **Token management** - Secure token storage and automatic refresh
- **Fallback to password auth** - Email/password authentication still available
- **5-minute timeout** - Authentication flow times out after 5 minutes
- **Beautiful success/error pages** - User-friendly HTML pages for OAuth callbacks

#### New Folder Structure
- **Project-centric organization** - Documentation now organized under project name folder
- **index.md file** - Automatic generation of navigation index with project map
- **Consistent structure** - Same folder hierarchy locally and in cloud
- **Better organization** - Clear separation: `project-name/general/` and `project-name/tech/`

#### CLI Improvements
- **Authentication method selection** - Choose between OAuth or password authentication
- **Improved error messages** - Clearer error descriptions and suggestions
- **Better progress indicators** - More informative spinner messages
- **Enhanced output** - Clearer success messages with direct links

#### Web Integration
- **CLI auth page** - New `/auth/cli` route for OAuth authentication
- **CLIAuthForm component** - Reusable authentication form for CLI users
- **Automatic redirect** - Seamless redirect back to CLI with tokens
- **Session handling** - Proper session management for already-authenticated users

### 📁 New Documentation Structure

**Before (v0.2.0):**
```
.devcache/docs/
├── general/
└── tech/
```

**Now (v0.3.0):**
```
.devcache/docs/
└── project-name/
    ├── index.md (NEW!)
    ├── general/
    └── tech/
```

### 🔧 Technical Improvements
- Added `open` package for browser automation
- Improved TypeScript types for OAuth flow
- Better session management with public methods
- Enhanced file system handler with project-aware paths
- Improved orchestrator to generate index.md

### 📝 Documentation Updates
- Added `OAUTH-SETUP.md` - Complete OAuth setup guide
- Added `WHATS-NEW-v0.3.0.md` - Detailed changelog and migration guide
- Updated `README.md` - New authentication flow
- Updated `COMPLETE-WORKFLOW.md` - OAuth workflow documentation

### 🎯 User Experience Improvements
- **No .env configuration needed** - OAuth eliminates environment variable setup
- **Professional project structure** - Better organization with project folders
- **Navigation index** - index.md provides quick overview and links
- **Consistent experience** - Same structure locally and in cloud
- **Better onboarding** - Clearer instructions and error messages

### 🔒 Security Enhancements
- OAuth tokens never exposed in terminal
- Secure local token storage in `~/.devcache/session.json`
- Automatic token refresh
- HTTPS support for production deployments
- Local server only runs during authentication

### 🚀 Breaking Changes
**None!** This release is fully backward compatible. Existing projects continue to work.

To use new features:
1. Update: `npm install -g devcache-hub@latest`
2. Re-generate: `devcache-hub generate`
3. Push: `devcache-hub push`

### 📊 Cloud Structure
Projects now appear in Supabase with this structure:
```
project_items
└── project-name (folder)
    ├── index.md (file)
    ├── general (folder)
    │   ├── project-overview.md (file)
    │   └── project-impact.md (file)
    └── tech (folder)
        ├── architecture-project.md (file)
        ├── stack-project.md (file)
        └── features.md (file)
```

---

## [0.2.0] - 2026-04-06

### 🎉 Major Update - Core Functionality Implemented

This release implements the complete documentation generation system. The package can now analyze projects and generate structured documentation.

### ✨ Added

#### Type System
- Complete TypeScript type definitions for all components
- `DevCacheConfig` interface for configuration management
- `ProjectContext` interface for analysis context
- `AnalysisOutput` and `AnalysisResult` interfaces
- `Template` and `TemplateSection` interfaces

#### Utility Functions
- `Logger` class with colored console output
- `ConfigManager` for reading/writing configuration
- `FileParser` for project scanning and file analysis
- Framework detection (Next.js, React, Vue, etc.)
- Package.json and README parsing

#### Template System
- YAML-based template definitions
- 5 complete templates (2 general, 3 tech)
- `TemplateManager` for loading and rendering templates
- Markdown generation from templates

#### Orchestrator Engine
- `Orchestrator` class coordinating all analysis
- `FileSystemHandler` for file operations
- Parallel analyzer execution
- Progress tracking and error handling

#### Analyzers
- `BaseAnalyzer` abstract class with helper methods
- `ProjectAnalyzer` - Generates project overview
- `ImpactAnalyzer` - Analyzes project impact and justification
- `ArchitectureAnalyzer` - Documents technical architecture
- `StackAnalyzer` - Analyzes technology stack and dependencies
- `FeaturesAnalyzer` - Documents features and functionality

#### CLI Commands
- Updated `generate` command with full implementation
- Integration with orchestrator and all analyzers
- Progress indicators and error handling
- Detailed output summaries

### 📝 Documentation Generated

The package now generates 5 markdown files:

**General Category:**
1. `project-overview.md` - Project purpose, objectives, and type
2. `project-impact.md` - Problem statement, solution, and expected impact

**Tech Category:**
3. `architecture-project.md` - Framework, patterns, and structure
4. `stack-project.md` - Dependencies, build tools, and environment
5. `features.md` - Core features, API endpoints, and integrations

### 🔧 Technical Improvements
- TypeScript strict mode enabled
- Proper error handling throughout
- Modular and extensible architecture
- File scanning with glob patterns
- Include/exclude pattern support

### 📦 Build System
- Successful TypeScript compilation
- Proper dist/ output structure
- All dependencies resolved

### 🚧 Known Limitations

**Not Yet Implemented:**
- Authentication system (login command is placeholder)
- Supabase integration (push command is placeholder)
- Embeddings generation
- Web dashboard
- RAG search functionality

These features are planned for version 0.3.0.

---

## [0.1.3] - 2026-04-05

### Fixed
- Updated deprecated dependencies
- Fixed CI/CD pipeline issues
- Resolved NPM publishing workflow

---

## [0.1.2] - 2026-04-05

### Fixed
- Package name conflict resolution
- Renamed to `devcache-hub`

---

## [0.1.1] - 2026-04-05

### Added
- Initial CLI structure
- Basic command stubs
- Configuration file generation

---

## [0.1.0] - 2026-04-05

### Added
- Initial package setup
- Commander.js integration
- Basic project structure
