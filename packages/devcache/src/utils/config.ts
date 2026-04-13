// Reads and writes the .devcache.json project configuration file.
// Used by every CLI command that needs the project name, output directory, or analysis patterns.

import fs from 'fs/promises';
import path from 'path';
import { DevCacheConfig } from '../types';

export class ConfigManager {
  private static CONFIG_FILE = '.devcache.json';

  /**
   * Read DevCache configuration
   */
  static async readConfig(rootPath: string = process.cwd()): Promise<DevCacheConfig> {
    const configPath = path.join(rootPath, this.CONFIG_FILE);

    try {
      const content = await fs.readFile(configPath, 'utf-8');
      return JSON.parse(content);
    } catch (error) {
      throw new Error(
        'DevCache not initialized. Run "devcache init" first.'
      );
    }
  }

  /**
   * Write DevCache configuration
   */
  static async writeConfig(
    config: DevCacheConfig,
    rootPath: string = process.cwd()
  ): Promise<void> {
    const configPath = path.join(rootPath, this.CONFIG_FILE);
    await fs.writeFile(configPath, JSON.stringify(config, null, 2), 'utf-8');
  }

  /**
   * Check if DevCache is initialized
   */
  static async isInitialized(rootPath: string = process.cwd()): Promise<boolean> {
    const configPath = path.join(rootPath, this.CONFIG_FILE);

    try {
      await fs.access(configPath);
      return true;
    } catch {
      return false;
    }
  }
}
