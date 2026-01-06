# Deployment Guide - Linux Server with PostgreSQL

This guide covers deploying the Plugin Builder application to a Linux server with PostgreSQL.

## Setup Wizard

The application includes a built-in setup wizard that runs automatically on first deployment. When you first access the application, you'll be guided through:

1. Database connection configuration
2. Database migration setup
3. Creating your first admin account

The wizard will delete itself automatically after successful setup, ensuring it only runs once.

## Current Architecture

This application is currently built with Supabase, which provides:
- PostgreSQL database with Row Level Security
- Built-in authentication system
- Real-time capabilities
- Edge functions for serverless API endpoints

## Deployment Options

### Option 1: Self-Hosted Supabase (Recommended)

Deploy your own Supabase instance on your Linux server. This maintains full compatibility with the existing codebase.

#### Requirements
- Docker and Docker Compose
- Linux server (Ubuntu 20.04+ recommended)
- 4GB RAM minimum, 8GB recommended
- 20GB disk space

#### Installation Steps

```bash
# Clone Supabase
git clone --depth 1 https://github.com/supabase/supabase
cd supabase/docker

# Copy example environment file
cp .env.example .env

# Edit .env file with your settings
nano .env

# Start Supabase
docker compose up -d
```

#### Configure Your Application

```bash
# Update .env file in your application
VITE_SUPABASE_URL=http://your-server-ip:8000
VITE_SUPABASE_ANON_KEY=your-anon-key-from-supabase
```

#### Deploy Migrations

```bash
# Install Supabase CLI
npm install -g supabase

# Link to your instance
supabase link --project-ref your-project-ref

# Push migrations
supabase db push
```

### Option 2: Standard PostgreSQL with Custom Backend

Convert the application to use standard PostgreSQL without Supabase dependencies.

#### Required Changes

This requires significant modifications:

1. **Remove Supabase Dependencies**
   - Replace `@supabase/supabase-js` with standard PostgreSQL client
   - Implement custom authentication (JWT-based)
   - Create REST API backend (Node.js/Express recommended)

2. **Database Modifications**
   - Remove `auth.uid()` references (requires session management)
   - Implement custom user management tables
   - Adapt RLS policies or move to application-level authorization

3. **Authentication System**
   - Implement custom JWT authentication
   - Create login/signup endpoints
   - Add session management

4. **Backend API**
   - Create Express.js server
   - Implement database connection pooling
   - Add API routes for all database operations
   - Handle file uploads and processing

#### Would you like me to implement Option 2?

I can create a complete backend system with:
- Express.js API server
- PostgreSQL connection with pg library
- JWT authentication
- Adapted database migrations
- Updated frontend to use REST API instead of Supabase client

## Option 3: Hybrid Approach - Use Hosted Supabase

Keep using Supabase's hosted service (free tier available) and only deploy your frontend to your Linux server.

### Frontend Deployment

#### Build the Application

```bash
npm install
npm run build
```

#### Serve with Nginx

```bash
# Install Nginx
sudo apt update
sudo apt install nginx

# Copy build files
sudo cp -r dist/* /var/www/html/plugin-builder/

# Configure Nginx
sudo nano /etc/nginx/sites-available/plugin-builder
```

Nginx configuration:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    root /var/www/html/plugin-builder;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Enable gzip compression
    gzip on;
    gzip_types text/css application/javascript application/json;
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/plugin-builder /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

#### SSL with Let's Encrypt

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

## Production Environment Variables

Create a `.env.production` file:

```bash
VITE_SUPABASE_URL=your-production-supabase-url
VITE_SUPABASE_ANON_KEY=your-production-anon-key
```

Build with production environment:

```bash
npm run build
```

## Monitoring and Maintenance

### Log Management

```bash
# Nginx access logs
tail -f /var/log/nginx/access.log

# Nginx error logs
tail -f /var/log/nginx/error.log
```

### Automatic Deployment Script

Create `deploy.sh`:

```bash
#!/bin/bash
set -e

echo "Pulling latest changes..."
git pull origin main

echo "Installing dependencies..."
npm install

echo "Building application..."
npm run build

echo "Deploying to web server..."
sudo rm -rf /var/www/html/plugin-builder/*
sudo cp -r dist/* /var/www/html/plugin-builder/

echo "Deployment complete!"
```

### Process Manager (if running Node.js backend)

```bash
# Install PM2
npm install -g pm2

# Start application
pm2 start server.js --name plugin-builder

# Setup autostart
pm2 startup
pm2 save
```

## Security Considerations

1. **Firewall Configuration**
```bash
sudo ufw allow 'Nginx Full'
sudo ufw allow OpenSSH
sudo ufw enable
```

2. **PostgreSQL Security** (if self-hosting)
```bash
# Edit PostgreSQL config
sudo nano /etc/postgresql/14/main/pg_hba.conf

# Only allow local connections or specific IPs
# Use strong passwords
# Enable SSL connections
```

3. **Environment Variables**
- Never commit `.env` files
- Use strong secrets for JWT tokens
- Rotate API keys regularly

4. **Regular Updates**
```bash
sudo apt update
sudo apt upgrade
npm audit fix
```

## Which Option Do You Prefer?

Please let me know which deployment approach you'd like:

1. **Self-hosted Supabase** - Full stack on your server, maintains compatibility
2. **Standard PostgreSQL** - I'll convert the app to use standard PostgreSQL with custom backend
3. **Hybrid** - Keep Supabase hosted, deploy only frontend to your server

I can provide detailed implementation for any of these options.
