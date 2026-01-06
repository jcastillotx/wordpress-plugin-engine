# cPanel Installation Guide (AlmaLinux)

Complete installation guide for deploying Plugin Builder on AlmaLinux 8.10 with cPanel on AWS EC2.

## Prerequisites

- AlmaLinux 8.10 server with cPanel/WHM
- Root or WHM access
- Domain pointed to your server
- Supabase database (hosted or self-hosted)
- SSH access to your server

## Architecture Overview

```
cPanel Account
├── public_html/
│   └── dist/           # Built application files
├── nodejs/             # Node.js application (if using Node.js selector)
└── .env               # Environment variables
```

## Step 1: Prepare cPanel Environment

### 1.1 Enable Node.js in WHM

1. Login to WHM as root
2. Navigate to **Software > Manage Node.js**
3. Enable Node.js for your domain
4. Select Node.js version 18 or higher

### 1.2 Create cPanel Account (if needed)

1. Login to WHM
2. **Account Functions > Create a New Account**
3. Enter domain and account details
4. Note the username (e.g., `cpanelusr`)

## Step 2: Deploy Supabase

### Option A: Self-Hosted on Same Server

```bash
# SSH into your server as root
ssh root@your-server-ip

# Install Docker (if not installed)
dnf config-manager --add-repo=https://download.docker.com/linux/centos/docker-ce.repo
dnf install docker-ce docker-ce-cli containerd.io docker-compose-plugin -y
systemctl start docker
systemctl enable docker

# Deploy Supabase
cd /opt
git clone --depth 1 https://github.com/supabase/supabase
cd supabase/docker

cp .env.example .env
nano .env
```

Configure `.env`:
```env
# Update these values
POSTGRES_PASSWORD=your-strong-password-here
JWT_SECRET=your-jwt-secret-32-chars-min
ANON_KEY=your-anon-key
SERVICE_ROLE_KEY=your-service-role-key
SITE_URL=https://your-domain.com
```

Generate keys:
```bash
# Generate JWT secret (32+ characters)
openssl rand -base64 32

# For ANON_KEY and SERVICE_ROLE_KEY, use Supabase's key generator
# or generate JWT tokens with appropriate claims
```

Start Supabase:
```bash
docker compose up -d

# Check status
docker compose ps
```

Supabase will be available at:
- API: `http://localhost:8000`
- Studio: `http://localhost:3000`

### Option B: Hosted Supabase (Easier)

1. Go to https://supabase.com
2. Create new project
3. Note your Project URL and anon key
4. Skip to Step 3

## Step 3: Build the Application

### 3.1 Upload Source Code

```bash
# SSH as root or your cPanel user
ssh cpanelusr@your-domain.com

# Navigate to home directory
cd ~

# Clone your repository
git clone <your-repo-url> plugin-builder-src
cd plugin-builder-src

# Or upload via cPanel File Manager and extract
```

### 3.2 Install Dependencies and Build

```bash
# Ensure you're using Node.js 18+
node --version

# If not, use cPanel's Node.js selector or nvm
# Install nvm if needed:
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 18
nvm use 18

# Install dependencies
npm install

# Build for production
npm run build
```

The `dist/` folder now contains your built application.

### 3.3 Deploy to public_html

```bash
# Clear public_html (backup first if needed)
cd ~/public_html
mkdir -p backup
mv * backup/ 2>/dev/null || true

# Copy built files
cp -r ~/plugin-builder-src/dist/* ~/public_html/

# Set proper permissions
chmod 755 ~/public_html
find ~/public_html -type f -exec chmod 644 {} \;
find ~/public_html -type d -exec chmod 755 {} \;
```

## Step 4: Configure .htaccess for React Router

Create/edit `~/public_html/.htaccess`:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /

  # Don't rewrite files or directories
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d

  # Rewrite everything else to index.html
  RewriteRule ^ index.html [L]
</IfModule>

# Enable compression
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/plain text/css application/json application/javascript text/javascript
</IfModule>

# Browser caching
<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType image/jpg "access plus 1 year"
  ExpiresByType image/jpeg "access plus 1 year"
  ExpiresByType image/gif "access plus 1 year"
  ExpiresByType image/png "access plus 1 year"
  ExpiresByType text/css "access plus 1 month"
  ExpiresByType application/javascript "access plus 1 month"
  ExpiresByType text/javascript "access plus 1 month"
</IfModule>

# Increase upload size
php_value upload_max_filesize 50M
php_value post_max_size 50M
```

## Step 5: Setup SSL Certificate

### Via cPanel (Let's Encrypt)

1. Login to cPanel
2. Navigate to **Security > SSL/TLS Status**
3. Click **Run AutoSSL** for your domain
4. Wait for certificate installation

### Via WHM (Let's Encrypt)

1. Login to WHM
2. Navigate to **SSL/TLS > Manage AutoSSL**
3. Enable AutoSSL
4. Select "Let's Encrypt" as provider

Your site is now accessible at: `https://your-domain.com`

## Step 6: Run the Setup Wizard

1. Open your browser and go to `https://your-domain.com`
2. The setup wizard will appear automatically
3. Follow the wizard steps:

### Step 1: Database Connection

Enter your Supabase details:
- **URL**: `https://your-project.supabase.co` (or `http://your-server-ip:8000` for self-hosted)
- **Anon Key**: From Supabase Dashboard > Settings > API

Click "Test Connection"

### Step 2: Run Migrations

Install Supabase CLI on your server:

```bash
# SSH into server
ssh cpanelusr@your-domain.com

# Install Supabase CLI
npm install -g supabase

# For self-hosted Supabase
cd ~/plugin-builder-src
supabase db push --db-url "postgresql://postgres:your-password@localhost:5432/postgres"

# For hosted Supabase (get connection string from dashboard)
supabase db push --db-url "postgresql://postgres.[project-ref]:[password]@[region].pooler.supabase.com:5432/postgres"
```

Click "Verify Database Setup" in the wizard.

### Step 3: Create Admin

Enter your admin email and password, click "Create Admin Account"

## Step 7: Post-Installation Setup

### 7.1 Create Update Script

```bash
nano ~/update-plugin-builder.sh
```

Add:
```bash
#!/bin/bash
set -e

echo "Updating Plugin Builder..."

cd ~/plugin-builder-src
git pull origin main
npm install
npm run build

# Backup current version
cd ~/public_html
mkdir -p ../backups/$(date +%Y%m%d_%H%M%S)
cp -r * ../backups/$(date +%Y%m%d_%H%M%S)/

# Deploy new version
rm -rf *
cp -r ~/plugin-builder-src/dist/* .

# Fix permissions
find ~/public_html -type f -exec chmod 644 {} \;
find ~/public_html -type d -exec chmod 755 {} \;

echo "Update complete!"
```

Make it executable:
```bash
chmod +x ~/update-plugin-builder.sh
```

Run updates:
```bash
./update-plugin-builder.sh
```

### 7.2 Setup Backups (Self-Hosted Supabase)

```bash
# Create backup script
nano ~/backup-database.sh
```

Add:
```bash
#!/bin/bash
BACKUP_DIR="$HOME/backups/database"
mkdir -p "$BACKUP_DIR"
DATE=$(date +%Y%m%d_%H%M%S)

docker exec supabase-db pg_dump -U postgres postgres > "$BACKUP_DIR/backup_$DATE.sql"
gzip "$BACKUP_DIR/backup_$DATE.sql"

# Keep last 7 days only
find "$BACKUP_DIR" -name "backup_*.sql.gz" -mtime +7 -delete

echo "Backup completed: backup_$DATE.sql.gz"
```

Make executable and add to cron:
```bash
chmod +x ~/backup-database.sh

# Add to crontab (runs daily at 2 AM)
crontab -e
# Add line:
0 2 * * * /home/cpanelusr/backup-database.sh
```

## Step 8: Configure Firewall

```bash
# As root user
ssh root@your-server-ip

# Allow HTTP/HTTPS
firewall-cmd --permanent --add-service=http
firewall-cmd --permanent --add-service=https

# If self-hosting Supabase and want to access Studio remotely
firewall-cmd --permanent --add-port=3000/tcp

# Reload firewall
firewall-cmd --reload
```

## Troubleshooting

### Issue: Node.js Version Too Old

```bash
# Install nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc

# Install Node 18
nvm install 18
nvm use 18
nvm alias default 18
```

### Issue: Permission Denied

```bash
# Fix permissions
cd ~/public_html
find . -type f -exec chmod 644 {} \;
find . -type d -exec chmod 755 {} \;
chown -R cpanelusr:cpanelusr ~/public_html
```

### Issue: 404 Errors on Refresh

Check `.htaccess` has correct rewrite rules (see Step 4)

### Issue: Can't Connect to Supabase

For self-hosted:
```bash
# Check if Docker is running
docker compose ps

# Check logs
docker compose logs

# Restart if needed
docker compose restart
```

For hosted: Verify URL and keys are correct

### Issue: Build Fails

```bash
# Clear npm cache
npm cache clean --force

# Remove node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Issue: Upload Size Limits

Edit `~/.htaccess` or use cPanel's **Select PHP Version > Options**:
- `upload_max_filesize`: 50M
- `post_max_size`: 50M

## Security Checklist

- [x] SSL certificate installed
- [ ] Strong database passwords
- [ ] Firewall configured
- [ ] Regular backups enabled
- [ ] File permissions correct (644/755)
- [ ] Database not exposed publicly
- [ ] Keep system updated: `dnf update`

## Performance Optimization

### Enable OPcache (PHP)

In cPanel > **Select PHP Version > Options**:
- `opcache.enable`: On
- `opcache.memory_consumption`: 128

### Enable Compression

Already configured in `.htaccess` above

### CDN (Optional)

Consider using Cloudflare for:
- DDoS protection
- CDN caching
- Additional SSL

## Monitoring

### Via cPanel

1. **Metrics > Resource Usage** - Monitor CPU/RAM
2. **Metrics > Bandwidth** - Check traffic
3. **Logs > Error Log** - Check for issues

### Via Command Line

```bash
# Check disk space
df -h

# Check memory
free -h

# Monitor processes
top

# Check logs
tail -f ~/logs/error_log
```

## Getting Help

- Check browser console (F12) for frontend errors
- Check cPanel error logs
- Check Supabase logs: `docker compose logs`
- Verify all steps completed correctly

## Summary

You now have:
- Plugin Builder deployed on cPanel
- Supabase database configured
- SSL certificate active
- Setup wizard completed
- Backups configured
- Update script ready

Access your site at: `https://your-domain.com`
