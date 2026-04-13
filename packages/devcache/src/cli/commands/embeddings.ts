// 'devcache embeddings' command — displays embedding coverage statistics for the user's
// project files and public agent templates, and shows the recent cron job history.
// 'devcache embeddings --trigger' manually fires the embedding generation API endpoint
// instead of waiting for the scheduled cron job.

import chalk from 'chalk';
import ora from 'ora';
import { getSupabaseClient } from '../../supabase/client';
import { Logger } from '../../utils';

interface EmbeddingStats {
  total_agents: number;
  agents_with_embeddings: number;
  agents_pending: number;
  total_project_items: number;
  project_items_with_embeddings: number;
  project_items_pending: number;
  last_check: string;
}

interface CronLog {
  id: string;
  run_at: string;
  items_processed: number;
  items_succeeded: number;
  items_failed: number;
  execution_time_ms: number;
  error_message: string | null;
}

export async function embeddingsCommand() {
  console.log(chalk.blue.bold('\n📊 Embedding Statistics\n'));

  const spinner = ora('Fetching embedding data...').start();

  try {
    // Initialize Supabase client
    const supabase = getSupabaseClient();
    await supabase.initialize();

    // Check authentication
    const session = await supabase.getSession();

    if (!session) {
      spinner.fail('Not authenticated');
      console.log(chalk.yellow('\nPlease run'), chalk.cyan('devcache login'), chalk.yellow('first.'));
      process.exit(1);
    }

    // Get embedding statistics
    const { data: statsData, error: statsError } = await supabase
      .getClient()
      .rpc('get_embedding_stats');

    if (statsError) {
      throw new Error(`Failed to fetch stats: ${statsError.message}`);
    }

    const stats: EmbeddingStats = statsData?.[0];

    if (!stats) {
      spinner.fail('No statistics available');
      process.exit(1);
    }

    // Get recent cron logs
    const { data: cronLogs, error: logsError } = await supabase
      .getClient()
      .from('embedding_cron_logs')
      .select('*')
      .order('run_at', { ascending: false })
      .limit(5);

    spinner.succeed('Statistics retrieved');

    // Display Project Items Statistics
    console.log(chalk.blue.bold('\n📁 Your Project Files:\n'));

    const projectItemsPercentage = stats.total_project_items > 0
      ? Math.round((stats.project_items_with_embeddings / stats.total_project_items) * 100)
      : 0;

    console.log(chalk.gray('  Total files:'), chalk.white(stats.total_project_items));
    console.log(chalk.gray('  With embeddings:'), chalk.green(`${stats.project_items_with_embeddings} (${projectItemsPercentage}%)`));
    console.log(chalk.gray('  Pending:'), stats.project_items_pending > 0 
      ? chalk.yellow(stats.project_items_pending)
      : chalk.green('0 ✓'));

    // Display visual progress bar for project items
    const barLength = 30;
    const filledLength = Math.round((projectItemsPercentage / 100) * barLength);
    const emptyLength = barLength - filledLength;
    const progressBar = '█'.repeat(filledLength) + '░'.repeat(emptyLength);
    
    console.log(chalk.gray('\n  Progress: ') + chalk.green(progressBar) + chalk.gray(` ${projectItemsPercentage}%`));

    // Display Agent Templates Statistics
    console.log(chalk.blue.bold('\n🤖 Agent Templates (Public):\n'));

    const agentsPercentage = stats.total_agents > 0
      ? Math.round((stats.agents_with_embeddings / stats.total_agents) * 100)
      : 0;

    console.log(chalk.gray('  Total agents:'), chalk.white(stats.total_agents));
    console.log(chalk.gray('  With embeddings:'), chalk.green(`${stats.agents_with_embeddings} (${agentsPercentage}%)`));
    console.log(chalk.gray('  Pending:'), stats.agents_pending > 0 
      ? chalk.yellow(stats.agents_pending)
      : chalk.green('0 ✓'));

    // Display status message
    console.log(chalk.blue.bold('\n📈 Status:\n'));

    if (stats.project_items_pending === 0 && stats.agents_pending === 0) {
      console.log(chalk.green('  ✓ All items have embeddings!'));
      console.log(chalk.gray('  Your files are fully searchable by AI.'));
    } else {
      const totalPending = stats.project_items_pending + stats.agents_pending;
      console.log(chalk.yellow(`  ⚠ ${totalPending} item(s) pending embedding generation`));
      console.log(chalk.gray('  Embeddings are generated automatically in the background.'));
      console.log(chalk.gray('  Run'), chalk.cyan('devcache embeddings --trigger'), chalk.gray('to process them now.'));
    }

    // Display recent cron runs
    if (cronLogs && cronLogs.length > 0) {
      console.log(chalk.blue.bold('\n🕐 Recent Embedding Jobs:\n'));

      cronLogs.slice(0, 3).forEach((log: CronLog) => {
        const date = new Date(log.run_at).toLocaleString();
        const status = log.error_message 
          ? chalk.red('✗ Failed')
          : chalk.green('✓ Success');
        
        console.log(chalk.gray(`  ${date}`));
        console.log(chalk.gray('    Status:'), status);
        console.log(chalk.gray('    Processed:'), chalk.white(log.items_processed));
        console.log(chalk.gray('    Succeeded:'), chalk.green(log.items_succeeded));
        if (log.items_failed > 0) {
          console.log(chalk.gray('    Failed:'), chalk.red(log.items_failed));
        }
        console.log(chalk.gray('    Time:'), chalk.white(`${log.execution_time_ms}ms`));
        console.log();
      });
    }

    // Display last check time
    console.log(chalk.gray(`Last updated: ${new Date(stats.last_check).toLocaleString()}\n`));

  } catch (error: any) {
    spinner.fail(chalk.red('Failed to fetch statistics'));
    Logger.error(error.message);
    
    if (error.message.includes('not initialized')) {
      console.log(chalk.yellow('\nRun'), chalk.cyan('devcache init'), chalk.yellow('first to initialize the project.'));
    } else if (error.message.includes('Not authenticated')) {
      console.log(chalk.yellow('\nRun'), chalk.cyan('devcache login'), chalk.yellow('to authenticate.'));
    }
    
    process.exit(1);
  }
}

// Manually triggers the embedding generation endpoint (normally run by cron).
// Useful after a large push when the user doesn't want to wait for the next scheduled run.
export async function triggerEmbeddingsCommand() {
  console.log(chalk.blue.bold('\n🚀 Triggering Embedding Generation\n'));

  const spinner = ora('Initializing...').start();

  try {
    // Initialize Supabase client
    const supabase = getSupabaseClient();
    await supabase.initialize();

    // Check authentication
    const session = await supabase.getSession();

    if (!session) {
      spinner.fail('Not authenticated');
      console.log(chalk.yellow('\nPlease run'), chalk.cyan('devcache login'), chalk.yellow('first.'));
      process.exit(1);
    }

    spinner.text = 'Triggering embedding generation...';

    // Get base URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://devcache.dev';

    // Trigger the cron job manually
    const response = await fetch(`${baseUrl}/api/embeddings/cron-trigger`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ max_items: 100 }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to trigger embeddings: ${errorText}`);
    }

    const result = await response.json();

    spinner.succeed(chalk.green('Embedding generation triggered!'));

    console.log(chalk.blue('\n📊 Results:\n'));
    console.log(chalk.gray('  Processed:'), chalk.white(result.result?.processed || 0));
    console.log(chalk.gray('  Succeeded:'), chalk.green(result.result?.succeeded || 0));
    
    if (result.result?.failed > 0) {
      console.log(chalk.gray('  Failed:'), chalk.red(result.result.failed));
    }

    console.log(chalk.gray('  Time:'), chalk.white(`${result.result?.execution_time_ms || 0}ms`));

    if (result.result?.succeeded > 0) {
      console.log(chalk.green('\n✓ Your files are now searchable by AI!'));
    } else if (result.result?.processed === 0) {
      console.log(chalk.green('\n✓ No pending items found. All embeddings are up to date!'));
    }

    console.log();

  } catch (error: any) {
    spinner.fail(chalk.red('Failed to trigger embeddings'));
    Logger.error(error.message);
    
    console.log(chalk.yellow('\nTip: Embeddings are generated automatically in the background.'));
    console.log(chalk.yellow('You can also wait for the weekly cron job to process them.'));
    
    process.exit(1);
  }
}
