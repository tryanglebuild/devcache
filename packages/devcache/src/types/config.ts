export interface DevCacheConfig {
  projectName: string;
  description?: string;
  version?: string;
  outputDir: string;
  templates: {
    general: string[];
    tech: string[];
  };
  supabase: {
    enabled: boolean;
    projectId: string | null;
  };
  analysis: {
    includePatterns: string[];
    excludePatterns: string[];
  };
}

export interface ProjectMetadata {
  name: string;
  version?: string;
  description?: string;
  repository?: string;
  author?: string;
  license?: string;
}
