export type ActivityType = 'operation' | 'transport' | 'delay' | 'inspection' | 'storage';

export interface DAPActivity {
  id: string;
  type: ActivityType;
  description: string;
  distance?: number;
  time?: number;
  sequence: number;
  studyId: string;
}

export interface DAPSummary {
  studyId: string;
  totalOperations: number;
  totalTransports: number;
  totalDelays: number;
  totalInspections: number;
  totalStorages: number;
  totalDistance: number;
  totalTime: number;
}

export interface ActivitySymbol {
  type: ActivityType;
  symbol: string;
  label: string;
  requiresDistance: boolean;
  requiresTime: boolean;
}