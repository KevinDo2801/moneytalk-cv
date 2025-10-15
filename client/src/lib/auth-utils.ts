import { supabase } from './supabase';

/**
 * Get authentication headers for API requests
 * @returns Promise<HeadersInit> - Headers object with Authorization header if user is authenticated
 */
export async function getAuthHeaders(): Promise<HeadersInit> {
  const { data: { session } } = await supabase.auth.getSession();
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (session?.access_token) {
    headers['Authorization'] = `Bearer ${session.access_token}`;
  }

  return headers;
}

/**
 * Get authentication headers for API requests (synchronous version)
 * This should be used when you already have the session
 * @param accessToken - The access token from Supabase session
 * @returns HeadersInit - Headers object with Authorization header
 */
export function getAuthHeadersSync(accessToken?: string): HeadersInit {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  return headers;
}
