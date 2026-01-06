# Quick Start for cPanel (AlmaLinux 8.10)

Fast deployment guide for your AlmaLinux cPanel environment on AWS EC2.

## What You Have

- AlmaLinux 8.10
- cPanel/WHM installed
- AWS EC2 instance
- Supabase database available

## 5-Minute Deploy

### 1. Upload and Build

```bash
# SSH into your cPanel account
ssh yourusername@your-domain.com

# Upload your code (via Git or File Manager)
git clone <your-repo> plugin-builder
cd plugin-builder

# Install and build
npm install
npm run build

# Deploy to public_html
rm -rf ~/public_html/*
cp -r dist/* ~/public_html/
```

### 2. Configure .htaccess

Create `~/public_html/.htaccess`:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule ^ index.html [L]
</IfModule>

php_value upload_max_filesize 50M
php_value post_max_size 50M
```

### 3. Enable SSL

In cPanel:
1. Go to **Security > SSL/TLS Status**
2. Click **Run AutoSSL**
3. Done

### 4. Run Setup Wizard

Visit `https://your-domain.com` and follow the wizard:

1. **Enter Supabase credentials** from your Supabase dashboard
2. **Run migrations** (see below)
3. **Create admin account**

### 5. Run Migrations

```bash
# SSH into server
ssh yourusername@your-domain.com

# Install Supabase CLI
npm install -g supabase

# Run migrations
cd ~/plugin-builder
supabase db push --db-url "your-supabase-connection-string"
```

Get the connection string from:
- **Self-hosted**: `postgresql://postgres:password@localhost:5432/postgres`
- **Hosted**: Supabase Dashboard > Settings > Database > Connection string

## That's It!

Your application is now live at `https://your-domain.com`

## Key Files

- **Application**: `~/public_html/*`
- **Source code**: `~/plugin-builder/`
- **.htaccess**: `~/public_html/.htaccess`
- **Logs**: `~/logs/error_log`

## Quick Updates

```bash
cd ~/plugin-builder
git pull
npm install
npm run build
rm -rf ~/public_html/*
cp -r dist/* ~/public_html/
```

## Common Issues

**"Cannot find module"**
- Install Node.js 18+: `nvm install 18 && nvm use 18`

**"Permission denied"**
- Fix permissions: `chmod -R 755 ~/public_html`

**"404 on page refresh"**
- Check `.htaccess` rewrite rules exist

**"Database connection failed"**
- Verify Supabase URL and keys are correct
- Check if Supabase is running (if self-hosted)

## Need More Details?

See [CPANEL_INSTALLATION.md](./CPANEL_INSTALLATION.md) for the complete guide.
