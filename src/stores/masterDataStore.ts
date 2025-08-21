import { create } from 'zustand';
import type { Collaborator, Process } from '@/types';
import { googleSheetsService } from '@/services/googleSheetsService';

interface MasterDataStore {
  // State
  collaborators: Collaborator[];
  processes: Process[];
  isLoading: boolean;
  error: string | null;

  // Actions
  loadCollaborators: () => Promise<void>;
  loadProcesses: () => Promise<void>;
  addCollaborator: (collaborator: Omit<Collaborator, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateCollaborator: (id: string, collaborator: Partial<Collaborator>) => Promise<void>;
  deleteCollaborator: (id: string) => Promise<void>;
  addProcess: (process: Omit<Process, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateProcess: (id: string, process: Partial<Process>) => Promise<void>;
  deleteProcess: (id: string) => Promise<void>;
  clearError: () => void;
}

export const useMasterDataStore = create<MasterDataStore>((set, get) => ({
  // Initial state
  collaborators: [],
  processes: [],
  isLoading: false,
  error: null,

  // Actions
  loadCollaborators: async () => {
    set({ isLoading: true, error: null });
    
    try {
      const data = await googleSheetsService.readData('DB_Colaboradores');
      
      if (data.length > 1) { // Skip header row
        const collaborators: Collaborator[] = data.slice(1).map((row: any[]) => ({
          id: row[0] || '',
          name: row[1] || '',
          department: row[2] || '',
          position: row[3] || '',
          experience: row[4] || '',
          createdAt: new Date(row[5] || Date.now()),
          updatedAt: new Date(row[5] || Date.now())
        })).filter(c => c.id && c.name); // Filter out empty rows
        
        set({ collaborators, isLoading: false });
      } else {
        set({ collaborators: [], isLoading: false });
      }
    } catch (error: any) {
      set({ error: error.message || 'Failed to load collaborators', isLoading: false });
    }
  },

  loadProcesses: async () => {
    set({ isLoading: true, error: null });
    
    try {
      const data = await googleSheetsService.readData('DB_Procesos');
      
      if (data.length > 1) { // Skip header row
        const processes: Process[] = data.slice(1).map((row: any[]) => ({
          id: row[0] || '',
          name: row[1] || '',
          description: row[2] || '',
          department: row[3] || '',
          resources: row[4] ? row[4].split(',').map((r: string) => r.trim()) : [],
          createdAt: new Date(row[5] || Date.now()),
          updatedAt: new Date(row[5] || Date.now())
        })).filter(p => p.id && p.name); // Filter out empty rows
        
        set({ processes, isLoading: false });
      } else {
        set({ processes: [], isLoading: false });
      }
    } catch (error: any) {
      set({ error: error.message || 'Failed to load processes', isLoading: false });
    }
  },

  addCollaborator: async (collaboratorData) => {
    set({ isLoading: true, error: null });
    
    try {
      const id = `COL_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`.toUpperCase();
      const now = new Date();
      
      const collaborator: Collaborator = {
        ...collaboratorData,
        id,
        createdAt: now,
        updatedAt: now
      };

      // Write to Google Sheets
      const rowData = [
        collaborator.id,
        collaborator.name,
        collaborator.department || '',
        collaborator.position || '',
        collaborator.experience || '',
        collaborator.createdAt.toISOString()
      ];

      await googleSheetsService.writeData('DB_Colaboradores', rowData);

      // Update local state
      const { collaborators } = get();
      set({ 
        collaborators: [...collaborators, collaborator],
        isLoading: false 
      });
    } catch (error: any) {
      set({ error: error.message || 'Failed to add collaborator', isLoading: false });
      throw error;
    }
  },

  updateCollaborator: async (id, updates) => {
    set({ isLoading: true, error: null });
    
    try {
      const { collaborators } = get();
      const existingCollaborator = collaborators.find(c => c.id === id);
      
      if (!existingCollaborator) {
        throw new Error('Collaborator not found');
      }

      const updatedCollaborator: Collaborator = {
        ...existingCollaborator,
        ...updates,
        updatedAt: new Date()
      };

      // Update in Google Sheets
      const rowData = [
        updatedCollaborator.id,
        updatedCollaborator.name,
        updatedCollaborator.department || '',
        updatedCollaborator.position || '',
        updatedCollaborator.experience || '',
        updatedCollaborator.createdAt.toISOString()
      ];

      await googleSheetsService.updateRowById('DB_Colaboradores', 'ID', id, rowData);

      // Update local state
      set({
        collaborators: collaborators.map(c => c.id === id ? updatedCollaborator : c),
        isLoading: false
      });
    } catch (error: any) {
      set({ error: error.message || 'Failed to update collaborator', isLoading: false });
      throw error;
    }
  },

  deleteCollaborator: async (id) => {
    set({ isLoading: true, error: null });
    
    try {
      // Delete from Google Sheets
      await googleSheetsService.deleteRowById('DB_Colaboradores', 'ID', id);

      // Update local state
      const { collaborators } = get();
      set({
        collaborators: collaborators.filter(c => c.id !== id),
        isLoading: false
      });
    } catch (error: any) {
      set({ error: error.message || 'Failed to delete collaborator', isLoading: false });
      throw error;
    }
  },

  addProcess: async (processData) => {
    set({ isLoading: true, error: null });
    
    try {
      const id = `PROC_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`.toUpperCase();
      const now = new Date();
      
      const process: Process = {
        ...processData,
        id,
        createdAt: now,
        updatedAt: now
      };

      // Write to Google Sheets
      const rowData = [
        process.id,
        process.name,
        process.description || '',
        process.department || '',
        process.resources?.join(', ') || '',
        process.createdAt.toISOString()
      ];

      await googleSheetsService.writeData('DB_Procesos', rowData);

      // Update local state
      const { processes } = get();
      set({ 
        processes: [...processes, process],
        isLoading: false 
      });
    } catch (error: any) {
      set({ error: error.message || 'Failed to add process', isLoading: false });
      throw error;
    }
  },

  updateProcess: async (id, updates) => {
    set({ isLoading: true, error: null });
    
    try {
      const { processes } = get();
      const existingProcess = processes.find(p => p.id === id);
      
      if (!existingProcess) {
        throw new Error('Process not found');
      }

      const updatedProcess: Process = {
        ...existingProcess,
        ...updates,
        updatedAt: new Date()
      };

      // Update in Google Sheets
      const rowData = [
        updatedProcess.id,
        updatedProcess.name,
        updatedProcess.description || '',
        updatedProcess.department || '',
        updatedProcess.resources?.join(', ') || '',
        updatedProcess.createdAt.toISOString()
      ];

      await googleSheetsService.updateRowById('DB_Procesos', 'ID', id, rowData);

      // Update local state
      set({
        processes: processes.map(p => p.id === id ? updatedProcess : p),
        isLoading: false
      });
    } catch (error: any) {
      set({ error: error.message || 'Failed to update process', isLoading: false });
      throw error;
    }
  },

  deleteProcess: async (id) => {
    set({ isLoading: true, error: null });
    
    try {
      // Delete from Google Sheets
      await googleSheetsService.deleteRowById('DB_Procesos', 'ID', id);

      // Update local state
      const { processes } = get();
      set({
        processes: processes.filter(p => p.id !== id),
        isLoading: false
      });
    } catch (error: any) {
      set({ error: error.message || 'Failed to delete process', isLoading: false });
      throw error;
    }
  },

  clearError: () => {
    set({ error: null });
  }
}));