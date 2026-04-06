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
      outputDir: '.devcache/docs',
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
      }
    };

    const spinner = ora('Creating configuration...').start();

    // Create devcache_docs directory structure
    const docsDir = 'devcache_docs';
    const templatesDir = path.join(docsDir, 'templates');
    const projectDir = path.join(docsDir, answers.projectName);
    
    await fs.mkdir(templatesDir, { recursive: true });
    await fs.mkdir(projectDir, { recursive: true });

    // Copy template files from package to project
    const packageTemplatesPath = path.join(__dirname, '../../../templates');
    
    try {
      // Copy general templates
      const generalTemplates = await fs.readdir(path.join(packageTemplatesPath, 'general'));
      await fs.mkdir(path.join(templatesDir, 'general'), { recursive: true });
      
      for (const template of generalTemplates) {
        const source = path.join(packageTemplatesPath, 'general', template);
        const dest = path.join(templatesDir, 'general', template);
        await fs.copyFile(source, dest);
      }

      // Copy tech templates
      const techTemplates = await fs.readdir(path.join(packageTemplatesPath, 'tech'));
      await fs.mkdir(path.join(templatesDir, 'tech'), { recursive: true });
      
      for (const template of techTemplates) {
        const source = path.join(packageTemplatesPath, 'tech', template);
        const dest = path.join(templatesDir, 'tech', template);
        await fs.copyFile(source, dest);
      }

      // Create orchestrator template
      const orchestratorTemplate = `# Orchestrator Template

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

      await fs.writeFile(
        path.join(templatesDir, 'orchestrator.md'),
        orchestratorTemplate,
        'utf-8'
      );

      // Create index file for navigation
      const indexContent = `# ${answers.projectName} Documentation Index

## Project Information
- **Name**: ${answers.projectName}
- **Description**: ${answers.description || 'No description provided'}
- **Generated**: ${new Date().toISOString()}

## Documentation Structure

### Templates
Templates are located in \`devcache_docs/templates/\` and define how documentation should be generated.

- **General Templates**: High-level project documentation
  - project-overview.yaml
  - project-impact.yaml

- **Tech Templates**: Technical documentation
  - architecture-project.yaml
  - stack-project.yaml
  - features.yaml

- **Orchestrator**: Manages and reviews all documentation generation

### Project Documentation
Project-specific documentation will be generated in this directory (\`devcache_docs/${answers.projectName}/\`).

## Next Steps
1. Run \`devcache generate\` to create documentation based on templates
2. Review generated documents in the project folder
3. The orchestrator will validate and approve each document

## Navigation
- [Templates Directory](./templates/)
- [Project Documentation](./${answers.projectName}/)
`;

      await fs.writeFile(
        path.join(docsDir, 'index.md'),
        indexContent,
        'utf-8'
      );

      // Write config file for reference
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
    console.log(chalk.gray('  ├── index.md'));
    console.log(chalk.gray('  └── .devcache.json'));

    console.log(chalk.blue('\n📝 Next steps:'));
    console.log(chalk.gray('  1. Review'), chalk.cyan('devcache_docs/index.md'), chalk.gray('for navigation'));
    console.log(chalk.gray('  2. Run'), chalk.cyan('devcache generate'), chalk.gray('to create documentation'));
    if (answers.enableSupabase) {
      console.log(chalk.gray('  2. Run'), chalk.cyan('devcache login'), chalk.gray('to authenticate'));
      console.log(chalk.gray('  3. Run'), chalk.cyan('devcache push'), chalk.gray('to sync to cloud'));
    }
    console.log();

  } catch (error) {
    console.error(chalk.red('Initialization failed:'), error);
    process.exit(1);
  }
}
