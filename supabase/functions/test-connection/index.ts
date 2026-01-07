import { createClient } from 'npm:@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface TestConnectionRequest {
  supabaseUrl: string;
  supabaseKey: string;
  testType: 'connection' | 'migration';
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { supabaseUrl, supabaseKey, testType }: TestConnectionRequest = await req.json();

    if (!supabaseUrl || !supabaseKey) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const testClient = createClient(supabaseUrl, supabaseKey);

    if (testType === 'connection') {
      const { error } = await testClient.from('_test_').select('*').limit(1);

      const tableMissingErrors = [
        'does not exist',
        'relation "_test_" does not exist',
        'Could not find the table',
        'schema cache'
      ];

      const isConnectionSuccess = !error || tableMissingErrors.some(msg =>
        error.message?.includes(msg) || error.hint?.includes(msg)
      );

      if (!isConnectionSuccess) {
        return new Response(
          JSON.stringify({ success: false, error: error.message }),
          {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      return new Response(
        JSON.stringify({ success: true, message: 'Connection successful!' }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    if (testType === 'migration') {
      const { data, error } = await testClient.from('profiles').select('id').limit(1);

      if (error) {
        const tableMissingErrors = [
          'does not exist',
          'relation "profiles" does not exist',
          'Could not find the table',
          'schema cache'
        ];

        const isTableMissing = tableMissingErrors.some(msg =>
          error.message?.includes(msg) || error.hint?.includes(msg)
        ) || error.code === 'PGRST204';

        if (isTableMissing) {
          return new Response(
            JSON.stringify({
              success: false,
              migrationNeeded: true,
              message: 'Database tables not found. Please run migrations first.'
            }),
            {
              status: 200,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            }
          );
        }

        return new Response(
          JSON.stringify({ success: false, error: error.message }),
          {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      return new Response(
        JSON.stringify({ success: true, message: 'Database is properly configured!' }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid test type' }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    console.error('Test connection error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message || 'Unknown error occurred' }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
