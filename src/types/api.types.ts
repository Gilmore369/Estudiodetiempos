export interface GoogleSheetsConfig {
  spreadsheetId: string;
  sheetUrl: string;
  accessToken: string;
  refreshToken: string;
}

export interface BatchUpdate {
  range: string;
  values: any[][];
}

export interface SheetsService {
  authenticate(): Promise<void>;
  setupWorkbook(sheetUrl?: string): Promise<string>;
  writeData(sheet: string, data: any[]): Promise<void>;
  readData(sheet: string, range?: string): Promise<any[]>;
  batchUpdate(updates: BatchUpdate[]): Promise<void>;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: GoogleUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  sheetsConfig: GoogleSheetsConfig | null;
}

export interface GoogleUser {
  id: string;
  email: string;
  name: string;
  picture?: string;
}

export interface APIError {
  code: number;
  message: string;
  details?: any;
}

export interface OfflineOperation {
  id: string;
  type: 'CREATE' | 'UPDATE' | 'DELETE';
  sheet: string;
  data: any;
  timestamp: Date;
  retryCount: number;
}

export interface SyncStatus {
  isOnline: boolean;
  lastSync: Date | null;
  pendingOperations: number;
  syncing: boolean;
}