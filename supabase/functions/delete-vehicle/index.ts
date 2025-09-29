import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { prisma } from '../_shared/prismaClient.ts'

// This function will eventually get the tenant ID from the authenticated user's JWT
async function getTenantIdFromAuth(req: Request): Promise<string> {
  const authHeader = req.headers.get('Authorization');
  if (authHeader && authHeader.startsWith('Bearer tenant_')) {
    return authHeader.split('tenant_')[1];
  }
  return 'cuid_placeholder_tenant_id';
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'DELETE, OPTIONS',
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

    // Extract vehicle ID from the URL path, e.g., /delete-vehicle/{id}
    const url = new URL(req.url);
    const pathParts = url.pathname.split('/');
    const vehicleId = pathParts[pathParts.length - 1];

    if (!vehicleId) {
        return new Response(JSON.stringify({ error: 'Vehicle ID is required.' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        });
    }

    // First, verify the vehicle belongs to the tenant before deleting
    const existingVehicle = await prisma.vehicle.findUnique({
        where: { id: vehicleId },
    });

    if (!existingVehicle || existingVehicle.tenantId !== tenantId) {
        return new Response(JSON.stringify({ error: 'Vehicle not found or access denied.' }), {
            status: 404,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        });
    }

    await prisma.vehicle.delete({
      where: {
        id: vehicleId,
      },
    });

    return new Response(JSON.stringify({ message: 'Vehicle deleted successfully.' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    })
  } catch (error) {
    console.error(error);
    // Handle cases where deletion is not possible due to foreign key constraints (e.g., existing inspections)
    if (error.code === 'P2003') {
        return new Response(JSON.stringify({ error: 'Cannot delete vehicle because it has associated inspections.' }), {
            status: 409, // Conflict
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        });
    }
    return new Response(JSON.stringify({ error: 'An internal server error occurred.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    })
  }
})