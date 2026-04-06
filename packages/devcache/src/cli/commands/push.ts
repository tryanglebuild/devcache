import chalk from 'chalk';
import ora from 'ora';
import path from 'path';
import fs from 'fs/promises';
import { getSupabaseClient } from '../../supabase/client';
import { StorageManager } from '../../supabase/storage';
import { ConfigManager, Logger } from '../../utils';

export async function pushCommand() {
  const spinner = ora('Initializing...').start();

  try {
    // Initialize Supabase client
    const supabase = getSupabaseClient();
    await supabase.initialize();

    // Check authentication
    spinner.text = 'Checking authentication...';
    const session = await supabase.getSession();

    if (!session) {
      spinner.fail('Not authenticated');
      console.log(chalk.yellow('\nPlease run'), chalk.cyan('devcache-hub login'), chalk.yellow('first.'));
      process.exit(1);
    }

    Logger.debug(`Authenticated as: ${session.email}`);

    // Load configuration
    spinner.text = 'Loading configuration...';
    const config = await ConfigManager.readConfig();

    // Check if documentation exists
    const projectPath = path.join(process.cwd(), config.outputDir, config.projectName);
    
    try {
      await fs.access(projectPath);
    } catch (error) {
      spinner.fail('No documentation found');
      console.log(chalk.yellow('\nPlease run'), chalk.cyan('devcache-hub generate'), chalk.yellow('first.'));
      process.exit(1);
    }

    // Read index.md file
    spinner.text = 'Reading documentation files...';
    const indexPath = path.join(projectPath, 'index.md');
    let indexContent: string;
    
    try {
      indexContent = await fs.readFile(indexPath, 'utf-8');
    } catch (error) {
      spinner.fail('index.md not found');
      console.log(chalk.yellow('\nPlease run'), chalk.cyan('devcache-hub generate'), chalk.yellow('to create documentation.'));
      process.exit(1);
    }

    // Read all documentation files
    const files: Array<{ category: 'general' | 'tech'; filename: string; content: string }> = [];

    const categories: Array<'general' | 'tech'> = ['general', 'tech'];
    
    for (const category of categories) {
      const categoryPath = path.join(projectPath, category);
      
      try {
        const fileNames = await fs.readdir(categoryPath);
        
        for (const filename of fileNames) {
          if (filename.endsWith('.md')) {
            const filePath = path.join(categoryPath, filename);
            const content = await fs.readFile(filePath, 'utf-8');
            files.push({ category, filename, content });
          }
        }
      } catch (error) {
        Logger.warn(`Category folder not found: ${category}`);
      }
    }

    if (files.length === 0) {
      spinner.fail('No documentation files found');
      process.exit(1);
    }

    Logger.debug(`Found ${files.length} documentation files + index.md`);

    // Upload to Supabase
    spinner.text = 'Uploading to Supabase...';
    const storage = new StorageManager(supabase);

    const projectId = await storage.uploadDocumentation(
      config.projectName,
      files,
      indexContent,
      config.description
    );

    spinner.succeed(chalk.green('Documentation pushed successfully!'));

    // Get project URL
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://devcache.vercel.app';
    console.log(chalk.blue('\n✨ View your project at:'));
    console.log(chalk.cyan(`  ${appUrl}/dashboard/projects/file/${projectId}`));
    console.log();

  } catch (error: any) {
    spinner.fail(chalk.red('Push failed'));
    Logger.error(error.message);
    
    if (error.message.includes('not initialized')) {
      console.log(chalk.yellow('\nRun'), chalk.cyan('devcache-hub init'), chalk.yellow('first to initialize the project.'));
    } else if (error.message.includes('Not authenticated')) {
      console.log(chalk.yellow('\nRun'), chalk.cyan('devcache-hub login'), chalk.yellow('to authenticate.'));
    }
    
    process.exit(1);
  }
}
