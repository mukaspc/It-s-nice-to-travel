import { DEFAULT_USER_ID } from '../db/supabase.client';

export async function getUserIdFromRequest(request: Request): Promise<string> {
  // During development, always return the default user ID
  return DEFAULT_USER_ID;
  
  // TODO: Implement proper authentication in production:
  // 1. Verify Authorization header
  // 2. Validate JWT token
  // 3. Extract and verify user ID
} 