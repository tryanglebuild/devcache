export interface ProjectContext {
  rootPath: string;
  config: any;
  files: FileInfo[];
  packageJson?: PackageJson;
  readme?: string;
  framework?: string;
}

export interface FileInfo {
  path: string;
  relativePath: string;
  name: string;
  extension: string;
  size: number;
  content?: string;
}

export interface PackageJson {
  name: string;
  version?: string;
  description?: string;
  main?: string;
  scripts?: Record<string, string>;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  repository?: string | { type: string; url: string };
  author?: string;
  license?: string;
  [key: string]: any;
}

export interface AnalysisOutput {
  title: string;
  sections: Section[];
  metadata?: Record<string, any>;
}

export interface Section {
  heading: string;
  content: string;
  subsections?: Section[];
}

export interface AnalysisResult {
  analyzer: string;
  outputPath: string;
  category: 'general' | 'tech';
  content: string;
  success: boolean;
  error?: string;
}
