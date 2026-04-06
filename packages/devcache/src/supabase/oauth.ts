import { createServer, IncomingMessage, ServerResponse } from 'http';
import { Logger } from '../utils';
import open from 'open';

const PORT = 54321;
const CALLBACK_PATH = '/auth/callback';

export interface OAuthResult {
  access_token: string;
  refresh_token: string;
  user_id: string;
  email: string;
  expires_at: number;
}

export class OAuthFlow {
  private server: ReturnType<typeof createServer> | null = null;
  private resolve: ((value: OAuthResult) => void) | null = null;
  private reject: ((error: Error) => void) | null = null;

  /**
   * Start OAuth flow
   */
  async startFlow(appUrl: string): Promise<OAuthResult> {
    return new Promise((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;

      // Create local server to receive callback
      this.server = createServer((req, res) => this.handleRequest(req, res));

      this.server.listen(PORT, () => {
        Logger.info('Starting authentication flow...');

        // Build OAuth URL
        const authUrl = `${appUrl}/auth/cli?redirect_uri=http://localhost:${PORT}${CALLBACK_PATH}`;

        Logger.info('Opening browser for authentication...');
        Logger.debug(`Auth URL: ${authUrl}`);

        // Open browser
        open(authUrl).catch((error) => {
          Logger.warn('Could not open browser automatically');
          console.log(`\nPlease open this URL in your browser:\n${authUrl}\n`);
        });
      });

      // Timeout after 5 minutes
      setTimeout(() => {
        this.cleanup();
        reject(new Error('Authentication timeout. Please try again.'));
      }, 5 * 60 * 1000);
    });
  }

  /**
   * Handle callback request
   */
  private handleRequest(req: IncomingMessage, res: ServerResponse): void {
    if (!req.url?.startsWith(CALLBACK_PATH)) {
      res.writeHead(404);
      res.end('Not found');
      return;
    }

    try {
      // Parse query parameters
      const url = new URL(req.url, `http://localhost:${PORT}`);
      const params = url.searchParams;

      // Check for error
      const error = params.get('error');
      if (error) {
        throw new Error(params.get('error_description') || error);
      }

      // Get tokens
      const access_token = params.get('access_token');
      const refresh_token = params.get('refresh_token');
      const user_id = params.get('user_id');
      const email = params.get('email');
      const expires_at = params.get('expires_at');

      if (!access_token || !refresh_token || !user_id || !email) {
        throw new Error('Missing required authentication parameters');
      }

      // Send success response
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Authentication Successful</title>
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                display: flex;
                align-items: center;
                justify-content: center;
                height: 100vh;
                margin: 0;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              }
              .container {
                background: white;
                padding: 3rem;
                border-radius: 1rem;
                box-shadow: 0 20px 60px rgba(0,0,0,0.3);
                text-align: center;
                max-width: 400px;
              }
              .success-icon {
                font-size: 4rem;
                margin-bottom: 1rem;
              }
              h1 {
                color: #2d3748;
                margin: 0 0 1rem 0;
              }
              p {
                color: #718096;
                margin: 0 0 1.5rem 0;
              }
              .email {
                background: #f7fafc;
                padding: 0.75rem;
                border-radius: 0.5rem;
                color: #4a5568;
                font-family: monospace;
                margin-bottom: 1.5rem;
              }
              .close-message {
                color: #a0aec0;
                font-size: 0.875rem;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="success-icon">✓</div>
              <h1>Authentication Successful!</h1>
              <p>You have successfully logged in to DevCache.</p>
              <div class="email">${email}</div>
              <p class="close-message">You can close this window and return to your terminal.</p>
            </div>
          </body>
        </html>
      `);

      // Resolve promise
      if (this.resolve) {
        this.resolve({
          access_token,
          refresh_token,
          user_id,
          email,
          expires_at: expires_at ? parseInt(expires_at) : Date.now() / 1000 + 3600,
        });
      }

      // Cleanup
      setTimeout(() => this.cleanup(), 1000);
    } catch (error: any) {
      // Send error response
      res.writeHead(400, { 'Content-Type': 'text/html' });
      res.end(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Authentication Failed</title>
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                display: flex;
                align-items: center;
                justify-content: center;
                height: 100vh;
                margin: 0;
                background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
              }
              .container {
                background: white;
                padding: 3rem;
                border-radius: 1rem;
                box-shadow: 0 20px 60px rgba(0,0,0,0.3);
                text-align: center;
                max-width: 400px;
              }
              .error-icon {
                font-size: 4rem;
                margin-bottom: 1rem;
              }
              h1 {
                color: #2d3748;
                margin: 0 0 1rem 0;
              }
              p {
                color: #718096;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="error-icon">✗</div>
              <h1>Authentication Failed</h1>
              <p>${error.message}</p>
              <p>Please try again from your terminal.</p>
            </div>
          </body>
        </html>
      `);

      // Reject promise
      if (this.reject) {
        this.reject(error);
      }

      // Cleanup
      setTimeout(() => this.cleanup(), 1000);
    }
  }

  /**
   * Cleanup server
   */
  private cleanup(): void {
    if (this.server) {
      this.server.close();
      this.server = null;
    }
    this.resolve = null;
    this.reject = null;
  }
}
