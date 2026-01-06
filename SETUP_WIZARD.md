# Setup Wizard

The Plugin Builder application includes an automated setup wizard that runs on first deployment.

## How It Works

### Automatic Detection

When you first access the application, it checks if setup has been completed. If not, the setup wizard appears automatically.

The wizard uses localStorage to track completion status, so after successful setup, it will never appear again unless you clear browser data.

### Wizard Flow

#### 1. Welcome Screen
- Overview of what's needed
- Checklist of requirements
- Introduction to the setup process

#### 2. Database Connection
- Enter Supabase URL
- Enter Supabase Anon Key
- Test connection to verify credentials
- Credentials are saved to localStorage for the application

#### 3. Connection Verification
- Success screen after connection test passes
- Proceeds to migration setup

#### 4. Database Migration
- Displays instructions for running migrations
- Shows exact commands to run on your server
- Includes verification button to check if migrations completed
- Verifies tables exist before proceeding

#### 5. Admin Account Creation
- Create your first admin user
- Email and password (minimum 8 characters)
- Sets user role to 'admin' in the database

#### 6. Setup Complete
- Confirmation screen
- Summary of what was configured
- Button to proceed to application
- Setup wizard deletes itself (marks as complete)

## Technical Details

### Files Created

- `src/pages/Setup.tsx` - Main setup wizard component
- `src/lib/setupConfig.ts` - Setup state management
- `INSTALLATION.md` - Complete installation guide
- `DEPLOYMENT.md` - Deployment options guide

### Setup State Storage

The setup wizard uses localStorage to track completion:

```typescript
{
  isComplete: boolean,
  completedAt: string,
  adminEmail: string
}
```

### Database Connection Storage

During setup, credentials are stored in localStorage:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

These values are used by the application after setup completes.

## Migration Process

The wizard guides users to run migrations using Supabase CLI:

```bash
npm install -g supabase
supabase db push --db-url "postgresql://..."
```

This ensures:
- All tables are created
- Row Level Security policies are applied
- Indexes are created
- Triggers are set up

## Admin Account Creation

The wizard creates the first admin account by:

1. Signing up user with Supabase Auth
2. Creating profile record with `role: 'admin'`
3. This gives full admin panel access

## Self-Deletion

Once setup completes successfully:
- The completion state is stored in localStorage
- On next page load, App.tsx checks if setup is complete
- If complete, the setup wizard is bypassed
- User goes directly to auth/main application

The wizard effectively "deletes itself" by never appearing again after completion.

## Resetting Setup

To re-run the setup wizard (for development or troubleshooting):

1. Open browser console
2. Run: `localStorage.clear()`
3. Refresh the page
4. Setup wizard will appear again

For production, you should never need to reset setup.

## Security Considerations

- Credentials are stored in localStorage (client-side only)
- First admin user must set a strong password
- Setup wizard should only run on trusted networks during initial deployment
- After setup, regular security practices apply

## Troubleshooting

### Wizard Stuck on Database Connection
- Verify Supabase is running and accessible
- Check URL format (include https:// or http://)
- Verify anon key is correct
- Check browser console for errors

### Migration Check Fails
- Ensure you ran the migration commands
- Verify database connection string was correct
- Check Supabase logs for migration errors
- Ensure you have database admin permissions

### Admin Account Creation Fails
- Ensure migrations ran successfully
- Check that profiles table exists
- Verify email is valid format
- Password must be at least 8 characters
- Check Supabase Auth is enabled

## Development Notes

### Testing the Wizard

During development:

```bash
npm run dev
```

Clear localStorage to test wizard:
```javascript
localStorage.clear()
```

### Modifying the Wizard

The wizard is a single-page React component with step-based navigation. To add steps:

1. Add new step type to the `Step` union
2. Add state variables for the new step
3. Create the UI section for the step
4. Add navigation logic

### Integration Points

The wizard integrates with:
- **App.tsx** - Checks if setup complete before rendering main app
- **AuthContext** - Uses Supabase client after setup
- **Database** - Creates admin profile record
- **localStorage** - Stores completion state and credentials
