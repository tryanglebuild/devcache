# Changelog

All notable changes to DevCache will be documented in this file.

## [Unreleased]

### 🚀 New Feature: Automatic Embedding Generation

#### Chunked Upload with Automatic Embeddings
- **Files uploaded via CLI now generate embeddings automatically**
  - Previously: Files uploaded but embeddings not generated ❌
  - Now: Embeddings generated automatically in background ✅
  - Processes files in chunks (5 files per chunk)
  - AI can query files immediately after push

#### How It Works
1. Upload files in chunks of 5
2. After each chunk upload, trigger embedding generation
3. Embeddings generated in parallel (fire-and-forget)
4. Progress shown in CLI during upload
5. Summary displayed after completion

#### Benefits
- ✅ Files immediately searchable by AI
- ✅ No waiting for weekly cron job
- ✅ Chunked processing prevents system overload
- ✅ Background generation doesn't block push
- ✅ Automatic retry via cron for any failures

#### Technical Details
- Modified `StorageManager.uploadDocumentation()` to process in chunks
- Added `triggerChunkEmbeddings()` for parallel embedding generation
- Returns both `projectId` and `uploadedFileIds` for tracking
- Fire-and-forget approach with error logging

#### CLI Output
```bash
Processing chunk 1/3 (5 files)...
✓ Chunk 1/3 uploaded (5 files)

📊 Upload Summary:
  • Files uploaded: 15
  • Embedding generation: In progress (background)
  • Note: Embeddings will be available in a few moments
```

### 📊 New Command: Embeddings Statistics

#### `devcache embeddings` - View Embedding Coverage
- **NEW: Check if all your files have embeddings**
  - Shows total files vs files with embeddings
  - Visual progress bar for quick overview
  - Displays pending items count
  - Shows recent embedding job history
  - Separate stats for project files and agent templates

**Example output:**
```bash
📊 Embedding Statistics

📁 Your Project Files:

  Total files: 25
  With embeddings: 23 (92%)
  Pending: 2

  Progress: ████████████████████████████░░ 92%

🤖 Agent Templates (Public):

  Total agents: 10
  With embeddings: 10 (100%)
  Pending: 0 ✓

📈 Status:

  ⚠ 2 item(s) pending embedding generation
  Embeddings are generated automatically in the background.
  Run devcache embeddings --trigger to process them now.
```

#### `devcache embeddings --trigger` - Force Embedding Generation
- **Manually trigger embedding generation for pending items**
  - Processes up to 100 items immediately
  - Shows detailed results (processed, succeeded, failed)
  - Useful when you need embeddings right away
  - No need to wait for weekly cron job

**Usage:**
```bash
# View statistics
devcache embeddings

# Trigger immediate generation
devcache embeddings --trigger
```

### 🎯 Impact
- **Immediate availability**: Files searchable right after push
- **Better UX**: Clear progress feedback during upload
- **Reliability**: Chunked processing prevents timeouts
- **Scalability**: Handles large documentation sets efficiently
- **Visibility**: Easy to verify embedding coverage
- **Control**: Manual trigger for immediate processing

---

## [0.16.0] - 2026-04-07

### 🔄 New Feature: Refresh Command

#### Refresh Command - Clear Cache & Refresh Session
- **NEW: `devcache refresh` command with multiple options**
  - Interactive menu for choosing what to refresh
  - Command-line flags for direct execution
  - Clear status cache
  - Refresh user session/token
  - Refresh everything at once

**Usage Options:**

1. **Interactive Menu:**
   ```bash
   devcache refresh
   ```
   Choose from menu: Cache, Profile, All, or Cancel

2. **Direct Commands:**
   ```bash
   devcache refresh --cache     # Clear status cache only
   devcache refresh --profile   # Refresh session only
   devcache refresh --all       # Refresh everything
   ```

**What Each Option Does:**

**Cache Refresh (`--cache`):**
- Clears `.devcache/status-cache.json`
- Next `devcache status` shows all files as new
- Useful when cache gets out of sync
- Safe operation, no data loss

**Profile Refresh (`--profile`):**
- Refreshes authentication token
- Extends session expiry
- Validates credentials
- Shows new expiration time
- Useful when session is about to expire

**All Refresh (`--all`):**
- Combines cache + profile refresh
- Complete system refresh
- Recommended for troubleshooting

### 🎯 Use Cases

**When to Refresh Cache:**
- Status showing incorrect file states
- After manual file operations
- Cache corruption suspected
- Want fresh status check

**When to Refresh Profile:**
- Session about to expire
- Authentication issues
- After long idle period
- Before important operations

**When to Refresh All:**
- General troubleshooting
- Starting fresh work session
- After system updates
- Periodic maintenance

### 💡 Pro Tips

- Run `devcache refresh --all` before important pushes
- Use `devcache refresh --profile` to extend session
- Clear cache if status looks wrong
- Combine with `devcache connection` for full health check

---

## 📦 Complete Feature Set (v0.9.0 - v0.16.0)

### Authentication & Security
- ✅ OAuth and Email/Password login
- ✅ Secure credential storage in `~/.devcache/session.json`
- ✅ Session management and refresh
- ✅ No dependency on local `.env.local` files
- ✅ Always connects to DevCache project (qeplvargpuusbrzwfluw)

### Project Management
- ✅ Project initialization with folder structure
- ✅ Configuration file (`.devcache.json`)
- ✅ AI-powered documentation generation
- ✅ Automatic folder creation (general, tech, features)

### Documentation Workflow
- ✅ Status tracking with MD5 hashing
- ✅ Push to cloud with automatic cache update
- ✅ Recursive file discovery
- ✅ Folder structure preservation in cloud

### Utilities & Troubleshooting
- ✅ Connection testing
- ✅ Profile management
- ✅ Interactive guide
- ✅ Cache and session refresh
- ✅ Comprehensive error messages

### Commands Available
```bash
devcache login          # Authenticate
devcache logout         # Clear session
devcache profile        # View user info
devcache init           # Initialize project
devcache generate       # Generate docs
devcache status         # Check pending changes
devcache push           # Sync to cloud
devcache connection     # Test connectivity
devcache refresh        # Refresh cache/session
devcache guide          # Interactive guide
```

---

## [0.15.0] - 2026-04-07

### 📚 New Feature: Interactive Guide

#### Guide Command - Learn DevCache Effectively
- **NEW: `devcache guide` command**
  - Interactive menu-driven guide
  - Comprehensive documentation on all features
  - Best practices and pro tips
  - Troubleshooting help
  - Command reference

**Guide Topics:**
- 🚀 Getting Started - Quick start guide
- 🔐 Authentication - Login and session management
- 📁 Project Initialization - Setup and configuration
- ✨ Documentation Generation - AI-powered docs
- ⭐ Best Practices - Quality documentation tips
- 🔄 Recommended Workflow - Step-by-step process
- 📋 Command Reference - All available commands
- 🔧 Troubleshooting - Common issues and solutions
- 💡 Pro Tips - Advanced usage and automation

**Features:**
- Interactive navigation
- Color-coded sections
- Practical examples
- Copy-paste ready commands
- Context-sensitive help

**Usage:**
```bash
devcache guide
```

Then navigate through topics using arrow keys and Enter.

### 🎯 Why This Matters

The guide command provides:
- **Onboarding**: New users learn quickly
- **Reference**: Quick lookup for commands
- **Best Practices**: Learn optimal workflows
- **Troubleshooting**: Self-service problem solving
- **Tips**: Discover advanced features

### 💡 Pro Tip

Run `devcache guide` anytime you need help or want to learn more about DevCache features!

## [0.14.0] - 2026-04-07

### ✨ New Features

#### Status Command - Track Documentation Changes
- **NEW: `devcache status` command**
  - Shows new, modified, and unchanged documentation files
  - Tracks changes using MD5 hash comparison
  - Displays pending files that need to be pushed
  - Cache stored in `.devcache/status-cache.json`
  - Updates automatically after successful push

**Example output:**
```
📊 Documentation Status

✨ New files (2):
  + tech/features/auth.md
  + tech/features/payments.md

📝 Modified files (1):
  ~ general/project-overview.md

✓ Unchanged files: 5

📤 3 file(s) pending push
```

#### Connection Command - Test Database Connectivity
- **NEW: `devcache connection` command**
  - Tests Supabase client initialization
  - Verifies user authentication
  - Tests database connection and schema
  - Checks write permissions
  - Displays existing projects
  - Helpful for troubleshooting push issues

**Connection test steps:**
1. ✓ Supabase client initialized
2. ✓ Authenticated as user@email.com
3. ✓ Database connection successful
4. ✓ DevCache credentials found
5. ✓ Write permissions verified

### 🔧 Technical Details

**Status Command:**
- Uses MD5 hashing to detect file changes
- Compares current files with last push state
- Recursive directory scanning
- Ignores non-markdown files
- Cache updated automatically after `devcache push`

**Connection Command:**
- Tests all connection layers
- Validates session credentials
- Queries `project_items` table
- Checks RLS policies
- Provides detailed error messages

### 🎯 Use Cases

**Status Command:**
- Check what changed before pushing
- Verify documentation is up to date
- Track file modifications over time
- See pending changes at a glance

**Connection Command:**
- Troubleshoot push failures
- Verify authentication is working
- Test database connectivity
- Confirm credentials are saved correctly

## [0.13.0] - 2026-04-07

### 🔒 Security: Secure Credential Management

#### Credentials Saved During Login (Secure Approach)
- **DevCache credentials now saved securely in `~/.devcache/session.json`**
  - Previously: Relied on local project's `.env.local` ❌
  - Now: Credentials saved during login process ✅
  - No hardcoded credentials in source code
  - Credentials stored locally and encrypted with user session

#### How It Works
1. User runs `devcache login`
2. Authenticates with DevCache (qeplvargpuusbrzwfluw)
3. Session + DevCache credentials saved to `~/.devcache/session.json`
4. All subsequent commands use saved credentials
5. Credentials refreshed automatically with session

#### Security Benefits
- ✅ No hardcoded credentials in source code
- ✅ Credentials stored per-user, not per-project
- ✅ Works from any directory/project
- ✅ No dependency on local `.env.local` files
- ✅ Credentials tied to authenticated session

#### Credential Priority (Fallback Chain)
1. **Saved session credentials** (most secure, preferred)
2. Environment variables (for development/testing)
3. Hardcoded fallback (last resort, only in client initialization)

### 🎯 Impact
- Users must login once to save credentials
- Push works from any project directory
- No need to configure Supabase in each project
- Consistent and secure authentication

## [0.12.1] - 2026-04-07

### 🐛 Bug Fixes

#### Environment Variable Loading from Subdirectories
- **Fixed "table not found" error when running commands from subdirectories**
  - Previously: CLI only looked for `.env.local` in current directory ❌
  - Now: Searches up the directory tree (like Git) to find environment files ✅
  - Users can run `devcache push` from any subdirectory (e.g., `devcache_docs/`)
  - Ensures Supabase credentials are always loaded correctly

### 🔧 Technical Changes
- Added `findEnvFile()` function that walks up directory tree
- Searches for `.env.local` and `.env` in parent directories
- Stops at filesystem root if no file found
- Maintains backward compatibility with existing setups

## [0.12.0] - 2026-04-06

### 🎯 Major Init Command Improvements

This release fixes critical issues with folder structure creation and documentation organization.

### ✨ New Features

#### Automatic Folder Structure Creation
- **Init now creates complete folder structure** - All necessary folders created upfront
  - Previously: Only created project folder, subfolders missing ❌
  - Now: Creates `general/`, `tech/`, and `features/` folders automatically ✅
  - AI can immediately start creating files in correct locations
  - No need to manually create folders

#### Enhanced Index.md with Clear Instructions
- **Added comprehensive file creation guide** - Step-by-step instructions in index.md
  - Visual folder structure diagram
  - Explicit path construction rules
  - Examples of correct and incorrect paths
  - File creation checklist
  - Features documentation explanation

### 📁 New Folder Structure

**After `devcache init`:**
```
devcache_docs/
└── {projectName}/
    ├── index.md           # Main entry point with instructions
    ├── general/           # General documentation
    ├── tech/              # Technical documentation
    └── features/          # Feature-specific docs
```

### 🔧 Technical Changes
- Modified `initCommand()` to create all folders upfront
- Updated `index.md` template with detailed instructions
- Added folder structure validation
- Improved console output to show created folders

### 🎯 Impact
- **Faster setup** - No manual folder creation needed
- **Better AI guidance** - Clear instructions prevent errors
- **Consistent structure** - All projects follow same pattern
- **Fewer errors** - AI creates files in correct locations

## [0.11.1] - 2026-04-06

### 📝 Documentation Improvements

#### Orchestrator Template Updates
- **Added critical file location instructions** to prevent AI errors
  - "CRITICAL: File Location Rules" section
  - "Quick Start - File Creation Guide"
  - "File Location Validation" checklist
  - Examples of correct and incorrect paths

### 🎯 Impact
- AI agents now create files in correct locations
- Reduced documentation generation errors
- Clearer guidance for file organization

## [0.11.0] - 2026-04-06

### 🐛 Bug Fixes

#### Folder Structure Preservation in Cloud
- **Fixed: Push now preserves complete folder hierarchy**
  - Previously: Uploaded all files to flat `general/` or `tech/` folders ❌
  - Now: Maintains exact local structure in Supabase ✅
  - Supports unlimited nesting depth
  - Recursive folder creation in cloud

### 🔧 Technical Changes
- Implemented `createFolderByPath()` method
- Updated `uploadDocumentation()` to preserve hierarchy
- Recursive folder creation in Supabase
- Path normalization for cross-platform compatibility

### 🎯 Impact
- Complex folder structures now work correctly
- Features can be organized in subfolders
- Cloud storage mirrors local structure exactly

## [0.10.0] - 2026-04-06

### 🐛 Bug Fixes

#### Recursive File Discovery in Push Command
- **Fixed: Push now finds ALL markdown files**
  - Previously: Only looked in hardcoded `general/` and `tech/` folders ❌
  - Now: Recursively scans entire project directory ✅
  - Supports unlimited nesting depth
  - Finds files regardless of folder structure

### 🔧 Technical Changes
- Implemented `readMarkdownFiles()` recursive function
- Removed hardcoded folder paths
- Dynamic category detection based on path
- Better error handling for directory scanning

### 🎯 Impact
- No more "No documentation files found" errors
- Flexible folder organization
- Supports custom folder structures

## [0.9.0] - 2026-04-06

### 🐛 Bug Fixes

#### Configuration File Location
- **Fixed: `.devcache.json` now created in correct location**
  - Previously: Created in wrong directory ❌
  - Now: Created in project root ✅
  - Also creates reference copy in `devcache_docs/`

#### Git Ignore Updates
- **Updated `.gitignore` to track configuration**
  - Tracks `.devcache.json` (configuration)
  - Ignores `.devcache/` folder (cache and temp files)

### 🔧 Technical Changes
- Fixed path resolution in init command
- Updated `.gitignore` patterns
- Improved file creation logic

### 🎯 Impact
- Configuration file in correct location
- Better version control integration
- Cleaner repository structure

---

## 🚀 Getting Started

```bash
# Install
npm install -g devcache-hub

# Authenticate
devcache login

# Initialize project
cd your-project
devcache init

# Generate documentation
devcache generate

# Check status
devcache status

# Push to cloud
devcache push

# Get help
devcache guide
```

## 📚 Documentation

- Run `devcache guide` for interactive guide
- Run `devcache --help` for command reference
- Visit https://devcache.dev for full documentation

## 🐛 Issues & Support

- GitHub: https://github.com/tryanglebuild/devcache/issues
- Email: support@devcache.dev

### 📚 New Feature: Interactive Guide

#### Guide Command - Learn DevCache Effectively
- **NEW: `devcache guide` command**
  - Interactive menu-driven guide
  - Comprehensive documentation on all features
  - Best practices and pro tips
  - Troubleshooting help
  - Command reference

**Guide Topics:**
- 🚀 Getting Started - Quick start guide
- 🔐 Authentication - Login and session management
- 📁 Project Initialization - Setup and configuration
- ✨ Documentation Generation - AI-powered docs
- ⭐ Best Practices - Quality documentation tips
- 🔄 Recommended Workflow - Step-by-step process
- 📋 Command Reference - All available commands
- 🔧 Troubleshooting - Common issues and solutions
- 💡 Pro Tips - Advanced usage and automation

**Features:**
- Interactive navigation
- Color-coded sections
- Practical examples
- Copy-paste ready commands
- Context-sensitive help

**Usage:**
```bash
devcache guide
```

Then navigate through topics using arrow keys and Enter.

### 🎯 Why This Matters

The guide command provides:
- **Onboarding**: New users learn quickly
- **Reference**: Quick lookup for commands
- **Best Practices**: Learn optimal workflows
- **Troubleshooting**: Self-service problem solving
- **Tips**: Discover advanced features

### 💡 Pro Tip

Run `devcache guide` anytime you need help or want to learn more about DevCache features!

## [0.14.0] - 2026-04-07

### ✨ New Features

#### Status Command - Track Documentation Changes
- **NEW: `devcache status` command**
  - Shows new, modified, and unchanged documentation files
  - Tracks changes using MD5 hash comparison
  - Displays pending files that need to be pushed
  - Cache stored in `.devcache/status-cache.json`
  - Updates automatically after successful push

**Example output:**
```
📊 Documentation Status

✨ New files (2):
  + tech/features/auth.md
  + tech/features/payments.md

📝 Modified files (1):
  ~ general/project-overview.md

✓ Unchanged files: 5

📤 3 file(s) pending push
```

#### Connection Command - Test Database Connectivity
- **NEW: `devcache connection` command**
  - Tests Supabase client initialization
  - Verifies user authentication
  - Tests database connection and schema
  - Checks write permissions
  - Displays existing projects
  - Helpful for troubleshooting push issues

**Connection test steps:**
1. ✓ Supabase client initialized
2. ✓ Authenticated as user@email.com
3. ✓ Database connection successful
4. ✓ DevCache credentials found
5. ✓ Write permissions verified

### 🔧 Technical Details

**Status Command:**
- Uses MD5 hashing to detect file changes
- Compares current files with last push state
- Recursive directory scanning
- Ignores non-markdown files
- Cache updated automatically after `devcache push`

**Connection Command:**
- Tests all connection layers
- Validates session credentials
- Queries `project_items` table
- Checks RLS policies
- Provides detailed error messages

### 🎯 Use Cases

**Status Command:**
- Check what changed before pushing
- Verify documentation is up to date
- Track file modifications over time
- See pending changes at a glance

**Connection Command:**
- Troubleshoot push failures
- Verify authentication is working
- Test database connectivity
- Confirm credentials are saved correctly

## [0.13.0] - 2026-04-07

### 🔒 Security: Secure Credential Management

#### Credentials Saved During Login (Secure Approach)
- **DevCache credentials now saved securely in `~/.devcache/session.json`**
  - Previously: Relied on local project's `.env.local` ❌
  - Now: Credentials saved during login process ✅
  - No hardcoded credentials in source code
  - Credentials stored locally and encrypted with user session

#### How It Works
1. User runs `devcache login`
2. Authenticates with DevCache (qeplvargpuusbrzwfluw)
3. Session + DevCache credentials saved to `~/.devcache/session.json`
4. All subsequent commands use saved credentials
5. Credentials refreshed automatically with session

#### Security Benefits
- ✅ No hardcoded credentials in source code
- ✅ Credentials stored per-user, not per-project
- ✅ Works from any directory/project
- ✅ No dependency on local `.env.local` files
- ✅ Credentials tied to authenticated session

#### Credential Priority (Fallback Chain)
1. **Saved session credentials** (most secure, preferred)
2. Environment variables (for development/testing)
3. Hardcoded fallback (last resort, only in client initialization)

### 🎯 Impact
- Users must login once to save credentials
- Push works from any project directory
- No need to configure Supabase in each project
- Consistent and secure authentication

## [0.12.1] - 2026-04-07

### 🐛 Bug Fixes

#### Environment Variable Loading from Subdirectories
- **Fixed "table not found" error when running commands from subdirectories**
  - Previously: CLI only looked for `.env.local` in current directory ❌
  - Now: Searches up the directory tree (like Git) to find environment files ✅
  - Users can run `devcache push` from any subdirectory (e.g., `devcache_docs/`)
  - Ensures Supabase credentials are always loaded correctly

### 🔧 Technical Changes
- Added `findEnvFile()` function that walks up directory tree
- Searches for `.env.local` and `.env` in parent directories
- Stops at filesystem root if no file found
- Maintains backward compatibility with existing setups

## [0.12.0] - 2026-04-06

### 🎯 Major Init Command Improvements

This release fixes critical issues with folder structure creation and documentation organization.

### ✨ New Features

#### Automatic Folder Structure Creation
- **Init now creates complete folder structure** - All necessary folders created upfront
  - Previously: Only created project folder, subfolders missing ❌
  - Now: Creates `general/`, `tech/`, and `features/` folders automatically ✅
  - AI can immediately start creating files in correct locations
  - No need to manually create folders

#### Enhanced Index.md with Clear Instructions
- **Added comprehensive file creation guide** - Step-by-step instructions in index.md
  - Visual folder structure diagram
  - Explicit path construction rules
  - Examples of correct and incorrect paths
  - File creation checklist
  - Features documentation explanation

### 📁 New Folder Structure

**After `devcache init`:**
```
devcache_docs/
├── templates/
│   ├── general/
│   ├── tech/
│   └── orchestrator.md
├── {projectName}/
│   ├── general/          ← NEW! Created automatically
│   ├── tech/             ← NEW! Created automatically
│   └── features/         ← NEW! Created automatically
├── index.md
└── .devcache.json
```

### 🐛 Bug Fixes

#### Missing Folder Structure
- **Fixed: Folders not created during init** - Now creates all necessary folders
  - `general/` folder created for general documentation
  - `tech/` folder created for technical documentation
  - `features/` folder created for individual feature docs
  - Prevents "folder not found" errors during generation

#### Unclear File Location Instructions
- **Fixed: AI creating files in wrong locations** - Enhanced index.md with explicit instructions
  - Added "🚨 IMPORTANT: File Creation Instructions" section
  - Included visual folder structure
  - Added path construction rules
  - Provided correct and incorrect examples
  - Explained features documentation system

### 📝 Updated Index.md Content

The index.md now includes:

1. **File Creation Instructions Section**
   - Where to create files
   - How to construct paths
   - What to avoid
   - Example file paths

2. **Visual Folder Structure**
   ```
   devcache_docs/{projectName}/
   ├── general/
   ├── tech/
   └── features/
   ```

3. **Features Documentation Explanation**
   - Main overview file location
   - Individual feature docs location
   - When to create individual docs (impact ≥ 6)

4. **File Creation Rules**
   - Read configuration first
   - Construct correct paths
   - Never create in wrong locations

### 🔧 Technical Changes

#### Init Command (`src/cli/commands/init.ts`)
```typescript
// Create project subdirectories
await fs.mkdir(path.join(projectDir, 'general'), { recursive: true });
await fs.mkdir(path.join(projectDir, 'tech'), { recursive: true });
await fs.mkdir(path.join(projectDir, 'features'), { recursive: true });
```

#### Enhanced Console Output
```
📁 Created structure:
  devcache_docs/
  ├── {projectName}/
  │   ├── general/          ← Create general docs here
  │   ├── tech/             ← Create tech docs here
  │   └── features/         ← Create feature docs here
```

### 🎯 Impact

**Who benefits:**
- Users generating documentation via AI (Kiro)
- Anyone using `devcache generate` command
- Developers extending the system

**What's improved:**
- Folders exist before file creation (no errors)
- Clear instructions prevent wrong file locations
- Features folder ready for detailed documentation
- Better user experience during init

### ✅ Validation

After updating, verify the structure:

```bash
# Run init
devcache init

# Check structure
ls -la devcache_docs/your-project/
# Should show: general/ tech/ features/

# Read instructions
cat devcache_docs/index.md
# Should show clear file creation instructions
```

### 📊 Before vs After

**Before v0.12.0:**
```
devcache_docs/
└── project/
    └── (empty)  ← No folders!
```

**After v0.12.0:**
```
devcache_docs/
└── project/
    ├── general/   ← Ready!
    ├── tech/      ← Ready!
    └── features/  ← Ready!
```

### 🎓 Key Benefits

1. **No manual folder creation** - Everything ready after init
2. **Clear instructions** - AI knows exactly where to create files
3. **Features support** - Folder ready for detailed feature docs
4. **Better UX** - Visual feedback shows folder structure
5. **Fewer errors** - Folders exist before file creation

---

## [0.11.1] - 2026-04-06

### 📝 Documentation Improvements

#### Enhanced Orchestrator Template with File Location Rules
- **Added explicit file location instructions** - Clear guidance on where to create documentation files
  - Added "CRITICAL: File Location Rules" section at the top
  - Added "Quick Start - File Creation Guide" for immediate reference
  - Added "File Location Validation" to post-generation checklist
  - Included examples of correct and incorrect paths

#### Problem Solved
When using AI assistants (like Kiro) to generate documentation based on templates, files were being created in wrong locations:
- ❌ Creating files in project root
- ❌ Creating files in `docs/` folder
- ❌ Creating files in `devcache_docs/` root without project name

Now the orchestrator template explicitly instructs:
- ✅ Always read project name from `.devcache.json`
- ✅ Always create files in `devcache_docs/{projectName}/`
- ✅ Verify folder structure before creating files
- ✅ Validate file locations after generation

### 📁 Updated Template Structure

The orchestrator template now includes:

1. **Quick Start Guide** - Immediate reference for file creation
2. **Path Construction Rules** - Step-by-step path building
3. **Common Mistakes Section** - What NOT to do
4. **Validation Checklist** - Verify correct file locations
5. **Code Examples** - TypeScript examples for path construction

### 🎯 Impact

**Who benefits:**
- Users generating documentation via AI chat (Kiro)
- Anyone using templates manually
- Developers extending the template system

**What's improved:**
- Consistent file locations across all generation methods
- Clear instructions prevent common mistakes
- Better validation catches location errors early

### 📖 Template Updates

Updated `packages/devcache/templates/orchestrator.md` with:

```markdown
## 🚨 QUICK START - File Creation Guide

1. Read Configuration from .devcache.json
2. Verify Project Folder Exists
3. Create Files in Correct Location
4. Never Create Files In wrong locations

Example Paths:
✅ devcache_docs/my-project/general/project-overview.md
❌ docs/project-overview.md
```

### ✅ Validation

After updating, when using AI to generate docs:

1. AI will read `.devcache.json` first
2. AI will verify `devcache_docs/{projectName}/` exists
3. AI will create files in correct location
4. AI will validate file locations after creation

---

## [0.11.0] - 2026-04-06

### 🐛 Critical Fix - Folder Structure Preservation

This release fixes a critical bug where nested folder structures were not being preserved when pushing to Supabase.

### 🐛 Bug Fixes

#### Folder Structure Not Preserved in Cloud
- **Fixed nested folder upload** - Folder structure now correctly preserved in Supabase
  - Previously: All files uploaded to flat `general/` or `tech/` folders ❌
  - Now: Complete folder hierarchy preserved in cloud ✅
  - Example: `tech/features/auth.md` → Creates `tech/` → `features/` → `auth.md`

#### Storage Manager Improvements
- **Implemented `createFolderByPath()`** - Recursively creates nested folder structure
  - Splits path into parts (e.g., `tech/features/auth` → `["tech", "features", "auth"]`)
  - Creates each folder in sequence
  - Reuses existing folders (no duplicates)
  - Maintains parent-child relationships

- **Updated `uploadDocumentation()`** - Preserves file paths during upload
  - Parses file path to extract folder structure
  - Creates folder hierarchy before uploading file
  - Places file in correct nested location
  - Works with any depth of nesting

### 📁 What This Fixes

**Before v0.11.0:**
```
Local structure:
devcache_docs/project/
├── tech/
│   └── features/
│       └── auth.md

Cloud structure (WRONG):
project/
├── general/
│   └── auth.md  ← File in wrong place!
└── tech/
```

**After v0.11.0:**
```
Local structure:
devcache_docs/project/
├── tech/
│   └── features/
│       └── auth.md

Cloud structure (CORRECT):
project/
├── tech/
│   └── features/
│       └── auth.md  ← Exact structure preserved!
```

### 🔧 Technical Implementation

#### New Method: `createFolderByPath()`

```typescript
async createFolderByPath(parentId: string, folderPath: string): Promise<ProjectFolder> {
  // Split path: "tech/features/auth" → ["tech", "features", "auth"]
  const parts = folderPath.split('/').filter(p => p.length > 0);
  
  let currentParentId = parentId;
  
  // Create each folder in sequence
  for (const folderName of parts) {
    // Check if folder exists, create if not
    // Update currentParentId to newly created folder
  }
  
  return finalFolder;
}
```

**Features:**
- Recursive folder creation
- Checks for existing folders (no duplicates)
- Maintains parent-child relationships
- Returns the deepest folder in the path

#### Updated: `uploadDocumentation()`

```typescript
for (const file of files) {
  // Parse: "tech/features/auth.md" → folder: "tech/features", file: "auth.md"
  const pathParts = file.filename.split('/');
  const fileName = pathParts[pathParts.length - 1];
  const folderPath = pathParts.slice(0, -1).join('/');

  // Create folder structure if needed
  if (folderPath) {
    const folder = await this.createFolderByPath(projectFolder.id, folderPath);
    parentId = folder.id;
  }

  // Upload file to correct location
  await this.uploadFile(parentId, fileName, file.content);
}
```

### 🎯 Impact

**Who is affected:**
- Anyone using nested folder structures (v0.10.0 users)
- Projects with custom folders like `features/`, `guides/`, `api/`
- Any structure deeper than 1 level

**What to do:**
1. Update to v0.11.0
2. Run `devcache push` again
3. Your folder structure will now be correctly preserved in Supabase

### ✅ Validation

After updating, verify the fix:

```bash
# Update package
npm install -g devcache-hub@latest

# Push documentation
devcache push

# Check in Supabase dashboard
# Folder structure should match your local structure exactly
```

### 📊 Examples

**Simple nested structure:**
```
Local: tech/features/auth.md
Cloud: project/tech/features/auth.md ✅
```

**Deep nesting:**
```
Local: tech/features/auth/oauth/google.md
Cloud: project/tech/features/auth/oauth/google.md ✅
```

**Multiple branches:**
```
Local:
├── tech/features/auth.md
├── tech/api/rest.md
└── guides/setup/install.md

Cloud:
project/
├── tech/
│   ├── features/
│   │   └── auth.md
│   └── api/
│       └── rest.md
└── guides/
    └── setup/
        └── install.md
✅ All preserved!
```

### 🙏 Thanks

Thanks to users who reported this issue! Your feedback helps make DevCache better.

---

## [0.10.0] - 2026-04-06

### 🚀 Enhanced Push Command - Recursive File Discovery

This release significantly improves the push command to support flexible folder structures and recursive file discovery.

### ✨ New Features

#### Recursive File Scanning
- **Push now finds ALL markdown files** - No longer limited to `general/` and `tech/` folders
  - Previously: Only scanned hardcoded `general/` and `tech/` directories ❌
  - Now: Recursively scans entire project folder for all `.md` files ✅
  - Supports unlimited nesting depth
  - Works with any custom folder structure
  - Automatically preserves folder hierarchy in cloud

#### Flexible Folder Structure Support
- **Any folder structure now works** - Organize documentation however you want
  - Create custom folders: `features/`, `guides/`, `api/`, etc.
  - Nest folders as deep as needed: `tech/features/auth/oauth.md`
  - Place files at root level: `devcache_docs/project/README.md`
  - Mix and match structures across projects

#### Smart File Categorization
- **Automatic category detection** - Files categorized based on path
  - Files in `tech/` or subfolders → Categorized as "tech"
  - All other files → Categorized as "general"
  - Category preserved when uploading to cloud
  - Maintains organization in Supabase storage

### 🐛 Bug Fixes

#### Push Command Error Handling
- **Fixed "No documentation files found" error** - Better file discovery
  - Now finds files regardless of folder structure
  - Improved error messages when project folder is empty
  - Clear guidance when documentation needs to be generated
  - Warns about specific directory read errors

#### Cross-Platform Compatibility
- **Normalized path separators** - Works on Windows, macOS, and Linux
  - Converts backslashes to forward slashes
  - Consistent path handling across platforms
  - Proper relative path preservation

### 📁 Supported Folder Structures

**Simple Structure:**
```
devcache_docs/project/
├── index.md
├── overview.md
└── architecture.md
```

**Standard Structure:**
```
devcache_docs/project/
├── index.md
├── general/
│   ├── overview.md
│   └── impact.md
└── tech/
    ├── architecture.md
    └── stack.md
```

**Advanced Structure (NEW!):**
```
devcache_docs/project/
├── index.md
├── general/
│   └── overview.md
├── tech/
│   ├── architecture.md
│   └── features/           ← Nested folders work!
│       ├── auth.md
│       ├── api.md
│       └── realtime/       ← Multiple levels!
│           └── websockets.md
├── guides/                 ← Custom folders work!
│   ├── setup.md
│   └── deployment.md
└── README.md               ← Root files work!
```

### 🔧 Technical Implementation

#### Recursive File Reader
```typescript
async function readMarkdownFiles(dirPath: string, relativePath: string = ''): Promise<void> {
  // Recursively reads all directories
  // Finds all .md files (except index.md)
  // Preserves relative paths
  // Handles errors gracefully
}
```

**Features:**
- Depth-first directory traversal
- Skips `index.md` (handled separately)
- Maintains relative path structure
- Error handling per directory
- Cross-platform path normalization

#### Category Detection Logic
- Files in `tech/` path → `category: 'tech'`
- All other files → `category: 'general'`
- Path-based detection (not folder name dependent)
- Works with nested structures

### 📝 Migration Guide

**No migration needed!** This is a backward-compatible enhancement.

**Existing projects:**
- Continue working with `general/` and `tech/` structure
- Or reorganize files into custom structure
- Both approaches fully supported

**New projects:**
- Use any folder structure you prefer
- Create folders that match your documentation needs
- No restrictions on organization

### 🎯 Use Cases Enabled

1. **Feature-based organization:**
   ```
   tech/features/
   ├── authentication/
   ├── payments/
   └── notifications/
   ```

2. **Guide-based organization:**
   ```
   guides/
   ├── getting-started/
   ├── deployment/
   └── troubleshooting/
   ```

3. **API documentation:**
   ```
   api/
   ├── rest/
   ├── graphql/
   └── webhooks/
   ```

4. **Mixed organization:**
   ```
   general/
   tech/
   guides/
   api/
   examples/
   ```

### ✅ Validation

After updating, verify push works:

```bash
# Update package
npm install -g devcache-hub@latest

# In your project
devcache push

# Should see:
# ✓ Found X documentation files + index.md
# ✓ Documentation pushed successfully!
```

### 🎓 Key Benefits

1. **Flexibility** - Organize docs however makes sense for your project
2. **Scalability** - Support for large documentation sets with deep nesting
3. **Simplicity** - No need to follow rigid folder structure
4. **Compatibility** - Works with existing projects without changes
5. **Reliability** - Better error handling and user feedback

---

## [0.9.0] - 2026-04-06

### 🎯 Major Configuration Fix

This release fixes critical issues with configuration file location and push command file discovery.

### 🐛 Critical Fixes

#### Configuration File Location
- **Fixed missing root config** - `.devcache.json` now correctly created in project root
  - Previously: Only created inside `devcache_docs/` folder ❌
  - Now: Created in both project root (primary) and `devcache_docs/` (reference) ✅
- **Fixed documentation path** - Documentation now consistently generated in correct location
  - Root config is read by all CLI commands
  - Reference config in docs folder for context
  - No more `.devcache/` folder created by mistake

#### Push Command File Discovery
- **Fixed recursive file reading** - Push now finds ALL markdown files in project folder
  - Previously: Only looked in `general/` and `tech/` subdirectories ❌
  - Now: Recursively scans entire project folder for all `.md` files ✅
  - Supports nested folders (e.g., `features/`, `guides/`, etc.)
  - Automatically categorizes files based on path
  - Better error messages when no files are found

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

#### Push Command (`src/cli/commands/push.ts`)
- Implemented recursive file scanning for all markdown files
- Removed hardcoded `general/` and `tech/` folder limitation
- Automatically categorizes files based on their path
- Supports any folder structure within project directory
- Better error handling and user feedback
- Normalizes path separators for cross-platform compatibility

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
