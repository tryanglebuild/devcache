import chalk from 'chalk';
import ora from 'ora';
import path from 'path';
import fs from 'fs/promises';
import crypto from 'crypto';
import { ConfigManager, Logger } from '../../utils';

interface FileStatus {
  path: string;
  status: 'new' | 'modified' | 'unchanged';
  lastModified: Date;
}

interface StatusCache {
  files: Record<string, { hash: string; lastPush: string }>;
}

const CACHE_FILE = '.devcache/status-cache.json';

/**
 * Calculate MD5 hash of file content
 */
function calculateHash(content: string): string {
  return crypto.createHash('md5').update(content).digest('hex');
}

/**
 * Load status cache
 */
async function loadCache(): Promise<StatusCache> {
  try {
    const cachePath = path.join(process.cwd(), CACHE_FILE);
    const content = await fs.readFile(cachePath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    return { files: {} };
  }
}

/**
 * Save status cache
 */
async function saveCache(cache: StatusCache): Promise<void> {
  const cachePath = path.join(process.cwd(), CACHE_FILE);
  const cacheDir = path.dirname(cachePath);
  
  await fs.mkdir(cacheDir, { recursive: true });
  await fs.writeFile(cachePath, JSON.stringify(cache, null, 2), 'utf-8');
}

/**
 * Scan documentation files and compare with cache
 */
async function scanFiles(projectPath: string, cache: StatusCache): Promise<FileStatus[]> {
  const files: FileStatus[] = [];

  async function scanDirectory(dirPath: string, relativePath: string = ''): Promise<void> {
    try {
      const entries = await fs.readdir(dirPath, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);
        const relPath = relativePath ? path.join(relativePath, entry.name) : entry.name;

        if (entry.isDirectory()) {
          await scanDirectory(fullPath, relPath);
        } else if (entry.isFile() && entry.name.endsWith('.md')) {
          const content = await fs.readFile(fullPath, 'utf-8');
          const hash = calculateHash(content);
          const stats = await fs.stat(fullPath);

          const cachedFile = cache.files[relPath];
          let status: 'new' | 'modified' | 'unchanged';

          if (!cachedFile) {
            status = 'new';
          } else if (cachedFile.hash !== hash) {
            status = 'modified';
          } else {
            status = 'unchanged';
          }

          files.push({
            path: relPath,
            status,
            lastModified: stats.mtime,
          });
        }
      }
    } catch (error) {
      Logger.warn(`Error scanning directory ${dirPath}: ${error}`);
    }
  }

  await scanDirectory(projectPath);
  return files;
}

export async function statusCommand() {
  const spinner = ora('Checking documentation status...').start();

  try {
    // Load configuration
    const config = await ConfigManager.readConfig();

    // Check if documentation exists
    const projectPath = path.join(process.cwd(), config.outputDir, config.projectName);

    try {
      await fs.access(projectPath);
    } catch (error) {
      spinner.fail('No documentation found');
      console.log(chalk.yellow('\nRun'), chalk.cyan('devcache init'), chalk.yellow('to initialize the project.'));
      process.exit(1);
    }

    // Load cache
    const cache = await loadCache();

    // Scan files
    const files = await scanFiles(projectPath, cache);

    spinner.stop();

    // Categorize files
    const newFiles = files.filter(f => f.status === 'new');
    const modifiedFiles = files.filter(f => f.status === 'modified');
    const unchangedFiles = files.filter(f => f.status === 'unchanged');

    // Display status
    console.log(chalk.blue.bold('\n📊 Documentation Status\n'));
    console.log(chalk.gray(`Project: ${config.projectName}`));
    console.log(chalk.gray(`Location: ${projectPath}\n`));

    if (newFiles.length > 0) {
      console.log(chalk.green.bold(`✨ New files (${newFiles.length}):`));
      newFiles.forEach(file => {
        console.log(chalk.green(`  + ${file.path}`));
      });
      console.log();
    }

    if (modifiedFiles.length > 0) {
      console.log(chalk.yellow.bold(`📝 Modified files (${modifiedFiles.length}):`));
      modifiedFiles.forEach(file => {
        console.log(chalk.yellow(`  ~ ${file.path}`));
      });
      console.log();
    }

    if (unchangedFiles.length > 0) {
      console.log(chalk.gray(`✓ Unchanged files: ${unchangedFiles.length}`));
      console.log();
    }

    // Summary
    const pendingCount = newFiles.length + modifiedFiles.length;
    
    if (pendingCount > 0) {
      console.log(chalk.cyan.bold(`📤 ${pendingCount} file(s) pending push`));
      console.log(chalk.gray('\nRun'), chalk.cyan('devcache push'), chalk.gray('to sync with cloud.'));
    } else {
      console.log(chalk.green.bold('✓ All files are up to date!'));
      console.log(chalk.gray('No changes to push.'));
    }

    console.log();

  } catch (error: any) {
    spinner.fail('Status check failed');
    Logger.error(error.message);
    process.exit(1);
  }
}

/**
 * Update cache after successful push
 */
export async function updateStatusCache(projectPath: string): Promise<void> {
  const cache: StatusCache = { files: {} };

  async function scanDirectory(dirPath: string, relativePath: string = ''): Promise<void> {
    try {
      const entries = await fs.readdir(dirPath, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);
        const relPath = relativePath ? path.join(relativePath, entry.name) : entry.name;

        if (entry.isDirectory()) {
          await scanDirectory(fullPath, relPath);
        } else if (entry.isFile() && entry.name.endsWith('.md')) {
          const content = await fs.readFile(fullPath, 'utf-8');
          const hash = calculateHash(content);

          cache.files[relPath] = {
            hash,
            lastPush: new Date().toISOString(),
          };
        }
      }
    } catch (error) {
      // Ignore errors
    }
  }

  await scanDirectory(projectPath);
  await saveCache(cache);
}
