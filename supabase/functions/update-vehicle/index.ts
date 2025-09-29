import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { prisma } from '../_shared/prismaClient.ts'
import { getTenantIdFromAuth } from '../_shared/auth.ts'

serve(async (req) => {
  const allowedOrigin = Deno.env.get('ALLOWED_ORIGIN') || 'http://localhost:5173';

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': allowedOrigin,
        'Access-Control-Allow-Methods': 'PUT, OPTIONS',
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

    // Extract vehicle ID from the URL path, e.g., /update-vehicle/{id}
    const url = new URL(req.url);
    const pathParts = url.pathname.split('/');
    const vehicleId = pathParts[pathParts.length - 1];

    if (!vehicleId) {
        return new Response(JSON.stringify({ error: 'Vehicle ID is required.' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        });
    }

    const vehicleData = await req.json();

    // First, verify the vehicle belongs to the tenant before updating
    const existingVehicle = await prisma.vehicle.findUnique({
        where: { id: vehicleId },
    });

    if (!existingVehicle || existingVehicle.tenantId !== tenantId) {
        return new Response(JSON.stringify({ error: 'Vehicle not found or access denied.' }), {
            status: 404,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        });
    }

    const updatedVehicle = await prisma.vehicle.update({
      where: {
        id: vehicleId,
      },
      data: {
        make: vehicleData.make,
        model: vehicleData.model,
        year: vehicleData.year,
        mileage: vehicleData.mileage,
        vin: vehicleData.vin,
        licensePlate: vehicleData.licensePlate,
        oilFilterPartNumber: vehicleData.oilFilterPartNumber,
        airFilterPartNumber: vehicleData.airFilterPartNumber,
        cabinAirFilterPartNumber: vehicleData.cabinAirFilterPartNumber,
        fuelFilterPartNumber: vehicleData.fuelFilterPartNumber,
      },
    });

    return new Response(JSON.stringify(updatedVehicle), {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    })
  } catch (error) {
    console.error(error);
    if (error.code === 'P2002') {
        return new Response(JSON.stringify({ error: 'A vehicle with this VIN already exists.' }), {
            status: 409,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        });
    }
    return new Response(JSON.stringify({ error: 'An internal server error occurred.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    })
  }
})