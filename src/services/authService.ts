import type { GoogleUser } from '@/types';

// Google OAuth configuration
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
const GOOGLE_SCOPES = [
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/drive.file',
  'profile',
  'email'
].join(' ');

declare global {
  interface Window {
    google: any;
    gapi: any;
  }
}

export class AuthService {
  private static instance: AuthService;
  private gapi: any = null;
  private tokenClient: any = null;
  private currentUser: GoogleUser | null = null;
  private accessToken: string | null = null;

  private constructor() {}

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  /**
   * Initialize Google API and OAuth
   */
  async initialize(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (typeof window === 'undefined') {
        reject(new Error('Google API can only be initialized in browser environment'));
        return;
      }

      // Wait for Google Identity Services to load
      const checkGoogleLoaded = () => {
        if (window.google && window.google.accounts) {
          this.initializeGoogleServices().then(resolve).catch(reject);
        } else {
          setTimeout(checkGoogleLoaded, 100);
        }
      };

      checkGoogleLoaded();
    });
  }

  private async initializeGoogleServices(): Promise<void> {
    // Load GAPI for Sheets API
    if (!window.gapi) {
      await this.loadGapi();
    }

    // Initialize GAPI client
    await new Promise<void>((resolve, reject) => {
      window.gapi.load('client', {
        callback: resolve,
        onerror: reject
      });
    });

    await window.gapi.client.init({
      discoveryDocs: ['https://sheets.googleapis.com/$discovery/rest?version=v4']
    });

    this.gapi = window.gapi;

    // Initialize Google Identity Services token client
    this.tokenClient = window.google.accounts.oauth2.initTokenClient({
      client_id: GOOGLE_CLIENT_ID,
      scope: GOOGLE_SCOPES,
      callback: (response: any) => {
        if (response.error) {
          console.error('Token response error:', response.error);
          return;
        }
        this.accessToken = response.access_token;
        this.gapi.client.setToken({ access_token: response.access_token });
      }
    });
  }

  private async loadGapi(): Promise<void> {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://apis.google.com/js/api.js';
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Google API script'));
      document.head.appendChild(script);
    });
  }

  /**
   * Sign in with Google
   */
  async signIn(): Promise<GoogleUser> {
    if (!this.tokenClient) {
      throw new Error('Google Auth not initialized');
    }

    return new Promise((resolve, reject) => {
      // Configure the token client callback
      this.tokenClient.callback = async (tokenResponse: any) => {
        if (tokenResponse.error) {
          reject(new Error(tokenResponse.error));
          return;
        }
        
        try {
          this.accessToken = tokenResponse.access_token;
          this.gapi.client.setToken({ access_token: tokenResponse.access_token });
          
          // Get user info from the access token
          const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
            headers: {
              'Authorization': `Bearer ${tokenResponse.access_token}`
            }
          });

          let user: GoogleUser;
          if (userInfoResponse.ok) {
            const userInfo = await userInfoResponse.json();
            user = {
              id: userInfo.id,
              email: userInfo.email,
              name: userInfo.name,
              picture: userInfo.picture || ''
            };
          } else {
            // Fallback user info
            user = {
              id: 'user_' + Date.now(),
              email: 'user@example.com',
              name: 'Google User',
              picture: ''
            };
          }

          this.currentUser = user;
          this.storeTokens(tokenResponse.access_token, '');
          resolve(user);
        } catch (error) {
          reject(error);
        }
      };

      // Request access token
      this.tokenClient.requestAccessToken({ prompt: 'consent' });
    });
  }

  /**
   * Sign out
   */
  async signOut(): Promise<void> {
    try {
      if (window.google && window.google.accounts) {
        window.google.accounts.id.disableAutoSelect();
      }
      
      if (this.gapi && this.accessToken) {
        this.gapi.client.setToken(null);
      }

      this.currentUser = null;
      this.accessToken = null;
      this.clearTokens();
    } catch (error) {
      console.error('Sign out failed:', error);
      throw new Error('Failed to sign out');
    }
  }

  /**
   * Check if user is signed in
   */
  isSignedIn(): boolean {
    return this.currentUser !== null && this.accessToken !== null;
  }

  /**
   * Get current user
   */
  getCurrentUser(): GoogleUser | null {
    return this.currentUser;
  }

  /**
   * Get access token
   */
  getAccessToken(): string | null {
    return this.accessToken;
  }

  /**
   * Refresh access token
   */
  async refreshToken(): Promise<string> {
    if (!this.tokenClient) {
      throw new Error('Google Auth not initialized');
    }

    return new Promise((resolve, reject) => {
      this.tokenClient.callback = (response: any) => {
        if (response.error) {
          reject(new Error(response.error));
          return;
        }
        
        this.accessToken = response.access_token;
        this.storeTokens(response.access_token, '');
        resolve(response.access_token);
      };

      this.tokenClient.requestAccessToken();
    });
  }

  /**
   * Store tokens in localStorage
   */
  private storeTokens(accessToken: string, idToken: string): void {
    localStorage.setItem('google_access_token', accessToken);
    localStorage.setItem('google_id_token', idToken);
    localStorage.setItem('token_timestamp', Date.now().toString());
  }

  /**
   * Clear stored tokens
   */
  private clearTokens(): void {
    localStorage.removeItem('google_access_token');
    localStorage.removeItem('google_id_token');
    localStorage.removeItem('token_timestamp');
    localStorage.removeItem('google_sheets_config');
  }

  /**
   * Check if token needs refresh (expires in 1 hour)
   */
  needsTokenRefresh(): boolean {
    const timestamp = localStorage.getItem('token_timestamp');
    if (!timestamp) return true;

    const tokenAge = Date.now() - parseInt(timestamp);
    const oneHour = 60 * 60 * 1000;
    
    return tokenAge > (oneHour - 5 * 60 * 1000); // Refresh 5 minutes before expiry
  }

  /**
   * Auto-refresh token if needed
   */
  async ensureValidToken(): Promise<string> {
    if (!this.accessToken) {
      throw new Error('User not signed in');
    }

    if (this.needsTokenRefresh()) {
      return await this.refreshToken();
    }

    return this.accessToken;
  }
}

// Export singleton instance
export const authService = AuthService.getInstance();