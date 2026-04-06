import { BaseAnalyzer } from './base/BaseAnalyzer';
import { ProjectContext, AnalysisOutput, FileInfo } from '../types';

export class FeaturesAnalyzer extends BaseAnalyzer {
  name = 'features';
  outputPath = 'tech/features.md';
  category: 'general' | 'tech' = 'tech';

  async analyze(context: ProjectContext): Promise<AnalysisOutput> {
    const metadata = this.extractMetadata(context);

    return {
      title: 'Features',
      sections: [
        this.createSection('Core Features', this.identifyCoreFeatures(context)),
        this.createSection('API Endpoints', this.documentApiEndpoints(context)),
        this.createSection('Authentication', this.analyzeAuthentication(context)),
        this.createSection('User Interface', this.analyzeUserInterface(context)),
        this.createSection('Data Management', this.analyzeDataManagement(context)),
        this.createSection('Integration Points', this.identifyIntegrations(context)),
        this.createSection('User Flows', this.describeUserFlows(context)),
      ],
      metadata,
    };
  }

  private identifyCoreFeatures(context: ProjectContext): string {
    const features: string[] = [];

    // Try to extract from README
    if (context.readme) {
      const featuresMatch = context.readme.match(/##\s*Features?\s*\n([\s\S]*?)(?=\n##|$)/i);
      if (featuresMatch) {
        const extractedFeatures = featuresMatch[1]
          .split('\n')
          .filter((line) => line.trim().startsWith('-') || line.trim().startsWith('*'))
          .map((line) => line.replace(/^[-*]\s*/, '').trim())
          .filter((line) => line.length > 0);

        features.push(...extractedFeatures);
      }
    }

    // If no features found in README, analyze project structure
    if (features.length === 0) {
      features.push(...this.inferFeaturesFromStructure(context));
    }

    if (features.length === 0) {
      return 'Core features should be documented in the README.md file.';
    }

    return this.formatList(features);
  }

  private inferFeaturesFromStructure(context: ProjectContext): string[] {
    const features: string[] = [];

    const hasAuth = this.getFilesMatching(context, /auth|login|signup/).length > 0;
    if (hasAuth) {
      features.push('User authentication and authorization');
    }

    const hasApi = this.getFilesMatching(context, /api/).length > 0;
    if (hasApi) {
      features.push('RESTful API endpoints');
    }

    const hasDashboard = this.getFilesMatching(context, /dashboard/).length > 0;
    if (hasDashboard) {
      features.push('User dashboard interface');
    }

    const hasAdmin = this.getFilesMatching(context, /admin/).length > 0;
    if (hasAdmin) {
      features.push('Administrative panel');
    }

    const hasChat = this.getFilesMatching(context, /chat|message/).length > 0;
    if (hasChat) {
      features.push('Real-time messaging or chat functionality');
    }

    const hasUpload = this.getFilesMatching(context, /upload|file/).length > 0;
    if (hasUpload) {
      features.push('File upload and management');
    }

    const hasSearch = this.getFilesMatching(context, /search/).length > 0;
    if (hasSearch) {
      features.push('Search functionality');
    }

    return features;
  }

  private documentApiEndpoints(context: ProjectContext): string {
    const apiFiles = this.getFilesMatching(context, /api.*route\.(ts|js)|api.*\[.*\]/);

    if (apiFiles.length === 0) {
      return 'No API endpoints detected in the project structure.';
    }

    let documentation = `The project includes ${apiFiles.length} API endpoint(s):\n\n`;

    const endpoints = this.extractEndpoints(apiFiles);
    
    for (const endpoint of endpoints.slice(0, 15)) {
      documentation += `- **${endpoint.method}** \`${endpoint.path}\` - ${endpoint.description}\n`;
    }

    if (endpoints.length > 15) {
      documentation += `\n...and ${endpoints.length - 15} more endpoints`;
    }

    return documentation;
  }

  private extractEndpoints(files: FileInfo[]): Array<{method: string, path: string, description: string}> {
    const endpoints: Array<{method: string, path: string, description: string}> = [];

    for (const file of files) {
      // Extract path from file structure
      const pathMatch = file.relativePath.match(/api\/(.*?)\/route\.(ts|js)/);
      if (pathMatch) {
        const path = `/api/${pathMatch[1]}`;
        
        // Infer methods based on common patterns
        if (path.includes('[id]')) {
          endpoints.push({ method: 'GET', path: path.replace('[id]', ':id'), description: 'Retrieve specific resource' });
          endpoints.push({ method: 'PUT', path: path.replace('[id]', ':id'), description: 'Update specific resource' });
          endpoints.push({ method: 'DELETE', path: path.replace('[id]', ':id'), description: 'Delete specific resource' });
        } else {
          endpoints.push({ method: 'GET', path, description: 'List resources' });
          endpoints.push({ method: 'POST', path, description: 'Create new resource' });
        }
      }
    }

    return endpoints;
  }

  private analyzeAuthentication(context: ProjectContext): string {
    const deps = {
      ...context.packageJson?.dependencies,
      ...context.packageJson?.devDependencies,
    };

    const authFiles = this.getFilesMatching(context, /auth|login|signup/).length;

    if (deps?.['next-auth'] || deps?.['@auth/core']) {
      return '**NextAuth.js** - Authentication is implemented using NextAuth.js, providing support for multiple authentication providers and session management.';
    }

    if (deps?.['@supabase/supabase-js']) {
      return '**Supabase Auth** - Authentication is handled by Supabase, providing email/password authentication, OAuth providers, and session management.';
    }

    if (deps?.['passport']) {
      return '**Passport.js** - Authentication middleware for Node.js supporting various strategies.';
    }

    if (deps?.['jsonwebtoken']) {
      return '**JWT (JSON Web Tokens)** - Custom authentication implementation using JWT for stateless authentication.';
    }

    if (authFiles > 0) {
      return `Authentication functionality detected (${authFiles} related files). Implementation details should be reviewed in the codebase.`;
    }

    return 'No authentication system detected in the project.';
  }

  private analyzeUserInterface(context: ProjectContext): string {
    const componentFiles = this.getFilesMatching(context, /components/);
    const pageFiles = this.getFilesMatching(context, /pages|app.*page/);

    if (componentFiles.length === 0 && pageFiles.length === 0) {
      return 'No UI components detected. This may be a backend-only project.';
    }

    let ui = `The user interface consists of:\n\n`;
    
    if (pageFiles.length > 0) {
      ui += `- **${pageFiles.length} page(s)** defining main application routes\n`;
    }

    if (componentFiles.length > 0) {
      ui += `- **${componentFiles.length} component(s)** for reusable UI elements\n`;
    }

    // Identify UI library
    const deps = {
      ...context.packageJson?.dependencies,
      ...context.packageJson?.devDependencies,
    };

    if (deps?.['@heroui/react']) {
      ui += '\n**UI Library**: HeroUI - Pre-styled, accessible React components';
    } else if (deps?.['@mui/material']) {
      ui += '\n**UI Library**: Material-UI - React components implementing Material Design';
    } else if (deps?.['@radix-ui/react']) {
      ui += '\n**UI Library**: Radix UI - Unstyled, accessible component primitives';
    } else if (deps?.['tailwindcss']) {
      ui += '\n**Styling**: Tailwind CSS - Utility-first CSS framework';
    }

    return ui;
  }

  private analyzeDataManagement(context: ProjectContext): string {
    const deps = {
      ...context.packageJson?.dependencies,
      ...context.packageJson?.devDependencies,
    };

    const dataStrategies: string[] = [];

    if (deps?.['@supabase/supabase-js']) {
      dataStrategies.push('**Supabase** - Real-time database with PostgreSQL');
    }

    if (deps?.['@prisma/client']) {
      dataStrategies.push('**Prisma ORM** - Type-safe database access');
    }

    if (deps?.['mongoose']) {
      dataStrategies.push('**Mongoose** - MongoDB object modeling');
    }

    if (deps?.['swr'] || deps?.['@tanstack/react-query']) {
      dataStrategies.push('**Data Fetching** - Optimized data fetching with caching');
    }

    if (deps?.['axios']) {
      dataStrategies.push('**HTTP Client** - Axios for API requests');
    }

    if (dataStrategies.length === 0) {
      return 'Data management strategy not clearly identified from dependencies.';
    }

    return this.formatList(dataStrategies);
  }

  private identifyIntegrations(context: ProjectContext): string {
    const deps = {
      ...context.packageJson?.dependencies,
      ...context.packageJson?.devDependencies,
    };

    const integrations: string[] = [];

    if (deps?.['@supabase/supabase-js']) {
      integrations.push('**Supabase** - Backend-as-a-Service platform');
    }

    if (deps?.['stripe']) {
      integrations.push('**Stripe** - Payment processing');
    }

    if (deps?.['@sendgrid/mail'] || deps?.['nodemailer']) {
      integrations.push('**Email Service** - Transactional email sending');
    }

    if (deps?.['aws-sdk'] || deps?.['@aws-sdk/client-s3']) {
      integrations.push('**AWS** - Cloud services integration');
    }

    if (deps?.['openai']) {
      integrations.push('**OpenAI** - AI/ML capabilities');
    }

    if (deps?.['@vercel/analytics']) {
      integrations.push('**Vercel Analytics** - Web analytics');
    }

    if (deps?.['socket.io'] || deps?.['socket.io-client']) {
      integrations.push('**Socket.IO** - Real-time bidirectional communication');
    }

    if (integrations.length === 0) {
      return 'No external integrations detected from dependencies.';
    }

    return this.formatList(integrations);
  }

  private describeUserFlows(context: ProjectContext): string {
    const hasAuth = this.getFilesMatching(context, /auth|login/).length > 0;
    const hasDashboard = this.getFilesMatching(context, /dashboard/).length > 0;
    const hasProfile = this.getFilesMatching(context, /profile|settings/).length > 0;

    const flows: string[] = [];

    if (hasAuth) {
      flows.push('**Authentication Flow**: User registration → Email verification → Login → Access protected routes');
    }

    if (hasDashboard) {
      flows.push('**Dashboard Flow**: Login → View dashboard → Access features → Manage data');
    }

    if (hasProfile) {
      flows.push('**Profile Management**: Access settings → Update profile → Save changes → Confirmation');
    }

    // Generic flow based on project type
    const hasApi = this.getFilesMatching(context, /api/).length > 0;
    if (hasApi && flows.length === 0) {
      flows.push('**Data Flow**: User action → API request → Data processing → Response → UI update');
    }

    if (flows.length === 0) {
      return 'User flows should be documented based on specific application features.';
    }

    return this.formatList(flows);
  }
}
