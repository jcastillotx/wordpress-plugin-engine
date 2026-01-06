# Admin Panel Setup

## Creating Your First Admin Account

To access the admin panel, you need to set a user's role to 'admin' in the database.

### Method 1: Using Supabase SQL Editor

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Run this query (replace `your-email@example.com` with your actual email):

```sql
UPDATE profiles
SET role = 'admin'
WHERE id = (
  SELECT id FROM auth.users
  WHERE email = 'your-email@example.com'
  LIMIT 1
);
```

### Method 2: Using Supabase Table Editor

1. Go to your Supabase project dashboard
2. Navigate to the Table Editor
3. Open the `profiles` table
4. Find your user row
5. Edit the `role` column value from `user` to `admin`
6. Save changes

## Admin Panel Features

Once you have admin access, you'll see a dark-themed admin navigation bar with access to:

### Dashboard
- View total users, plugins, subscriptions, and pages
- Monitor recent admin activity
- Quick overview statistics

### Subscriptions
- View all user subscriptions
- Filter by status (active, trialing, cancelled, past_due)
- Search by user name or ID
- Monitor billing periods

### All Plugins
- View all plugin requests across the platform
- Filter by status and builder type
- Search by plugin name or user
- Track plugin generation progress

### Pages
- Create and manage custom pages
- Visual page builder with blocks:
  - Heading blocks
  - Paragraph blocks
  - Image blocks
  - Call-to-Action blocks
  - Custom HTML blocks
- Multiple page templates (Default, Landing Page, Documentation, Full Width)
- SEO settings (meta title, meta description)
- Publish/unpublish pages
- Custom URL slugs

### Settings
- Customize theme colors (primary, secondary)
- Change site-wide font family
- Update site name and tagline
- Set custom logo
- Reset to defaults

## Page Builder Block Types

### Heading Block
- Configurable heading text
- Select level (H1, H2, H3)

### Paragraph Block
- Multi-line text content
- Rich formatting support

### Image Block
- Image URL input
- Alt text for accessibility
- Optional caption

### Call to Action Block
- Title and description
- Button text and URL
- Centered layout

### HTML Block
- Custom HTML code
- Full flexibility for advanced users

## Security Notes

- Only users with `role = 'admin'` can access the admin panel
- All admin actions are logged in the `admin_logs` table
- Regular users cannot see or access admin features
- Admin status is checked on every page load

## Tips

1. **Test Changes**: Use the draft/publish toggle on pages to test before making them live
2. **Monitor Activity**: Check the Dashboard regularly for system overview
3. **Backup**: Always backup before making significant changes
4. **Theme Testing**: Test theme color changes on different pages before finalizing
5. **Page Templates**: Choose the right template for your content type

## Troubleshooting

**Can't see admin panel after setting role to admin?**
- Sign out and sign back in
- Clear browser cache
- Verify the role was updated correctly in the database

**Admin logs not showing?**
- Ensure RLS policies are correctly applied
- Check that your user ID matches the admin_id in logs

**Page builder not saving?**
- Verify slug is unique and URL-friendly
- Check that title and slug fields are filled
- Ensure you have admin role
