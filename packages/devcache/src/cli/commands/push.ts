// 'devcache push' command: reads generated Markdown docs from disk and uploads them to Supabase.
// Creates/updates project_items records and triggers background embedding generation for all files.

import chalk from 'chalk';
import ora from 'ora';
import path from 'path';
import fs from 'fs/promises';
import { getSupabaseClient } from '../../supabase/client';
import { StorageManager } from '../../supabase/storage';
import { ConfigManager, Logger } from '../../utils';
import { updateStatusCache } from './status';

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
    
    // Note: supabase.enabled flag only controls auto-sync behavior
    // Manual push via CLI should always work if user is authenticated
    if (config.supabase.enabled === false) {
      Logger.debug('Supabase sync is disabled in config, but manual push is allowed');
    }

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

    // Read all documentation files recursively
    const files: Array<{ category: 'general' | 'tech'; filename: string; content: string }> = [];

    // Recursive function to read all .md files
    async function readMarkdownFiles(dirPath: string, relativePath: string = ''): Promise<void> {
      try {
        const entries = await fs.readdir(dirPath, { withFileTypes: true });
        
        for (const entry of entries) {
          const fullPath = path.join(dirPath, entry.name);
          const relPath = relativePath ? path.join(relativePath, entry.name) : entry.name;
          
          if (entry.isDirectory()) {
            // Recursively read subdirectories
            await readMarkdownFiles(fullPath, relPath);
          } else if (entry.isFile() && entry.name.endsWith('.md') && entry.name !== 'index.md') {
            // Read markdown file
            const content = await fs.readFile(fullPath, 'utf-8');
            
            // Determine category based on path
            let category: 'general' | 'tech' = 'general';
            if (relPath.startsWith('tech/') || relPath.startsWith('tech\\')) {
              category = 'tech';
            }
            
            files.push({ 
              category, 
              filename: relPath.replace(/\\/g, '/'), // Normalize path separators
              content 
            });
          }
        }
      } catch (error) {
        Logger.warn(`Error reading directory ${dirPath}: ${error}`);
      }
    }

    // Read all files from project directory
    await readMarkdownFiles(projectPath);

    if (files.length === 0) {
      spinner.fail('No documentation files found');
      console.log(chalk.yellow('\nThe project folder exists but contains no .md files.'));
      console.log(chalk.yellow('Please run'), chalk.cyan('devcache generate'), chalk.yellow('to create documentation.'));
      process.exit(1);
    }

    Logger.debug(`Found ${files.length} documentation files + index.md`);

    // Upload to Supabase
    spinner.text = 'Uploading to Supabase...';
    const storage = new StorageManager(supabase);

    const { projectId, uploadedFileIds } = await storage.uploadDocumentation(
      config.projectName,
      files,
      indexContent,
      config.description,
      5 // Process 5 files per chunk
    );

    spinner.succeed(chalk.green('Documentation pushed successfully!'));
    
    console.log(chalk.blue(`\n📊 Upload Summary:`));
    console.log(chalk.gray(`  • Files uploaded: ${uploadedFileIds.length}`));
    console.log(chalk.gray(`  • Embedding generation: In progress (background)`));
    console.log(chalk.yellow(`  • Note: Embeddings will be available in a few moments`));

    // Update status cache
    await updateStatusCache(projectPath);

    // Get project URL
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://devcache.dev';
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
