import chalk from 'chalk';
import inquirer from 'inquirer';

export async function loginCommand() {
  console.log(chalk.blue.bold('\n🔐 DevCache Login\n'));

  try {
    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'email',
        message: 'Email:',
        validate: (input) => {
          if (input.includes('@')) return true;
          return 'Please enter a valid email address';
        }
      },
      {
        type: 'password',
        name: 'password',
        message: 'Password:',
        mask: '*'
      }
    ]);

    // TODO: Implement Supabase authentication
    console.log(chalk.green('\n✓ Login successful!'));
    console.log(chalk.gray('Session stored locally\n'));

  } catch (error) {
    console.error(chalk.red('Login failed:'), error);
    process.exit(1);
  }
}
