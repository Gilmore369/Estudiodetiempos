import type { TimeObservation, WestinghouseFactors, ToleranceFactors } from '@/types';

/**
 * Calculate average observed time from multiple observations
 */
export function calculateAverageObservedTime(observations: TimeObservation[]): number {
  if (observations.length === 0) return 0;
  
  const total = observations.reduce((sum, obs) => sum + obs.observedTime, 0);
  return total / observations.length;
}

/**
 * Calculate normal time using Westinghouse factors
 */
export function calculateNormalTime(
  averageObservedTime: number,
  westinghouseFactors: WestinghouseFactors
): number {
  return averageObservedTime * westinghouseFactors.total;
}

/**
 * Calculate standard time applying tolerances
 */
export function calculateStandardTime(
  normalTime: number,
  tolerances: ToleranceFactors
): number {
  const toleranceFactor = 1 + (tolerances.total / 100);
  return normalTime * toleranceFactor;
}

/**
 * Calculate total Westinghouse factor
 */
export function calculateWestinghouseFactor(factors: Omit<WestinghouseFactors, 'total'>): number {
  return 1 + factors.skill + factors.effort + factors.conditions + factors.consistency;
}

/**
 * Calculate total tolerance percentage
 */
export function calculateTotalTolerance(tolerances: Omit<ToleranceFactors, 'total'>): number {
  return tolerances.personal + tolerances.fatigue + tolerances.other;
}

/**
 * Format time in seconds to MM:SS format
 */
export function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}

/**
 * Format time in seconds to decimal minutes
 */
export function formatTimeDecimal(seconds: number): string {
  const minutes = seconds / 60;
  return minutes.toFixed(3);
}

/**
 * Generate unique study ID
 */
export function generateStudyId(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `STUDY_${timestamp}_${random}`.toUpperCase();
}