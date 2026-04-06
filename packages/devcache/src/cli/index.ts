#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import { initCommand } from './commands/init';
import { generateCommand } from './commands/generate';
import { pushCommand } from './commands/push';
import { loginCommand } from './commands/login';

const program = new Command();

program
  .name('devcache')
  .description('Intelligent project documentation generator with cloud sync')
  .version('0.1.0');

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
  .command('status')
  .description('Check synchronization status')
  .action(() => {
    console.log(chalk.blue('Status command coming soon!'));
  });

program.parse(process.argv);
