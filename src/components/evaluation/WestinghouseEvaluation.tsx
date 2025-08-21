import { useState, useEffect } from 'react';
import { useStudyStore } from '@/stores/studyStore';
import { 
  WESTINGHOUSE_SKILL_RATINGS,
  WESTINGHOUSE_EFFORT_RATINGS,
  WESTINGHOUSE_CONDITIONS_RATINGS,
  WESTINGHOUSE_CONSISTENCY_RATINGS,
  getWestinghouseRating
} from '@/utils/westinghouseFactors';
import { calculateWestinghouseFactor } from '@/utils/timeCalculations';
import type { WestinghouseFactors } from '@/types';

export default function WestinghouseEvaluation() {
  const { activeStudy, updateStudy, isLoading, error, clearError } = useStudyStore();

  const [factors, setFactors] = useState({
    skill: '',
    effort: '',
    conditions: '',
    consistency: ''
  });

  const [factorValues, setFactorValues] = useState({
    skill: 0,
    effort: 0,
    conditions: 0,
    consistency: 0
  });

  useEffect(() => {
    if (activeStudy?.westinghouseFactors) {
      // Find the ratings that match the current values
      const skillRating = WESTINGHOUSE_SKILL_RATINGS.find(r => r.value === activeStudy.westinghouseFactors!.skill);
      const effortRating = WESTINGHOUSE_EFFORT_RATINGS.find(r => r.value === activeStudy.westinghouseFactors!.effort);
      const conditionsRating = WESTINGHOUSE_CONDITIONS_RATINGS.find(r => r.value === activeStudy.westinghouseFactors!.conditions);
      const consistencyRating = WESTINGHOUSE_CONSISTENCY_RATINGS.find(r => r.value === activeStudy.westinghouseFactors!.consistency);

      setFactors({
        skill: skillRating?.label || '',
        effort: effortRating?.label || '',
        conditions: conditionsRating?.label || '',
        consistency: consistencyRating?.label || ''
      });

      setFactorValues({
        skill: activeStudy.westinghouseFactors.skill,
        effort: activeStudy.westinghouseFactors.effort,
        conditions: activeStudy.westinghouseFactors.conditions,
        consistency: activeStudy.westinghouseFactors.consistency
      });
    }
  }, [activeStudy]);

  if (!activeStudy) {
    return (
      <div className="card text-center py-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">No Active Study</h2>
        <p className="text-gray-600">Please select a study to perform Westinghouse evaluation.</p>
      </div>
    );
  }

  const handleFactorChange = (category: keyof typeof factors, value: string) => {
    const newFactors = { ...factors, [category]: value };
    setFactors(newFactors);

    // Get the numeric value for the selected rating
    let rating;
    switch (category) {
      case 'skill':
        rating = getWestinghouseRating('skill', value);
        break;
      case 'effort':
        rating = getWestinghouseRating('effort', value);
        break;
      case 'conditions':
        rating = getWestinghouseRating('conditions', value);
        break;
      case 'consistency':
        rating = getWestinghouseRating('consistency', value);
        break;
    }

    if (rating) {
      const newFactorValues = { ...factorValues, [category]: rating.value };
      setFactorValues(newFactorValues);
    }
  };

  const totalFactor = calculateWestinghouseFactor(factorValues);
  const isComplete = factors.skill && factors.effort && factors.conditions && factors.consistency;

  const handleSave = async () => {
    if (!isComplete) return;

    const westinghouseFactors: WestinghouseFactors = {
      ...factorValues,
      total: totalFactor
    };

    try {
      await updateStudy(activeStudy.id, { westinghouseFactors });
    } catch (error) {
      // Error handled by store
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Westinghouse Performance Evaluation</h2>
        <p className="text-gray-600">Evaluate the collaborator's performance using Westinghouse methodology</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
            <div className="ml-auto pl-3">
              <button
                onClick={clearError}
                className="text-red-400 hover:text-red-600"
              >
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="card">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Study Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-700">Study ID:</span>
              <span className="ml-2 text-gray-600">{activeStudy.id}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Process:</span>
              <span className="ml-2 text-gray-600">{activeStudy.processId}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Collaborator:</span>
              <span className="ml-2 text-gray-600">{activeStudy.collaboratorId}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Skill Rating */}
          <div className="space-y-3">
            <h4 className="text-lg font-medium text-gray-900">1. Skill (Habilidad)</h4>
            <p className="text-sm text-gray-600">
              Evaluate the worker's proficiency and dexterity in performing the operation
            </p>
            <select
              value={factors.skill}
              onChange={(e) => handleFactorChange('skill', e.target.value)}
              className="input-field"
              disabled={isLoading}
            >
              <option value="">Select skill level</option>
              {WESTINGHOUSE_SKILL_RATINGS.map((rating) => (
                <option key={rating.label} value={rating.label}>
                  {rating.label} - {rating.description} ({rating.value > 0 ? '+' : ''}{(rating.value * 100).toFixed(0)}%)
                </option>
              ))}
            </select>
            {factors.skill && (
              <div className="p-3 bg-blue-50 rounded-md">
                <div className="text-sm font-medium text-blue-900">
                  Selected: {factors.skill} ({factorValues.skill > 0 ? '+' : ''}{(factorValues.skill * 100).toFixed(1)}%)
                </div>
              </div>
            )}
          </div>

          {/* Effort Rating */}
          <div className="space-y-3">
            <h4 className="text-lg font-medium text-gray-900">2. Effort (Esfuerzo)</h4>
            <p className="text-sm text-gray-600">
              Evaluate the worker's willingness to work and the pace maintained
            </p>
            <select
              value={factors.effort}
              onChange={(e) => handleFactorChange('effort', e.target.value)}
              className="input-field"
              disabled={isLoading}
            >
              <option value="">Select effort level</option>
              {WESTINGHOUSE_EFFORT_RATINGS.map((rating) => (
                <option key={rating.label} value={rating.label}>
                  {rating.label} - {rating.description} ({rating.value > 0 ? '+' : ''}{(rating.value * 100).toFixed(0)}%)
                </option>
              ))}
            </select>
            {factors.effort && (
              <div className="p-3 bg-green-50 rounded-md">
                <div className="text-sm font-medium text-green-900">
                  Selected: {factors.effort} ({factorValues.effort > 0 ? '+' : ''}{(factorValues.effort * 100).toFixed(1)}%)
                </div>
              </div>
            )}
          </div>

          {/* Conditions Rating */}
          <div className="space-y-3">
            <h4 className="text-lg font-medium text-gray-900">3. Conditions (Condiciones)</h4>
            <p className="text-sm text-gray-600">
              Evaluate the working conditions including lighting, temperature, noise, etc.
            </p>
            <select
              value={factors.conditions}
              onChange={(e) => handleFactorChange('conditions', e.target.value)}
              className="input-field"
              disabled={isLoading}
            >
              <option value="">Select conditions</option>
              {WESTINGHOUSE_CONDITIONS_RATINGS.map((rating) => (
                <option key={rating.label} value={rating.label}>
                  {rating.label} - {rating.description} ({rating.value > 0 ? '+' : ''}{(rating.value * 100).toFixed(0)}%)
                </option>
              ))}
            </select>
            {factors.conditions && (
              <div className="p-3 bg-yellow-50 rounded-md">
                <div className="text-sm font-medium text-yellow-900">
                  Selected: {factors.conditions} ({factorValues.conditions > 0 ? '+' : ''}{(factorValues.conditions * 100).toFixed(1)}%)
                </div>
              </div>
            )}
          </div>

          {/* Consistency Rating */}
          <div className="space-y-3">
            <h4 className="text-lg font-medium text-gray-900">4. Consistency (Consistencia)</h4>
            <p className="text-sm text-gray-600">
              Evaluate the consistency of the worker's performance throughout the study
            </p>
            <select
              value={factors.consistency}
              onChange={(e) => handleFactorChange('consistency', e.target.value)}
              className="input-field"
              disabled={isLoading}
            >
              <option value="">Select consistency</option>
              {WESTINGHOUSE_CONSISTENCY_RATINGS.map((rating) => (
                <option key={rating.label} value={rating.label}>
                  {rating.label} - {rating.description} ({rating.value > 0 ? '+' : ''}{(rating.value * 100).toFixed(0)}%)
                </option>
              ))}
            </select>
            {factors.consistency && (
              <div className="p-3 bg-purple-50 rounded-md">
                <div className="text-sm font-medium text-purple-900">
                  Selected: {factors.consistency} ({factorValues.consistency > 0 ? '+' : ''}{(factorValues.consistency * 100).toFixed(1)}%)
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Total Factor Display */}
        <div className="mt-8 p-6 bg-gray-50 rounded-lg">
          <h4 className="text-xl font-semibold text-gray-900 mb-4">Total Westinghouse Factor</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h5 className="font-medium text-gray-700 mb-2">Individual Factors:</h5>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Base Factor:</span>
                  <span className="font-mono">1.000</span>
                </div>
                <div className="flex justify-between">
                  <span>Skill:</span>
                  <span className="font-mono">{factorValues.skill > 0 ? '+' : ''}{factorValues.skill.toFixed(3)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Effort:</span>
                  <span className="font-mono">{factorValues.effort > 0 ? '+' : ''}{factorValues.effort.toFixed(3)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Conditions:</span>
                  <span className="font-mono">{factorValues.conditions > 0 ? '+' : ''}{factorValues.conditions.toFixed(3)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Consistency:</span>
                  <span className="font-mono">{factorValues.consistency > 0 ? '+' : ''}{factorValues.consistency.toFixed(3)}</span>
                </div>
                <hr className="my-2" />
                <div className="flex justify-between font-semibold">
                  <span>Total Factor:</span>
                  <span className="font-mono text-lg">{totalFactor.toFixed(3)}</span>
                </div>
              </div>
            </div>
            <div>
              <h5 className="font-medium text-gray-700 mb-2">Impact on Time:</h5>
              <div className="text-sm text-gray-600">
                <p className="mb-2">
                  The total factor of <strong>{totalFactor.toFixed(3)}</strong> means:
                </p>
                {totalFactor > 1 ? (
                  <p className="text-green-700">
                    ↗ The observed time will be <strong>increased by {((totalFactor - 1) * 100).toFixed(1)}%</strong> to calculate normal time.
                    This indicates above-average performance.
                  </p>
                ) : totalFactor < 1 ? (
                  <p className="text-red-700">
                    ↘ The observed time will be <strong>decreased by {((1 - totalFactor) * 100).toFixed(1)}%</strong> to calculate normal time.
                    This indicates below-average performance.
                  </p>
                ) : (
                  <p className="text-gray-700">
                    → The observed time will remain unchanged. This indicates average performance.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={handleSave}
            disabled={!isComplete || isLoading}
            className="btn-primary"
          >
            {isLoading ? 'Saving...' : 'Save Evaluation'}
          </button>
        </div>

        {!isComplete && (
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-800">
                  Please complete all four evaluations before saving.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}