# DevCache Hub

> Intelligent project documentation generator with cloud sync and RAG-powered search

DevCache Hub automatically analyzes your codebase and generates comprehensive, structured documentation. Push your docs to the cloud and leverage RAG (Retrieval-Augmented Generation) for intelligent search.

## Features

- 🤖 **Automatic Analysis** - Scans your project and extracts insights
- 📝 **Template-Based Docs** - Generates organized markdown documentation
- ☁️ **Cloud Sync** - Push documentation to Supabase
- 🔍 **RAG Search** - AI-powered semantic search through your docs
- 🎯 **Multi-Category** - Separates general and technical documentation

## Installation

```bash
npm install -g devcache-hub
```

## Quick Start

```bash
# Initialize in your project
cd my-project
devcache init

# Generate documentation
devcache generate

# Login to sync
devcache login

# Push to cloud
devcache push
```

## Documentation Structure

After running `devcache init`, the following structure is created:

```
your-project/
├── .devcache.json              # Configuration file (read by CLI)
└── devcache_docs/              # Documentation root
    ├── index.md                # Navigation guide
    ├── .devcache.json          # Config copy (for reference)
    ├── templates/              # Template definitions
    │   ├── general/            # General templates
    │   ├── tech/               # Technical templates
    │   ├── orchestrator.md     # Orchestrator instructions
    │   └── README.md           # Template system guide
    └── {project-name}/         # Generated documentation
        ├── index.md            # Project documentation index
        ├── general/            # General category docs
        │   ├── project-overview.md
        │   └── project-impact.md
        └── tech/               # Technical category docs
            ├── architecture-project.md
            ├── stack-project.md
            └── features.md
```

### Key Points

- **Configuration**: `.devcache.json` in project root (used by CLI commands)
- **Templates**: `devcache_docs/templates/` contains all template definitions
- **Generated Docs**: `devcache_docs/{project-name}/` contains your documentation
- **Organization**: Docs are split into `general/` and `tech/` categories

DevCache generates documentation in two categories:

### General
- `project-overview.md` - Project purpose and objectives
- `project-impact.md` - Problem statement and solution approach

### Technical
- `architecture-project.md` - System architecture overview
- `stack-project.md` - Technology stack analysis
- `features.md` - Main features and API endpoints

## Configuration

DevCache creates a `.devcache.json` file in your project root:

```json
{
  "projectName": "my-project",
  "description": "Optional project description",
  "outputDir": "devcache_docs",
  "templates": {
    "general": ["project-overview", "project-impact"],
    "tech": ["architecture-project", "stack-project", "features"]
  },
  "supabase": {
    "enabled": true,
    "projectId": null
  },
  "analysis": {
    "includePatterns": ["src/**/*", "app/**/*", "lib/**/*"],
    "excludePatterns": ["node_modules/**", "dist/**", ".next/**"]
  }
}
```

### Supabase Sync Configuration

The `supabase.enabled` flag controls automatic sync behavior:

- **`true`**: Enables cloud sync features and reminders
- **`false`**: Local-only mode (but manual `devcache push` still works!)

**Important**: Even if you set `enabled: false` during init, you can always:
1. Run `devcache login` to authenticate
2. Run `devcache push` to manually sync your docs

The flag only controls automatic behavior, not your ability to use cloud features.

See [SUPABASE-SYNC.md](./docs/SUPABASE-SYNC.md) for detailed information.

## Commands

- `devcache init` - Initialize DevCache in your project
- `devcache generate` - Generate documentation
- `devcache login` - Authenticate with Supabase
- `devcache push` - Push documentation to cloud
- `devcache status` - Check sync status

## Requirements

- Node.js >= 18.0.0
- npm or yarn

## License

MIT

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

## Support

For issues and questions, please visit our [GitHub Issues](https://github.com/yourusername/your-repo/issues).
