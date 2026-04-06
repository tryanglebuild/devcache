import { BaseAnalyzer } from './base/BaseAnalyzer';
import { ProjectContext, AnalysisOutput } from '../types';

export class ProjectAnalyzer extends BaseAnalyzer {
  name = 'project-overview';
  outputPath = 'general/project-overview.md';
  category: 'general' | 'tech' = 'general';

  async analyze(context: ProjectContext): Promise<AnalysisOutput> {
    const metadata = this.extractMetadata(context);

    // Extract project name
    const projectName = metadata.projectName;

    // Extract purpose from package.json or README
    const purpose = this.extractPurpose(context);

    // Determine project type
    const projectType = this.determineProjectType(context);

    // Extract objectives
    const objectives = this.extractObjectives(context);

    // Identify target audience
    const targetAudience = this.identifyTargetAudience(context);

    return {
      title: 'Project Overview',
      sections: [
        this.createSection('Project Name', projectName),
        this.createSection('Purpose', purpose),
        this.createSection('Central Idea', this.extractCentralIdea(context)),
        this.createSection('Objectives', objectives),
        this.createSection('Target Audience', targetAudience),
        this.createSection('Project Type', projectType),
      ],
      metadata,
    };
  }

  private extractPurpose(context: ProjectContext): string {
    if (context.packageJson?.description) {
      return context.packageJson.description;
    }

    if (context.readme) {
      // Try to extract first paragraph from README
      const lines = context.readme.split('\n');
      for (const line of lines) {
        if (line.trim() && !line.startsWith('#') && line.length > 20) {
          return line.trim();
        }
      }
    }

    return 'No description available. Please add a description to package.json or README.md';
  }

  private extractCentralIdea(context: ProjectContext): string {
    const framework = context.framework;
    const fileCount = context.files.length;
    const hasApi = this.getFilesMatching(context, /api|routes/).length > 0;
    const hasComponents = this.getFilesMatching(context, /components/).length > 0;

    let idea = 'This project ';

    if (framework) {
      idea += `is built with ${framework} `;
    }

    if (hasApi && hasComponents) {
      idea += 'and provides both a user interface and backend API functionality. ';
    } else if (hasApi) {
      idea += 'and focuses on providing backend API services. ';
    } else if (hasComponents) {
      idea += 'and focuses on providing a user interface. ';
    }

    idea += `The codebase consists of ${fileCount} files organized in a structured manner.`;

    return idea;
  }

  private determineProjectType(context: ProjectContext): string {
    const packageJson = context.packageJson;

    if (!packageJson) {
      return 'Unknown project type';
    }

    // Check for CLI
    if (packageJson.bin) {
      return 'Command Line Interface (CLI) Tool';
    }

    // Check for library
    if (packageJson.main && !packageJson.scripts?.start) {
      return 'Library / Package';
    }

    // Check for web application
    if (context.framework) {
      const hasApi = this.getFilesMatching(context, /api|routes/).length > 0;
      const hasComponents = this.getFilesMatching(context, /components/).length > 0;

      if (hasApi && hasComponents) {
        return 'Full-Stack Web Application';
      } else if (hasApi) {
        return 'Backend API Service';
      } else if (hasComponents) {
        return 'Frontend Web Application';
      }
    }

    return 'Software Application';
  }

  private extractObjectives(context: ProjectContext): string {
    const objectives: string[] = [];

    // Analyze from README if available
    if (context.readme) {
      const featuresMatch = context.readme.match(/##\s*Features?\s*\n([\s\S]*?)(?=\n##|$)/i);
      if (featuresMatch) {
        const features = featuresMatch[1]
          .split('\n')
          .filter((line) => line.trim().startsWith('-') || line.trim().startsWith('*'))
          .map((line) => line.replace(/^[-*]\s*/, '').trim())
          .filter((line) => line.length > 0);

        objectives.push(...features.slice(0, 5));
      }
    }

    // If no objectives found, generate generic ones
    if (objectives.length === 0) {
      objectives.push('Provide a reliable and efficient solution');
      objectives.push('Maintain clean and maintainable code architecture');
      objectives.push('Ensure scalability and performance');
    }

    return this.formatList(objectives);
  }

  private identifyTargetAudience(context: ProjectContext): string {
    const projectType = this.determineProjectType(context);

    if (projectType.includes('CLI')) {
      return 'Developers and technical users who need command-line tools';
    }

    if (projectType.includes('Library')) {
      return 'Developers who need to integrate this functionality into their projects';
    }

    if (projectType.includes('API')) {
      return 'Applications and services that need to consume API endpoints';
    }

    if (projectType.includes('Web Application')) {
      return 'End users who interact with the web interface';
    }

    return 'General users and stakeholders';
  }
}
