// 'devcache profile' command — displays the currently authenticated user's
// email, user ID, session status, and approximate time until session expiry.

import chalk from 'chalk';
import ora from 'ora';
import { getSupabaseClient } from '../../supabase/client';
import { Logger } from '../../utils';

export async function profileCommand() {
  console.log(chalk.blue.bold('\n👤 User Profile\n'));

  try {
    // Initialize Supabase client
    const supabase = getSupabaseClient();
    await supabase.initialize();

    const spinner = ora('Loading profile...').start();

    // Get current session
    const session = await supabase.getSession();

    if (!session) {
      spinner.fail('Not authenticated');
      console.log(chalk.yellow('\nPlease run'), chalk.cyan('devcache login'), chalk.yellow('first.\n'));
      process.exit(1);
    }

    spinner.succeed('Profile loaded');

    // Display user information
    console.log(chalk.gray('─'.repeat(50)));
    console.log(chalk.cyan('Email:'), chalk.white(session.email));
    console.log(chalk.cyan('User ID:'), chalk.gray(session.user_id));
    
    // Calculate session expiry
    const expiresAt = new Date(session.expires_at * 1000);
    const now = new Date();
    const isExpired = expiresAt < now;
    
    if (isExpired) {
      console.log(chalk.cyan('Session:'), chalk.red('Expired'));
      console.log(chalk.yellow('\nYour session has expired. Please login again.'));
    } else {
      const timeLeft = Math.floor((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60));
      console.log(chalk.cyan('Session:'), chalk.green('Active'));
      console.log(chalk.cyan('Expires in:'), chalk.white(`~${timeLeft} hours`));
    }
    
    console.log(chalk.gray('─'.repeat(50)));
    console.log();

  } catch (error: any) {
    Logger.error(`Failed to load profile: ${error.message}`);
    
    if (error.message.includes('expired')) {
      console.log(chalk.yellow('\nYour session has expired. Please run'), chalk.cyan('devcache login'), chalk.yellow('again.\n'));
    }
    
    process.exit(1);
  }
}
