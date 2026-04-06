import { ProjectContext, AnalysisOutput, Section, FileInfo } from '../../types';

export abstract class BaseAnalyzer {
  abstract name: string;
  abstract outputPath: string;
  abstract category: 'general' | 'tech';

  /**
   * Main analysis method - must be implemented by subclasses
   */
  abstract analyze(context: ProjectContext): Promise<AnalysisOutput>;

  /**
   * Helper: Extract metadata from project context
   */
  protected extractMetadata(context: ProjectContext): Record<string, any> {
    return {
      projectName: context.packageJson?.name || 'Unknown',
      version: context.packageJson?.version,
      description: context.packageJson?.description,
      framework: context.framework,
      fileCount: context.files.length,
    };
  }

  /**
   * Helper: Create a section
   */
  protected createSection(heading: string, content: string): Section {
    return {
      heading,
      content,
    };
  }

  /**
   * Helper: Filter files by extension
   */
  protected filterFilesByExtension(
    context: ProjectContext,
    extensions: string[]
  ): FileInfo[] {
    return context.files.filter((file) =>
      extensions.includes(file.extension)
    );
  }

  /**
   * Helper: Count files by extension
   */
  protected countFilesByExtension(
    context: ProjectContext
  ): Record<string, number> {
    const counts: Record<string, number> = {};

    for (const file of context.files) {
      const ext = file.extension || 'no-extension';
      counts[ext] = (counts[ext] || 0) + 1;
    }

    return counts;
  }

  /**
   * Helper: Get file paths matching pattern
   */
  protected getFilesMatching(
    context: ProjectContext,
    pattern: RegExp
  ): FileInfo[] {
    return context.files.filter((file) => pattern.test(file.relativePath));
  }

  /**
   * Helper: Format list as markdown
   */
  protected formatList(items: string[]): string {
    return items.map((item) => `- ${item}`).join('\n');
  }

  /**
   * Helper: Format object as markdown table
   */
  protected formatTable(data: Record<string, string>): string {
    const rows = Object.entries(data).map(
      ([key, value]) => `| ${key} | ${value} |`
    );
    return ['| Key | Value |', '|-----|-------|', ...rows].join('\n');
  }
}
