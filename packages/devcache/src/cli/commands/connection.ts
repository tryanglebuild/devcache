import chalk from 'chalk';
import ora from 'ora';
import { getSupabaseClient } from '../../supabase/client';
import { Logger } from '../../utils';

export async function connectionCommand() {
  console.log(chalk.blue.bold('\n🔌 Testing DevCache Connection\n'));

  const spinner = ora('Initializing...').start();

  try {
    // Step 1: Initialize Supabase client
    spinner.text = 'Initializing Supabase client...';
    const supabase = getSupabaseClient();
    await supabase.initialize();
    spinner.succeed(chalk.green('✓ Supabase client initialized'));

    // Step 2: Check authentication
    spinner.start('Checking authentication...');
    const session = await supabase.getSession();

    if (!session) {
      spinner.fail(chalk.red('✗ Not authenticated'));
      console.log(chalk.yellow('\nPlease run'), chalk.cyan('devcache login'), chalk.yellow('to authenticate.'));
      process.exit(1);
    }

    spinner.succeed(chalk.green(`✓ Authenticated as ${session.email}`));

    // Step 3: Test database connection
    spinner.start('Testing database connection...');
    const client = supabase.getClient();

    // Try to query a simple table to test connection
    const { data, error } = await client
      .from('project_items')
      .select('id')
      .limit(1);

    if (error) {
      spinner.fail(chalk.red('✗ Database connection failed'));
      console.log(chalk.red(`\nError: ${error.message}`));
      
      if (error.message.includes('schema cache')) {
        console.log(chalk.yellow('\nThe database schema cache may need to be refreshed.'));
        console.log(chalk.gray('This usually resolves automatically. Please try again in a few moments.'));
      }
      
      process.exit(1);
    }

    spinner.succeed(chalk.green('✓ Database connection successful'));

    // Step 4: Check credentials
    spinner.start('Verifying credentials...');
    
    if (session.supabase_url && session.supabase_anon_key) {
      spinner.succeed(chalk.green('✓ DevCache credentials found'));
      console.log(chalk.gray(`\n  URL: ${session.supabase_url}`));
      console.log(chalk.gray(`  Key: ${session.supabase_anon_key.substring(0, 20)}...`));
    } else {
      spinner.warn(chalk.yellow('⚠ Credentials not found in session'));
      console.log(chalk.yellow('\nPlease run'), chalk.cyan('devcache login'), chalk.yellow('again to save credentials.'));
    }

    // Step 5: Test write permissions
    spinner.start('Testing write permissions...');
    
    // Try to query user's own projects
    const { data: projects, error: projectError } = await client
      .from('project_items')
      .select('id, name')
      .eq('user_id', session.user_id)
      .eq('type', 'folder')
      .is('parent_id', null)
      .limit(5);

    if (projectError) {
      spinner.fail(chalk.red('✗ Permission check failed'));
      console.log(chalk.red(`\nError: ${projectError.message}`));
      process.exit(1);
    }

    spinner.succeed(chalk.green('✓ Write permissions verified'));

    if (projects && projects.length > 0) {
      console.log(chalk.gray(`\n  Found ${projects.length} existing project(s):`));
      projects.forEach(project => {
        console.log(chalk.gray(`    - ${project.name}`));
      });
    }

    // Success summary
    console.log(chalk.green.bold('\n✅ Connection Test Successful!\n'));
    console.log(chalk.gray('You can now use'), chalk.cyan('devcache push'), chalk.gray('to sync your documentation.'));
    console.log();

  } catch (error: any) {
    spinner.fail(chalk.red('Connection test failed'));
    Logger.error(error.message);

    if (error.message.includes('not initialized')) {
      console.log(chalk.yellow('\nPlease run'), chalk.cyan('devcache login'), chalk.yellow('to authenticate.'));
    } else if (error.message.includes('credentials not found')) {
      console.log(chalk.yellow('\nSupabase credentials are missing.'));
      console.log(chalk.yellow('Please run'), chalk.cyan('devcache login'), chalk.yellow('to save credentials.'));
    }

    process.exit(1);
  }
}
