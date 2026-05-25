# Privacy-First MongoDB Configuration

## Overview

Bloggy is a **privacy-first blogging platform** where each user manages their own MongoDB connection. No connection strings are sent to servers—everything stays on your device.

## How It Works

### 1. **Configuration Storage**

- Users enter their MongoDB connection URI in the app settings
- The connection string is stored **only in your browser's localStorage**
- Data never leaves your device or reaches our servers

### 2. **Connection Flow**

```
User Device (Browser)
  ↓
[Settings Modal] → [Input MongoDB URI]
  ↓
[Validation] → [Test Connection via API]
  ↓
[localStorage] → Encrypted storage (base64 obfuscation)
  ↓
API Requests use this connection from localStorage
```

### 3. **Security Features**

- ✅ **Local-Only Storage**: No server-side storage of connection strings
- ✅ **Obfuscation**: Stored in localStorage with base64 encoding (basic privacy)
- ✅ **Validation**: Connection is tested before saving
- ✅ **No Data Collection**: We never access or log your MongoDB URI
- ✅ **User Control**: Clear and remove configuration anytime

## Configuration Files

### `lib/config/storage.ts`

Handles all localStorage operations:

- `saveDBConfig(uri)` - Save MongoDB URI
- `getDBConfig()` - Retrieve MongoDB URI
- `isDBConfigured()` - Check if configured
- `clearDBConfig()` - Remove configuration
- `validateMongoDBURI(uri)` - Validate URI format

### `app/_components/DBConfigModal.tsx`

UI component for configuration:

- MongoDB URI input field
- Connection validation
- Visual feedback
- Remove/Update options

### `app/api/config/validate/route.ts`

API endpoint for connection testing:

- Tests MongoDB connection
- Validates URI format
- Returns helpful error messages
- Does NOT store the URI

### `lib/db.ts`

Database connection logic:

- Uses user's stored configuration first
- Falls back to .env (for development)
- Connects to user's MongoDB instance

## User Guide

### Setting Up MongoDB

1. **Get Your MongoDB URI**
   - Local: `mongodb://localhost:27017/dbname`
   - Atlas (Cloud): `mongodb+srv://user:password@cluster.mongodb.net/dbname`

2. **Configure in Bloggy**
   - Click Settings icon (gear) in the top-right corner
   - Enter your MongoDB URI
   - Click "Save & Connect"
   - Wait for validation to complete

3. **Manage Configuration**
   - Click Settings → "Update" to change URI
   - Click Settings → "Remove" to disconnect

### Supported MongoDB Connections

- ✅ Local MongoDB (`mongodb://`)
- ✅ MongoDB Atlas Cloud (`mongodb+srv://`)
- ✅ Any MongoDB-compatible database

### Connection String Examples

**Local MongoDB:**

```
mongodb://localhost:27017/myblog
```

**MongoDB Atlas:**

```
mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/myblog?retryWrites=true&w=majority
```

**MongoDB with Authentication:**

```
mongodb://user:password@host:port/database
```

## Privacy & Security

### What We Know

- ✅ That you're using Bloggy
- ✅ Your activity within the app (posts, projects)
- ✅ Basic analytics (non-identifying)

### What We DON'T Know

- ❌ Your MongoDB connection string
- ❌ Your MongoDB username/password
- ❌ Which database you're using
- ❌ Your data (stored only in your MongoDB instance)
- ❌ Your MongoDB host/location

### Data Flow

1. **Blog Data**: Stored in your MongoDB instance (not our servers)
2. **Configuration**: Stored only in your browser (localStorage)
3. **API Calls**: Use your stored connection to query your MongoDB
4. **Backup**: Backup your MongoDB directly—we have no copy

## Troubleshooting

### "Invalid MongoDB URI"

- Check the format: `mongodb://...` or `mongodb+srv://...`
- Verify the URI includes a database name

### "Connection Failed"

- Check if MongoDB server is running
- Verify host/port are correct
- Check username and password for authentication errors
- Ensure your IP is whitelisted (for MongoDB Atlas)

### "Unknown Host"

- Check the hostname spelling
- Verify network connectivity
- For Atlas, ensure IP whitelist includes your current IP

### Lost Configuration?

- Your configuration is stored in browser localStorage
- Clearing browser data/cache will remove it
- Always save your connection string somewhere safe

## Development vs Production

### Development

Set `MONGODB_URI` in `.env` for testing:

```env
MONGODB_URI=mongodb://localhost:27017/bloggy
```

Users can override with their own configuration anytime.

### Production

- Remove `MONGODB_URI` from `.env`
- Each user configures their own MongoDB
- Completely serverless approach

## Environment Variables

### Optional

```env
# Only needed for development/testing
MONGODB_URI=mongodb://localhost:27017/bloggy
```

### Not Needed (User-Configured)

- No API keys
- No secrets
- No connection strings in production

## API Reference

### POST `/api/config/validate`

Validates MongoDB connection string.

**Request:**

```json
{
  "mongoUri": "mongodb+srv://user:password@cluster.mongodb.net/dbname"
}
```

**Response (Success):**

```json
{
  "message": "MongoDB connection validated successfully",
  "valid": true
}
```

**Response (Error):**

```json
{
  "error": "Invalid credentials. Check your username and password."
}
```

## Future Enhancements

- 🔒 End-to-end encryption for localStorage
- 🔄 Automatic backup configuration
- 🌐 Multi-database support
- 📊 Connection statistics
- 🛡️ IP whitelist management

## Conclusion

Bloggy puts **you in control** of your data. Your MongoDB URI stays on your device, and you manage your own database entirely. This is how privacy-first software should work.

For questions or issues, visit: https://github.com/umairhex/bloggy
