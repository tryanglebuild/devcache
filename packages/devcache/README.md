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

DevCache generates documentation in two categories:

### General
- `project-overview.md` - Project purpose and objectives
- `project-impact.md` - Problem statement and solution approach

### Technical
- `architecture-project.md` - System architecture overview
- `stack-project.md` - Technology stack analysis
- `features.md` - Main features and API endpoints

## Configuration

DevCache creates a `.devcache.json` file in your project:

```json
{
  "projectName": "my-project",
  "outputDir": ".devcache/docs",
  "templates": {
    "general": ["project-overview", "project-impact"],
    "tech": ["architecture-project", "stack-project", "features"]
  },
  "supabase": {
    "enabled": true
  }
}
```

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
