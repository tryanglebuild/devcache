# Changelog

All notable changes to DevCache will be documented in this file.

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
