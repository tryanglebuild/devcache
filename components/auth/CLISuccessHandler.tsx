'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

export function CLISuccessHandler() {
  const searchParams = useSearchParams();
  const [tokensSent, setTokensSent] = useState(false);

  useEffect(() => {
    // Prevent multiple executions
    if (tokensSent) return;

    // Get all the auth parameters
    const accessToken = searchParams.get('access_token');
    const refreshToken = searchParams.get('refresh_token');
    const userId = searchParams.get('user_id');
    const email = searchParams.get('email');
    const expiresAt = searchParams.get('expires_at');
    const redirectUri = searchParams.get('redirect_uri');

    // If we have a redirect URI (CLI callback), send the tokens
    if (redirectUri && accessToken && refreshToken) {
      try {
        const cliRedirectUrl = new URL(redirectUri);
        cliRedirectUrl.searchParams.set('access_token', accessToken);
        cliRedirectUrl.searchParams.set('refresh_token', refreshToken);
        if (userId) cliRedirectUrl.searchParams.set('user_id', userId);
        if (email) cliRedirectUrl.searchParams.set('email', email);
        if (expiresAt) cliRedirectUrl.searchParams.set('expires_at', expiresAt);

        console.log('Sending tokens to CLI:', cliRedirectUrl.toString());

        // Method 1: Direct window location change (most reliable for localhost callbacks)
        // This will actually navigate to the CLI callback URL
        setTimeout(() => {
          window.location.href = cliRedirectUrl.toString();
        }, 1000);

        setTokensSent(true);
        console.log('Tokens will be sent to CLI in 1 second');
      } catch (error) {
        console.error('Error sending tokens to CLI:', error);
      }
    }
  }, [searchParams, tokensSent]);

  return null;
}
