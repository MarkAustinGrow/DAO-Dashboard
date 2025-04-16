# Character Upload Scripts

This directory contains scripts to help test and debug the character upload functionality.

## Changes Made

We've updated the `/api/upload-character` endpoint to automatically detect and transform character files from the old format to the new format. This means you can now upload character files with the following structure:

```json
{
  "name": "CharacterName",
  "clients": [...],
  "modelProvider": "...",
  ...
}
```

The system will automatically transform this to the required format:

```json
{
  "display_name": "CharacterName",
  "agent_name": "charactername",
  "content": {
    // Original character data
  }
}
```

## Recent Fixes

We've fixed several issues with the character API endpoints:

1. **Fixed table name**: The upload-character and delete-character endpoints now use the correct table name ('character_files' instead of 'characters')
2. **Added environment variable checks**: Both endpoints now properly check if the Supabase environment variables are set
3. **Improved error handling**: Better error messages and more detailed logging in all endpoints

## Testing the Changes

### Option 1: Using the Web Interface

To use the web interface for testing:

1. Copy the test-upload.html file to the public directory:
   ```
   cp scripts/test-upload.html public/test-upload.html
   ```

2. Start the Next.js development server:
   ```
   cd marvin-dashboard
   npm run dev
   ```

3. Open a browser and navigate to:
   ```
   http://localhost:3000/test-upload.html
   ```

4. Click the "Upload Character" button to test uploading a character in the old format.

### Option 2: Using the Node.js Script

1. Start the Next.js development server:
   ```
   cd marvin-dashboard
   npm run dev
   ```

2. Run the upload-angus.js script:
   ```
   cd marvin-dashboard
   node scripts/upload-angus.js
   ```

This script will read the Angus.json file from your Downloads folder and upload it to the server. The script includes detailed logging and error handling to help troubleshoot any issues.

### Option 3: Using the Characters Page

1. Start the Next.js development server:
   ```
   cd marvin-dashboard
   npm run dev
   ```

2. Open a browser and navigate to:
   ```
   http://localhost:3000/characters
   ```

3. Click the "Upload Character" button and select your character JSON file.

## Troubleshooting

If you encounter any issues:

1. Check the browser console or terminal for error messages
2. Verify that the Next.js development server is running
3. Make sure the character JSON file is valid
4. Check the server logs for any errors during the upload process
5. Verify that the Supabase environment variables are set correctly in your .env file:
   - NEXT_PUBLIC_SUPABASE_URL
   - SUPABASE_SERVICE_ROLE_KEY
