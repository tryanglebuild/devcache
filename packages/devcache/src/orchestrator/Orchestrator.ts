// Orchestrator: coordinates the full documentation generation pipeline.
// Registers analyzers, scans the project, runs each analyzer, renders Markdown templates,
// and writes output files to disk. Called by the 'devcache generate' CLI command.

import path from 'path';
import { BaseAnalyzer } from '../analyzers/base/BaseAnalyzer';
import { TemplateManager } from './TemplateManager';
import { FileSystemHandler } from './FileSystemHandler';
import { FileParser, Logger, ConfigManager } from '../utils';
import { ProjectContext, AnalysisResult, DevCacheConfig } from '../types';

export class Orchestrator {
  private analyzers: Map<string, BaseAnalyzer> = new Map();
  private templateManager: TemplateManager;
  private fsHandler: FileSystemHandler;
  private config: DevCacheConfig;
  private rootPath: string;

  constructor(rootPath: string = process.cwd()) {
    this.rootPath = rootPath;
    this.templateManager = new TemplateManager();
    this.fsHandler = new FileSystemHandler();
    this.config = {} as DevCacheConfig; // Will be loaded in initialize()
  }

  /**
   * Initialize orchestrator
   */
  async initialize(): Promise<void> {
    Logger.debug('Initializing orchestrator...');

    // Load configuration
    this.config = await ConfigManager.readConfig(this.rootPath);

    // Load templates
    await this.templateManager.loadTemplates();

    Logger.debug('Orchestrator initialized');
  }

  /**
   * Register an analyzer
   */
  registerAnalyzer(analyzer: BaseAnalyzer): void {
    this.analyzers.set(analyzer.name, analyzer);
    Logger.debug(`Registered analyzer: ${analyzer.name}`);
  }

  /**
   * Main analysis workflow
   */
  async analyze(): Promise<AnalysisResult[]> {
    Logger.section('🔍 Analyzing Project');

    // Step 1: Scan project
    const context = await this.scanProject();
    Logger.success(`Scanned ${context.files.length} files`);

    // Step 2: Create output directory with project name
    const outputPath = path.join(this.rootPath, this.config.outputDir);
    await this.fsHandler.createOutputDirectory(outputPath, this.config.projectName);

    // Step 3: Run analyzers
    const results: AnalysisResult[] = [];
    const fileDescriptions: Array<{ category: string; filename: string; description: string }> = [];

    for (const [name, analyzer] of this.analyzers) {
      try {
        Logger.info(`Running ${name}...`);

        const output = await analyzer.analyze(context);
        const template = this.templateManager.getTemplate(name);

        if (!template) {
          throw new Error(`Template not found for analyzer: ${name}`);
        }

        // Render markdown with metadata
        const markdown = this.templateManager.renderTemplate(template, output, {
          projectName: this.config.projectName,
          aiModel: this.config.generation?.aiModel || 'AI-Powered Analysis'
        });

        // Write to file (now includes project name in path)
        await this.fsHandler.writeDocumentation(
          outputPath,
          this.config.projectName,
          analyzer.category,
          template.outputFile,
          markdown
        );

        // Store file description for index
        fileDescriptions.push({
          category: analyzer.category,
          filename: template.outputFile,
          description: template.description,
        });

        results.push({
          analyzer: name,
          outputPath: path.join(outputPath, this.config.projectName, analyzer.category, template.outputFile),
          category: analyzer.category,
          content: markdown,
          success: true,
        });

        Logger.success(`Generated ${template.outputFile}`);
      } catch (error) {
        Logger.error(`Failed to run ${name}: ${error}`);

        results.push({
          analyzer: name,
          outputPath: '',
          category: analyzer.category,
          content: '',
          success: false,
          error: String(error),
        });
      }
    }

    // Step 4: Create index.md file
    const projectDescription = this.config.description || 
      `Comprehensive documentation for ${this.config.projectName} project.`;

    await this.fsHandler.writeIndexFile(
      outputPath,
      this.config.projectName,
      projectDescription,
      fileDescriptions
    );

    Logger.success('Created index.md');

    return results;
  }

  /**
   * Scan project and build context
   */
  private async scanProject(): Promise<ProjectContext> {
    Logger.debug('Scanning project structure...');

    // Scan files
    const files = await FileParser.scanProject(
      this.rootPath,
      this.config.analysis.includePatterns,
      this.config.analysis.excludePatterns
    );

    // Read package.json
    const packageJson = await FileParser.readPackageJson(this.rootPath);

    // Read README
    const readme = await FileParser.readReadme(this.rootPath);

    // Detect framework
    const framework = FileParser.detectFramework(packageJson);

    return {
      rootPath: this.rootPath,
      config: this.config,
      files,
      packageJson: packageJson || undefined,
      readme: readme || undefined,
      framework,
    };
  }

  /**
   * Get analysis summary
   */
  getSummary(results: AnalysisResult[]): string {
    const successful = results.filter((r) => r.success).length;
    const failed = results.filter((r) => !r.success).length;

    let summary = '\n📊 Analysis Summary\n\n';
    summary += `✓ Successful: ${successful}\n`;
    summary += `✗ Failed: ${failed}\n\n`;

    summary += 'Generated files:\n';
    for (const result of results) {
      if (result.success) {
        summary += `  ✓ ${result.outputPath}\n`;
      } else {
        summary += `  ✗ ${result.analyzer} - ${result.error}\n`;
      }
    }

    return summary;
  }
}
