// Generates the architecture documentation section of the project report.
// Examines file/directory structure and dependencies to identify the framework,
// architecture pattern, data flow, routing style, and state management approach.

import { BaseAnalyzer } from './base/BaseAnalyzer';
import { ProjectContext, AnalysisOutput } from '../types';

export class ArchitectureAnalyzer extends BaseAnalyzer {
  name = 'architecture-project';
  outputPath = 'tech/architecture-project.md';
  category: 'general' | 'tech' = 'tech';

  async analyze(context: ProjectContext): Promise<AnalysisOutput> {
    const metadata = this.extractMetadata(context);

    return {
      title: 'Architecture Overview',
      sections: [
        this.createSection('Framework', this.identifyFramework(context)),
        this.createSection('Architecture Pattern', this.identifyArchitecturePattern(context)),
        this.createSection('Project Structure', this.analyzeProjectStructure(context)),
        this.createSection('Component Hierarchy', this.analyzeComponentHierarchy(context)),
        this.createSection('Data Flow', this.analyzeDataFlow(context)),
        this.createSection('Routing Structure', this.analyzeRouting(context)),
        this.createSection('State Management', this.identifyStateManagement(context)),
        this.createSection('Key Design Decisions', this.identifyDesignDecisions(context)),
      ],
      metadata,
    };
  }

  // Returns a markdown description of the detected framework and its version.
  private identifyFramework(context: ProjectContext): string {
    if (context.framework) {
      const version = context.packageJson?.dependencies?.[context.framework.toLowerCase()] ||
                     context.packageJson?.dependencies?.['next'] ||
                     context.packageJson?.dependencies?.['react'];
      
      return `**${context.framework}** ${version ? `(${version})` : ''}\n\nThis project is built using ${context.framework}, a modern framework for building web applications.`;
    }

    return 'Framework not detected. This may be a vanilla JavaScript/TypeScript project or use a framework not in the detection list.';
  }

  // Detects the architectural pattern (MVC, Component+Services, Hooks, etc.)
  // by checking which directories and dependency types are present in the project.
  private identifyArchitecturePattern(context: ProjectContext): string {
    const hasComponents = this.getFilesMatching(context, /components/).length > 0;
    const hasControllers = this.getFilesMatching(context, /controllers/).length > 0;
    const hasModels = this.getFilesMatching(context, /models/).length > 0;
    const hasViews = this.getFilesMatching(context, /views/).length > 0;
    const hasServices = this.getFilesMatching(context, /services/).length > 0;
    const hasHooks = this.getFilesMatching(context, /hooks|use[A-Z]/).length > 0;

    let pattern = '';

    if (hasModels && hasViews && hasControllers) {
      pattern = '**MVC (Model-View-Controller)**\n\n';
      pattern += 'The project follows the MVC pattern with clear separation between:\n';
      pattern += '- Models: Data structures and business logic\n';
      pattern += '- Views: User interface components\n';
      pattern += '- Controllers: Request handling and coordination\n';
    } else if (hasComponents && hasServices) {
      pattern = '**Component-Based Architecture with Services**\n\n';
      pattern += 'The project uses a component-based architecture with:\n';
      pattern += '- Components: Reusable UI building blocks\n';
      pattern += '- Services: Business logic and data management\n';
      pattern += '- Clear separation of concerns\n';
    } else if (hasComponents && hasHooks) {
      pattern = '**Component-Based with Hooks Pattern**\n\n';
      pattern += 'Modern React/Next.js architecture using:\n';
      pattern += '- Functional components\n';
      pattern += '- Custom hooks for logic reuse\n';
      pattern += '- Composition over inheritance\n';
    } else if (hasComponents) {
      pattern = '**Component-Based Architecture**\n\n';
      pattern += 'The project follows a component-based approach with modular, reusable components.\n';
    } else {
      pattern = '**Modular Architecture**\n\n';
      pattern += 'The project uses a modular structure with organized code separation.\n';
    }

    return pattern;
  }

  // Lists the top-level directories and their file counts to give a structural overview.
  private analyzeProjectStructure(context: ProjectContext): string {
    const directories = new Set<string>();
    
    for (const file of context.files) {
      const parts = file.relativePath.split('/');
      if (parts.length > 1) {
        directories.add(parts[0]);
      }
    }

    const mainDirs = Array.from(directories).sort();
    
    let structure = 'The project is organized into the following main directories:\n\n';
    
    for (const dir of mainDirs.slice(0, 10)) {
      const filesInDir = context.files.filter(f => f.relativePath.startsWith(dir + '/')).length;
      structure += `- **${dir}/** (${filesInDir} files)\n`;
    }

    if (mainDirs.length > 10) {
      structure += `\n...and ${mainDirs.length - 10} more directories`;
    }

    return structure;
  }

  // Groups component files by their subdirectory to reveal the component hierarchy.
  private analyzeComponentHierarchy(context: ProjectContext): string {
    const componentFiles = this.getFilesMatching(context, /components/);
    
    if (componentFiles.length === 0) {
      return 'No component directory detected in the project structure.';
    }

    const componentDirs = new Set<string>();
    
    for (const file of componentFiles) {
      const match = file.relativePath.match(/components\/([^\/]+)/);
      if (match) {
        componentDirs.add(match[1]);
      }
    }

    let hierarchy = `The project contains ${componentFiles.length} component files organized as:\n\n`;
    
    const dirs = Array.from(componentDirs).sort();
    for (const dir of dirs.slice(0, 8)) {
      const count = componentFiles.filter(f => f.relativePath.includes(`components/${dir}`)).length;
      hierarchy += `- **${dir}**: ${count} component(s)\n`;
    }

    return hierarchy;
  }

  // Describes the data flow path (client → API → DB → state) based on
  // which layers (API files, database files, state management) exist.
  private analyzeDataFlow(context: ProjectContext): string {
    const hasApi = this.getFilesMatching(context, /api|routes/).length > 0;
    const hasDatabase = this.getFilesMatching(context, /models|schema|database|prisma|supabase/).length > 0;
    const hasState = this.getFilesMatching(context, /store|state|context/).length > 0;

    let flow = 'Data flows through the application as follows:\n\n';

    if (hasApi && hasDatabase) {
      flow += '1. **Client** → Makes requests to API endpoints\n';
      flow += '2. **API Layer** → Processes requests and validates data\n';
      flow += '3. **Database** → Stores and retrieves persistent data\n';
      flow += '4. **API Response** → Returns data to client\n';
      
      if (hasState) {
        flow += '5. **State Management** → Updates application state\n';
      }
      
      flow += '\nThis follows a typical client-server architecture with clear data boundaries.';
    } else if (hasApi) {
      flow += '1. **Client** → Sends requests to API\n';
      flow += '2. **API Layer** → Processes and responds\n';
      flow += '3. **Client** → Updates UI based on response\n';
    } else if (hasState) {
      flow += '1. **User Interaction** → Triggers state changes\n';
      flow += '2. **State Management** → Updates application state\n';
      flow += '3. **Components** → Re-render based on state\n';
    } else {
      flow += 'Data flow follows standard component prop passing and event handling patterns.';
    }

    return flow;
  }

  // Detects whether the project uses Next.js App Router, Pages Router, or custom routing.
  private analyzeRouting(context: ProjectContext): string {
    const framework = context.framework;

    if (framework === 'Next.js') {
      const appDir = this.getFilesMatching(context, /^app\/.*\/page\.(tsx?|jsx?)$/);
      const pagesDir = this.getFilesMatching(context, /^pages\/.*\.(tsx?|jsx?)$/);

      if (appDir.length > 0) {
        return `**App Router** (Next.js 13+)\n\nThe project uses Next.js App Router with ${appDir.length} route(s). Routes are defined using the file-system based routing in the \`app/\` directory.`;
      } else if (pagesDir.length > 0) {
        return `**Pages Router** (Next.js)\n\nThe project uses Next.js Pages Router with ${pagesDir.length} page(s). Routes are defined in the \`pages/\` directory.`;
      }
    }

    const routeFiles = this.getFilesMatching(context, /routes|router/);
    
    if (routeFiles.length > 0) {
      return `The project uses explicit routing configuration with ${routeFiles.length} route file(s).`;
    }

    return 'Routing structure not clearly identified. May use default framework routing or custom implementation.';
  }

  // Identifies the state management library (Redux, Zustand, Context API, etc.)
  // by checking production dependencies in package.json.
  private identifyStateManagement(context: ProjectContext): string {
    const deps = {
      ...context.packageJson?.dependencies,
      ...context.packageJson?.devDependencies,
    };

    if (deps?.['redux'] || deps?.['@reduxjs/toolkit']) {
      return '**Redux** - Centralized state management with predictable state updates';
    }

    if (deps?.['zustand']) {
      return '**Zustand** - Lightweight state management with hooks-based API';
    }

    if (deps?.['mobx']) {
      return '**MobX** - Reactive state management with observable state';
    }

    if (deps?.['recoil']) {
      return '**Recoil** - Atomic state management for React';
    }

    const hasContext = this.getFilesMatching(context, /context|provider/).length > 0;
    
    if (hasContext) {
      return '**React Context API** - Built-in state management using Context and Providers';
    }

    return 'State management appears to use local component state or is not clearly identified.';
  }

  // Infers key design decisions (TypeScript adoption, monorepo, API-first, testing)
  // from the file mix and package.json structure.
  private identifyDesignDecisions(context: ProjectContext): string {
    const decisions: string[] = [];

    // TypeScript usage
    const tsFiles = this.filterFilesByExtension(context, ['.ts', '.tsx']).length;
    const jsFiles = this.filterFilesByExtension(context, ['.js', '.jsx']).length;
    
    if (tsFiles > jsFiles) {
      decisions.push('**TypeScript** - Chosen for type safety and better developer experience');
    }

    // Monorepo detection
    const hasWorkspaces = context.packageJson?.workspaces;
    if (hasWorkspaces) {
      decisions.push('**Monorepo Structure** - Multiple packages managed in a single repository');
    }

    // API architecture
    const hasApi = this.getFilesMatching(context, /api/).length > 0;
    if (hasApi) {
      decisions.push('**API-First Design** - Clear separation between frontend and backend logic');
    }

    // Testing
    const hasTests = this.getFilesMatching(context, /test|spec/).length > 0;
    if (hasTests) {
      decisions.push('**Test-Driven Approach** - Includes automated testing infrastructure');
    }

    if (decisions.length === 0) {
      decisions.push('Design decisions follow standard practices for the chosen framework');
    }

    return this.formatList(decisions);
  }
}
