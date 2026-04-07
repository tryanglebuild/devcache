import chalk from 'chalk';
import ora from 'ora';
import fs from 'fs/promises';
import path from 'path';
import inquirer from 'inquirer';
import { getSupabaseClient } from '../../supabase/client';
import { Logger } from '../../utils';

const CACHE_FILE = '.devcache/status-cache.json';

/**
 * Refresh cache - Clear status cache
 */
async function refreshCache(): Promise<void> {
  const spinner = ora('Clearing status cache...').start();

  try {
    const cachePath = path.join(process.cwd(), CACHE_FILE);

    try {
      await fs.unlink(cachePath);
      spinner.succeed(chalk.green('✓ Status cache cleared'));
      console.log(chalk.gray('\nNext ' + chalk.cyan('devcache status') + ' will show all files as new.'));
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        spinner.info(chalk.yellow('No cache file found'));
        console.log(chalk.gray('\nCache was already empty.'));
      } else {
        throw error;
      }
    }
  } catch (error: any) {
    spinner.fail(chalk.red('Failed to clear cache'));
    Logger.error(error.message);
    process.exit(1);
  }
}

/**
 * Refresh profile - Refresh user session
 */
async function refreshProfile(): Promise<void> {
  const spinner = ora('Refreshing session...').start();

  try {
    // Initialize Supabase client
    const supabase = getSupabaseClient();
    await supabase.initialize();

    // Check if user is authenticated
    const session = await supabase.getSession();

    if (!session) {
      spinner.fail(chalk.red('Not authenticated'));
      console.log(chalk.yellow('\nPlease run'), chalk.cyan('devcache login'), chalk.yellow('to authenticate.'));
      process.exit(1);
    }

    spinner.text = 'Refreshing authentication token...';

    // The getSession() method already refreshes the token if needed
    // Force a refresh by getting the client and checking auth
    const client = supabase.getClient();
    const { data, error } = await client.auth.refreshSession();

    if (error) {
      spinner.fail(chalk.red('Session refresh failed'));
      console.log(chalk.red(`\nError: ${error.message}`));
      console.log(chalk.yellow('\nPlease run'), chalk.cyan('devcache login'), chalk.yellow('again.'));
      process.exit(1);
    }

    if (data.session) {
      spinner.succeed(chalk.green('✓ Session refreshed successfully'));
      console.log(chalk.gray(`\nLogged in as: ${session.email}`));
      console.log(chalk.gray(`New expiry: ${new Date(data.session.expires_at! * 1000).toLocaleString()}`));
    } else {
      spinner.fail(chalk.red('Session refresh failed'));
      console.log(chalk.yellow('\nPlease run'), chalk.cyan('devcache login'), chalk.yellow('again.'));
      process.exit(1);
    }
  } catch (error: any) {
    spinner.fail(chalk.red('Refresh failed'));
    Logger.error(error.message);
    
    if (error.message.includes('expired')) {
      console.log(chalk.yellow('\nSession expired. Please run'), chalk.cyan('devcache login'), chalk.yellow('again.'));
    }
    
    process.exit(1);
  }
}

/**
 * Refresh all - Clear cache and refresh session
 */
async function refreshAll(): Promise<void> {
  console.log(chalk.blue.bold('\n🔄 Refreshing Everything\n'));

  // Refresh cache
  await refreshCache();
  console.log();

  // Refresh profile
  await refreshProfile();
  
  console.log(chalk.green.bold('\n✅ All refreshed successfully!\n'));
}

/**
 * Main refresh command with interactive menu
 */
export async function refreshCommand(options: { cache?: boolean; profile?: boolean; all?: boolean }) {
  // If specific flags are provided, execute directly
  if (options.cache) {
    console.log(chalk.blue.bold('\n🔄 Refresh Cache\n'));
    await refreshCache();
    console.log();
    return;
  }

  if (options.profile) {
    console.log(chalk.blue.bold('\n🔄 Refresh Profile\n'));
    await refreshProfile();
    console.log();
    return;
  }

  if (options.all) {
    await refreshAll();
    return;
  }

  // Interactive menu if no flags provided
  console.log(chalk.blue.bold('\n🔄 DevCache Refresh\n'));
  console.log(chalk.gray('Choose what to refresh:\n'));

  const { action } = await inquirer.prompt([
    {
      type: 'list',
      name: 'action',
      message: 'What would you like to refresh?',
      choices: [
        {
          name: '🗑️  Cache - Clear status cache',
          value: 'cache',
        },
        {
          name: '👤 Profile - Refresh user session',
          value: 'profile',
        },
        {
          name: '🔄 All - Refresh everything',
          value: 'all',
        },
        {
          name: '❌ Cancel',
          value: 'cancel',
        },
      ],
    },
  ]);

  if (action === 'cancel') {
    console.log(chalk.gray('\nCancelled.\n'));
    return;
  }

  console.log();

  switch (action) {
    case 'cache':
      await refreshCache();
      break;
    case 'profile':
      await refreshProfile();
      break;
    case 'all':
      await refreshAll();
      break;
  }

  console.log();
}
