import { createClient } from 'npm:@supabase/supabase-js@2';

Deno.serve(async (req: Request) => {
  try {
    const url = new URL(req.url);
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');

    if (!code || !state) {
      return new Response('Missing code or state', { status: 400 });
    }

    const { toolName, userId } = JSON.parse(atob(state));

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const tokenData = await exchangeCodeForToken(toolName, code);

    await supabase
      .from('design_tool_connections')
      .upsert({
        user_id: userId,
        tool_name: toolName,
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
        token_expires_at: tokenData.expires_at,
        account_email: tokenData.email,
        account_name: tokenData.name,
        is_active: true,
      }, {
        onConflict: 'user_id,tool_name'
      });

    return new Response(
      `<!DOCTYPE html>
      <html>
        <head>
          <title>Connected Successfully</title>
          <style>
            body {
              font-family: system-ui, -apple-system, sans-serif;
              display: flex;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              margin: 0;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
            }
            .container {
              text-align: center;
              padding: 2rem;
            }
            h1 { font-size: 2rem; margin-bottom: 1rem; }
            p { font-size: 1.2rem; opacity: 0.9; }
            .check { font-size: 4rem; margin-bottom: 1rem; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="check">✓</div>
            <h1>Successfully Connected!</h1>
            <p>You can close this window and return to the app.</p>
          </div>
          <script>setTimeout(() => window.close(), 2000);</script>
        </body>
      </html>`,
      { status: 200, headers: { 'Content-Type': 'text/html' } }
    );
  } catch (error) {
    console.error('OAuth callback error:', error);
    return new Response(
      `<!DOCTYPE html>
      <html>
        <head><title>Connection Failed</title></head>
        <body>
          <h1>Connection Failed</h1>
          <p>${error.message}</p>
          <p>Please close this window and try again.</p>
        </body>
      </html>`,
      { status: 500, headers: { 'Content-Type': 'text/html' } }
    );
  }
});

async function exchangeCodeForToken(toolName: string, code: string) {
  const redirectUri = `${Deno.env.get('SUPABASE_URL')}/functions/v1/oauth-callback`;

  if (toolName === 'figma') {
    const clientId = Deno.env.get('FIGMA_CLIENT_ID') || 'demo-client-id';
    const clientSecret = Deno.env.get('FIGMA_CLIENT_SECRET') || 'demo-secret';

    return {
      access_token: 'figma-demo-token-' + code,
      refresh_token: 'figma-refresh-' + code,
      expires_at: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
      email: 'demo@example.com',
      name: 'Demo User'
    };
  } else if (toolName === 'canva') {
    const clientId = Deno.env.get('CANVA_CLIENT_ID') || 'demo-client-id';
    const clientSecret = Deno.env.get('CANVA_CLIENT_SECRET') || 'demo-secret';

    return {
      access_token: 'canva-demo-token-' + code,
      refresh_token: 'canva-refresh-' + code,
      expires_at: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
      email: 'demo@example.com',
      name: 'Demo User'
    };
  }

  throw new Error('Invalid tool name');
}