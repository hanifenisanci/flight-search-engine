# OAuth Setup Guide for WithPass

## Google OAuth Setup

1. **Go to Google Cloud Console**: https://console.cloud.google.com/
2. **Create a new project** or select existing project
3. **Enable Google+ API**:
   - Go to "APIs & Services" > "Library"
   - Search for "Google+ API" 
   - Click Enable
4. **Create OAuth Credentials**:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth client ID"
   - Choose "Web application"
   - **Authorized JavaScript origins** (NO path, NO trailing slash):
     - `http://localhost:5000`
     - `http://localhost:3000`
   - **Authorized redirect URIs** (full path required):
     - `http://localhost:5000/api/auth/google/callback`
     - (Add production URL later)
   - Copy the Client ID and Client Secret
5. **Update server/.env**:
   ```
   GOOGLE_CLIENT_ID=your_actual_client_id_here
   GOOGLE_CLIENT_SECRET=your_actual_client_secret_here
   ```
6. **Update client/.env**:
   ```
   REACT_APP_GOOGLE_CLIENT_ID=your_actual_client_id_here
   ```

## Facebook OAuth Setup

1. **Go to Facebook Developers**: https://developers.facebook.com/
2. **Create a new app** or select existing app
3. **Add Facebook Login product**:
   - Click "Add Product"
   - Select "Facebook Login"
   - Choose "Web"
4. **Configure OAuth settings**:
   - Go to "Facebook Login" > "Settings"
   - Add Valid OAuth Redirect URIs:
     - `http://localhost:5000/api/auth/facebook/callback`
     - (Add production URL later)
5. **Get App Credentials**:
   - Go to Settings > Basic
   - Copy App ID and App Secret
6. **Update server/.env**:
   ```
   FACEBOOK_APP_ID=your_actual_app_id_here
   FACEBOOK_APP_SECRET=your_actual_app_secret_here
   ```

## Testing OAuth Flow

1. **Start the servers**:
   ```bash
   # Terminal 1 - Backend
   cd server
   npm start

   # Terminal 2 - Frontend
   cd client
   npm start
   ```

2. **Test Google Login**:
   - Go to http://localhost:3000/login
   - Click "Continue with Google"
   - Authorize the app
   - You should be redirected back and logged in

3. **Test Facebook Login**:
   - Go to http://localhost:3000/login
   - Click "Continue with Facebook"
   - Authorize the app
   - You should be redirected back and logged in

## Important Notes

- OAuth providers will only work with the exact redirect URIs you configure
- For production, add your production domain to the authorized redirect URIs
- Users created via OAuth will have `authProvider` set to 'google' or 'facebook'
- OAuth users don't need a password (it's optional in the User model now)
- The system automatically links OAuth accounts to existing emails

## Troubleshooting

- **"redirect_uri_mismatch"**: Make sure the callback URL in .env matches exactly what's in Google/Facebook console
- **"Access blocked"**: For Google, make sure Google+ API is enabled
- **"App Not Set Up"**: For Facebook, make sure Facebook Login product is added to your app
- **"Invalid OAuth credentials"**: Double-check your Client ID and Secret in .env files
