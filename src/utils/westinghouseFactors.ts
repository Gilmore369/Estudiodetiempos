export interface WestinghouseRating {
  label: string;
  value: number;
  description: string;
}

export const WESTINGHOUSE_SKILL_RATINGS: WestinghouseRating[] = [
  { label: 'A1', value: 0.15, description: 'Superskilled' },
  { label: 'A2', value: 0.13, description: 'Superskilled' },
  { label: 'B1', value: 0.11, description: 'Excellent' },
  { label: 'B2', value: 0.08, description: 'Excellent' },
  { label: 'C1', value: 0.06, description: 'Good' },
  { label: 'C2', value: 0.03, description: 'Good' },
  { label: 'D', value: 0.00, description: 'Average' },
  { label: 'E1', value: -0.05, description: 'Fair' },
  { label: 'E2', value: -0.10, description: 'Fair' },
  { label: 'F1', value: -0.16, description: 'Poor' },
  { label: 'F2', value: -0.22, description: 'Poor' },
];

export const WESTINGHOUSE_EFFORT_RATINGS: WestinghouseRating[] = [
  { label: 'A1', value: 0.13, description: 'Excessive' },
  { label: 'A2', value: 0.12, description: 'Excessive' },
  { label: 'B1', value: 0.10, description: 'Excellent' },
  { label: 'B2', value: 0.08, description: 'Excellent' },
  { label: 'C1', value: 0.05, description: 'Good' },
  { label: 'C2', value: 0.02, description: 'Good' },
  { label: 'D', value: 0.00, description: 'Average' },
  { label: 'E1', value: -0.04, description: 'Fair' },
  { label: 'E2', value: -0.08, description: 'Fair' },
  { label: 'F1', value: -0.12, description: 'Poor' },
  { label: 'F2', value: -0.17, description: 'Poor' },
];

export const WESTINGHOUSE_CONDITIONS_RATINGS: WestinghouseRating[] = [
  { label: 'A', value: 0.06, description: 'Ideal' },
  { label: 'B', value: 0.04, description: 'Excellent' },
  { label: 'C', value: 0.02, description: 'Good' },
  { label: 'D', value: 0.00, description: 'Average' },
  { label: 'E', value: -0.03, description: 'Fair' },
  { label: 'F', value: -0.07, description: 'Poor' },
];

export const WESTINGHOUSE_CONSISTENCY_RATINGS: WestinghouseRating[] = [
  { label: 'A', value: 0.04, description: 'Perfect' },
  { label: 'B', value: 0.03, description: 'Excellent' },
  { label: 'C', value: 0.01, description: 'Good' },
  { label: 'D', value: 0.00, description: 'Average' },
  { label: 'E', value: -0.02, description: 'Fair' },
  { label: 'F', value: -0.04, description: 'Poor' },
];

export function getWestinghouseRating(
  category: 'skill' | 'effort' | 'conditions' | 'consistency',
  label: string
): WestinghouseRating | undefined {
  const ratings = {
    skill: WESTINGHOUSE_SKILL_RATINGS,
    effort: WESTINGHOUSE_EFFORT_RATINGS,
    conditions: WESTINGHOUSE_CONDITIONS_RATINGS,
    consistency: WESTINGHOUSE_CONSISTENCY_RATINGS,
  };

  return ratings[category].find(rating => rating.label === label);
}