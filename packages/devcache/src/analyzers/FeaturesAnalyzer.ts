import { BaseAnalyzer } from './base/BaseAnalyzer';
import { ProjectContext, AnalysisOutput, FileInfo } from '../types';

interface Feature {
  name: string;
  impact: number;
  category: string;
  description: string;
  capabilities: string[];
  techStack: string[];
  impactBreakdown: {
    userAdoption: number;
    businessValue: number;
    technicalComplexity: number;
    failureImpact: number;
    developmentEffort: number;
  };
}

export class FeaturesAnalyzer extends BaseAnalyzer {
  name = 'features';
  outputPath = 'tech/features.md';
  category: 'general' | 'tech' = 'tech';

  async analyze(context: ProjectContext): Promise<AnalysisOutput> {
    const metadata = this.extractMetadata(context);
    
    // Identify and classify all features
    const features = this.identifyAndClassifyFeatures(context);
    
    // Sort features by impact (highest first)
    features.sort((a, b) => b.impact - a.impact);

    return {
      title: 'Features',
      sections: [
        this.createSection('Feature Overview', this.generateFeatureTable(features)),
        this.createSection('Critical Features (Impact 8-10)', this.describeCriticalFeatures(features)),
        this.createSection('Major Features (Impact 6-7.9)', this.describeMajorFeatures(features)),
        this.createSection('Supporting Features (Impact 4-5.9)', this.describeSupportingFeatures(features)),
        this.createSection('Minor Features (Impact 0-3.9)', this.describeMinorFeatures(features)),
        this.createSection('API Endpoints Summary', this.documentApiEndpoints(context)),
        this.createSection('Integration Points', this.identifyIntegrations(context)),
      ],
      metadata,
    };
  }

  private identifyAndClassifyFeatures(context: ProjectContext): Feature[] {
    const features: Feature[] = [];

    // Authentication Feature
    if (this.hasAuthentication(context)) {
      features.push(this.classifyAuthenticationFeature(context));
    }

    // API/Backend Features
    const apiFiles = this.getFilesMatching(context, /api.*route\.(ts|js)/);
    if (apiFiles.length > 0) {
      features.push(this.classifyApiFeature(context, apiFiles));
    }

    // Dashboard Feature
    if (this.hasDashboard(context)) {
      features.push(this.classifyDashboardFeature(context));
    }

    // Real-time Features
    if (this.hasRealtime(context)) {
      features.push(this.classifyRealtimeFeature(context));
    }

    // Chat/Messaging
    if (this.hasChat(context)) {
      features.push(this.classifyChatFeature(context));
    }

    // File Management
    if (this.hasFileManagement(context)) {
      features.push(this.classifyFileManagementFeature(context));
    }

    // Search
    if (this.hasSearch(context)) {
      features.push(this.classifySearchFeature(context));
    }

    // Profile/Settings
    if (this.hasProfile(context)) {
      features.push(this.classifyProfileFeature(context));
    }

    return features;
  }

  private classifyAuthenticationFeature(context: ProjectContext): Feature {
    return {
      name: 'User Authentication',
      impact: 9.4,
      category: 'Critical',
      description: 'Comprehensive authentication system handling user registration, login, session management, and OAuth integration.',
      capabilities: [
        'Email/password authentication',
        'OAuth integration (Google, GitHub)',
        'Session management with JWT',
        'Password reset flow',
        'Email verification',
      ],
      techStack: this.getAuthTechStack(context),
      impactBreakdown: {
        userAdoption: 10, // 100% of users
        businessValue: 10, // Critical for platform
        technicalComplexity: 9, // OAuth, JWT, RLS
        failureImpact: 10, // App unusable
        developmentEffort: 8, // Weeks of work
      },
    };
  }

  private classifyApiFeature(context: ProjectContext, apiFiles: FileInfo[]): Feature {
    return {
      name: 'RESTful API',
      impact: 8.5,
      category: 'Critical',
      description: `Backend API with ${apiFiles.length} endpoints providing data access and business logic.`,
      capabilities: [
        'CRUD operations',
        'Data validation',
        'Error handling',
        'Authentication middleware',
      ],
      techStack: ['Next.js API Routes', 'TypeScript'],
      impactBreakdown: {
        userAdoption: 9,
        businessValue: 9,
        technicalComplexity: 8,
        failureImpact: 9,
        developmentEffort: 8,
      },
    };
  }

  private classifyDashboardFeature(context: ProjectContext): Feature {
    return {
      name: 'Dashboard',
      impact: 7.5,
      category: 'Major',
      description: 'User dashboard providing overview, analytics, and quick access to main features.',
      capabilities: [
        'Overview statistics',
        'Recent activity',
        'Quick actions',
        'Data visualization',
      ],
      techStack: ['React', 'Next.js', 'Tailwind CSS'],
      impactBreakdown: {
        userAdoption: 8,
        businessValue: 7,
        technicalComplexity: 7,
        failureImpact: 6,
        developmentEffort: 7,
      },
    };
  }

  private classifyRealtimeFeature(context: ProjectContext): Feature {
    return {
      name: 'Real-time Updates',
      impact: 8.2,
      category: 'Major',
      description: 'Real-time data synchronization and live updates across clients.',
      capabilities: [
        'Live data updates',
        'WebSocket connections',
        'Optimistic UI updates',
        'Conflict resolution',
      ],
      techStack: this.getRealtimeTechStack(context),
      impactBreakdown: {
        userAdoption: 7,
        businessValue: 8,
        technicalComplexity: 9,
        failureImpact: 7,
        developmentEffort: 9,
      },
    };
  }

  private classifyChatFeature(context: ProjectContext): Feature {
    return {
      name: 'Chat/Messaging',
      impact: 7.8,
      category: 'Major',
      description: 'Real-time messaging system for user communication.',
      capabilities: [
        'Direct messaging',
        'Message history',
        'Real-time delivery',
        'Read receipts',
      ],
      techStack: ['WebSocket', 'Supabase Realtime'],
      impactBreakdown: {
        userAdoption: 6,
        businessValue: 8,
        technicalComplexity: 8,
        failureImpact: 6,
        developmentEffort: 8,
      },
    };
  }

  private classifyFileManagementFeature(context: ProjectContext): Feature {
    return {
      name: 'File Management',
      impact: 6.5,
      category: 'Important',
      description: 'File upload, storage, and management system.',
      capabilities: [
        'File upload',
        'File preview',
        'File organization',
        'Access control',
      ],
      techStack: ['Supabase Storage', 'Next.js'],
      impactBreakdown: {
        userAdoption: 6,
        businessValue: 6,
        technicalComplexity: 7,
        failureImpact: 5,
        developmentEffort: 6,
      },
    };
  }

  private classifySearchFeature(context: ProjectContext): Feature {
    return {
      name: 'Search',
      impact: 6.8,
      category: 'Important',
      description: 'Search functionality for finding content across the platform.',
      capabilities: [
        'Full-text search',
        'Filters and sorting',
        'Search suggestions',
        'Result highlighting',
      ],
      techStack: ['PostgreSQL Full-Text Search'],
      impactBreakdown: {
        userAdoption: 7,
        businessValue: 7,
        technicalComplexity: 6,
        failureImpact: 5,
        developmentEffort: 6,
      },
    };
  }

  private classifyProfileFeature(context: ProjectContext): Feature {
    return {
      name: 'Profile Management',
      impact: 5.3,
      category: 'Supporting',
      description: 'User profile customization and settings management.',
      capabilities: [
        'Profile editing',
        'Avatar upload',
        'Preferences',
        'Account settings',
      ],
      techStack: ['React', 'Supabase'],
      impactBreakdown: {
        userAdoption: 5,
        businessValue: 5,
        technicalComplexity: 4,
        failureImpact: 3,
        developmentEffort: 5,
      },
    };
  }

  // Helper methods
  private hasAuthentication(context: ProjectContext): boolean {
    return this.getFilesMatching(context, /auth|login|signup/).length > 0;
  }

  private hasDashboard(context: ProjectContext): boolean {
    return this.getFilesMatching(context, /dashboard/).length > 0;
  }

  private hasRealtime(context: ProjectContext): boolean {
    const deps = { ...context.packageJson?.dependencies };
    return !!(deps?.['@supabase/supabase-js'] || deps?.['socket.io']);
  }

  private hasChat(context: ProjectContext): boolean {
    return this.getFilesMatching(context, /chat|message/).length > 0;
  }

  private hasFileManagement(context: ProjectContext): boolean {
    return this.getFilesMatching(context, /upload|file|storage/).length > 0;
  }

  private hasSearch(context: ProjectContext): boolean {
    return this.getFilesMatching(context, /search/).length > 0;
  }

  private hasProfile(context: ProjectContext): boolean {
    return this.getFilesMatching(context, /profile|settings/).length > 0;
  }

  private getAuthTechStack(context: ProjectContext): string[] {
    const deps = { ...context.packageJson?.dependencies };
    const stack: string[] = [];
    
    if (deps?.['@supabase/supabase-js']) stack.push('Supabase Auth');
    if (deps?.['next-auth']) stack.push('NextAuth.js');
    if (deps?.['jsonwebtoken']) stack.push('JWT');
    
    return stack.length > 0 ? stack : ['Custom Authentication'];
  }

  private getRealtimeTechStack(context: ProjectContext): string[] {
    const deps = { ...context.packageJson?.dependencies };
    const stack: string[] = [];
    
    if (deps?.['@supabase/supabase-js']) stack.push('Supabase Realtime');
    if (deps?.['socket.io']) stack.push('Socket.IO');
    
    return stack.length > 0 ? stack : ['WebSocket'];
  }

  private generateFeatureTable(features: Feature[]): string {
    let table = '| Feature | Impact | Category | Description |\n';
    table += '|---------|--------|----------|-------------|\n';
    
    for (const feature of features) {
      table += `| ${feature.name} | ${feature.impact.toFixed(1)} | ${feature.category} | ${feature.description} |\n`;
    }
    
    return table;
  }

  private describeCriticalFeatures(features: Feature[]): string {
    const critical = features.filter(f => f.impact >= 8);
    
    if (critical.length === 0) {
      return 'No critical features identified.';
    }
    
    let description = '';
    for (const feature of critical) {
      description += `### ${feature.name} (${feature.impact.toFixed(1)}/10)\n\n`;
      description += `${feature.description}\n\n`;
      description += `**Key Capabilities**:\n`;
      for (const cap of feature.capabilities) {
        description += `- ${cap}\n`;
      }
      description += `\n**Technology Stack**: ${feature.techStack.join(', ')}\n\n`;
      description += `**Documentation**: See [features/${this.toKebabCase(feature.name)}.md](./features/${this.toKebabCase(feature.name)}.md)\n\n`;
      description += '---\n\n';
    }
    
    return description;
  }

  private describeMajorFeatures(features: Feature[]): string {
    const major = features.filter(f => f.impact >= 6 && f.impact < 8);
    
    if (major.length === 0) {
      return 'No major features identified.';
    }
    
    let description = '';
    for (const feature of major) {
      description += `### ${feature.name} (${feature.impact.toFixed(1)}/10)\n\n`;
      description += `${feature.description}\n\n`;
      description += `**Documentation**: See [features/${this.toKebabCase(feature.name)}.md](./features/${this.toKebabCase(feature.name)}.md)\n\n`;
      description += '---\n\n';
    }
    
    return description;
  }

  private describeSupportingFeatures(features: Feature[]): string {
    const supporting = features.filter(f => f.impact >= 4 && f.impact < 6);
    
    if (supporting.length === 0) {
      return 'No supporting features identified.';
    }
    
    let description = '';
    for (const feature of supporting) {
      description += `- **${feature.name}** (${feature.impact.toFixed(1)}) - ${feature.description}\n`;
    }
    
    return description;
  }

  private describeMinorFeatures(features: Feature[]): string {
    const minor = features.filter(f => f.impact < 4);
    
    if (minor.length === 0) {
      return 'No minor features identified.';
    }
    
    let description = '';
    for (const feature of minor) {
      description += `- ${feature.name} (${feature.impact.toFixed(1)})\n`;
    }
    
    return description;
  }

  private toKebabCase(str: string): string {
    return str
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
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
      const pathMatch = file.relativePath.match(/api\/(.*?)\/route\.(ts|js)/);
      if (pathMatch) {
        const path = `/api/${pathMatch[1]}`;
        
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
}
