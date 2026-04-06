import chalk from 'chalk';
import inquirer from 'inquirer';
import ora from 'ora';
import { getSupabaseClient } from '../../supabase/client';
import { Logger } from '../../utils';

export async function logoutCommand() {
  console.log(chalk.blue.bold('\n👋 DevCache Logout\n'));

  try {
    // Initialize Supabase client
    const supabase = getSupabaseClient();
    await supabase.initialize();

    // Check if user is logged in
    const session = await supabase.getSession();
    
    if (!session) {
      Logger.info('Not currently logged in');
      return;
    }

    // Confirm logout
    const { confirm } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirm',
        message: `Logout from ${session.email}?`,
        default: true,
      },
    ]);

    if (!confirm) {
      Logger.info('Logout cancelled');
      return;
    }

    const spinner = ora('Logging out...').start();

    // Clear session
    await supabase.clearSession();

    spinner.succeed(chalk.green('Logged out successfully!'));
    console.log(chalk.gray('Session cleared from local storage\n'));

  } catch (error: any) {
    Logger.error(`Logout failed: ${error.message}`);
    process.exit(1);
  }
}
