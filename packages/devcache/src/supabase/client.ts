// CLI Supabase client wrapper — manages the user's auth session for all CLI commands.
// Persists the session (access token, refresh token, user ID, DevCache project credentials)
// to ~/.devcache/session.json so it survives across terminal sessions.
// Credential priority: saved session → env vars → hardcoded DevCache project defaults.

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import { DEVCACHE_SUPABASE_URL, DEVCACHE_SUPABASE_ANON_KEY } from '../config';

const SESSION_FILE = path.join(os.homedir(), '.devcache', 'session.json');

export interface SessionData {
  access_token: string;
  refresh_token: string;
  user_id: string;
  email: string;
  expires_at: number;
  // DevCache project credentials (saved during login)
  supabase_url: string;
  supabase_anon_key: string;
}

export class DevCacheSupabaseClient {
  private client: SupabaseClient | null = null;
  private session: SessionData | null = null;
  private supabaseUrl: string = '';
  private supabaseKey: string = '';

  /**
   * Initialize Supabase client with environment variables or saved session credentials
   */
  async initialize(): Promise<void> {
    // Try to load existing session first to get saved credentials
    await this.loadSession();

    // Priority 1: Use credentials from saved session (most reliable)
    if (this.session?.supabase_url && this.session?.supabase_anon_key) {
      this.supabaseUrl = this.session.supabase_url;
      this.supabaseKey = this.session.supabase_anon_key;
    }
    // Priority 2: Use environment variables (fallback for first-time setup)
    else if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      this.supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      this.supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    }
    // Priority 3: Use hardcoded DevCache credentials (last resort)
    else {
      this.supabaseUrl = DEVCACHE_SUPABASE_URL;
      this.supabaseKey = DEVCACHE_SUPABASE_ANON_KEY;
    }

    this.client = createClient(this.supabaseUrl, this.supabaseKey);

    // Set session in Supabase client if we have one
    if (this.session) {
      await this.client.auth.setSession({
        access_token: this.session.access_token,
        refresh_token: this.session.refresh_token,
      });
    }
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

    // Store session with DevCache credentials
    this.session = {
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
      user_id: data.user.id,
      email: data.user.email!,
      expires_at: data.session.expires_at || 0,
      supabase_url: this.supabaseUrl,
      supabase_anon_key: this.supabaseKey,
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
   * Silently refreshes the access token using the stored refresh token.
   * Called automatically by getSession() when the access token has expired.
   * If the refresh fails (e.g. token revoked), the session is cleared and the user
   * must run 'devcache login' again.
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

    // Preserve DevCache credentials when refreshing
    this.session = {
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
      user_id: data.session.user.id,
      email: data.session.user.email!,
      expires_at: data.session.expires_at || 0,
      supabase_url: this.session.supabase_url,
      supabase_anon_key: this.session.supabase_anon_key,
    };

    await this.saveSession();
  }

  /**
   * Save OAuth session (public method for OAuth flow)
   */
  async saveOAuthSession(session: SessionData): Promise<void> {
    // Ensure session includes DevCache credentials
    this.session = {
      ...session,
      supabase_url: session.supabase_url || this.supabaseUrl || DEVCACHE_SUPABASE_URL,
      supabase_anon_key: session.supabase_anon_key || this.supabaseKey || DEVCACHE_SUPABASE_ANON_KEY,
    };

    // Set session in Supabase client
    if (this.client) {
      await this.client.auth.setSession({
        access_token: this.session.access_token,
        refresh_token: this.session.refresh_token,
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
