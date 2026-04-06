import fs from 'fs/promises';
import path from 'path';
import { glob } from 'glob';
import { FileInfo, PackageJson } from '../types';

export class FileParser {
  /**
   * Scan project directory and return file information
   */
  static async scanProject(
    rootPath: string,
    includePatterns: string[],
    excludePatterns: string[]
  ): Promise<FileInfo[]> {
    const files: FileInfo[] = [];

    for (const pattern of includePatterns) {
      const matches = await glob(pattern, {
        cwd: rootPath,
        ignore: excludePatterns,
        nodir: true,
        absolute: false,
      });

      for (const match of matches) {
        const fullPath = path.join(rootPath, match);
        const stats = await fs.stat(fullPath);

        files.push({
          path: fullPath,
          relativePath: match,
          name: path.basename(match),
          extension: path.extname(match),
          size: stats.size,
        });
      }
    }

    return files;
  }

  /**
   * Read and parse package.json
   */
  static async readPackageJson(rootPath: string): Promise<PackageJson | null> {
    try {
      const packagePath = path.join(rootPath, 'package.json');
      const content = await fs.readFile(packagePath, 'utf-8');
      return JSON.parse(content);
    } catch (error) {
      return null;
    }
  }

  /**
   * Read README.md content
   */
  static async readReadme(rootPath: string): Promise<string | null> {
    const readmeFiles = ['README.md', 'readme.md', 'Readme.md', 'README.MD'];

    for (const filename of readmeFiles) {
      try {
        const readmePath = path.join(rootPath, filename);
        return await fs.readFile(readmePath, 'utf-8');
      } catch (error) {
        continue;
      }
    }

    return null;
  }

  /**
   * Read file content
   */
  static async readFile(filePath: string): Promise<string> {
    return await fs.readFile(filePath, 'utf-8');
  }

  /**
   * Detect project framework
   */
  static detectFramework(packageJson: PackageJson | null): string | undefined {
    if (!packageJson) return undefined;

    const deps = {
      ...packageJson.dependencies,
      ...packageJson.devDependencies,
    };

    if (deps['next']) return 'Next.js';
    if (deps['react']) return 'React';
    if (deps['vue']) return 'Vue.js';
    if (deps['@angular/core']) return 'Angular';
    if (deps['express']) return 'Express';
    if (deps['fastify']) return 'Fastify';
    if (deps['nestjs']) return 'NestJS';

    return undefined;
  }

  /**
   * Get file extension statistics
   */
  static getFileStats(files: FileInfo[]): Record<string, number> {
    const stats: Record<string, number> = {};

    for (const file of files) {
      const ext = file.extension || 'no-extension';
      stats[ext] = (stats[ext] || 0) + 1;
    }

    return stats;
  }
}
