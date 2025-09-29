import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { prisma } from '../_shared/prismaClient.ts'

// This function handles the creation of a new tenant and user.
// It's a critical transactional operation for the multi-tenant system.
serve(async (req) => {
  const allowedOrigin = Deno.env.get('ALLOWED_ORIGIN') || 'http://localhost:5173';

  // 1. Handle CORS preflight requests
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
    // 2. Initialize Supabase client with Service Role for admin operations
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // 3. Get user data from the request body
    const { email, password, businessName } = await req.json();
    if (!email || !password || !businessName) {
      return new Response(JSON.stringify({ error: 'Email, password, and business name are required.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }

    // 4. Create the Tenant first
    const newTenant = await prisma.tenant.create({
      data: {
        name: businessName,
      },
    });

    // 5. Create the user in Supabase Auth and link them to the new tenant
    // We store the tenant_id in the user's app_metadata
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm user for simplicity
      app_metadata: {
        tenant_id: newTenant.id,
      },
    });

    if (authError) {
      // If user creation fails, we should ideally roll back the tenant creation.
      // For now, we'll log the error and return a failure response.
      console.error('Supabase Auth Error:', authError);
      await prisma.tenant.delete({ where: { id: newTenant.id } }); // Rollback
      return new Response(JSON.stringify({ error: authError.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }

    // 6. Create the corresponding user profile in the public 'User' table
    await prisma.user.create({
      data: {
        id: authData.user.id, // Use the ID from Supabase Auth
        email: authData.user.email,
        role: 'manager', // The person who signs up is the manager
        tenantId: newTenant.id,
      },
    });

    // 7. Return a success response
    return new Response(JSON.stringify({ message: 'User and tenant created successfully.' }), {
      status: 201,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });

  } catch (error) {
    console.error('Internal Server Error:', error);
    return new Response(JSON.stringify({ error: 'An internal server error occurred.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  }
})