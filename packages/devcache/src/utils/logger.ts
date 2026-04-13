// Thin wrapper around console.log that adds coloured prefix icons for each log level.
// debug() is suppressed unless the DEBUG environment variable is set.

import chalk from 'chalk';

export class Logger {
  static info(message: string): void {
    console.log(chalk.blue('ℹ'), message);
  }

  static success(message: string): void {
    console.log(chalk.green('✓'), message);
  }

  static error(message: string): void {
    console.log(chalk.red('✗'), message);
  }

  static warn(message: string): void {
    console.log(chalk.yellow('⚠'), message);
  }

  static debug(message: string): void {
    if (process.env.DEBUG) {
      console.log(chalk.gray('🔍'), message);
    }
  }

  static section(title: string): void {
    console.log('\n' + chalk.bold.cyan(title));
  }
}
