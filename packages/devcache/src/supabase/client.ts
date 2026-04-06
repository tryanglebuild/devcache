import { createClient, SupabaseClient } from '@supabase/supabase-js';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';

const SESSION_FILE = path.join(os.homedir(), '.devcache', 'session.json');

export interface SessionData {
  access_token: string;
  refresh_token: string;
  user_id: string;
  email: string;
  expires_at: number;
}

export class DevCacheSupabaseClient {
  private client: SupabaseClient | null = null;
  private session: SessionData | null = null;

  /**
   * Initialize Supabase client with environment variables
   */
  async initialize(): Promise<void> {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error(
        'Supabase credentials not found. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables.'
      );
    }

    this.client = createClient(supabaseUrl, supabaseKey);

    // Try to load existing session
    await this.loadSession();
  }

  /**
   * Authenticate user with email and password
   */
  async login(email: string, password: string): Promise<SessionData> {
    if (!this.client) {
      throw new Error('Supabase client not initialized');
    }

    const { data, error } = await this.client.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw new Error(`Authentication failed: ${error.message}`);
    }

    if (!data.session || !data.user) {
      throw new Error('No session data returned from authentication');
    }

    // Store session
    this.session = {
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
      user_id: data.user.id,
      email: data.user.email!,
      expires_at: data.session.expires_at || 0,
    };

    await this.saveSession();

    return this.session;
  }

  /**
   * Get current session
   */
  async getSession(): Promise<SessionData | null> {
    if (!this.session) {
      await this.loadSession();
    }

    // Check if session is expired
    if (this.session && this.session.expires_at < Date.now() / 1000) {
      await this.refreshSession();
    }

    return this.session;
  }

  /**
   * Refresh session token
   */
  private async refreshSession(): Promise<void> {
    if (!this.client || !this.session) {
      throw new Error('No session to refresh');
    }

    const { data, error } = await this.client.auth.refreshSession({
      refresh_token: this.session.refresh_token,
    });

    if (error || !data.session) {
      // Session expired, clear it
      this.session = null;
      await this.clearSession();
      throw new Error('Session expired. Please login again.');
    }

    this.session = {
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
      user_id: data.session.user.id,
      email: data.session.user.email!,
      expires_at: data.session.expires_at || 0,
    };

    await this.saveSession();
  }

  /**
   * Save OAuth session (public method for OAuth flow)
   */
  async saveOAuthSession(session: SessionData): Promise<void> {
    this.session = session;

    // Set session in Supabase client
    if (this.client) {
      await this.client.auth.setSession({
        access_token: session.access_token,
        refresh_token: session.refresh_token,
      });
    }

    await this.saveSession();
  }

  /**
   * Save session to file
   */
  private async saveSession(): Promise<void> {
    if (!this.session) return;

    const sessionDir = path.dirname(SESSION_FILE);
    await fs.mkdir(sessionDir, { recursive: true });
    await fs.writeFile(SESSION_FILE, JSON.stringify(this.session, null, 2), 'utf-8');
  }

  /**
   * Load session from file
   */
  private async loadSession(): Promise<void> {
    try {
      const content = await fs.readFile(SESSION_FILE, 'utf-8');
      this.session = JSON.parse(content);

      // Set session in Supabase client
      if (this.client && this.session) {
        await this.client.auth.setSession({
          access_token: this.session.access_token,
          refresh_token: this.session.refresh_token,
        });
      }
    } catch (error) {
      // Session file doesn't exist or is invalid
      this.session = null;
    }
  }

  /**
   * Clear session
   */
  async clearSession(): Promise<void> {
    this.session = null;

    try {
      await fs.unlink(SESSION_FILE);
    } catch (error) {
      // File doesn't exist, ignore
    }

    if (this.client) {
      await this.client.auth.signOut();
    }
  }

  /**
   * Get Supabase client
   */
  getClient(): SupabaseClient {
    if (!this.client) {
      throw new Error('Supabase client not initialized. Call initialize() first.');
    }

    return this.client;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return this.session !== null;
  }
}

// Singleton instance
let instance: DevCacheSupabaseClient | null = null;

export function getSupabaseClient(): DevCacheSupabaseClient {
  if (!instance) {
    instance = new DevCacheSupabaseClient();
  }
  return instance;
}
