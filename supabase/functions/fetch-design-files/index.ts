import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { toolName } = await req.json();

    const { data: connection } = await supabase
      .from('design_tool_connections')
      .select('*')
      .eq('user_id', user.id)
      .eq('tool_name', toolName)
      .eq('is_active', true)
      .maybeSingle();

    if (!connection) {
      return new Response(
        JSON.stringify({ error: 'No active connection found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const files = await fetchFilesFromTool(toolName, connection.access_token);

    await supabase
      .from('design_tool_connections')
      .update({ last_synced_at: new Date().toISOString() })
      .eq('id', connection.id);

    return new Response(
      JSON.stringify({ files }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function fetchFilesFromTool(toolName: string, accessToken: string) {
  if (toolName === 'figma') {
    return [
      {
        id: 'figma-1',
        name: 'Homepage Design',
        thumbnail: 'https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead?w=400',
        url: 'https://www.figma.com/file/demo1',
        lastModified: new Date().toISOString(),
        metadata: { pages: 3, frames: 12 }
      },
      {
        id: 'figma-2',
        name: 'Product Page',
        thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400',
        url: 'https://www.figma.com/file/demo2',
        lastModified: new Date(Date.now() - 86400000).toISOString(),
        metadata: { pages: 2, frames: 8 }
      },
      {
        id: 'figma-3',
        name: 'Mobile App Design',
        thumbnail: 'https://images.unsplash.com/photo-1618005198907-386d7428f6e0?w=400',
        url: 'https://www.figma.com/file/demo3',
        lastModified: new Date(Date.now() - 172800000).toISOString(),
        metadata: { pages: 5, frames: 20 }
      }
    ];
  } else if (toolName === 'canva') {
    return [
      {
        id: 'canva-1',
        name: 'Social Media Post',
        thumbnail: 'https://images.unsplash.com/photo-1634942537034-2531766767d1?w=400',
        url: 'https://www.canva.com/design/demo1',
        lastModified: new Date().toISOString(),
        metadata: { type: 'social', dimensions: '1080x1080' }
      },
      {
        id: 'canva-2',
        name: 'Landing Page',
        thumbnail: 'https://images.unsplash.com/photo-1635322966219-b75ed372eb01?w=400',
        url: 'https://www.canva.com/design/demo2',
        lastModified: new Date(Date.now() - 86400000).toISOString(),
        metadata: { type: 'web', dimensions: '1920x1080' }
      },
      {
        id: 'canva-3',
        name: 'Email Template',
        thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400',
        url: 'https://www.canva.com/design/demo3',
        lastModified: new Date(Date.now() - 172800000).toISOString(),
        metadata: { type: 'email', dimensions: '600x800' }
      }
    ];
  }

  return [];
}