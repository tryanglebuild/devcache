import { BaseAnalyzer } from './base/BaseAnalyzer';
import { ProjectContext, AnalysisOutput } from '../types';

export class ImpactAnalyzer extends BaseAnalyzer {
  name = 'project-impact';
  outputPath = 'general/project-impact.md';
  category: 'general' | 'tech' = 'general';

  async analyze(context: ProjectContext): Promise<AnalysisOutput> {
    const metadata = this.extractMetadata(context);

    return {
      title: 'Project Impact',
      sections: [
        this.createSection('Problem Statement', this.extractProblemStatement(context)),
        this.createSection('Root Cause Analysis', this.analyzeRootCause(context)),
        this.createSection('Solution Approach', this.describeSolution(context)),
        this.createSection('Expected Impact', this.describeImpact(context)),
        this.createSection('Success Metrics', this.defineSuccessMetrics(context)),
        this.createSection('Target Users', this.identifyTargetUsers(context)),
      ],
      metadata,
    };
  }

  private extractProblemStatement(context: ProjectContext): string {
    // Try to extract from README
    if (context.readme) {
      const problemMatch = context.readme.match(/##\s*Problem\s*\n([\s\S]*?)(?=\n##|$)/i);
      if (problemMatch) {
        return problemMatch[1].trim();
      }

      // Look for "Why" section
      const whyMatch = context.readme.match(/##\s*Why\s*\n([\s\S]*?)(?=\n##|$)/i);
      if (whyMatch) {
        return whyMatch[1].trim();
      }
    }

    // Generate generic problem statement based on project type
    const projectName = context.packageJson?.name || 'this project';
    const description = context.packageJson?.description || '';

    if (description) {
      return `${projectName} addresses the need for ${description.toLowerCase()}`;
    }

    return `${projectName} was created to solve specific challenges in its domain. The exact problem statement should be documented in the README.md file.`;
  }

  private analyzeRootCause(context: ProjectContext): string {
    const framework = context.framework;

    let analysis = 'The root causes that justify this project include:\n\n';

    if (framework) {
      analysis += `- Need for a solution built with modern ${framework} technology\n`;
    }

    analysis += '- Existing solutions may not fully address the specific requirements\n';
    analysis += '- Opportunity to create a more efficient or user-friendly approach\n';
    analysis += '- Technical or business requirements that demand a custom solution\n';

    return analysis;
  }

  private describeSolution(context: ProjectContext): string {
    const framework = context.framework;
    const projectType = this.determineProjectType(context);

    let solution = `This project provides a ${projectType.toLowerCase()} `;

    if (framework) {
      solution += `built with ${framework} `;
    }

    solution += 'that addresses the identified problem through:\n\n';

    // Analyze project structure for solution components
    const hasApi = this.getFilesMatching(context, /api|routes/).length > 0;
    const hasComponents = this.getFilesMatching(context, /components/).length > 0;
    const hasDatabase = this.getFilesMatching(context, /models|schema|database/).length > 0;

    if (hasComponents) {
      solution += '- User-friendly interface for easy interaction\n';
    }

    if (hasApi) {
      solution += '- Robust API endpoints for data management and operations\n';
    }

    if (hasDatabase) {
      solution += '- Structured data storage and retrieval mechanisms\n';
    }

    solution += '- Well-organized codebase for maintainability and scalability\n';

    return solution;
  }

  private describeImpact(context: ProjectContext): string {
    const projectType = this.determineProjectType(context);

    let impact = 'The expected impact of this project includes:\n\n';

    if (projectType.includes('Web Application')) {
      impact += '- Improved user experience and accessibility\n';
      impact += '- Increased efficiency in completing tasks\n';
      impact += '- Better data management and organization\n';
    } else if (projectType.includes('Library')) {
      impact += '- Reduced development time for dependent projects\n';
      impact += '- Standardized approach to common problems\n';
      impact += '- Improved code quality through reusable components\n';
    } else if (projectType.includes('CLI')) {
      impact += '- Automated workflows and increased productivity\n';
      impact += '- Reduced manual errors through automation\n';
      impact += '- Streamlined development processes\n';
    }

    impact += '- Long-term maintainability and scalability\n';

    return impact;
  }

  private defineSuccessMetrics(context: ProjectContext): string {
    const projectType = this.determineProjectType(context);

    let metrics = 'Success can be measured through:\n\n';

    if (projectType.includes('Web Application')) {
      metrics += '- User adoption and engagement rates\n';
      metrics += '- Performance metrics (load time, response time)\n';
      metrics += '- User satisfaction scores\n';
      metrics += '- Feature completion and bug resolution rates\n';
    } else if (projectType.includes('Library')) {
      metrics += '- Number of projects using the library\n';
      metrics += '- Download and installation statistics\n';
      metrics += '- Community contributions and feedback\n';
      metrics += '- Code coverage and test pass rates\n';
    } else if (projectType.includes('CLI')) {
      metrics += '- Installation and usage statistics\n';
      metrics += '- Time saved through automation\n';
      metrics += '- Error reduction rates\n';
      metrics += '- User feedback and satisfaction\n';
    }

    return metrics;
  }

  private identifyTargetUsers(context: ProjectContext): string {
    const projectType = this.determineProjectType(context);

    if (projectType.includes('CLI')) {
      return 'Developers, DevOps engineers, and technical users who work with command-line tools and automation.';
    }

    if (projectType.includes('Library')) {
      return 'Software developers and engineering teams who need to integrate this functionality into their applications.';
    }

    if (projectType.includes('API')) {
      return 'Application developers and services that need to consume API endpoints for data and functionality.';
    }

    if (projectType.includes('Web Application')) {
      return 'End users who interact with the web interface, including both technical and non-technical users.';
    }

    return 'Various stakeholders including developers, end users, and business users depending on the specific use case.';
  }

  private determineProjectType(context: ProjectContext): string {
    const packageJson = context.packageJson;

    if (!packageJson) return 'Software Application';

    if (packageJson.bin) return 'CLI Tool';
    if (packageJson.main && !packageJson.scripts?.start) return 'Library';
    if (context.framework) {
      const hasApi = this.getFilesMatching(context, /api|routes/).length > 0;
      const hasComponents = this.getFilesMatching(context, /components/).length > 0;

      if (hasApi && hasComponents) return 'Full-Stack Web Application';
      if (hasApi) return 'Backend API Service';
      if (hasComponents) return 'Frontend Web Application';
    }

    return 'Software Application';
  }
}
