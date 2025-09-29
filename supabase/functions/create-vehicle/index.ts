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
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
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

    const vehicleData = await req.json();

    // Basic validation
    if (!vehicleData.make || !vehicleData.model || !vehicleData.year || !vehicleData.vin) {
        return new Response(JSON.stringify({ error: 'Missing required vehicle fields.' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        });
    }

    const newVehicle = await prisma.vehicle.create({
      data: {
        // Spread the validated data, ensuring no extra fields are passed to prisma
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
        tenantId: tenantId, // Enforce tenant isolation
      },
    });

    return new Response(JSON.stringify(newVehicle), {
      status: 201, // Created
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    })
  } catch (error) {
    console.error(error);
    // Handle potential unique constraint violation on VIN
    if (error.code === 'P2002') {
        return new Response(JSON.stringify({ error: 'A vehicle with this VIN already exists.' }), {
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