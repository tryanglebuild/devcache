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
   * Create or get folder by path (supports nested folders)
   */
  async createFolderByPath(
    parentId: string,
    folderPath: string
  ): Promise<ProjectFolder> {
    const client = this.supabaseClient.getClient();
    const session = await this.supabaseClient.getSession();

    if (!session) {
      throw new Error('Not authenticated');
    }

    // Split path into parts (e.g., "tech/features/auth" -> ["tech", "features", "auth"])
    const parts = folderPath.split('/').filter(p => p.length > 0);
    
    let currentParentId = parentId;
    
    // Create each folder in the path
    for (const folderName of parts) {
      // Check if folder already exists
      const { data: existing, error: searchError } = await client
        .from('project_items')
        .select('*')
        .eq('user_id', session.user_id)
        .eq('parent_id', currentParentId)
        .eq('name', folderName)
        .eq('type', 'folder')
        .maybeSingle();

      if (searchError) {
        throw new Error(`Failed to search for folder: ${searchError.message}`);
      }

      if (existing) {
        currentParentId = existing.id;
        continue;
      }

      // Create folder
      const { data, error } = await client
        .from('project_items')
        .insert({
          user_id: session.user_id,
          parent_id: currentParentId,
          name: folderName,
          type: 'folder',
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to create folder "${folderName}": ${error.message}`);
      }

      Logger.debug(`Created folder: ${folderName}`);
      currentParentId = data.id;
    }

    // Return the last created/found folder
    const { data: finalFolder, error } = await client
      .from('project_items')
      .select('*')
      .eq('id', currentParentId)
      .single();

    if (error) {
      throw new Error(`Failed to get final folder: ${error.message}`);
    }

    return finalFolder as ProjectFolder;
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
   * Processes files in chunks and triggers embedding generation
   */
  async uploadDocumentation(
    projectName: string,
    files: Array<{ category: 'general' | 'tech'; filename: string; content: string }>,
    indexContent: string,
    description?: string,
    chunkSize: number = 5
  ): Promise<{ projectId: string; uploadedFileIds: string[] }> {
    Logger.info('Creating project structure...');

    // Create main project folder
    const projectFolder = await this.createProjectStructure(projectName, description);

    // Upload index.md file
    const indexFile = await this.uploadFile(projectFolder.id, 'index.md', indexContent);
    Logger.debug('Uploaded index.md');

    const uploadedFileIds: string[] = [indexFile.id];

    // Process files in chunks
    const totalFiles = files.length;
    const chunks = Math.ceil(totalFiles / chunkSize);

    for (let i = 0; i < chunks; i++) {
      const start = i * chunkSize;
      const end = Math.min(start + chunkSize, totalFiles);
      const chunk = files.slice(start, end);

      Logger.info(`Processing chunk ${i + 1}/${chunks} (${chunk.length} files)...`);

      // Upload files in current chunk
      const chunkFileIds: string[] = [];
      
      for (const file of chunk) {
        // Parse the file path to extract folder structure and filename
        const pathParts = file.filename.split('/');
        const fileName = pathParts[pathParts.length - 1];
        const folderPath = pathParts.slice(0, -1).join('/');

        let parentId = projectFolder.id;

        // If there's a folder path, create the folder structure
        if (folderPath) {
          const folder = await this.createFolderByPath(projectFolder.id, folderPath);
          parentId = folder.id;
        }

        // Upload the file to the correct folder
        const uploadedFile = await this.uploadFile(parentId, fileName, file.content);
        chunkFileIds.push(uploadedFile.id);
      }

      uploadedFileIds.push(...chunkFileIds);

      // Trigger embedding generation for this chunk (fire-and-forget)
      this.triggerChunkEmbeddings(chunkFileIds).catch(err => {
        Logger.warn(`Failed to trigger embeddings for chunk ${i + 1}: ${err.message}`);
      });

      Logger.success(`Chunk ${i + 1}/${chunks} uploaded (${chunkFileIds.length} files)`);
    }

    Logger.success(`Uploaded ${files.length + 1} files to project "${projectName}"`);
    
    return {
      projectId: projectFolder.id,
      uploadedFileIds
    };
  }

  /**
   * Trigger embedding generation for a chunk of files
   * Fire-and-forget approach to avoid blocking the upload process
   */
  private async triggerChunkEmbeddings(fileIds: string[]): Promise<void> {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    
    // Trigger embeddings for each file in parallel
    const promises = fileIds.map(fileId =>
      fetch(`${baseUrl}/api/embeddings/generate-project`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ project_item_id: fileId })
      }).catch(err => {
        Logger.debug(`Failed to trigger embedding for file ${fileId}: ${err.message}`);
      })
    );

    await Promise.allSettled(promises);
  }

  /**
   * Get project URL for viewing in dashboard
   */
  getProjectUrl(projectId: string): string {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    return `${baseUrl}/dashboard/projects/${projectId}`;
  }
}
