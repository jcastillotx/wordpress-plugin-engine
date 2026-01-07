# WordPress Plugin Builder Platform

An AI-powered platform for building WordPress plugins, Divi modules, and Elementor widgets with visual design-to-code conversion.

## Features

- AI-powered WordPress plugin generation
- Divi module builder with visual reference support
- Elementor widget builder
- Design-to-code conversion (images to HTML/CSS/layouts)
- Figma and Canva integration
- Admin panel for managing users and content
- Subscription management system
- Built-in setup wizard for easy deployment

## Quick Start

### For Local Development

```bash
npm install
npm run dev
```

### For Production Deployment

See [INSTALLATION.md](./INSTALLATION.md) for complete deployment instructions.

## Setup Wizard

The application includes an automated setup wizard that runs on first deployment. It guides you through:

1. Configuring database connection (with automatic CORS detection)
2. Running database migrations
3. Creating your first admin account

The wizard supports:
- Supabase Cloud (hosted)
- Local Supabase development
- Self-hosted Supabase instances

For detailed instructions on connecting to different Supabase configurations, see [SUPABASE_SETUP_GUIDE.md](./SUPABASE_SETUP_GUIDE.md).

After setup completes, the wizard automatically removes itself. See [SETUP_WIZARD.md](./SETUP_WIZARD.md) for additional details.

## Deployment Options

### Option 1: Self-Hosted Supabase (Recommended)

Deploy the full stack on your own server using Docker. Best for production environments.

**Difficulty**: Easy (Docker Compose handles everything)

```bash
git clone https://github.com/supabase/supabase
cd supabase/docker
docker compose up -d
```

### Option 2: Hosted Supabase + Your Frontend

Use Supabase's hosted service for the database and deploy only your frontend to your server.

**Difficulty**: Very Easy

### Option 3: Standard PostgreSQL (Advanced)

Convert the application to use standard PostgreSQL without Supabase. Requires building custom backend.

**Difficulty**: Hard (not recommended)

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions on all options.

## Documentation

### Installation & Deployment
- [INSTALLATION.md](./INSTALLATION.md) - General installation guide
- [SUPABASE_SETUP_GUIDE.md](./SUPABASE_SETUP_GUIDE.md) - Supabase connection guide with CORS fixes
- [CPANEL_INSTALLATION.md](./CPANEL_INSTALLATION.md) - cPanel/AlmaLinux specific guide
- [CPANEL_QUICK_START.md](./CPANEL_QUICK_START.md) - 5-minute cPanel deployment
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Deployment options and strategies
- [SETUP_WIZARD.md](./SETUP_WIZARD.md) - Setup wizard documentation

### Features & Administration
- [ADMIN_SETUP.md](./ADMIN_SETUP.md) - Admin system documentation
- [DESIGN_TO_CODE.md](./DESIGN_TO_CODE.md) - Design conversion features
- [FIGMA_CANVA_INTEGRATION.md](./FIGMA_CANVA_INTEGRATION.md) - Design tool integrations

### Security
- [SECURITY_AUDIT.md](./SECURITY_AUDIT.md) - Complete security audit report
- [SECURITY_CHECKLIST.md](./SECURITY_CHECKLIST.md) - Security maintenance checklist

## Technology Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, Vite
- **Backend**: Supabase (PostgreSQL + Auth + Storage + Edge Functions)
- **Authentication**: Supabase Auth with email/password
- **Database**: PostgreSQL with Row Level Security
- **Icons**: Lucide React
- **Deployment**: Nginx, Docker, Linux

## Architecture

```
┌─────────────────┐
│  React Frontend │
│  (Vite Build)   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│    Supabase     │
├─────────────────┤
│  - PostgreSQL   │
│  - Auth System  │
│  - Storage      │
│  - Edge Funcs   │
└─────────────────┘
```

## Project Structure

```
/src
  /components     # Reusable React components
  /contexts       # React contexts (Auth, etc)
  /hooks          # Custom React hooks
  /lib            # Utility functions and clients
  /pages          # Page components
  /types          # TypeScript type definitions

/supabase
  /functions      # Edge functions
  /migrations     # Database migrations

/dist             # Production build output
```

## Key Features

### Plugin Builder

Create WordPress plugins using AI with:
- Custom feature descriptions
- Theme compatibility testing
- Visual reference images
- Builder module options (Divi, Elementor)

### Design-to-Code Conversion

Upload design images and convert to:
- HTML/CSS
- Divi layouts with companion plugins
- Elementor layouts with companion plugins

### Design Tool Integration

Connect your Figma or Canva account to:
- Browse your designs
- Import directly for conversion
- Automatic export handling

### Admin Panel

Full-featured admin system with:
- User management
- Subscription management
- Plugin approval system
- Custom page builder
- Site settings management
- Activity logs

## Environment Variables

Create a `.env` file with:

```env
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

During production deployment, these are configured via the setup wizard.

## Database Migrations

Migrations are located in `supabase/migrations/` and include:

1. Plugin builder schema
2. Visual references and builder types
3. Admin system and pages
4. Design conversion system
5. Design tool integrations
6. Performance optimizations

Run migrations using:

```bash
supabase db push --db-url "your-database-url"
```

## Building for Production

```bash
npm install
npm run build
```

Output will be in the `dist/` directory, ready to serve with Nginx or any static host.

## Development Commands

```bash
npm run dev        # Start development server
npm run build      # Build for production
npm run preview    # Preview production build
npm run lint       # Run ESLint
npm run typecheck  # Run TypeScript checks
```

## Security

- All tables use Row Level Security (RLS)
- User data isolated by user_id
- Admin-only access for management features
- Secure token storage for design tool integrations
- Environment variables for sensitive data

## Support

For issues and questions:
1. Check the documentation files
2. Review browser console for errors
3. Check Nginx logs: `/var/log/nginx/error.log`
4. Check Supabase logs: `docker compose logs`

## License

Proprietary
