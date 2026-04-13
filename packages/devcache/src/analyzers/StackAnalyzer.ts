// Generates the technology stack documentation section.
// Categorises all dependencies, identifies the database/build/test tools,
// detects the deployment configuration, and describes the environment setup.

import { BaseAnalyzer } from './base/BaseAnalyzer';
import { ProjectContext, AnalysisOutput } from '../types';

export class StackAnalyzer extends BaseAnalyzer {
  name = 'stack-project';
  outputPath = 'tech/stack-project.md';
  category: 'general' | 'tech' = 'tech';

  async analyze(context: ProjectContext): Promise<AnalysisOutput> {
    const metadata = this.extractMetadata(context);

    return {
      title: 'Technology Stack',
      sections: [
        this.createSection('Core Technologies', this.analyzeCoreStack(context)),
        this.createSection('Production Dependencies', this.analyzeProductionDeps(context)),
        this.createSection('Development Dependencies', this.analyzeDevDeps(context)),
        this.createSection('Database', this.identifyDatabase(context)),
        this.createSection('Build Tools', this.identifyBuildTools(context)),
        this.createSection('Testing Framework', this.identifyTestingTools(context)),
        this.createSection('Deployment', this.analyzeDeployment(context)),
        this.createSection('Environment Setup', this.describeEnvironmentSetup(context)),
      ],
      metadata,
    };
  }

  private analyzeCoreStack(context: ProjectContext): string {
    const pkg = context.packageJson;
    if (!pkg) return 'Package.json not found';

    let stack = '';

    // Framework
    if (context.framework) {
      const version = pkg.dependencies?.[context.framework.toLowerCase()] ||
                     pkg.dependencies?.['next'] ||
                     pkg.dependencies?.['react'];
      stack += `- **Framework**: ${context.framework} ${version || ''}\n`;
    }

    // Language
    const hasTypeScript = pkg.devDependencies?.['typescript'] || pkg.dependencies?.['typescript'];
    if (hasTypeScript) {
      stack += `- **Language**: TypeScript ${hasTypeScript}\n`;
    } else {
      stack += `- **Language**: JavaScript\n`;
    }

    // Runtime
    if (pkg.engines?.node) {
      stack += `- **Runtime**: Node.js ${pkg.engines.node}\n`;
    } else {
      stack += `- **Runtime**: Node.js (version not specified)\n`;
    }

    return stack;
  }

  private analyzeProductionDeps(context: ProjectContext): string {
    const deps = context.packageJson?.dependencies;
    
    if (!deps || Object.keys(deps).length === 0) {
      return 'No production dependencies found';
    }

    const categorized = this.categorizeDependencies(deps);
    let output = '';

    for (const [category, packages] of Object.entries(categorized)) {
      if (packages.length > 0) {
        output += `\n### ${category}\n\n`;
        for (const pkg of packages.slice(0, 10)) {
          output += `- **${pkg.name}** (${pkg.version}): ${this.getPackageDescription(pkg.name)}\n`;
        }
        if (packages.length > 10) {
          output += `\n...and ${packages.length - 10} more packages\n`;
        }
      }
    }

    return output;
  }

  private analyzeDevDeps(context: ProjectContext): string {
    const devDeps = context.packageJson?.devDependencies;
    
    if (!devDeps || Object.keys(devDeps).length === 0) {
      return 'No development dependencies found';
    }

    const categorized = this.categorizeDependencies(devDeps);
    let output = '';

    for (const [category, packages] of Object.entries(categorized)) {
      if (packages.length > 0) {
        output += `\n### ${category}\n\n`;
        for (const pkg of packages.slice(0, 8)) {
          output += `- **${pkg.name}** (${pkg.version})\n`;
        }
        if (packages.length > 8) {
          output += `\n...and ${packages.length - 8} more packages\n`;
        }
      }
    }

    return output;
  }

  // Classifies each dependency into a named bucket (UI, State, DB, Auth, etc.)
  // using name-pattern matching.  Unrecognised packages go into "Other".
  private categorizeDependencies(deps: Record<string, string>): Record<string, Array<{name: string, version: string}>> {
    const categories: Record<string, Array<{name: string, version: string}>> = {
      'UI & Styling': [],
      'State Management': [],
      'Data Fetching': [],
      'Database & ORM': [],
      'Authentication': [],
      'Testing': [],
      'Build Tools': [],
      'Utilities': [],
      'Other': [],
    };

    for (const [name, version] of Object.entries(deps)) {
      const pkg = { name, version };

      if (this.isUIPackage(name)) {
        categories['UI & Styling'].push(pkg);
      } else if (this.isStateManagement(name)) {
        categories['State Management'].push(pkg);
      } else if (this.isDataFetching(name)) {
        categories['Data Fetching'].push(pkg);
      } else if (this.isDatabase(name)) {
        categories['Database & ORM'].push(pkg);
      } else if (this.isAuth(name)) {
        categories['Authentication'].push(pkg);
      } else if (this.isTesting(name)) {
        categories['Testing'].push(pkg);
      } else if (this.isBuildTool(name)) {
        categories['Build Tools'].push(pkg);
      } else if (this.isUtility(name)) {
        categories['Utilities'].push(pkg);
      } else {
        categories['Other'].push(pkg);
      }
    }

    return categories;
  }

  private isUIPackage(name: string): boolean {
    return /^(@mui|@heroui|@radix|tailwind|styled-components|emotion|sass|postcss|autoprefixer)/.test(name) ||
           ['react-icons', 'lucide-react', 'framer-motion'].includes(name);
  }

  private isStateManagement(name: string): boolean {
    return ['redux', '@reduxjs/toolkit', 'zustand', 'mobx', 'recoil', 'jotai'].includes(name);
  }

  private isDataFetching(name: string): boolean {
    return ['axios', 'swr', 'react-query', '@tanstack/react-query', 'graphql', 'apollo-client'].includes(name);
  }

  private isDatabase(name: string): boolean {
    return /^(@supabase|@prisma|mongoose|typeorm|sequelize|pg|mysql)/.test(name);
  }

  private isAuth(name: string): boolean {
    return /^(next-auth|@auth|passport|jsonwebtoken|bcrypt)/.test(name);
  }

  private isTesting(name: string): boolean {
    return /^(jest|@testing-library|vitest|cypress|playwright|mocha|chai)/.test(name);
  }

  private isBuildTool(name: string): boolean {
    return ['webpack', 'vite', 'rollup', 'esbuild', 'turbopack', 'typescript', 'babel'].includes(name) ||
           name.startsWith('@babel/');
  }

  private isUtility(name: string): boolean {
    return ['lodash', 'date-fns', 'dayjs', 'moment', 'uuid', 'nanoid', 'zod', 'yup'].includes(name);
  }

  // Returns a human-readable one-liner for well-known packages; unknown packages
  // fall back to the generic string "Package dependency".
  private getPackageDescription(name: string): string {
    const descriptions: Record<string, string> = {
      'react': 'UI library for building user interfaces',
      'next': 'React framework for production',
      '@supabase/supabase-js': 'Supabase client for database and auth',
      'tailwindcss': 'Utility-first CSS framework',
      'typescript': 'Typed superset of JavaScript',
      'axios': 'HTTP client for API requests',
      'zod': 'TypeScript-first schema validation',
      'react-hook-form': 'Form validation library',
      'lucide-react': 'Icon library',
      'date-fns': 'Date utility library',
    };

    return descriptions[name] || 'Package dependency';
  }

  private identifyDatabase(context: ProjectContext): string {
    const deps = {
      ...context.packageJson?.dependencies,
      ...context.packageJson?.devDependencies,
    };

    if (deps?.['@supabase/supabase-js']) {
      return '**Supabase** - PostgreSQL database with real-time capabilities and built-in authentication';
    }

    if (deps?.['@prisma/client']) {
      return '**Prisma** - Next-generation ORM for Node.js and TypeScript';
    }

    if (deps?.['mongoose']) {
      return '**MongoDB** with Mongoose ODM';
    }

    if (deps?.['pg']) {
      return '**PostgreSQL** with node-postgres driver';
    }

    if (deps?.['mysql'] || deps?.['mysql2']) {
      return '**MySQL** database';
    }

    const hasDbFiles = this.getFilesMatching(context, /database|db|schema/).length > 0;
    if (hasDbFiles) {
      return 'Database configuration detected but specific technology not identified';
    }

    return 'No database configuration detected';
  }

  private identifyBuildTools(context: ProjectContext): string {
    const deps = {
      ...context.packageJson?.dependencies,
      ...context.packageJson?.devDependencies,
    };

    const tools: string[] = [];

    if (deps?.['webpack']) tools.push('**Webpack** - Module bundler');
    if (deps?.['vite']) tools.push('**Vite** - Fast build tool');
    if (deps?.['turbopack']) tools.push('**Turbopack** - Incremental bundler');
    if (deps?.['esbuild']) tools.push('**esbuild** - Fast JavaScript bundler');
    if (deps?.['typescript']) tools.push('**TypeScript Compiler** - Type checking and compilation');
    if (deps?.['@babel/core']) tools.push('**Babel** - JavaScript compiler');
    if (deps?.['postcss']) tools.push('**PostCSS** - CSS transformation tool');
    if (deps?.['tailwindcss']) tools.push('**Tailwind CSS** - Utility-first CSS framework');

    if (tools.length === 0) {
      return 'Build tools not explicitly configured or using framework defaults';
    }

    return this.formatList(tools);
  }

  private identifyTestingTools(context: ProjectContext): string {
    const deps = {
      ...context.packageJson?.dependencies,
      ...context.packageJson?.devDependencies,
    };

    const tools: string[] = [];

    if (deps?.['jest']) tools.push('**Jest** - JavaScript testing framework');
    if (deps?.['vitest']) tools.push('**Vitest** - Vite-native testing framework');
    if (deps?.['@testing-library/react']) tools.push('**React Testing Library** - React component testing');
    if (deps?.['cypress']) tools.push('**Cypress** - E2E testing framework');
    if (deps?.['playwright']) tools.push('**Playwright** - Browser automation and testing');

    if (tools.length === 0) {
      return 'No testing framework detected';
    }

    return this.formatList(tools);
  }

  private analyzeDeployment(context: ProjectContext): string {
    const hasVercelConfig = this.getFilesMatching(context, /vercel\.json/).length > 0;
    const hasDockerfile = this.getFilesMatching(context, /Dockerfile/).length > 0;
    const hasGithubActions = this.getFilesMatching(context, /\.github\/workflows/).length > 0;

    let deployment = '';

    if (hasVercelConfig) {
      deployment += '- **Vercel** - Configuration detected for Vercel deployment\n';
    }

    if (hasDockerfile) {
      deployment += '- **Docker** - Containerized deployment configuration\n';
    }

    if (hasGithubActions) {
      deployment += '- **GitHub Actions** - CI/CD pipeline configured\n';
    }

    if (context.framework === 'Next.js') {
      deployment += '- Compatible with **Vercel**, **Netlify**, or any Node.js hosting\n';
    }

    if (!deployment) {
      deployment = 'Deployment configuration not explicitly defined';
    }

    return deployment;
  }

  private describeEnvironmentSetup(context: ProjectContext): string {
    const pkg = context.packageJson;
    if (!pkg) return 'Package.json not found';

    let setup = '**Requirements:**\n\n';

    if (pkg.engines?.node) {
      setup += `- Node.js ${pkg.engines.node}\n`;
    } else {
      setup += '- Node.js (version not specified, recommend LTS)\n';
    }

    if (pkg.engines?.npm) {
      setup += `- npm ${pkg.engines.npm}\n`;
    }

    setup += '\n**Installation:**\n\n';
    setup += '```bash\n';
    setup += 'npm install\n';
    setup += '```\n\n';

    if (pkg.scripts) {
      setup += '**Available Scripts:**\n\n';
      const importantScripts = ['dev', 'build', 'start', 'test', 'lint'];
      
      for (const script of importantScripts) {
        if (pkg.scripts[script]) {
          setup += `- \`npm run ${script}\` - ${this.getScriptDescription(script)}\n`;
        }
      }
    }

    return setup;
  }

  private getScriptDescription(script: string): string {
    const descriptions: Record<string, string> = {
      'dev': 'Start development server',
      'build': 'Build for production',
      'start': 'Start production server',
      'test': 'Run tests',
      'lint': 'Run linter',
    };

    return descriptions[script] || 'Run script';
  }
}
