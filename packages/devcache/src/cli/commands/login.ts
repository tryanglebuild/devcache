import chalk from 'chalk';
import inquirer from 'inquirer';
import ora from 'ora';
import { getSupabaseClient } from '../../supabase/client';
import { OAuthFlow } from '../../supabase/oauth';
import { Logger } from '../../utils';

const DEFAULT_APP_URL = 'https://devcache.vercel.app'; // Your production URL

export async function loginCommand() {
  console.log(chalk.blue.bold('\n🔐 DevCache Login\n'));

  try {
    // Initialize Supabase client
    const supabase = getSupabaseClient();
    await supabase.initialize();

    // Check if already logged in
    const existingSession = await supabase.getSession();
    if (existingSession) {
      const { relogin } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'relogin',
          message: `Already logged in as ${existingSession.email}. Login with different account?`,
          default: false,
        },
      ]);

      if (!relogin) {
        Logger.success('Already authenticated');
        return;
      }

      await supabase.clearSession();
    }

    // Ask for authentication method
    const { method } = await inquirer.prompt([
      {
        type: 'list',
        name: 'method',
        message: 'Choose authentication method:',
        choices: [
          { name: 'Browser (OAuth) - Recommended', value: 'oauth' },
          { name: 'Email & Password', value: 'password' },
        ],
        default: 'oauth',
      },
    ]);

    if (method === 'oauth') {
      // OAuth flow
      console.log(chalk.gray('\nOpening browser for authentication...'));
      console.log(chalk.gray('If browser doesn\'t open, copy the URL from the terminal.\n'));

      const oauth = new OAuthFlow();
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || DEFAULT_APP_URL;

      const spinner = ora('Waiting for authentication...').start();

      try {
        const session = await oauth.startFlow(appUrl);
        
        // Save session
        await supabase.saveOAuthSession(session);

        spinner.succeed(chalk.green('Login successful!'));
        console.log(chalk.gray(`\nLogged in as: ${session.email}`));
        console.log(chalk.gray('Session stored locally\n'));
      } catch (error: any) {
        spinner.fail('Authentication failed');
        throw error;
      }
    } else {
      // Password flow
      const answers = await inquirer.prompt([
        {
          type: 'input',
          name: 'email',
          message: 'Email:',
          validate: (input) => {
            if (input.includes('@')) return true;
            return 'Please enter a valid email address';
          },
        },
        {
          type: 'password',
          name: 'password',
          message: 'Password:',
          mask: '*',
        },
      ]);

      const spinner = ora('Authenticating...').start();

      // Authenticate
      const session = await supabase.login(answers.email, answers.password);

      spinner.succeed(chalk.green('Login successful!'));
      console.log(chalk.gray(`\nLogged in as: ${session.email}`));
      console.log(chalk.gray('Session stored locally\n'));
    }

  } catch (error: any) {
    Logger.error(`Login failed: ${error.message}`);
    
    if (error.message.includes('timeout')) {
      console.log(chalk.yellow('\nAuthentication timed out. Please try again.'));
    } else if (error.message.includes('credentials')) {
      console.log(chalk.yellow('\nPlease check your email and password and try again.'));
    }
    
    process.exit(1);
  }
}
