# Marketplace Population Script

This script populates your agent marketplace with 25+ high-quality, production-ready agent templates across multiple categories.

## Agent Categories

### 🎭 Orchestrators (2 agents)
- **Workflow Orchestrator** - Coordinates complex multi-step workflows
- **Microservices Coordinator** - Manages distributed systems communication

### 🎨 Frontend/UI (3 agents)
- **React Component Builder** - Creates modern React components
- **Tailwind CSS Designer** - Designs beautiful responsive interfaces
- **Next.js App Router Expert** - Builds high-performance Next.js apps

### ⚙️ Backend (3 agents)
- **REST API Architect** - Designs robust RESTful APIs
- **Database Schema Designer** - Creates efficient database structures
- **GraphQL API Builder** - Builds type-safe GraphQL services

### ☁️ Cloud & Infrastructure (3 agents)
- **AWS Infrastructure Expert** - Designs scalable AWS architectures
- **Docker & Kubernetes Specialist** - Containerization and orchestration
- **Terraform Infrastructure Coder** - Infrastructure as Code

### 🧪 Testing (2 agents)
- **Test Automation Engineer** - Creates comprehensive test suites
- **API Testing Specialist** - Tests REST and GraphQL APIs

### 📚 Documentation (2 agents)
- **Technical Documentation Writer** - Creates clear technical docs
- **OpenAPI Spec Generator** - Generates API specifications

### 🔒 Security (2 agents)
- **Security Auditor** - Performs security audits
- **Authentication & Authorization Expert** - Implements secure access control

### 📊 Data (3 agents)
- **Data Pipeline Engineer** - Builds ETL/ELT pipelines
- **Data Analytics Specialist** - Extracts insights from data
- **Machine Learning Engineer** - Builds production ML systems

### 🚀 Specialized (5 agents)
- **Performance Optimization Expert** - Optimizes application performance
- **Code Review Assistant** - Provides constructive code reviews
- **CI/CD Pipeline Builder** - Automates software delivery
- **Accessibility Specialist** - Ensures WCAG compliance
- **Mobile App Developer** - Builds mobile applications

## Usage

### Prerequisites
1. Supabase project set up
2. Environment variables configured in `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your-project-url
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```
3. At least one user profile in the database

### Run the Script

```bash
# Install dependencies if needed
npm install

# Run the population script
npm run populate:marketplace

# Or with tsx directly
npx tsx scripts/populate-marketplace.ts
```

### Expected Output

```
🚀 Starting marketplace population...
📝 Using user ID: abc-123-def-456
✅ Created: Workflow Orchestrator
✅ Created: Microservices Coordinator
✅ Created: React Component Builder
...
📊 Summary:
✅ Successfully created: 25 agents
❌ Failed: 0 agents
📦 Total agents: 25

🎉 Marketplace population complete!
```

## Agent Template Structure

Each agent includes:
- **Name**: Clear, descriptive title
- **Description**: Brief overview of capabilities
- **Content**: Detailed instructions and best practices
- **Category**: Classification for filtering
- **Tags**: Searchable keywords
- **Version**: Semantic versioning
- **Visibility**: Public (marketplace-ready)
- **Published Date**: Timestamp for sorting

## Customization

### Adding New Agents

Add new agent objects to the `agents` array in `populate-marketplace.ts`:

```typescript
{
  name: 'Your Agent Name',
  description: 'Brief description',
  content: `Detailed instructions...`,
  category: 'your-category',
  tags: ['tag1', 'tag2'],
  version: '1.0.0',
  visibility: 'public',
  published_at: new Date().toISOString(),
  dependencies: []
}
```

### Modifying Existing Agents

Edit the agent objects in the script before running. Changes will be reflected in newly created agents.

### Categories

Available categories:
- `orchestrator`
- `frontend`
- `backend`
- `cloud`
- `testing`
- `documentation`
- `security`
- `data`
- `optimization`
- `code-quality`
- `devops`
- `accessibility`
- `mobile`

## Troubleshooting

### "No user profiles found"
Create at least one user account through your authentication system before running the script.

### "Missing Supabase credentials"
Ensure `.env.local` contains valid Supabase URL and service role key.

### Duplicate agents
The script doesn't check for duplicates. If you run it multiple times, it will create duplicate entries. To avoid this, manually delete existing agents or modify the script to check for existing names.

## Database Impact

This script will:
- Insert 25 rows into `agent_templates` table
- Set all agents to `public` visibility
- Associate all agents with the first user profile found
- Set `published_at` to current timestamp

## Next Steps

After populating the marketplace:

1. **Generate Embeddings**: Run the embedding generation script to enable semantic search
   ```bash
   npm run generate:embeddings
   ```

2. **Verify in UI**: Check the marketplace page to see all agents

3. **Test Search**: Try searching for agents by category, tags, or keywords

4. **Customize**: Edit agent content to match your specific needs

## License

These agent templates are provided as examples and can be freely modified for your use case.
