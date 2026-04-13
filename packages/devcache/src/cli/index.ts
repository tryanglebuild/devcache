#!/usr/bin/env node
// CLI entry point for the 'devcache' command.
// Registers all subcommands (init, generate, push, login, etc.) using the commander library.
// Session credentials are stored in ~/.devcache/session.json after login.

import { Command } from 'commander';
import { initCommand } from './commands/init';
import { generateCommand } from './commands/generate';
import { pushCommand } from './commands/push';
import { loginCommand } from './commands/login';
import { logoutCommand } from './commands/logout';
import { profileCommand } from './commands/profile';
import { statusCommand } from './commands/status';
import { connectionCommand } from './commands/connection';
import { guideCommand } from './commands/guide';
import { refreshCommand } from './commands/refresh';
import { embeddingsCommand, triggerEmbeddingsCommand } from './commands/embeddings';

// Note: Supabase credentials are now stored securely in ~/.devcache/session.json
// They are saved during login and loaded automatically by the Supabase client

const program = new Command();

program
  .name('devcache')
  .description('Intelligent project documentation generator with cloud sync')
  .version('0.16.1');

program
  .command('init')
  .description('Initialize DevCache in your project')
  .action(initCommand);

program
  .command('generate')
  .description('Generate project documentation')
  .action(generateCommand);

program
  .command('push')
  .description('Push documentation to Supabase')
  .action(pushCommand);

program
  .command('login')
  .description('Authenticate with Supabase')
  .action(loginCommand);

program
  .command('logout')
  .description('Logout and clear session')
  .action(logoutCommand);

program
  .command('profile')
  .description('Display user profile information')
  .action(profileCommand);

program
  .command('status')
  .description('Check documentation status and pending changes')
  .action(statusCommand);

program
  .command('connection')
  .description('Test connection to DevCache database')
  .action(connectionCommand);

program
  .command('guide')
  .description('Interactive guide for using DevCache')
  .action(guideCommand);

program
  .command('refresh')
  .description('Refresh cache, session, or everything')
  .option('-c, --cache', 'Clear status cache')
  .option('-p, --profile', 'Refresh user session')
  .option('-a, --all', 'Refresh everything')
  .action(refreshCommand);

program
  .command('embeddings')
  .description('View embedding statistics for your files')
  .option('-t, --trigger', 'Trigger immediate embedding generation')
  .action((options) => {
    if (options.trigger) {
      triggerEmbeddingsCommand();
    } else {
      embeddingsCommand();
    }
  });

program.parse(process.argv);
