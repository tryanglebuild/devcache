import { DevCacheSupabaseClient } from './client';
import { Logger } from '../utils';

export interface ProjectFolder {
  id: string;
  name: string;
  description?: string;
  user_id: string;
  created_at: string;
}

export interface ProjectFile {
  id: string;
  parent_id: string;
  name: string;
  content: string;
  type: 'file';
  user_id: string;
  created_at: string;
}

export class StorageManager {
  constructor(private supabaseClient: DevCacheSupabaseClient) {}

  /**
   * Create or update project folder structure
   */
  async createProjectStructure(
    projectName: string,
    description?: string
  ): Promise<ProjectFolder> {
    const client = this.supabaseClient.getClient();
    const session = await this.supabaseClient.getSession();

    if (!session) {
      throw new Error('Not authenticated');
    }

    // Check if project folder already exists
    const { data: existing, error: searchError } = await client
      .from('project_items')
      .select('*')
      .eq('user_id', session.user_id)
      .eq('name', projectName)
      .eq('type', 'folder')
      .is('parent_id', null)
      .maybeSingle();

    if (searchError) {
      throw new Error(`Failed to search for existing project: ${searchError.message}`);
    }

    if (existing) {
      Logger.info(`Project "${projectName}" already exists, will update files`);
      return existing as ProjectFolder;
    }

    // Create new project folder
    const { data, error } = await client
      .from('project_items')
      .insert({
        user_id: session.user_id,
        name: projectName,
        description: description || `DevCache documentation for ${projectName}`,
        type: 'folder',
        parent_id: null,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create project folder: ${error.message}`);
    }

    Logger.success(`Created project folder: ${projectName}`);
    return data as ProjectFolder;
  }

  /**
   * Create category folder (general or tech)
   */
  async createCategoryFolder(
    parentId: string,
    categoryName: string
  ): Promise<ProjectFolder> {
    const client = this.supabaseClient.getClient();
    const session = await this.supabaseClient.getSession();

    if (!session) {
      throw new Error('Not authenticated');
    }

    // Check if category folder already exists
    const { data: existing, error: searchError } = await client
      .from('project_items')
      .select('*')
      .eq('user_id', session.user_id)
      .eq('parent_id', parentId)
      .eq('name', categoryName)
      .eq('type', 'folder')
      .maybeSingle();

    if (searchError) {
      throw new Error(`Failed to search for category folder: ${searchError.message}`);
    }

    if (existing) {
      return existing as ProjectFolder;
    }

    // Create category folder
    const { data, error } = await client
      .from('project_items')
      .insert({
        user_id: session.user_id,
        parent_id: parentId,
        name: categoryName,
        type: 'folder',
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create category folder: ${error.message}`);
    }

    Logger.debug(`Created category folder: ${categoryName}`);
    return data as ProjectFolder;
  }

  /**
   * Upload documentation file
   */
  async uploadFile(
    parentId: string,
    fileName: string,
    content: string
  ): Promise<ProjectFile> {
    const client = this.supabaseClient.getClient();
    const session = await this.supabaseClient.getSession();

    if (!session) {
      throw new Error('Not authenticated');
    }

    // Check if file already exists
    const { data: existing, error: searchError } = await client
      .from('project_items')
      .select('*')
      .eq('user_id', session.user_id)
      .eq('parent_id', parentId)
      .eq('name', fileName)
      .eq('type', 'file')
      .maybeSingle();

    if (searchError) {
      throw new Error(`Failed to search for existing file: ${searchError.message}`);
    }

    if (existing) {
      // Update existing file
      const { data, error } = await client
        .from('project_items')
        .update({
          content,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to update file: ${error.message}`);
      }

      Logger.debug(`Updated file: ${fileName}`);
      return data as ProjectFile;
    }

    // Create new file
    const { data, error } = await client
      .from('project_items')
      .insert({
        user_id: session.user_id,
        parent_id: parentId,
        name: fileName,
        content,
        type: 'file',
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to upload file: ${error.message}`);
    }

    Logger.debug(`Uploaded file: ${fileName}`);
    return data as ProjectFile;
  }

  /**
   * Upload complete documentation structure with project folder
   */
  async uploadDocumentation(
    projectName: string,
    files: Array<{ category: 'general' | 'tech'; filename: string; content: string }>,
    indexContent: string,
    description?: string
  ): Promise<string> {
    Logger.info('Creating project structure...');

    // Create main project folder
    const projectFolder = await this.createProjectStructure(projectName, description);

    // Upload index.md file
    await this.uploadFile(projectFolder.id, 'index.md', indexContent);
    Logger.debug('Uploaded index.md');

    // Create category folders
    const generalFolder = await this.createCategoryFolder(projectFolder.id, 'general');
    const techFolder = await this.createCategoryFolder(projectFolder.id, 'tech');

    // Upload files
    for (const file of files) {
      const parentId = file.category === 'general' ? generalFolder.id : techFolder.id;
      await this.uploadFile(parentId, file.filename, file.content);
    }

    Logger.success(`Uploaded ${files.length + 1} files to project "${projectName}"`);
    
    return projectFolder.id;
  }

  /**
   * Get project URL for viewing in dashboard
   */
  getProjectUrl(projectId: string): string {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    return `${baseUrl}/dashboard/projects/${projectId}`;
  }
}
