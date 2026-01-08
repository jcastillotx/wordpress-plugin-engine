import { serve } from "https://deno.land/std@0.177.1/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface CreateAdminRequest {
  supabaseUrl: string;
  supabaseKey: string;
  serviceRoleKey?: string;
  email: string;
  password: string;
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { supabaseUrl, supabaseKey, serviceRoleKey: requestServiceKey, email, password }: CreateAdminRequest = await req.json();

    if (!supabaseUrl || !supabaseKey || !email || !password) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    if (password.length < 8) {
      return new Response(
        JSON.stringify({ error: 'Password must be at least 8 characters' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Get the service role key - prefer from request, then from environment
    const serviceRoleKey = requestServiceKey || Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    // Use service role key if available (allows auto-confirming email), otherwise fall back to provided key
    const adminClient = createClient(supabaseUrl, serviceRoleKey || supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    let userId: string;

    // If we have service role key, use admin API to create user with email already confirmed
    if (serviceRoleKey) {
      const { data: createData, error: createError } = await adminClient.auth.admin.createUser({
        email,
        password,
        email_confirm: true, // Auto-confirm email - no confirmation email needed
      });

      if (createError) {
        return new Response(
          JSON.stringify({ error: createError.message }),
          {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      if (!createData?.user) {
        return new Response(
          JSON.stringify({ error: 'User creation failed' }),
          {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      userId = createData.user.id;
    } else {
      // Fall back to regular signUp (may require email confirmation if enabled)
      const { data: signUpData, error: signUpError } = await adminClient.auth.signUp({
        email,
        password,
      });

      if (signUpError) {
        // Check if this is an email confirmation error - user might still be created
        const isEmailError = signUpError.message?.toLowerCase().includes('email') &&
          (signUpError.message?.toLowerCase().includes('confirm') ||
           signUpError.message?.toLowerCase().includes('sending'));

        if (isEmailError && signUpData?.user) {
          // User was created but email failed - continue with profile creation
          console.log('Email confirmation failed but user was created, continuing...');
          userId = signUpData.user.id;
        } else {
          return new Response(
            JSON.stringify({ error: signUpError.message }),
            {
              status: 400,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            }
          );
        }
      } else if (!signUpData?.user) {
        return new Response(
          JSON.stringify({ error: 'User creation failed' }),
          {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      } else {
        userId = signUpData.user.id;
      }
    }

    const { error: profileError } = await adminClient
      .from('profiles')
      .insert({
        id: userId,
        role: 'admin',
        full_name: 'Admin'
      });

    if (profileError) {
      console.log('Profile insert failed, trying update:', profileError);

      const { error: updateError } = await adminClient
        .from('profiles')
        .update({ role: 'admin' })
        .eq('id', userId);

      if (updateError) {
        console.error('Failed to set admin role:', updateError);
        return new Response(
          JSON.stringify({
            success: true,
            warning: 'User created but admin role may not be set. Please check manually.',
            userId
          }),
          {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Admin user created successfully',
        userId
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    console.error('Create admin error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Unknown error occurred' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
