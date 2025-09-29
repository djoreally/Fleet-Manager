import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// This utility function verifies the JWT from the request,
// extracts the user's tenant_id, and returns it.
// It's the core of our multi-tenant security on the backend.
export async function getTenantIdFromAuth(req: Request): Promise<string | null> {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    console.warn('No Authorization header provided.');
    return null;
  }

  try {
    // Initialize a Supabase client with the user's JWT
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    // Get the authenticated user
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error) {
      console.error('JWT validation error:', error.message);
      return null;
    }

    if (!user) {
      console.warn('No user found for the provided JWT.');
      return null;
    }

    // Extract the tenant_id from the user's metadata
    const tenantId = user.app_metadata?.tenant_id;
    if (!tenantId) {
      console.error(`User ${user.id} does not have a tenant_id in their metadata.`);
      return null;
    }

    return tenantId;

  } catch (err) {
    console.error('An unexpected error occurred during authentication:', err);
    return null;
  }
}