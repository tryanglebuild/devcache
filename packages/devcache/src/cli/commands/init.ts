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

    // Create .devcache directory
    await fs.mkdir('.devcache', { recursive: true });

    // Write config file
    await fs.writeFile(
      '.devcache.json',
      JSON.stringify(config, null, 2),
      'utf-8'
    );

    // Create output directory
    await fs.mkdir(config.outputDir, { recursive: true });

    spinner.succeed(chalk.green('Configuration created successfully!'));

    console.log(chalk.blue('\n📝 Next steps:'));
    console.log(chalk.gray('  1. Run'), chalk.cyan('devcache generate'), chalk.gray('to create documentation'));
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
