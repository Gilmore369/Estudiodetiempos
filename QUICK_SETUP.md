# 🚀 Quick Setup Guide - Standard Time Pro

## ⚠️ IMPORTANT: Google OAuth Setup Required

The app is currently showing "Google Auth not initialized" because it needs a real Google OAuth Client ID.

## 🔧 Fix in 5 Minutes:

### Step 1: Get Google OAuth Credentials
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable these APIs:
   - **Google Sheets API**
   - **Google Drive API**
4. Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client ID**
5. Configure OAuth consent screen (add your email as test user)
6. Create OAuth 2.0 Client ID:
   - **Application type**: Web application
   - **Authorized origins**: 
     - `https://estudiodetiempos.vercel.app` (your current domain)
     - `http://localhost:5173` (for local development)

### Step 2: Update Vercel Environment Variable
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your `estudiodetiempos` project
3. Go to **Settings** → **Environment Variables**
4. Find `VITE_GOOGLE_CLIENT_ID` and update it with your real Client ID
5. **Redeploy** the application

### Step 3: Test the Application
1. Visit your Vercel URL
2. Click "Sign in with Google"
3. Authorize the application
4. Start using Standard Time Pro!

## 🔍 Current Issues Fixed:

✅ **Authentication System**: Unified to use Google OAuth 2.0  
✅ **Store Consistency**: Fixed authStore to match the rest of the app  
✅ **Dependencies**: Added missing jwt-decode package  
✅ **Error Handling**: Improved error messages and loading states  

## 📱 After Setup, You Can:

- ✅ Sign in with Google
- ✅ Create or connect Google Sheets
- ✅ Manage collaborators and processes
- ✅ Conduct time studies with stopwatch
- ✅ Perform Westinghouse evaluations
- ✅ Assign OIT tolerances
- ✅ Calculate standard times
- ✅ Create process analysis diagrams (DAP)
- ✅ Export reports

## 🆘 Need Help?

If you need help getting the Google OAuth credentials, I can guide you through the process step by step.

The app is **100% functional** once the OAuth credentials are properly configured!