import { createClient } from 'npm:@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface CreateAdminRequest {
  supabaseUrl: string;
  supabaseKey: string;
  email: string;
  password: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { supabaseUrl, supabaseKey, email, password }: CreateAdminRequest = await req.json();

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

    const adminClient = createClient(supabaseUrl, supabaseKey);

    const { data: signUpData, error: signUpError } = await adminClient.auth.signUp({
      email,
      password,
    });

    if (signUpError) {
      return new Response(
        JSON.stringify({ error: signUpError.message }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    if (!signUpData?.user) {
      return new Response(
        JSON.stringify({ error: 'User creation failed' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const userId = signUpData.user.id;

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
