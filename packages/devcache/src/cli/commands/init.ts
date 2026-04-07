import inquirer from 'inquirer';
import chalk from 'chalk';
import ora from 'ora';
import fs from 'fs/promises';
import path from 'path';

interface InitConfig {
  projectName: string;
  description?: string;
  outputDir: string;
  templates: {
    general: string[];
    tech: string[];
  };
  supabase: {
    enabled: boolean;
    projectId: string | null;
  };
  analysis: {
    includePatterns: string[];
    excludePatterns: string[];
  };
  generation?: {
    aiModel?: string;
    includeMetadata?: boolean;
  };
}

export async function initCommand() {
  console.log(chalk.blue.bold('\n🚀 DevCache Initialization\n'));

  try {
    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'projectName',
        message: 'Project name:',
        default: path.basename(process.cwd()),
        validate: (input) => {
          if (/^[a-z0-9-]+$/.test(input)) return true;
          return 'Project name must contain only lowercase letters, numbers, and hyphens';
        }
      },
      {
        type: 'input',
        name: 'description',
        message: 'Project description (optional):',
      },
      {
        type: 'confirm',
        name: 'enableSupabase',
        message: 'Enable Supabase sync?',
        default: true
      }
    ]);

    const config: InitConfig = {
      projectName: answers.projectName,
      description: answers.description || undefined,
      outputDir: 'devcache_docs',
      templates: {
        general: ['project-overview', 'project-impact'],
        tech: ['architecture-project', 'stack-project', 'features']
      },
      supabase: {
        enabled: answers.enableSupabase,
        projectId: null
      },
      analysis: {
        includePatterns: ['src/**/*', 'app/**/*', 'lib/**/*'],
        excludePatterns: ['node_modules/**', 'dist/**', '.next/**', 'build/**']
      },
      generation: {
        aiModel: 'Claude Sonnet 3.5 / GPT-4',
        includeMetadata: true
      }
    };

    const spinner = ora('Creating configuration...').start();

    // Create devcache_docs directory structure
    const docsDir = 'devcache_docs';
    const templatesDir = path.join(docsDir, 'templates');
    const projectDir = path.join(docsDir, answers.projectName);
    
    // Create project subdirectories
    await fs.mkdir(templatesDir, { recursive: true });
    await fs.mkdir(projectDir, { recursive: true });
    await fs.mkdir(path.join(projectDir, 'general'), { recursive: true });
    await fs.mkdir(path.join(projectDir, 'tech'), { recursive: true });
    await fs.mkdir(path.join(projectDir, 'features'), { recursive: true });

    // Copy template files from package to project
    const packageTemplatesPath = path.join(__dirname, '../../../templates');
    
    // Helper function to copy directory recursively
    async function copyDir(src: string, dest: string) {
      await fs.mkdir(dest, { recursive: true });
      const entries = await fs.readdir(src, { withFileTypes: true });
      
      for (const entry of entries) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);
        
        if (entry.isDirectory()) {
          await copyDir(srcPath, destPath);
        } else {
          await fs.copyFile(srcPath, destPath);
        }
      }
    }

    try {
      // Copy general templates
      await copyDir(
        path.join(packageTemplatesPath, 'general'),
        path.join(templatesDir, 'general')
      );

      // Copy tech templates
      await copyDir(
        path.join(packageTemplatesPath, 'tech'),
        path.join(templatesDir, 'tech')
      );

      // Copy orchestrator template
      const orchestratorSource = path.join(packageTemplatesPath, 'orchestrator.md');
      const orchestratorDest = path.join(templatesDir, 'orchestrator.md');
      
      try {
        await fs.copyFile(orchestratorSource, orchestratorDest);
      } catch (error) {
        // If orchestrator doesn't exist in package, create a basic one
        console.warn(chalk.yellow('Warning: orchestrator.md not found in package, creating basic version'));
        const basicOrchestrator = `# Orchestrator Template

## Purpose
This template defines the orchestrator's role in managing and reviewing documentation generation.

## Responsibilities
- Authorize document creation based on project analysis
- Review generated documents for quality and completeness
- Ensure consistency across all documentation
- Validate that templates are properly applied

## Workflow
1. Analyze project structure and requirements
2. Select appropriate templates for documentation
3. Authorize document generation
4. Review generated content
5. Approve or request revisions
`;
        await fs.writeFile(orchestratorDest, basicOrchestrator, 'utf-8');
      }
      
      // Copy README if exists
      try {
        const readmeSource = path.join(packageTemplatesPath, 'README.md');
        const readmeDest = path.join(templatesDir, 'README.md');
        await fs.copyFile(readmeSource, readmeDest);
      } catch (error) {
        // README is optional
      }

      // Create index file for navigation
      const indexContent = `# ${answers.projectName} Documentation Index

## Project Information
- **Name**: ${answers.projectName}
- **Description**: ${answers.description || 'No description provided'}
- **Generated**: ${new Date().toISOString()}

---

## 🚨 IMPORTANT: File Creation Instructions

### Where to Create Documentation Files

**ALL documentation files MUST be created in the following structure:**

\`\`\`
devcache_docs/${answers.projectName}/
├── index.md                    ← Project index (auto-generated)
├── general/                    ← General documentation folder
│   ├── project-overview.md     ← Create here
│   └── project-impact.md       ← Create here
├── tech/                       ← Technical documentation folder
│   ├── architecture-project.md ← Create here
│   ├── stack-project.md        ← Create here
│   └── features.md             ← Create here (overview)
└── features/                   ← Individual feature documentation
    ├── feature-name-1.md       ← Create here (for high-impact features)
    ├── feature-name-2.md       ← Create here
    └── ...
\`\`\`

### File Creation Rules

1. **Read Configuration First**
   - Open \`.devcache.json\` in project root
   - Extract \`projectName\` value
   - Use this to construct paths

2. **Construct Correct Paths**
   - Base path: \`devcache_docs/${answers.projectName}/\`
   - General docs: \`devcache_docs/${answers.projectName}/general/\`
   - Tech docs: \`devcache_docs/${answers.projectName}/tech/\`
   - Features: \`devcache_docs/${answers.projectName}/features/\`

3. **Never Create Files In**
   - ❌ Project root
   - ❌ \`docs/\` folder
   - ❌ \`devcache_docs/\` root (without project name)
   - ❌ Any other location

### Example File Paths

**Correct:**
- ✅ \`devcache_docs/${answers.projectName}/general/project-overview.md\`
- ✅ \`devcache_docs/${answers.projectName}/tech/architecture-project.md\`
- ✅ \`devcache_docs/${answers.projectName}/features/authentication.md\`

**Wrong:**
- ❌ \`docs/project-overview.md\`
- ❌ \`devcache_docs/project-overview.md\`
- ❌ \`project-overview.md\`

---

## Documentation Structure

### Templates
Templates are located in \`devcache_docs/templates/\` and define how documentation should be generated.

All templates are in **Markdown format (.md)** with detailed instructions for analysis, extraction, and validation.

- **General Templates**: High-level project documentation
  - project-overview-template.md
  - project-impact-template.md

- **Tech Templates**: Technical documentation
  - stack-project-template.md
  - architecture-project-template.md
  - features-template.md

- **Orchestrator**: Manages and reviews all documentation generation (orchestrator.md)
- **README**: Complete guide to the template system (README.md)

### Project Documentation
Project-specific documentation will be generated in: \`devcache_docs/${answers.projectName}/\`

**Folder Structure:**
- \`general/\` - High-level overview and business context
- \`tech/\` - Technical architecture and implementation
- \`features/\` - Individual feature documentation (for high-impact features)

## Template System

The template system uses **Markdown files** with:
- Detailed analysis instructions for each section
- Built-in security validation rules
- Example outputs for guidance
- Cross-document consistency checks
- Clear dependencies between templates

See \`templates/README.md\` for complete documentation on creating and using templates.

## Security

All templates include comprehensive security validation to ensure:
- ❌ No API keys or tokens are exposed
- ❌ No credentials in documentation
- ❌ No database connection strings with passwords
- ❌ No sensitive business logic is revealed
- ✅ Environment variables are referenced by name only
- ✅ Generic examples are used instead of real data

## Template Execution Order

The orchestrator executes templates in this order:
1. **project-overview-template.md** (Priority 1) - Foundation for all docs
2. **project-impact-template.md** (Priority 2) - Business justification
3. **stack-project-template.md** (Priority 2) - Technology inventory
4. **architecture-project-template.md** (Priority 3) - System design
5. **features-template.md** (Priority 4) - Functionality documentation + individual feature files

## Features Documentation

The features template generates TWO types of documentation:

1. **Main Overview** (\`tech/features.md\`)
   - Complete list of all features
   - Impact scores and rankings
   - Brief descriptions
   - Links to detailed docs

2. **Individual Feature Docs** (\`features/[feature-name].md\`)
   - Created for features with impact ≥ 6
   - Detailed implementation information
   - Configuration steps
   - Integration points
   - Security considerations

## Next Steps
1. Review \`templates/README.md\` to understand the template system
2. Review \`templates/orchestrator.md\` to understand the orchestration process
3. Run \`devcache generate\` to create documentation based on templates
4. The orchestrator will validate and approve each document
5. Review generated documentation in \`${answers.projectName}/\` directory

## Navigation
- [Templates Directory](./templates/)
- [Template System Guide](./templates/README.md)
- [Orchestrator Documentation](./templates/orchestrator.md)
- [Project Documentation](./${answers.projectName}/)
`;

      await fs.writeFile(
        path.join(docsDir, 'index.md'),
        indexContent,
        'utf-8'
      );

      // Write config file in project root (not inside devcache_docs)
      await fs.writeFile(
        path.join(process.cwd(), '.devcache.json'),
        JSON.stringify(config, null, 2),
        'utf-8'
      );
      
      // Also write a copy inside devcache_docs for reference
      await fs.writeFile(
        path.join(docsDir, '.devcache.json'),
        JSON.stringify(config, null, 2),
        'utf-8'
      );

    } catch (error) {
      spinner.fail(chalk.red('Failed to copy templates'));
      throw error;
    }

    spinner.succeed(chalk.green('Configuration created successfully!'));

    console.log(chalk.blue('\n📁 Created structure:'));
    console.log(chalk.gray('  devcache_docs/'));
    console.log(chalk.gray('  ├── templates/'));
    console.log(chalk.gray('  │   ├── general/'));
    console.log(chalk.gray('  │   ├── tech/'));
    console.log(chalk.gray('  │   └── orchestrator.md'));
    console.log(chalk.gray(`  ├── ${answers.projectName}/`));
    console.log(chalk.gray(`  │   ├── general/          ← Create general docs here`));
    console.log(chalk.gray(`  │   ├── tech/             ← Create tech docs here`));
    console.log(chalk.gray(`  │   └── features/         ← Create feature docs here`));
    console.log(chalk.gray('  ├── index.md'));
    console.log(chalk.gray('  └── .devcache.json'));

    console.log(chalk.blue('\n📝 Next steps:'));
    console.log(chalk.gray('  1. Review'), chalk.cyan('devcache_docs/index.md'), chalk.gray('for navigation'));
    console.log(chalk.gray('  2. Run'), chalk.cyan('devcache generate'), chalk.gray('to create documentation'));
    console.log(chalk.gray('  3. Run'), chalk.cyan('devcache login'), chalk.gray('to authenticate with Supabase'));
    console.log(chalk.gray('  4. Run'), chalk.cyan('devcache push'), chalk.gray('to sync documentation to cloud'));
    
    if (!answers.enableSupabase) {
      console.log(chalk.yellow('\n💡 Note: Supabase sync is disabled, but you can still use'), chalk.cyan('devcache push'));
      console.log(chalk.yellow('   after running'), chalk.cyan('devcache login'), chalk.yellow('if you change your mind.'));
    }
    console.log();

  } catch (error) {
    console.error(chalk.red('Initialization failed:'), error);
    process.exit(1);
  }
}
