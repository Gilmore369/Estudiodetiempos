import { create } from 'zustand';
import type { Study, TimeObservation, StudyElement } from '@/types';
import { googleSheetsService } from '@/services/googleSheetsService';
import { generateStudyId } from '@/utils/timeCalculations';

interface StudyStore {
  // State
  activeStudy: Study | null;
  studies: Study[];
  timeObservations: TimeObservation[];
  studyElements: StudyElement[];
  isLoading: boolean;
  error: string | null;

  // Actions
  createStudy: (studyData: {
    processId: string;
    collaboratorId: string;
    analyst: string;
  }) => Promise<Study>;
  loadStudies: () => Promise<void>;
  loadStudyObservations: (studyId: string) => Promise<void>;
  setActiveStudy: (study: Study | null) => void;
  updateStudy: (studyId: string, updates: Partial<Study>) => Promise<void>;
  addTimeObservation: (observation: Omit<TimeObservation, 'timestamp'>) => Promise<void>;
  addStudyElement: (elementName: string) => void;
  clearError: () => void;
}

export const useStudyStore = create<StudyStore>((set, get) => ({
  // Initial state
  activeStudy: null,
  studies: [],
  timeObservations: [],
  studyElements: [],
  isLoading: false,
  error: null,

  // Actions
  createStudy: async (studyData) => {
    set({ isLoading: true, error: null });

    try {
      const studyId = generateStudyId();
      const now = new Date();

      const study: Study = {
        id: studyId,
        processId: studyData.processId,
        collaboratorId: studyData.collaboratorId,
        analyst: studyData.analyst,
        createdAt: now,
        status: 'active'
      };

      // Write to Google Sheets Config_Estudios
      const rowData = [
        study.id,
        studyData.processId, // This should be process name, we'll need to resolve it
        studyData.collaboratorId, // This should be collaborator name, we'll need to resolve it
        study.analyst,
        now.toISOString(),
        '', // Habilidad - will be filled during evaluation
        '', // Esfuerzo
        '', // Condiciones
        '', // Consistencia
        '', // Tolerancia_Personal
        '', // Tolerancia_Fatiga
        ''  // Tolerancia_Otros
      ];

      await googleSheetsService.writeData('Config_Estudios', rowData);

      // Update local state
      const { studies } = get();
      set({
        studies: [...studies, study],
        activeStudy: study,
        isLoading: false
      });

      return study;
    } catch (error: any) {
      set({ error: error.message || 'Failed to create study', isLoading: false });
      throw error;
    }
  },

  loadStudies: async () => {
    set({ isLoading: true, error: null });

    try {
      const data = await googleSheetsService.readData('Config_Estudios');

      if (data.length > 1) { // Skip header row
        const studies: Study[] = data.slice(1).map((row: any[]) => ({
          id: row[0] || '',
          processId: row[1] || '',
          collaboratorId: row[2] || '',
          analyst: row[3] || '',
          createdAt: new Date(row[4] || Date.now()),
          status: 'active' as const, // We'll determine this based on data
          westinghouseFactors: row[5] ? {
            skill: parseFloat(row[5]) || 0,
            effort: parseFloat(row[6]) || 0,
            conditions: parseFloat(row[7]) || 0,
            consistency: parseFloat(row[8]) || 0,
            total: 1 + (parseFloat(row[5]) || 0) + (parseFloat(row[6]) || 0) + (parseFloat(row[7]) || 0) + (parseFloat(row[8]) || 0)
          } : undefined,
          tolerances: row[9] ? {
            personal: parseFloat(row[9]) || 0,
            fatigue: parseFloat(row[10]) || 0,
            other: parseFloat(row[11]) || 0,
            total: (parseFloat(row[9]) || 0) + (parseFloat(row[10]) || 0) + (parseFloat(row[11]) || 0)
          } : undefined
        })).filter(s => s.id); // Filter out empty rows

        set({ studies, isLoading: false });
      } else {
        set({ studies: [], isLoading: false });
      }
    } catch (error: any) {
      set({ error: error.message || 'Failed to load studies', isLoading: false });
    }
  },

  loadStudyObservations: async (studyId) => {
    set({ isLoading: true, error: null });

    try {
      const data = await googleSheetsService.readData('Tiempos_Observados');

      if (data.length > 1) { // Skip header row
        const observations: TimeObservation[] = data.slice(1)
          .filter((row: any[]) => row[0] === studyId) // Filter by study ID
          .map((row: any[]) => ({
            studyId: row[0],
            elementName: row[1] || '',
            cycleNumber: parseInt(row[2]) || 1,
            observedTime: parseFloat(row[3]) || 0,
            timestamp: new Date(row[4] || Date.now())
          }));

        // Group observations by element
        const elementsMap = new Map<string, StudyElement>();
        observations.forEach(obs => {
          if (!elementsMap.has(obs.elementName)) {
            elementsMap.set(obs.elementName, {
              name: obs.elementName,
              observations: []
            });
          }
          elementsMap.get(obs.elementName)!.observations.push(obs);
        });

        const studyElements = Array.from(elementsMap.values());

        set({ 
          timeObservations: observations,
          studyElements,
          isLoading: false 
        });
      } else {
        set({ 
          timeObservations: [],
          studyElements: [],
          isLoading: false 
        });
      }
    } catch (error: any) {
      set({ error: error.message || 'Failed to load study observations', isLoading: false });
    }
  },

  setActiveStudy: (study) => {
    set({ activeStudy: study });
    if (study) {
      get().loadStudyObservations(study.id);
    } else {
      set({ timeObservations: [], studyElements: [] });
    }
  },

  updateStudy: async (studyId, updates) => {
    set({ isLoading: true, error: null });

    try {
      const { studies, activeStudy } = get();
      const existingStudy = studies.find(s => s.id === studyId);

      if (!existingStudy) {
        throw new Error('Study not found');
      }

      const updatedStudy: Study = {
        ...existingStudy,
        ...updates
      };

      // Update in Google Sheets
      const rowData = [
        updatedStudy.id,
        updatedStudy.processId,
        updatedStudy.collaboratorId,
        updatedStudy.analyst,
        updatedStudy.createdAt.toISOString(),
        updatedStudy.westinghouseFactors?.skill?.toString() || '',
        updatedStudy.westinghouseFactors?.effort?.toString() || '',
        updatedStudy.westinghouseFactors?.conditions?.toString() || '',
        updatedStudy.westinghouseFactors?.consistency?.toString() || '',
        updatedStudy.tolerances?.personal?.toString() || '',
        updatedStudy.tolerances?.fatigue?.toString() || '',
        updatedStudy.tolerances?.other?.toString() || ''
      ];

      await googleSheetsService.updateRowById('Config_Estudios', 'ID_Estudio', studyId, rowData);

      // Update local state
      set({
        studies: studies.map(s => s.id === studyId ? updatedStudy : s),
        activeStudy: activeStudy?.id === studyId ? updatedStudy : activeStudy,
        isLoading: false
      });
    } catch (error: any) {
      set({ error: error.message || 'Failed to update study', isLoading: false });
      throw error;
    }
  },

  addTimeObservation: async (observationData) => {
    set({ isLoading: true, error: null });

    try {
      const observation: TimeObservation = {
        ...observationData,
        timestamp: new Date()
      };

      // Write to Google Sheets
      const rowData = [
        observation.studyId,
        observation.elementName,
        observation.cycleNumber.toString(),
        observation.observedTime.toString(),
        observation.timestamp.toISOString()
      ];

      await googleSheetsService.writeData('Tiempos_Observados', rowData);

      // Update local state
      const { timeObservations } = get();
      const newObservations = [...timeObservations, observation];

      // Update study elements
      const elementsMap = new Map<string, StudyElement>();
      newObservations.forEach(obs => {
        if (!elementsMap.has(obs.elementName)) {
          elementsMap.set(obs.elementName, {
            name: obs.elementName,
            observations: []
          });
        }
        elementsMap.get(obs.elementName)!.observations.push(obs);
      });

      const newStudyElements = Array.from(elementsMap.values());

      set({
        timeObservations: newObservations,
        studyElements: newStudyElements,
        isLoading: false
      });
    } catch (error: any) {
      set({ error: error.message || 'Failed to add time observation', isLoading: false });
      throw error;
    }
  },

  addStudyElement: (elementName) => {
    const { studyElements } = get();
    
    // Check if element already exists
    if (!studyElements.find(e => e.name === elementName)) {
      const newElement: StudyElement = {
        name: elementName,
        observations: []
      };
      
      set({
        studyElements: [...studyElements, newElement]
      });
    }
  },

  clearError: () => {
    set({ error: null });
  }
}));