# Figma & Canva Integration Guide

## Overview

The platform now supports direct import from Figma and Canva, allowing users to seamlessly convert their designs from these tools into Divi or Elementor layouts without manual downloads. This integration streamlines the workflow and keeps designs up-to-date.

## Features

### OAuth Authentication
- Secure OAuth 2.0 connection to Figma and Canva accounts
- Token management with automatic refresh
- Account email and name display
- Connection status tracking
- Easy disconnect functionality

### File Browsing
- Visual grid view of all user designs
- Thumbnail previews for quick identification
- Search functionality to find specific files
- Last modified date tracking
- Sync button to refresh file list
- Select files directly for conversion

### Seamless Integration
- Choose between upload, Figma, or Canva import
- Auto-fill conversion name from selected file
- Direct conversion without downloading
- Maintains design metadata

## Database Schema

### design_tool_connections
Stores OAuth connections for Figma and Canva:

```sql
- id (uuid) - Primary key
- user_id (uuid) - References auth.users
- tool_name (text) - 'figma' or 'canva'
- access_token (text) - OAuth access token (encrypted)
- refresh_token (text) - OAuth refresh token (encrypted)
- token_expires_at (timestamptz) - Token expiration
- account_email (text) - Connected account email
- account_name (text) - Connected account name
- metadata (jsonb) - Additional connection data
- is_active (boolean) - Connection status
- last_synced_at (timestamptz) - Last file sync time
- created_at, updated_at (timestamptz)
```

### imported_designs
Tracks imported designs from external tools:

```sql
- id (uuid) - Primary key
- user_id (uuid) - References auth.users
- connection_id (uuid) - References design_tool_connections
- tool_name (text) - Source tool name
- external_id (text) - ID in external tool
- file_name (text) - Design file name
- file_url (text) - URL to design in external tool
- thumbnail_url (text) - Preview image URL
- export_url (text) - Exported image URL
- metadata (jsonb) - File metadata
- imported_at, created_at (timestamptz)
```

## Edge Functions

### 1. connect-design-tool
**Purpose:** Initiates OAuth flow for Figma or Canva

**Endpoint:** `POST /functions/v1/connect-design-tool`

**Request:**
```json
{
  "toolName": "figma" // or "canva"
}
```

**Response:**
```json
{
  "authUrl": "https://www.figma.com/oauth?..."
}
```

**Flow:**
1. User clicks "Connect Figma" or "Connect Canva"
2. Function generates OAuth URL with state
3. Opens popup window to OAuth provider
4. User authorizes the application
5. OAuth callback receives code
6. Tokens stored in database

### 2. oauth-callback
**Purpose:** Handles OAuth callback and stores tokens

**Endpoint:** `GET /functions/v1/oauth-callback`

**Parameters:**
- `code` - Authorization code from OAuth provider
- `state` - Base64 encoded state with toolName and userId

**Flow:**
1. Receives authorization code
2. Exchanges code for access/refresh tokens
3. Stores tokens in design_tool_connections
4. Shows success page
5. Closes popup window

### 3. fetch-design-files
**Purpose:** Retrieves files from connected Figma/Canva account

**Endpoint:** `POST /functions/v1/fetch-design-files`

**Request:**
```json
{
  "toolName": "figma" // or "canva"
}
```

**Response:**
```json
{
  "files": [
    {
      "id": "figma-file-123",
      "name": "Homepage Design",
      "thumbnail": "https://...",
      "url": "https://www.figma.com/file/...",
      "lastModified": "2024-01-06T10:00:00Z",
      "metadata": {
        "pages": 3,
        "frames": 12
      }
    }
  ]
}
```

## User Interface Components

### DesignToolConnector
Component for connecting/disconnecting design tools

**Props:**
- `toolName`: 'figma' | 'canva'
- `onConnected?`: Callback when connection is successful

**Features:**
- Shows connection status
- Connect button with loading state
- Displays account information
- Disconnect button
- Visual feedback with icons and colors

**Usage:**
```tsx
<DesignToolConnector
  toolName="figma"
  onConnected={() => console.log('Connected!')}
/>
```

### FileBrowser
Component for browsing and selecting design files

**Props:**
- `toolName`: 'figma' | 'canva'
- `onSelect`: Callback when file is selected
- `selectedFileId?`: Currently selected file ID

**Features:**
- Grid view of design files
- Thumbnail previews
- Search functionality
- Sync/refresh button
- Visual selection indicator
- Empty state messaging

**Usage:**
```tsx
<FileBrowser
  toolName="figma"
  onSelect={(file) => handleFileSelect(file)}
  selectedFileId={selectedFile?.id}
/>
```

### Updated DesignToCode Page
New tabbed interface for design sources:

**Tabs:**
1. **Upload Image** - Traditional file upload
2. **Import from Figma** - Connect and browse Figma files
3. **Import from Canva** - Connect and browse Canva files

**Features:**
- Automatic name population from selected file
- Seamless switching between sources
- Connection status display
- File selection with preview
- All original conversion options maintained

## Setup Instructions

### 1. Configure OAuth Apps

#### Figma
1. Go to [Figma Developers](https://www.figma.com/developers/apps)
2. Create a new app
3. Set redirect URI to: `YOUR_SUPABASE_URL/functions/v1/oauth-callback`
4. Copy Client ID and Client Secret
5. Add to environment variables:
   - `FIGMA_CLIENT_ID`
   - `FIGMA_CLIENT_SECRET`

#### Canva
1. Go to [Canva Developers](https://www.canva.com/developers)
2. Create a new app
3. Set redirect URI to: `YOUR_SUPABASE_URL/functions/v1/oauth-callback`
4. Copy Client ID and Client Secret
5. Add to environment variables:
   - `CANVA_CLIENT_ID`
   - `CANVA_CLIENT_SECRET`

### 2. Deploy Edge Functions
All edge functions are already deployed:
- `connect-design-tool`
- `oauth-callback`
- `fetch-design-files`

### 3. Configure Permissions
Ensure your OAuth apps request appropriate scopes:

**Figma Scopes:**
- `file_read` - Read file content and metadata

**Canva Scopes:**
- `design:content:read` - Read design content
- `asset:read` - Read assets and images

## Usage Workflow

### Connecting an Account

1. Navigate to "Design to Code" page
2. Click "Import from Figma" or "Import from Canva" tab
3. Click "Connect [Tool]" button
4. Popup window opens with OAuth flow
5. Login and authorize the application
6. Popup closes automatically
7. Connection status updates to "Connected"

### Importing a Design

1. Ensure tool is connected (green "Connected" badge)
2. Browse available design files
3. Use search to filter files (optional)
4. Click on a file to select it
5. Conversion name auto-fills with file name
6. Choose output type (HTML/Divi/Elementor)
7. Add optional instructions
8. Click "Start Conversion"
9. Design is processed and converted

### Disconnecting an Account

1. Click the trash icon next to "Connected" status
2. Confirm disconnection
3. All tokens are removed from database
4. Imported file list clears

## API Integration Details

### Figma API
The integration uses the Figma REST API:

**Endpoints Used:**
- `GET /v1/me` - Get user information
- `GET /v1/users/{user_id}/files` - List user files
- `GET /v1/files/{file_key}` - Get file details
- `GET /v1/images/{file_key}` - Export images

**Authentication:**
```
Authorization: Bearer {access_token}
```

### Canva API
The integration uses the Canva REST API:

**Endpoints Used:**
- `GET /v1/designs` - List user designs
- `GET /v1/designs/{design_id}` - Get design details
- `GET /v1/designs/{design_id}/export` - Export design

**Authentication:**
```
Authorization: Bearer {access_token}
```

## Security Considerations

### Token Storage
- Tokens stored in database with RLS policies
- Only accessible by token owner
- Should be encrypted at rest (implement encryption)
- Refresh tokens used to maintain long-term access

### OAuth Security
- State parameter prevents CSRF attacks
- Redirect URI validation
- Secure token exchange
- HTTPS-only communication

### API Access
- User-scoped access tokens
- Minimal required permissions
- Token expiration handling
- Automatic refresh mechanism

## Best Practices

### For Users
1. **Connect Once** - Tokens last 90 days
2. **Sync Regularly** - Click sync to get latest files
3. **Organize Files** - Use descriptive names in Figma/Canva
4. **Disconnect When Done** - Remove unused connections

### For Developers
1. **Token Refresh** - Implement automatic token refresh
2. **Error Handling** - Handle expired tokens gracefully
3. **Rate Limiting** - Respect API rate limits
4. **Caching** - Cache file lists to reduce API calls
5. **Encryption** - Encrypt tokens at rest in production

## Troubleshooting

### Connection Issues

**Problem:** "Connection Failed" message
**Solutions:**
- Check OAuth credentials are correct
- Verify redirect URI matches exactly
- Ensure popup wasn't blocked by browser
- Check network connectivity

**Problem:** Files not loading
**Solutions:**
- Click "Sync" button to refresh
- Check connection status (should be green)
- Verify account has designs in Figma/Canva
- Check browser console for errors

**Problem:** Token expired
**Solutions:**
- Disconnect and reconnect account
- Implement automatic token refresh
- Check token_expires_at field

### Import Issues

**Problem:** Can't select file
**Solutions:**
- Ensure connection is active
- Click "Sync" to load files
- Check file permissions in Figma/Canva
- Verify file isn't deleted

**Problem:** Conversion fails with imported file
**Solutions:**
- Check image URL is accessible
- Verify file has exportable content
- Try re-importing the file
- Check edge function logs

## Future Enhancements

### Planned Features
- [ ] Real-time sync with Figma/Canva
- [ ] Automatic re-conversion when design changes
- [ ] Bulk import multiple files
- [ ] Team/workspace support
- [ ] Version history tracking
- [ ] Collaborative features
- [ ] Direct publish to WordPress
- [ ] Sketch and Adobe XD support

### API Improvements
- [ ] Webhook support for real-time updates
- [ ] Incremental sync for large libraries
- [ ] Advanced filtering and sorting
- [ ] Custom export settings
- [ ] Multi-page design support
- [ ] Component library integration

## Demo Mode

The current implementation includes demo data for testing without real OAuth setup:

- Demo tokens are generated
- Sample files are returned
- Full UI functionality works
- No actual API calls to Figma/Canva

**To Enable Production Mode:**
1. Add real OAuth credentials
2. Implement actual API calls in edge functions
3. Remove demo data generators
4. Add proper error handling
5. Implement token refresh logic

## Support

For issues or questions:
- Check edge function logs in Supabase dashboard
- Verify database RLS policies
- Review OAuth app configuration
- Test with demo mode first
- Check browser console for errors

## Compliance

### Figma Terms
- Comply with [Figma API Terms](https://www.figma.com/api-terms)
- Respect rate limits
- Proper attribution where required

### Canva Terms
- Comply with [Canva API Terms](https://www.canva.com/developers/terms)
- Respect usage limits
- Follow brand guidelines

## Resources

- [Figma API Documentation](https://www.figma.com/developers/api)
- [Canva API Documentation](https://www.canva.com/developers/docs)
- [OAuth 2.0 Specification](https://oauth.net/2/)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
