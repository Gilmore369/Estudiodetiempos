# Standard Time Pro - Deployment Guide

## 🚀 Deployment Instructions

### Prerequisites
1. Google Cloud Console project
2. GitHub account
3. Vercel account

### Step 1: Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the following APIs:
   - Google Sheets API
   - Google Drive API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
5. Configure OAuth consent screen
6. Add authorized origins:
   - `http://localhost:5173` (for development)
   - `https://your-vercel-domain.vercel.app` (for production)
7. Copy the Client ID

### Step 2: Environment Variables

Create a `.env` file in the project root:

```env
VITE_GOOGLE_CLIENT_ID=your_google_client_id_here
```

For Vercel deployment, add this as an environment variable in the Vercel dashboard.

### Step 3: Deploy to Vercel

1. Push code to GitHub
2. Connect GitHub repository to Vercel
3. Add environment variable `VITE_GOOGLE_CLIENT_ID` in Vercel dashboard
4. Deploy

### Step 4: Update OAuth Settings

After deployment, update your Google OAuth settings:
1. Add your Vercel domain to authorized origins
2. Test the authentication flow

## 🔧 Configuration

### Google Sheets Structure
The app will automatically create these sheets:
- Config_Estudios
- DB_Colaboradores  
- DB_Procesos
- Tiempos_Observados
- Calculo_y_Resultados
- DAP_Data

### PWA Features
- Service Worker for offline functionality
- App installation support
- Responsive design for all devices

## 📱 Usage
1. Visit the deployed URL
2. Sign in with Google
3. Connect to existing Google Sheet or create new one
4. Start conducting time studies!

## 🛠️ Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 📞 Support
For issues or questions, refer to the implementation documentation.