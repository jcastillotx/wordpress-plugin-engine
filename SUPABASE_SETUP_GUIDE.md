# Supabase Setup Guide

This guide will help you connect your application to Supabase using the built-in setup wizard.

## Choose Your Supabase Configuration

### Option 1: Supabase Cloud (Recommended for Production)

**Best for:** Production deployments, teams, and hassle-free hosting

1. Go to [supabase.com/dashboard](https://supabase.com/dashboard)
2. Create a new project
3. Wait for provisioning to complete
4. Navigate to Project Settings → API
5. Copy your:
   - Project URL (e.g., `https://abc123xyz.supabase.co`)
   - Anon/Public Key (starts with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`)

**CORS Configuration:**
- Supabase Cloud automatically handles CORS for most cases
- If you need to add custom origins:
  1. Go to Settings → API
  2. Scroll to "URL Configuration"
  3. Add your app's origin (e.g., `https://forgewp.app`)

### Option 2: Local Development

**Best for:** Development, testing, and learning

#### Prerequisites
```bash
# Install Supabase CLI
npm install -g supabase

# Initialize Supabase in your project
supabase init

# Start local Supabase
supabase start
```

#### Get Your Credentials
After starting, you'll see:
```
API URL: http://localhost:54321
anon key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### Fix CORS Issues

**Method 1: Update config.toml (Recommended)**

Edit `supabase/config.toml`:
```toml
[api]
additional_redirect_urls = ["https://forgewp.app", "http://localhost:5173"]
```

Restart Supabase:
```bash
supabase stop
supabase start
```

**Method 2: Docker Environment Variables**

If using Docker directly, add to your `docker-compose.yml` under the kong service:
```yaml
environment:
  KONG_CORS_ORIGINS: "https://forgewp.app,http://localhost:5173"
```

### Option 3: Self-Hosted

**Best for:** Full control, custom infrastructure, compliance requirements

#### Prerequisites
Follow the [Supabase Self-Hosting Guide](https://supabase.com/docs/guides/self-hosting)

#### CORS Configuration

Edit your Kong configuration file (usually `docker/volumes/api/kong.yml`):

```yaml
plugins:
  - name: cors
    config:
      origins:
        - https://forgewp.app
        - https://yourdomain.com
      methods:
        - GET
        - POST
        - PUT
        - PATCH
        - DELETE
        - OPTIONS
      headers:
        - Accept
        - Authorization
        - Content-Type
        - X-Client-Info
      credentials: false
      max_age: 3600
```

Restart Kong:
```bash
docker-compose restart kong
```

## Using the Setup Wizard

1. Open your application
2. You'll be automatically redirected to the setup wizard
3. Follow these steps:

### Step 1: Welcome
- Review the different Supabase options
- Click "Get Started"

### Step 2: Database Connection
- Enter your Supabase URL
- Enter your Supabase Anon Key
- Click "Test Connection"

**If you get a CORS error:**
- The wizard will automatically detect your setup type (local/cloud/self-hosted)
- Follow the specific instructions shown for your setup
- Use the copy buttons to quickly copy configuration snippets
- Apply the fix and retry the connection

### Step 3: Database Setup
- Run the provided migration commands
- Click "Verify Database Setup"

### Step 4: Create Admin Account
- Enter your admin email
- Create a secure password (minimum 8 characters)
- Click "Create Admin Account"

### Step 5: Complete
- Setup is done! Click "Go to Application"

## Common Issues

### CORS Error on Cloud Supabase
**Problem:** `Access to fetch has been blocked by CORS policy`

**Solution:**
1. Go to Supabase Dashboard → Settings → API
2. Under "URL Configuration", add your application's origin
3. Save and retry connection

### CORS Error on Local Supabase
**Problem:** Cannot connect to `http://localhost:54321`

**Solution:**
1. Update `supabase/config.toml` with your app's URL
2. Restart: `supabase stop && supabase start`
3. Retry connection in setup wizard

### Invalid API Key
**Problem:** `Invalid API key` error

**Solution:**
- Verify you're using the **anon** key, not the service role key
- Check for extra spaces or line breaks in the key
- Regenerate the key if necessary

### Connection Timeout
**Problem:** Connection times out

**Solution:**
- Verify the URL is correct
- Check your internet connection
- For local: ensure Supabase is running (`supabase status`)
- For self-hosted: verify the server is accessible

### Migration Errors
**Problem:** Database tables not found

**Solution:**
```bash
# Navigate to your project directory
cd /path/to/project

# Run migrations
supabase db push

# Or if using Docker:
docker exec -it supabase-db psql -U postgres -d postgres -f /migrations/yourfile.sql
```

## Environment Variables

The setup wizard automatically saves your configuration to localStorage. If you need to use environment variables instead:

Create a `.env` file:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

## Security Notes

1. **Never commit your keys to Git**
   - Add `.env` to `.gitignore`
   - Use environment variables in production

2. **Use Row Level Security (RLS)**
   - All tables have RLS enabled by default
   - Review policies before going to production

3. **Rotate Keys Regularly**
   - Especially after team member changes
   - Use Supabase Dashboard to regenerate keys

4. **Service Role Key**
   - Never expose the service role key in frontend code
   - Only use it in backend/server-side code

## Need Help?

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Discord Community](https://discord.supabase.com)
- [GitHub Issues](https://github.com/supabase/supabase/issues)
