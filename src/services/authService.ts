import type { GoogleUser } from '@/types';

// Google OAuth configuration
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
const GOOGLE_SCOPES = [
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/drive.file',
  'profile',
  'email'
].join(' ');

export class AuthService {
  private static instance: AuthService;
  private gapi: any = null;
  private auth2: any = null;

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

      // Load Google API script
      if (!(window as any).gapi) {
        const script = document.createElement('script');
        script.src = 'https://apis.google.com/js/api.js';
        script.onload = () => this.loadGapi().then(resolve).catch(reject);
        script.onerror = () => reject(new Error('Failed to load Google API script'));
        document.head.appendChild(script);
      } else {
        this.loadGapi().then(resolve).catch(reject);
      }
    });
  }

  private async loadGapi(): Promise<void> {
    this.gapi = (window as any).gapi;
    
    await new Promise<void>((resolve, reject) => {
      this.gapi.load('auth2', {
        callback: resolve,
        onerror: reject
      });
    });

    await new Promise<void>((resolve, reject) => {
      this.gapi.load('client', {
        callback: resolve,
        onerror: reject
      });
    });

    // Initialize the client
    await this.gapi.client.init({
      clientId: GOOGLE_CLIENT_ID,
      scope: GOOGLE_SCOPES,
      discoveryDocs: ['https://sheets.googleapis.com/$discovery/rest?version=v4']
    });

    this.auth2 = this.gapi.auth2.getAuthInstance();
  }

  /**
   * Sign in with Google
   */
  async signIn(): Promise<GoogleUser> {
    if (!this.auth2) {
      throw new Error('Google Auth not initialized');
    }

    try {
      const authResult = await this.auth2.signIn();
      const profile = authResult.getBasicProfile();
      const authResponse = authResult.getAuthResponse();

      const user: GoogleUser = {
        id: profile.getId(),
        email: profile.getEmail(),
        name: profile.getName(),
        picture: profile.getImageUrl()
      };

      // Store tokens
      this.storeTokens(authResponse.access_token, authResponse.id_token);

      return user;
    } catch (error) {
      console.error('Sign in failed:', error);
      throw new Error('Failed to sign in with Google');
    }
  }

  /**
   * Sign out
   */
  async signOut(): Promise<void> {
    if (!this.auth2) {
      throw new Error('Google Auth not initialized');
    }

    try {
      await this.auth2.signOut();
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
    return this.auth2?.isSignedIn.get() || false;
  }

  /**
   * Get current user
   */
  getCurrentUser(): GoogleUser | null {
    if (!this.isSignedIn()) return null;

    const user = this.auth2.currentUser.get();
    const profile = user.getBasicProfile();

    return {
      id: profile.getId(),
      email: profile.getEmail(),
      name: profile.getName(),
      picture: profile.getImageUrl()
    };
  }

  /**
   * Get access token
   */
  getAccessToken(): string | null {
    if (!this.isSignedIn()) return null;
    
    const user = this.auth2.currentUser.get();
    const authResponse = user.getAuthResponse();
    return authResponse.access_token;
  }

  /**
   * Refresh access token
   */
  async refreshToken(): Promise<string> {
    if (!this.auth2) {
      throw new Error('Google Auth not initialized');
    }

    try {
      const user = this.auth2.currentUser.get();
      const authResponse = await user.reloadAuthResponse();
      
      this.storeTokens(authResponse.access_token, authResponse.id_token);
      return authResponse.access_token;
    } catch (error) {
      console.error('Token refresh failed:', error);
      throw new Error('Failed to refresh token');
    }
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
    if (!this.isSignedIn()) {
      throw new Error('User not signed in');
    }

    if (this.needsTokenRefresh()) {
      return await this.refreshToken();
    }

    return this.getAccessToken()!;
  }
}

// Export singleton instance
export const authService = AuthService.getInstance();