import chalk from 'chalk';
import ora from 'ora';
import { Orchestrator } from '../../orchestrator';
import {
  ProjectAnalyzer,
  ImpactAnalyzer,
  ArchitectureAnalyzer,
  StackAnalyzer,
  FeaturesAnalyzer,
} from '../../analyzers';
import { Logger } from '../../utils';

export async function generateCommand() {
  const spinner = ora('Initializing...').start();

  try {
    // Initialize orchestrator
    const orchestrator = new Orchestrator(process.cwd());
    await orchestrator.initialize();

    // Register all analyzers
    orchestrator.registerAnalyzer(new ProjectAnalyzer());
    orchestrator.registerAnalyzer(new ImpactAnalyzer());
    orchestrator.registerAnalyzer(new ArchitectureAnalyzer());
    orchestrator.registerAnalyzer(new StackAnalyzer());
    orchestrator.registerAnalyzer(new FeaturesAnalyzer());

    spinner.succeed('Initialized');

    // Run analysis
    const results = await orchestrator.analyze();

    // Display summary
    const summary = orchestrator.getSummary(results);
    console.log(summary);

    const successful = results.filter((r) => r.success).length;
    const failed = results.filter((r) => !r.success).length;

    if (failed > 0) {
      Logger.warn(`${failed} analyzer(s) failed. Check the output above for details.`);
    }

    if (successful > 0) {
      console.log(chalk.blue('\nNext step:'), chalk.cyan('devcache push'));
      console.log();
    }

  } catch (error: any) {
    spinner.fail(chalk.red('Generation failed'));
    Logger.error(error.message);
    
    if (error.message.includes('not initialized')) {
      console.log(chalk.yellow('\nRun'), chalk.cyan('devcache init'), chalk.yellow('first to initialize the project.'));
    }
    
    process.exit(1);
  }
}
