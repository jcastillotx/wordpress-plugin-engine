# Installation Guide

This guide walks you through installing the Plugin Builder application on your Linux server.

## Quick Start

1. Deploy Supabase (or use hosted Supabase)
2. Build and deploy the application
3. Complete the setup wizard on first visit
4. Start building plugins

## Prerequisites

- Linux server (Ubuntu 20.04+ recommended)
- Docker and Docker Compose (for self-hosted Supabase)
- Node.js 18+ and npm
- Nginx (for serving the application)
- Domain name with SSL certificate (recommended)

## Step 1: Deploy Supabase

### Option A: Self-Hosted Supabase (Recommended for Production)

```bash
cd /opt
sudo git clone --depth 1 https://github.com/supabase/supabase
cd supabase/docker

sudo cp .env.example .env
sudo nano .env
```

Configure your .env file with:
- Strong passwords for all services
- Your server's IP or domain
- Proper JWT secrets

Start Supabase:
```bash
sudo docker compose up -d
```

Supabase will be available at:
- API: http://localhost:8000
- Studio: http://localhost:3000

### Option B: Hosted Supabase (Quick Start)

1. Go to https://supabase.com
2. Create a new project
3. Note your project URL and anon key

## Step 2: Build the Application

```bash
cd /var/www
sudo git clone <your-repo-url> plugin-builder
cd plugin-builder

npm install
npm run build
```

The built files will be in the `dist/` directory.

## Step 3: Configure Nginx

Create Nginx configuration:

```bash
sudo nano /etc/nginx/sites-available/plugin-builder
```

Add the following configuration:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    root /var/www/plugin-builder/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    gzip on;
    gzip_types text/css application/javascript application/json;

    client_max_body_size 50M;
}
```

Enable the site:

```bash
sudo ln -s /etc/nginx/sites-available/plugin-builder /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## Step 4: Setup SSL (Recommended)

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

## Step 5: Run the Setup Wizard

1. Navigate to your domain: https://your-domain.com
2. The setup wizard will appear automatically
3. Follow the wizard steps:

### Wizard Step 1: Database Connection

Enter your Supabase credentials:
- **Supabase URL**: `https://your-project.supabase.co` or `http://your-server-ip:8000` for self-hosted
- **Anon Key**: Found in Supabase Dashboard > Settings > API

Click "Test Connection" to verify.

### Wizard Step 2: Run Database Migrations

Install Supabase CLI on your server:

```bash
npm install -g supabase
```

Run migrations:

```bash
cd /var/www/plugin-builder
supabase db push --db-url "postgresql://postgres:your-password@localhost:5432/postgres"
```

For hosted Supabase, get the direct database URL from:
Supabase Dashboard > Settings > Database > Connection string (Direct)

Click "Verify Database Setup" in the wizard once complete.

### Wizard Step 3: Create Admin Account

Enter your admin email and password (minimum 8 characters).

Click "Create Admin Account" to finish setup.

## Step 6: Login and Start Using

After setup completes, you'll be redirected to the login page. Use your admin credentials to access the admin panel.

## Automatic Deployment Script

Create a deployment script for easy updates:

```bash
sudo nano /usr/local/bin/deploy-plugin-builder
```

Add:

```bash
#!/bin/bash
set -e

cd /var/www/plugin-builder
git pull origin main
npm install
npm run build
sudo systemctl reload nginx

echo "Deployment complete!"
```

Make it executable:

```bash
sudo chmod +x /usr/local/bin/deploy-plugin-builder
```

Run deployments with:
```bash
deploy-plugin-builder
```

## Troubleshooting

### Setup Wizard Won't Load
- Check Nginx configuration
- Verify build succeeded
- Check browser console for errors

### Database Connection Failed
- Verify Supabase is running: `sudo docker compose ps`
- Check firewall settings
- Verify credentials are correct

### Migrations Failed
- Ensure Supabase CLI is installed
- Check database connection string
- Verify you have database admin permissions

### Can't Create Admin User
- Ensure migrations ran successfully
- Check that `profiles` table exists
- Verify email is valid format

## Security Checklist

- [ ] SSL certificate installed
- [ ] Strong passwords for all services
- [ ] Firewall configured (ufw)
- [ ] Regular backups enabled
- [ ] Database not exposed to public internet
- [ ] Environment variables secured
- [ ] Regular security updates scheduled

## Post-Installation

### Enable Automatic Backups

For self-hosted Supabase:

```bash
sudo mkdir -p /backups/supabase
sudo nano /usr/local/bin/backup-supabase
```

Add backup script:

```bash
#!/bin/bash
BACKUP_DIR="/backups/supabase"
DATE=$(date +%Y%m%d_%H%M%S)

docker exec supabase-db pg_dump -U postgres postgres > "$BACKUP_DIR/backup_$DATE.sql"
gzip "$BACKUP_DIR/backup_$DATE.sql"

find "$BACKUP_DIR" -name "backup_*.sql.gz" -mtime +7 -delete
```

Add to crontab:
```bash
sudo chmod +x /usr/local/bin/backup-supabase
sudo crontab -e
```

Add line:
```
0 2 * * * /usr/local/bin/backup-supabase
```

### Monitor Application

Install monitoring:

```bash
sudo apt install prometheus-node-exporter
```

Monitor Nginx logs:
```bash
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

Monitor Supabase:
```bash
sudo docker compose logs -f
```

## Updating the Application

```bash
cd /var/www/plugin-builder
git pull
npm install
npm run build
sudo systemctl reload nginx
```

## Need Help?

- Check application logs: Browser console (F12)
- Check Nginx logs: `/var/log/nginx/error.log`
- Check Supabase logs: `docker compose logs`
- Review setup wizard steps carefully
