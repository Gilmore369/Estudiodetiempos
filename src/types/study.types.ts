export interface Study {
  id: string;
  processId: string;
  collaboratorId: string;
  analyst: string;
  createdAt: Date;
  status: 'active' | 'completed' | 'paused';
  westinghouseFactors?: WestinghouseFactors;
  tolerances?: ToleranceFactors;
}

export interface WestinghouseFactors {
  skill: number;
  effort: number;
  conditions: number;
  consistency: number;
  total: number;
}

export interface ToleranceFactors {
  personal: number;
  fatigue: number;
  other: number;
  total: number;
}

export interface TimeObservation {
  studyId: string;
  elementName: string;
  cycleNumber: number;
  observedTime: number;
  timestamp: Date;
}

export interface StudyElement {
  name: string;
  description?: string;
  observations: TimeObservation[];
}

export interface StudyResults {
  studyId: string;
  element: string;
  averageObservedTime: number;
  normalTime: number;
  standardTime: number;
  totalStandardTime?: number;
}

export interface StudyConfig {
  id: string;
  process: string;
  collaborator: string;
  analyst: string;
  date: Date;
  skill: number;
  effort: number;
  conditions: number;
  consistency: number;
  personalAllowance: number;
  fatigueAllowance: number;
  otherAllowances: number;
}