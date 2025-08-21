# Deployment Guide - Standard Time Pro

## Vercel Deployment

### Step 1: Deploy to Vercel

1. Go to [Vercel](https://vercel.com)
2. Sign in with GitHub
3. Click "New Project"
4. Import the repository: `Gilmore369/Estudiodetiempos`
5. Select the `standard-time-pro` folder as the root directory
6. Framework Preset: **Vite**
7. Build Command: `npm run build`
8. Output Directory: `dist`
9. Install Command: `npm install`

### Step 2: Configure Environment Variables

In Vercel project settings, add:

- **Name**: `VITE_GOOGLE_CLIENT_ID`
- **Value**: `155913873528-nns0t4l1ss9tag26e2ik1ase5cdu3blm.apps.googleusercontent.com`

### Step 3: Update Google OAuth Settings

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your "Standard Time Pro" project
3. Go to "APIs & Services" → "Credentials"
4. Edit your OAuth 2.0 Client ID
5. Add your Vercel domain to "Authorized JavaScript origins":
   - `https://your-project-name.vercel.app`
6. Add to "Authorized redirect URIs":
   - `https://your-project-name.vercel.app`

### Step 4: Deploy

Click "Deploy" in Vercel and wait for the build to complete.

## Production URL

Once deployed, your app will be available at:
`https://your-project-name.vercel.app`

## Features Available

✅ Google OAuth Authentication
✅ Google Sheets Integration
✅ Time Study Management
✅ Stopwatch/Chronometer
✅ Element Timing
✅ Data Persistence
✅ Offline Support (PWA)
✅ Westinghouse Performance Evaluation
✅ Process Analysis Diagrams (DAP)
✅ Results Dashboard

## Usage Instructions

1. **Login**: Use your Google account to authenticate
2. **Setup**: Configure your Google Sheets integration
3. **Create Study**: Set up a new time study with process and collaborator info
4. **Add Elements**: Define the work elements you want to time
5. **Start Timing**: Use the chronometer to record element times
6. **Analyze**: View results and perform Westinghouse evaluations
7. **Export**: All data is automatically synced to your Google Sheets