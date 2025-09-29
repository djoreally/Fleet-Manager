import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { prisma } from '../_shared/prismaClient.ts'

// This function will eventually get the tenant ID from the authenticated user's JWT
async function getTenantIdFromAuth(req: Request): Promise<string> {
  // In a real implementation, you would decode the JWT from the Authorization header
  // and extract the tenant_id claim.
  // For now, we'll use a placeholder or a header for testing.
  const authHeader = req.headers.get('Authorization');
  if (authHeader && authHeader.startsWith('Bearer tenant_')) {
    return authHeader.split('tenant_')[1];
  }
  // This is a placeholder for development and MUST be replaced with real auth
  return 'cuid_placeholder_tenant_id';
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      }
    })
  }

  try {
    const tenantId = await getTenantIdFromAuth(req);

    if (!tenantId) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      })
    }

    const vehicles = await prisma.vehicle.findMany({
      where: {
        tenantId: tenantId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return new Response(JSON.stringify(vehicles), {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    })
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: 'An internal server error occurred.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    })
  }
})