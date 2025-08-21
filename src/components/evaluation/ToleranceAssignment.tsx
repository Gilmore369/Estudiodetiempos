import { useState, useEffect } from 'react';
import { useStudyStore } from '@/stores/studyStore';
import { calculateTotalTolerance } from '@/utils/timeCalculations';
import { isToleranceWithinLimits } from '@/utils/validators';
import type { ToleranceFactors } from '@/types';

interface ToleranceCategory {
  id: keyof Omit<ToleranceFactors, 'total'>;
  name: string;
  description: string;
  recommendedRange: string;
  examples: string[];
}

const TOLERANCE_CATEGORIES: ToleranceCategory[] = [
  {
    id: 'personal',
    name: 'Personal Needs (Necesidades Personales)',
    description: 'Time for basic physiological needs',
    recommendedRange: '5-7%',
    examples: [
      'Restroom breaks',
      'Drinking water',
      'Personal hygiene',
      'Brief rest periods'
    ]
  },
  {
    id: 'fatigue',
    name: 'Fatigue (Fatiga)',
    description: 'Recovery time from physical and mental effort',
    recommendedRange: '4-15%',
    examples: [
      'Physical exertion recovery',
      'Mental concentration breaks',
      'Posture changes',
      'Eye strain relief'
    ]
  },
  {
    id: 'other',
    name: 'Other Allowances (Otros Suplementos)',
    description: 'Additional delays and interruptions',
    recommendedRange: '0-10%',
    examples: [
      'Machine maintenance',
      'Material handling delays',
      'Quality inspections',
      'Supervisor consultations'
    ]
  }
];

export default function ToleranceAssignment() {
  const { activeStudy, updateStudy, isLoading, error, clearError } = useStudyStore();

  const [tolerances, setTolerances] = useState({
    personal: 0,
    fatigue: 0,
    other: 0
  });

  useEffect(() => {
    if (activeStudy?.tolerances) {
      setTolerances({
        personal: activeStudy.tolerances.personal,
        fatigue: activeStudy.tolerances.fatigue,
        other: activeStudy.tolerances.other
      });
    }
  }, [activeStudy]);

  if (!activeStudy) {
    return (
      <div className="card text-center py-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">No Active Study</h2>
        <p className="text-gray-600">Please select a study to assign tolerances.</p>
      </div>
    );
  }

  const totalTolerance = calculateTotalTolerance(tolerances);
  const isWithinLimits = isToleranceWithinLimits(totalTolerance);

  const handleToleranceChange = (category: keyof typeof tolerances, value: string) => {
    const numValue = parseFloat(value) || 0;
    setTolerances(prev => ({
      ...prev,
      [category]: Math.max(0, Math.min(100, numValue)) // Clamp between 0-100
    }));
  };

  const handleSave = async () => {
    const toleranceFactors: ToleranceFactors = {
      ...tolerances,
      total: totalTolerance
    };

    try {
      await updateStudy(activeStudy.id, { tolerances: toleranceFactors });
    } catch (error) {
      // Error handled by store
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Tolerance Assignment (OIT Method)</h2>
        <p className="text-gray-600">Assign allowances for personal needs, fatigue, and other delays</p>
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

        <div className="space-y-8">
          {TOLERANCE_CATEGORIES.map((category) => (
            <div key={category.id} className="border border-gray-200 rounded-lg p-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <h4 className="text-lg font-medium text-gray-900 mb-2">{category.name}</h4>
                  <p className="text-gray-600 mb-3">{category.description}</p>
                  
                  <div className="mb-4">
                    <span className="text-sm font-medium text-gray-700">Recommended Range: </span>
                    <span className="text-sm text-blue-600 font-medium">{category.recommendedRange}</span>
                  </div>

                  <div>
                    <h5 className="text-sm font-medium text-gray-700 mb-2">Examples:</h5>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {category.examples.map((example, index) => (
                        <li key={index} className="flex items-center">
                          <svg className="h-3 w-3 text-gray-400 mr-2" fill="currentColor" viewBox="0 0 8 8">
                            <circle cx="4" cy="4" r="3" />
                          </svg>
                          {example}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="lg:col-span-1">
                  <label htmlFor={category.id} className="block text-sm font-medium text-gray-700 mb-2">
                    Percentage (%)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      id={category.id}
                      min="0"
                      max="100"
                      step="0.1"
                      value={tolerances[category.id]}
                      onChange={(e) => handleToleranceChange(category.id, e.target.value)}
                      className="input-field pr-8"
                      disabled={isLoading}
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 text-sm">%</span>
                    </div>
                  </div>
                  
                  <div className="mt-2 text-center">
                    <div className="text-2xl font-bold text-gray-900">
                      {tolerances[category.id].toFixed(1)}%
                    </div>
                  </div>

                  {/* Visual indicator */}
                  <div className="mt-3">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${
                          tolerances[category.id] <= 5 ? 'bg-green-500' :
                          tolerances[category.id] <= 15 ? 'bg-yellow-500' :
                          tolerances[category.id] <= 25 ? 'bg-orange-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${Math.min(tolerances[category.id], 100)}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>0%</span>
                      <span>50%</span>
                      <span>100%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Total Tolerance Summary */}
        <div className="mt-8 p-6 bg-gray-50 rounded-lg">
          <h4 className="text-xl font-semibold text-gray-900 mb-4">Total Tolerance Summary</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h5 className="font-medium text-gray-700 mb-3">Individual Tolerances:</h5>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Personal Needs:</span>
                  <span className="font-mono">{tolerances.personal.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Fatigue:</span>
                  <span className="font-mono">{tolerances.fatigue.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Other Allowances:</span>
                  <span className="font-mono">{tolerances.other.toFixed(1)}%</span>
                </div>
                <hr className="my-2" />
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total Tolerance:</span>
                  <span className="font-mono">{totalTolerance.toFixed(1)}%</span>
                </div>
              </div>
            </div>

            <div>
              <h5 className="font-medium text-gray-700 mb-3">Impact on Standard Time:</h5>
              <div className="text-sm text-gray-600">
                <p className="mb-2">
                  The total tolerance of <strong>{totalTolerance.toFixed(1)}%</strong> means:
                </p>
                <p className="mb-3">
                  Standard Time = Normal Time × (1 + {totalTolerance.toFixed(1)}%) = Normal Time × {(1 + totalTolerance/100).toFixed(3)}
                </p>
                
                {!isWithinLimits && (
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-yellow-800">
                          <strong>Warning:</strong> Total tolerance exceeds recommended limits (50%). 
                          Please review your assignments to ensure accuracy.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={handleSave}
            disabled={isLoading}
            className="btn-primary"
          >
            {isLoading ? 'Saving...' : 'Save Tolerances'}
          </button>
        </div>
      </div>

      {/* Guidelines */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">OIT Tolerance Guidelines</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
          <div>
            <h4 className="font-medium text-gray-700 mb-2">Personal Needs (5-7%)</h4>
            <ul className="text-gray-600 space-y-1">
              <li>• Minimum 5% for basic needs</li>
              <li>• 7% for normal conditions</li>
              <li>• Consider work duration</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-gray-700 mb-2">Fatigue (4-15%)</h4>
            <ul className="text-gray-600 space-y-1">
              <li>• 4% for light work</li>
              <li>• 8-12% for moderate work</li>
              <li>• 15% for heavy work</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-gray-700 mb-2">Other Allowances (0-10%)</h4>
            <ul className="text-gray-600 space-y-1">
              <li>• Machine delays</li>
              <li>• Material handling</li>
              <li>• Quality control</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}