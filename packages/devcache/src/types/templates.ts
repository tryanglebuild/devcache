export interface Template {
  name: string;
  category: 'general' | 'tech';
  outputFile: string;
  description: string;
  sections: TemplateSection[];
  analyzer: string;
}

export interface TemplateSection {
  heading: string;
  prompt: string;
  required: boolean;
  subsections?: TemplateSection[];
}

export interface TemplateRegistry {
  [key: string]: Template;
}
